from rest_framework import serializers
from .models import Ship , Cargo, Crew, Client, Port, Shipment

class ShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ship
        fields = '__all__'


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Weight must be greater than 0.")
        return value

    def validate(self, data):
        # Example: if cargo_type is 'dangerous' ensure some business rule or flag present
        if data.get('cargo_type') == 'dangerous':
            # enforce any extra rules here; for now just pass
            pass
        return data



class CrewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crew
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_phone_number(self, value):
        # Additional format validation can be added here
        if Crew.objects.filter(phone_number=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Phone number must be unique.")
        return value

    def validate(self, data):
        # Enforce only one Captain per ship
        role = data.get('role', getattr(self.instance, 'role', None))
        ship = data.get('ship', getattr(self.instance, 'ship', None))

        if role == 'Captain' and ship is not None:
            # exclude current instance (for updates)
            qs = Crew.objects.filter(ship=ship, role='Captain')
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("This ship already has a Captain assigned.")
        return data


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = '__all__'


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = '__all__'
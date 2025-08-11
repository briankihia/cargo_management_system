# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # New user → default to normal
        Profile.objects.create(user=instance, role='normal')
    else:
        # Update role if superuser status changes
        profile = instance.profile
        if instance.is_superuser:
            profile.role = 'admin'
        else:
            # Keep existing role if not superuser
            if not profile.role:
                profile.role = 'normal'
        profile.save()
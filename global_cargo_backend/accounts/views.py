from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.contrib.auth import logout, authenticate
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status


@api_view(['POST'])
def user_login(request):
    data = request.data
    username = data.get('email')  # Use email as username
    password = data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)

        # Role is now based on is_superuser
        role = "admin" if user.is_superuser else "normal"

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'id': user.id,
                'role': role
            },
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register(request):
    data = request.data
    try:
        # Create the user (default: not superuser, not staff)
        user = User.objects.create_user(
            username=data['email'],
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            password=data['password']
        )
        user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully',
            'role': 'normal'  # Always normal at registration
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


def user_logout(request):
    logout(request)
    return redirect('store')


def check_authentication(request):
    return JsonResponse({'authenticated': request.user.is_authenticated})
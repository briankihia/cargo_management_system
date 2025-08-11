from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('user_logout/', views.user_logout, name='user_logout'),
    path('check_authentication', views.check_authentication, name='check_authentication'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
"""Defines url patterns for users."""

from django.urls import path, include
from django.contrib.auth.views import LogoutView

from . import views

app_name = 'Users'
urlpatterns = [
    # Include default auth urls
    path('', include('django.contrib.auth.urls')),
    # Registration page
    path('register/', views.register, name='register'),
    # Logout page
    path('logout/', LogoutView.as_view(), name='logout'),
    path('search_users/', views.search_users, name='search_users'),
    path('google/login/', views.google_login, name='google_login'),
    path('google/callback/', views.google_callback, name='google_callback'),
    path('google/start/', views.google_auth_start, name='google_auth_start'),
    path('google/redirect/', views.google_auth_redirect, name='google_auth_redirect'),
]
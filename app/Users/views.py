from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model
from django.contrib import messages
from .forms import CustomUserCreationForm
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from google_auth_oauthlib.flow import Flow
from django.conf import settings
import os
from google.oauth2.credentials import Credentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User

def register(request):
    """Register a new user."""
    if request.method != 'POST':
        # Display a blank registration form.
        form = CustomUserCreationForm()
    else:
        # Process completed form.
        form = CustomUserCreationForm(data=request.POST)

        if form.is_valid():
            new_user = form.save()
            # Log the user and then redirect to the Dashboard.
            login(request, new_user)
            messages.success(request, "User registered and logged in successfully.")
            return redirect('projects:dashboard')
        else:
            for error in form.errors.values():
                messages.error(request, error)

    # Display a blank or invalid form.
    context = {'form': form, "show_sidebar": False}
    return render(request, 'registration/register.html', context)

def google_login(request):
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=settings.GOOGLE_AUTH_SCOPE
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session['oauth_state'] = state
    return redirect(authorization_url)


def google_callback(request):
    state = request.session('oauth_state')
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=settings.GOOGLE_AUTH_SCOPE,
        state=state
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.fetch_token(authorization_response=request.build_absolute_uri())

    credentials = flow.credentials
    idinfo = id_token.verify_oauth2_token(
        credentials.id_token,
        google_requests.Request(),
        settings.GOOGLE_CLIENT_ID
    )

    email = idinfo['email']
    name = idinfo.get('name', email.split('@')[0])

    # create or get user
    user, created = User.objects.get_or_create(username=email, defaults={
        'email': email,
        'first_name': name.split(' ')[0],
        'last_name': ' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
    })

    login(request, user)
    return HttpResponseRedirect('/')


def google_auth_start(request):
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=settings.GOOGLE_SCOPES,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session['oauth_state'] = state
    return redirect(authorization_url)

def google_auth_redirect(request):
    state = request.session['oauth_state']
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=settings.GOOGLE_SCOPES,
        state=state
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI

    flow.fetch_token(authorization_response=request.build_absolute_uri())

    credentials = flow.credentials
    request.session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return JsonResponse({"message": "Google Drive connected successfully!"})

@login_required
def search_users(request):
    query = request.GET.get('q', '')
    if query:
        users = get_user_model().objects.filter(username__icontains=query).values("username")
        return JsonResponse(list(users), safe=False)
    return JsonResponse([], safe=False)





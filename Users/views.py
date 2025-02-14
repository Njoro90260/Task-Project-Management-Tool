from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib import messages
from .forms import CustomUserCreationForm

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
    context = {'form': form}
    return render(request, 'registration/register.html', context)
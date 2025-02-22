from django.shortcuts import render, redirect
from django.contrib.auth import login, get_user_model
from django.contrib import messages
from .forms import CustomUserCreationForm
from .models import Role
from django.http import JsonResponse

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
            # Assign a default role (e.g., "Team Member") to the user
            default_role, created = Role.objects.get_or_create(name='Team Member')
            new_user.roles.add(default_role)
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


User = get_user_model()

def search_users(request):
    query = request.GET.get('q', '')
    if query:
        users = User.objects.filter(username__icontains=query).values("username")
        return JsonResponse(list(users), safe=False)
    return JsonResponse([], safe=False)





from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
# Create your views here.
def register(request):
    """Register a new user."""
    if request.method != 'POST':
        #Display a blank registration form.
        form = UserCreationForm()
    else:
        #process completed form.
        form = UserCreationForm(data=request.POST)

        if form.is_valid():
            new_user = form.save()
            #Log the user and then redirect to the Dashboard.
            login(request, new_user)
            return redirect('projects:dashboard')
        # display a blank or invalid form.
    context = {'form': form}
    return render(request, 'registration/register.html', context)
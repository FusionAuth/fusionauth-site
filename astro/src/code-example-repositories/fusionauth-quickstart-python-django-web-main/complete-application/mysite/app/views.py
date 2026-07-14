from json import loads
from math import ceil
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.conf import settings

def app(request):
    if not request.user.is_authenticated:
        return render(request, template_name='home.html')
    return redirect('account')

def account(request):
    if not request.user.is_authenticated:
        return redirect('oidc_authentication_init')
    return render(request, 'account.html', {'email': request.user.email})

def logout(request):
    # https://mozilla-django-oidc.readthedocs.io/en/stable/installation.html
    # When a user logs out, by default, mozilla-django-oidc will end the current Django session. 
    # However, the user may still have an active session with the OpenID Connect provider. In this case
    # the user has been directed back to the FusionAuth server to end the session there. FusionAuth will redirect
    # back here. This is where servers side cleanup will happen, if needed.
    return redirect('app')

def change(request):
    if not request.user.is_authenticated:
        return redirect('oidc_authentication_init')
    change = { "error": None }
    if request.method == 'POST':
        dollar_amt_param = request.POST.get("amount")
        try:
            if dollar_amt_param:
                dollar_amt = float(dollar_amt_param)
                nickels = int(dollar_amt / 0.05)
                pennies = ceil((dollar_amt - (0.05 * nickels)) / 0.01)
                change["total"] = "{:,.2f}".format(dollar_amt)
                change["nickels"] = "{:,d}".format(nickels)
                change["pennies"] = "{:,d}".format(pennies)
        except ValueError:
            change["error"] = "Please enter a dollar amount"
    return render(
        request,
        'change.html',
        {
            'email': request.user.email,
            'change': change
        }
    )

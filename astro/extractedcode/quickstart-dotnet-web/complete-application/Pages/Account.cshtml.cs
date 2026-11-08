using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

namespace Pages;

[Authorize]
public class AccountsModel : PageModel
{
    private readonly ILogger<PrivacyModel> _logger;

    public AccountsModel(ILogger<PrivacyModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
      
    }
}


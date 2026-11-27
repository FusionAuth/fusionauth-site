using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Notes.Pages;

[Authorize]
public class IndexModel : PageModel
{
    public string Note { get; private set; } = "";

    private string NotePath => "note.txt";

    public IActionResult OnPostLogout()
    {
        return SignOut(CookieAuthenticationDefaults.AuthenticationScheme,
            OpenIdConnectDefaults.AuthenticationScheme);
    }

    public void OnGet()
    {
        Note = System.IO.File.Exists(NotePath)
            ? System.IO.File.ReadAllText(NotePath)
            : "";
    }

    public IActionResult OnPost(string? content)
    {
        System.IO.File.WriteAllText(NotePath, content ?? "");
        return RedirectToPage();
    }
}

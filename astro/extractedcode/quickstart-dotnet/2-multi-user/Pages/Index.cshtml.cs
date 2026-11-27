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

    public string DisplayName
    {
        get
        {
            var firstName = User.FindFirst("given_name")?.Value;
            var lastName = User.FindFirst("family_name")?.Value;
            var name = $"{firstName} {lastName}".Trim();
            return name.Length == 0 ? "writer" : name;
        }
    }

    private string NotePath
    {
        get
        {
            var userId = Guid.Parse(User.FindFirst("sub")!.Value);
            return Path.Combine("user_data", $"note-{userId}.txt");
        }
    }

    public IActionResult OnPostLogout()
    {
        return SignOut(CookieAuthenticationDefaults.AuthenticationScheme,
            OpenIdConnectDefaults.AuthenticationScheme);
    }

    public void OnGet()
    {
        Note = System.IO.File.Exists(NotePath)
            ? System.IO.File.ReadAllText(NotePath)
            : $"Write a note, {DisplayName}.";
    }

    public IActionResult OnPost(string? content)
    {
        Directory.CreateDirectory("user_data");
        System.IO.File.WriteAllText(NotePath, content ?? "");
        return RedirectToPage();
    }
}

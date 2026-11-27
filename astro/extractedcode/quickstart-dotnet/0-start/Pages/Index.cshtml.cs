using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Notes.Pages;

public class IndexModel : PageModel
{
    public string Note { get; private set; } = "";

    private string NotePath => "note.txt";

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

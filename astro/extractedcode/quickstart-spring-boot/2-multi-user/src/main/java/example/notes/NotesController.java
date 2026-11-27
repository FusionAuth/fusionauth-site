package example.notes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class NotesController {
    private static final Path NOTES = Path.of("user_data");

    @GetMapping("/")
    String show(@AuthenticationPrincipal OidcUser user, Model model) throws IOException {
        Path note = notePath(user);
        String firstName = Objects.toString(user.getGivenName(), "");
        String lastName = Objects.toString(user.getFamilyName(), "");
        String fullName = (firstName + " " + lastName).strip();
        String name = fullName.isEmpty() ? "writer" : fullName;
        model.addAttribute("name", name);
        model.addAttribute("content", Files.exists(note) ? Files.readString(note) : "Write a note, " + name + ".");
        return "notes";
    }

    @PostMapping("/")
    String save(@AuthenticationPrincipal OidcUser user, @RequestParam String content) throws IOException {
        Files.createDirectories(NOTES);
        Files.writeString(notePath(user), content);
        return "redirect:/";
    }

    private Path notePath(OidcUser user) {
        UUID userId = UUID.fromString(user.getSubject());
        return NOTES.resolve("note-" + userId + ".txt");
    }
}

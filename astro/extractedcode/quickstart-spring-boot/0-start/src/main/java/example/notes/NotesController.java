package example.notes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class NotesController {
    private static final Path NOTE = Path.of("note.txt");

    @GetMapping("/")
    String show(Model model) throws IOException {
        model.addAttribute("content", Files.exists(NOTE) ? Files.readString(NOTE) : "");
        return "notes";
    }

    @PostMapping("/")
    String save(@RequestParam String content) throws IOException {
        Files.writeString(NOTE, content);
        return "redirect:/";
    }
}

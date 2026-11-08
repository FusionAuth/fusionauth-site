package io.fusionauth.quickstart.springweb;

import io.fusionauth.quickstart.springweb.model.Change;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Controller
public class MakeChangeController {
    private static final Logger logger = LoggerFactory.getLogger(MakeChangeController.class);

    @GetMapping("/make-change")
    public String get(Model model, @AuthenticationPrincipal OidcUser principal) {
        model.addAttribute("change", new Change());
        model.addAttribute("profile", principal.getClaims());
        return "make-change";
    }

    @PostMapping("/make-change")
    public String post(@ModelAttribute Change change, Model model, @AuthenticationPrincipal OidcUser principal) {
        model.addAttribute("profile", principal.getClaims());
        change.setError(null);
        try {
            if (change.getTotal() != null) {
                BigDecimal totalValue = new BigDecimal(change.getTotal());
                change.setNickels(totalValue
                        .divide(new BigDecimal("0.05"), RoundingMode.HALF_DOWN)
                        .intValue());
                change.setPennies(totalValue
                        .subtract(new BigDecimal("0.05")
                                .multiply(new BigDecimal(change.getNickels())))
                        .multiply(new BigDecimal(100))
                        .intValue());
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
            change.setError("Please enter a dollar amount.");
        }

        return "make-change";
    }
}


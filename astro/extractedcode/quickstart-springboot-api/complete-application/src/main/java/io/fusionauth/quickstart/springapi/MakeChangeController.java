package io.fusionauth.quickstart.springapi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@RestController
@RequestMapping("make-change")
public class MakeChangeController {

    // The amount is taken as a String and parsed here rather than bound
    // straight to a BigDecimal. Binding a required BigDecimal makes Spring
    // reject bad input by forwarding to /error, and that forward is itself
    // subject to the security rules, so the response comes back as 403 rather
    // than a useful 400.
    @GetMapping
    public ResponseEntity<?> get(@RequestParam(required = false) String total) {
        BigDecimal amount;
        try {
            amount = new BigDecimal(total);
        } catch (NullPointerException | NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Problem converting the submitted value to a decimal. Value submitted: "
                            + (total == null ? "" : total)));
        }

        if (amount.signum() < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "The submitted value must not be negative. Value submitted: " + total));
        }

        var change = new Change();
        change.setTotal(amount);
        change.setNickels(amount.divide(new BigDecimal("0.05"), RoundingMode.HALF_DOWN).intValue());
        change.setPennies(amount.subtract(new BigDecimal("0.05")
                        .multiply(new BigDecimal(change.getNickels())))
                .multiply(new BigDecimal(100))
                .intValue());
        return ResponseEntity.ok(change);
    }
}

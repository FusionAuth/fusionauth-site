package io.fusionauth.quickstart.springapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("make-change")
public class MakeChangeController {

    @GetMapping
    public Change get(@RequestParam(required = false) BigDecimal total) {
        var change = new Change();
        change.setTotal(total);
        change.setNickels(total.divide(new BigDecimal("0.05"), RoundingMode.HALF_DOWN).intValue());
        change.setPennies(total.subtract(new BigDecimal("0.05")
                        .multiply(new BigDecimal(change.getNickels())))
                .multiply(new BigDecimal(100))
                .intValue());
        return change;
    }
}

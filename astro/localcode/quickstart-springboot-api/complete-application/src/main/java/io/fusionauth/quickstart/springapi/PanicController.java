package io.fusionauth.quickstart.springapi;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("panic")
public class PanicController {

    @PostMapping
    public PanicResponse postPanic() {
        return new PanicResponse("We've called the police!");
    }
}

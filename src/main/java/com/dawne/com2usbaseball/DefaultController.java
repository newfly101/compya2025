package com.dawne.com2usbaseball;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DefaultController {

    @GetMapping("/health")
    public String defaultController() {
        return "Okay";
    }
}

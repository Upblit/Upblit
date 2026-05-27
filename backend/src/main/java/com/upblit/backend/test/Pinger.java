package com.upblit.backend.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
@RequestMapping("/ping")
public class Pinger {
    private final WebClient webClient = WebClient.create();
    @GetMapping
    public String ping() {
        String url="http://localhost:8000/";
        Flux.range(1, 100)
                .flatMap(i ->
                                webClient.head() // faster than GET
                                        .uri(url)
                                        .retrieve()
                                        .toBodilessEntity()
                                        .timeout(Duration.ofSeconds(2))
                                        .map(res -> "OK " + i)
                                        .onErrorResume(e -> Mono.just("FAIL " + i))
                        , 100) // 🔥 100 parallel calls
                .doOnNext(System.out::println)
                .blockLast();

        return url;
    }
}

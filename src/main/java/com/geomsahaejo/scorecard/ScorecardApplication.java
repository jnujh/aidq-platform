package com.geomsahaejo.scorecard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // SSE 하트비트(@Scheduled) 활성화
public class ScorecardApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScorecardApplication.class, args);
	}

}

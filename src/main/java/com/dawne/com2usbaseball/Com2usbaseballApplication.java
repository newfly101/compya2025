package com.dawne.com2usbaseball;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableCaching
@MapperScan("com.dawne.com2usbaseball.repository.mapper")
public class Com2usbaseballApplication {

	public static void main(String[] args) {
		SpringApplication.run(Com2usbaseballApplication.class, args);
	}

}

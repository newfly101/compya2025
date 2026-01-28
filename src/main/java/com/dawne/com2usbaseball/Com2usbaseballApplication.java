package com.dawne.com2usbaseball;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.dawne.com2usbaseball")
@EnableCaching
@EntityScan("com.dawne.com2usbaseball")
@MapperScan("com.dawne.com2usbaseball")
//@MapperScan("com.dawne.com2usbaseball.domain.**.mapper")
public class Com2usbaseballApplication {

	public static void main(String[] args) {
		SpringApplication.run(Com2usbaseballApplication.class, args);
	}

}

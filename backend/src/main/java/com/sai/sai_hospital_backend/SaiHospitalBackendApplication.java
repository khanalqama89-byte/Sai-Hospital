package com.sai.sai_hospital_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.sai.sai_hospital_backend.repository.UserRepository;
import com.sai.sai_hospital_backend.model.User;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SaiHospitalBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaiHospitalBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.count() == 0) {
				User admin = new User();
				admin.setName("Hospital Admin");
				admin.setEmail("admin@saihospital.com");
				admin.setPhoneNumber("1234567890");
				admin.setPassword(passwordEncoder.encode("admin123"));
				userRepository.save(admin);
				System.out.println("====== DEFAULT ADMIN CREATED: admin@saihospital.com / admin123 ======");
			}
		};
	}

}

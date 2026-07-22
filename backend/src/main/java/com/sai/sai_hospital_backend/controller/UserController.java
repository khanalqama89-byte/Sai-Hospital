package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.User;
import com.sai.sai_hospital_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Prevent password hashes from being sent to the client
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }
}

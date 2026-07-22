package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.Token;
import com.sai.sai_hospital_backend.model.User;
import com.sai.sai_hospital_backend.repository.TokenRepository;
import com.sai.sai_hospital_backend.repository.UserRepository;
import com.sai.sai_hospital_backend.service.OtpService;
import com.sai.sai_hospital_backend.service.ActivityLogService;
import com.sai.sai_hospital_backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private ActivityLogService activityLogService;

    private void saveTokenForUser(User user, String jwtToken) {
        Token token = new Token(jwtToken, false, user);
        tokenRepository.save(token);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("identifier"); // can be email or phoneNumber
        String password = payload.get("password");

        Map<String, Object> response = new HashMap<>();
        Optional<User> optionalUser;

        if (identifier != null && identifier.contains("@")) {
            optionalUser = userRepository.findByEmail(identifier);
        } else {
            optionalUser = userRepository.findByPhoneNumber(identifier);
        }

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Verify password hash using PasswordEncoder
            if (passwordEncoder.matches(password, user.getPassword())) {
                // Update last login
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                // Generate JWT Token
                String token = jwtUtil.generateToken(user.getEmail());

                // Save to database
                saveTokenForUser(user, token);

                // Log Activity
                activityLogService.log(user, "LOGIN", "Staff logged in from Dashboard");

                response.put("success", true);
                response.put("message", "Login successful");
                response.put("user", user.getName());
                response.put("email", user.getEmail());
                response.put("role", user.getRole()); // Add role to response
                response.put("token", token);
                return ResponseEntity.ok(response);
            }
        }

        response.put("success", false);
        response.put("message", "Invalid credentials");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-signup-otp")
    public ResponseEntity<Map<String, Object>> generateSignupOtp(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        String email = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(email).isPresent()) {
            response.put("success", false);
            response.put("message", "Email is already registered!");
            return ResponseEntity.ok(response);
        }

        if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            response.put("success", false);
            response.put("message", "Phone number is already registered!");
            return ResponseEntity.ok(response);
        }

        // Send OTP to email (SMS removed)
        otpService.generateAndSendOtp(email);

        response.put("success", true);
        response.put("message", "OTP sent to your email successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String phoneNumber = payload.get("phoneNumber");
        String password = payload.get("password");
        String role = payload.get("role");
        Map<String, Object> response = new HashMap<>();

        if (userRepository.findByEmail(email).isPresent()
                || userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            response.put("success", false);
            response.put("message", "Email or Phone number is already registered!");
            return ResponseEntity.ok(response);
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPhoneNumber(phoneNumber);
        // Hash the password before saving to DB!
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(role != null ? role : "DOCTOR");

        userRepository.save(newUser);

        // Log Registration
        activityLogService.log(newUser, "REGISTRATION", "New staff registered with role: " + newUser.getRole());

        // Generate JWT Token automatically on signup so user is logged in
        String token = jwtUtil.generateToken(email);

        // Save to database
        saveTokenForUser(newUser, token);

        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            Optional<Token> storedToken = tokenRepository.findByToken(jwt);

            if (storedToken.isPresent()) {
                Token tokenEntity = storedToken.get();
                tokenEntity.setLoggedOut(true);
                tokenRepository.save(tokenEntity);

                // Also update last logout time for the user
                String email = jwtUtil.extractUsername(jwt);
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    user.setLastLogout(LocalDateTime.now());
                    userRepository.save(user);

                    // Log Activity
                    activityLogService.log(user, "LOGOUT", "Staff logged out");
                }

                response.put("success", true);
                response.put("message", "Logged out successfully");
                return ResponseEntity.ok(response);
            }
        }

        response.put("success", false);
        response.put("message", "Invalid or missing token");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || !email.contains("@")) {
            response.put("success", false);
            response.put("message", "Please provide a valid Gmail address.");
            return ResponseEntity.ok(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            // Generate OTP and send to Email
            otpService.sendPasswordResetOtp(email);

            response.put("success", true);
            response.put("message", "An OTP has been sent to your registered Gmail: " + maskEmail(email));
        } else {
            response.put("success", false);
            response.put("message", "No account found with that Gmail address.");
        }

        return ResponseEntity.ok(response);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");
        if (atIndex <= 1)
            return email;
        return email.substring(0, 1) + "****" + email.substring(atIndex);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        Map<String, Object> response = new HashMap<>();

        if (email == null || otp == null || newPassword == null) {
            response.put("success", false);
            response.put("message", "Missing required fields.");
            return ResponseEntity.ok(response);
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Verify OTP against the email
            if (otpService.verifyOtp(email, otp)) {
                // Hash new password and update
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                // Send success notification
                otpService.sendPasswordResetSuccessEmail(email);

                response.put("success", true);
                response.put("message", "Password reset successfully! You can now log in.");
                return ResponseEntity.ok(response);
            }
        }

        response.put("success", false);
        response.put("message", "Invalid or expired OTP");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (id == null) {
            response.put("success", false);
            response.put("message", "ID is required");
            return ResponseEntity.badRequest().body(response);
        }
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isPresent()) {
            User userToRemove = userOpt.get();
            userRepository.delete(Objects.requireNonNull(userToRemove));
            response.put("success", true);
            response.put("message", "Staff member deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Staff member not found");
            return ResponseEntity.status(404).body(response);
        }
    }
}

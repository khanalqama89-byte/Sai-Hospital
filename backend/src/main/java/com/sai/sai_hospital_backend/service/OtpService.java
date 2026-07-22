package com.sai.sai_hospital_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Temporary in-memory storage for OTPs.
    // Key: email or identifier, Value: OTP string
    private final Map<String, String> otpStorage = new HashMap<>();

    @Async
    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Sai Hospital - Verification Code");
            message.setText("Your OTP is: " + otp + "\n\nIf you did not request this, please ignore.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email);
        }

        System.out.println("========== MOCK EMAIL ==========");
        System.out.println("To: " + email);
        System.out.println("OTP: " + otp);
        System.out.println("================================");
    }

    @Async
    public void sendPasswordResetOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        String messageBody = "Dear User,\n\n" +
                "We received a request to reset your password for your account.\n\n" +
                "Please use the following One-Time Password (OTP) to continue the password reset process:\n\n" +
                "OTP: " + otp + "\n\n" +
                "This code will expire in 10 minutes. For your security, please do not share this OTP with anyone.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Sai Hospital Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Request - Sai Hospital");
            message.setText(messageBody);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + email);
        }

        System.out.println("========== MOCK PASSWORD RESET EMAIL ==========");
        System.out.println("To: " + email);
        System.out.println("Body: \n" + messageBody);
        System.out.println("===============================================");
    }

    @Async
    public void sendPasswordResetSuccessEmail(String email) {
        String messageBody = "Dear User,\n\n" +
                "Your account password has been successfully reset after OTP verification.\n\n" +
                "You can now log in to your account using your new password. If you made this request, no further action is required.\n\n" +
                "If you did not request this password reset, please contact our support team immediately to secure your account.\n\n" +
                "Thank you for using our services.\n\n" +
                "Best regards,\n" +
                "Sai Hospital Support Team\n" +
                "Email: support@saihospital.com";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Password Reset Successful - Sai Hospital");
            message.setText(messageBody);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset success email to " + email);
        }

        System.out.println("========== MOCK PASSWORD RESET SUCCESS EMAIL ==========");
        System.out.println("To: " + email);
        System.out.println("Body: \n" + messageBody);
        System.out.println("=======================================================");
    }

    public boolean verifyOtp(String identifier, String otp) {
        if (otp != null && otp.equals(otpStorage.get(identifier))) {
            otpStorage.remove(identifier); // OTP is single-use
            return true;
        }
        return false;
    }

    @Async
    public void sendNotification(String contactEmail, String subject, String messageBody) {
        // Send Email if available
        if (contactEmail != null && !contactEmail.isEmpty()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(contactEmail);
                message.setSubject(subject);
                message.setText(messageBody);
                mailSender.send(message);
                System.out.println("Email notification sent successfully to " + contactEmail);
            } catch (Exception e) {
                System.err.println("Failed to send email notification to " + contactEmail + ": " + e.getMessage());
            }
        }

        // MOCK Notification for logs
        System.out.println("========== NOTIFICATION (EMAIL ONLY) ==========");
        System.out.println("To: " + contactEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Body: \n" + messageBody);
        System.out.println("===============================================");
    }
}

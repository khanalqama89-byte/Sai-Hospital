package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.Appointment;
import com.sai.sai_hospital_backend.repository.AppointmentRepository;
import com.sai.sai_hospital_backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@SuppressWarnings("null")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private OtpService otpService;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) {
            appointment.setStatus("PENDING");
        }
        if (appointment.getVisitStatus() == null || appointment.getVisitStatus().isEmpty()) {
            appointment.setVisitStatus("PENDING");
        }
        Appointment saved = appointmentRepository.save(appointment);

        // Send "Appointment Request Received" email
        String subject = "Appointment Request Received";
        String message = "Your appointment request has been successfully received and is currently under review by the hospital.\n" +
                         "You will be notified once your appointment is approved or rejected. Please wait for confirmation.";
        otpService.sendNotification(saved.getEmail(), subject, message);

        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id,
            @RequestBody Appointment details) {
        Optional<Appointment> optionalApp = appointmentRepository.findById(id);

        if (optionalApp.isPresent()) {
            Appointment existing = optionalApp.get();

            // Only update non-null provided values to support partial updates
            if (details.getFullName() != null)
                existing.setFullName(details.getFullName());
            if (details.getAge() != null)
                existing.setAge(details.getAge());
            if (details.getGender() != null)
                existing.setGender(details.getGender());
            if (details.getContact() != null)
                existing.setContact(details.getContact());
            if (details.getEmail() != null)
                existing.setEmail(details.getEmail());
            if (details.getAddress() != null)
                existing.setAddress(details.getAddress());
            if (details.getDisease() != null)
                existing.setDisease(details.getDisease());
            if (details.getAppointmentDate() != null)
                existing.setAppointmentDate(details.getAppointmentDate());
            if (details.getAppointmentTime() != null)
                existing.setAppointmentTime(details.getAppointmentTime());
            if (details.getScheduledDate() != null)
                existing.setScheduledDate(details.getScheduledDate());
            if (details.getScheduledTime() != null)
                existing.setScheduledTime(details.getScheduledTime());

            String oldStatus = existing.getStatus();
            String newStatus = details.getStatus();

            if (newStatus != null) {
                existing.setStatus(newStatus);
            }

            if (details.getVisitStatus() != null) {
                existing.setVisitStatus(details.getVisitStatus());
            }

            Appointment updated = appointmentRepository.save(existing);

            // Trigger Notifications if status changed to APPROVED or REJECTED
            if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
                String subject;
                String message;

                if ("APPROVED".equalsIgnoreCase(newStatus)) {
                    subject = "Appointment Confirmation - Sai Hospital";
                    String schedDate = updated.getScheduledDate() != null ? updated.getScheduledDate() : "TBD";
                    String schedTime = updated.getScheduledTime() != null ? updated.getScheduledTime() : "TBD";
                    
                    message = "Dear " + updated.getFullName() + ",\n\n" +
                              "We are pleased to inform you that your appointment request has been APPROVED.\n\n" +
                              "Scheduled Details:\n" +
                              "Date: " + schedDate + "\n" +
                              "Time: " + schedTime + "\n\n" +
                              "Please visit the hospital on the scheduled date and time mentioned above.\n" +
                              "If you have any questions or need to reschedule, please contact us at your earliest convenience.\n\n" +
                              "Thank you for choosing Sai Hospital.";
                    otpService.sendNotification(updated.getEmail(), subject, message);
                } else if ("REJECTED".equalsIgnoreCase(newStatus)) {
                    subject = "Appointment Update";
                    message = "We regret to inform you that your appointment request has been rejected. This may be due to schedule unavailability or other reasons.\n" +
                              "Please try booking another appointment or contact the hospital for assistance.\n" +
                              "Thank you for your understanding.";
                    otpService.sendNotification(updated.getEmail(), subject, message);
                    
                    // Also update visitStatus to REJECTED
                    existing.setVisitStatus("REJECTED");
                    appointmentRepository.save(existing);
                }
            }

            return ResponseEntity.ok().body(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

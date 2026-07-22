package com.sai.sai_hospital_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private Integer age;
    private String gender;
    private String contact;
    private String email;
    private String address;
    private String disease;
    private String appointmentDate;
    private String appointmentTime;
    private String scheduledDate;
    private String scheduledTime;

    // e.g. "PENDING", "APPROVED", "REJECTED"
    private String status;

    // e.g. "PENDING", "COMPLETED"
    private String visitStatus;

}

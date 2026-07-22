package com.sai.sai_hospital_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action;

    private String details;

    private LocalDateTime timestamp;

    public ActivityLog(User user, String action, String details) {
        this.user = user;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}

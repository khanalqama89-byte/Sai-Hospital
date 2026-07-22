package com.sai.sai_hospital_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "lab_records")
public class LabRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String test;
    private String name;
    private String address;
    private String contact;
    private String gender;
    private Integer age;
    private String date;
    private String reportStatus;

}

package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.IpdRecord;
import com.sai.sai_hospital_backend.repository.IpdRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ipd")
@CrossOrigin(origins = "http://localhost:3000") // Assuming React is on port 3000
public class IpdController {

    @Autowired
    private IpdRecordRepository ipdRecordRepository;

    // Get all IPD records
    @GetMapping
    public List<IpdRecord> getAllIpdRecords() {
        return ipdRecordRepository.findAll();
    }

    // Admit new patient
    @PostMapping("/admit")
    public IpdRecord admitPatient(@RequestBody IpdRecord record) {
        record.setStatus("ADMITTED");
        record.setAdmissionDate(LocalDateTime.now());
        return ipdRecordRepository.save(record);
    }

    // Discharge a patient
    @PutMapping("/discharge/{id}")
    public ResponseEntity<IpdRecord> dischargePatient(
            @PathVariable @NonNull Long id,
            @RequestBody IpdRecord dischargeData) {

        return ipdRecordRepository.findById(id).map(record -> {
            record.setStatus("DISCHARGED");
            record.setDischargeDate(LocalDateTime.now());
            record.setTotalBill(dischargeData.getTotalBill());
            return ResponseEntity.ok(ipdRecordRepository.save(record));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Update IPD record (e.g., changing ward/bed)
    @PutMapping("/{id}")
    public ResponseEntity<IpdRecord> updateRecord(@PathVariable @NonNull Long id,
            @RequestBody IpdRecord updatedRecord) {
        return ipdRecordRepository.findById(id).map(record -> {
            record.setPatientName(updatedRecord.getPatientName());
            record.setAge(updatedRecord.getAge());
            record.setGender(updatedRecord.getGender());
            record.setDisease(updatedRecord.getDisease());
            record.setWardBedNo(updatedRecord.getWardBedNo());
            record.setAddress(updatedRecord.getAddress());
            record.setEmail(updatedRecord.getEmail());
            record.setContact(updatedRecord.getContact());
            record.setTotalBill(updatedRecord.getTotalBill());
            return ResponseEntity.ok(ipdRecordRepository.save(record));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete record
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable @NonNull Long id) {
        return ipdRecordRepository.findById(id).map((@NonNull IpdRecord record) -> {
            ipdRecordRepository.delete(record);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}

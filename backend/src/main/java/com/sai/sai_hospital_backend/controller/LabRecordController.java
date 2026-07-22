package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.LabRecord;
import com.sai.sai_hospital_backend.repository.LabRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api/lab-records")
public class LabRecordController {

    @Autowired
    private LabRecordRepository labRecordRepository;

    @GetMapping
    public List<LabRecord> getAllRecords() {
        return labRecordRepository.findAll();
    }

    @PostMapping
    public LabRecord createRecord(@NonNull @RequestBody LabRecord labRecord) {
        if (labRecord.getReportStatus() == null || labRecord.getReportStatus().isEmpty()) {
            labRecord.setReportStatus("PENDING");
        }
        return labRecordRepository.save(labRecord);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabRecord> updateRecord(@NonNull @PathVariable Long id,
            @NonNull @RequestBody LabRecord recordDetails) {
        Optional<LabRecord> optionalRecord = labRecordRepository.findById(id);

        if (optionalRecord.isPresent()) {
            LabRecord existingRecord = optionalRecord.get();
            existingRecord.setTest(recordDetails.getTest());
            existingRecord.setName(recordDetails.getName());
            existingRecord.setAddress(recordDetails.getAddress());
            existingRecord.setContact(recordDetails.getContact());
            existingRecord.setGender(recordDetails.getGender());
            existingRecord.setAge(recordDetails.getAge());
            existingRecord.setDate(recordDetails.getDate());
            existingRecord.setReportStatus(recordDetails.getReportStatus());

            LabRecord updatedRecord = labRecordRepository.save(existingRecord);
            return ResponseEntity.ok(updatedRecord);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@NonNull @PathVariable Long id) {
        if (labRecordRepository.existsById(id)) {
            labRecordRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

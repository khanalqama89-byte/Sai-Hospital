package com.sai.sai_hospital_backend.repository;

import com.sai.sai_hospital_backend.model.LabRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabRecordRepository extends JpaRepository<LabRecord, Long> {
}

package com.sai.sai_hospital_backend.repository;

import com.sai.sai_hospital_backend.model.IpdRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IpdRecordRepository extends JpaRepository<IpdRecord, Long> {
    List<IpdRecord> findByStatus(String status);
}

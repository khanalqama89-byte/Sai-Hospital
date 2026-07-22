package com.sai.sai_hospital_backend.controller;

import com.sai.sai_hospital_backend.model.ActivityLog;
import com.sai.sai_hospital_backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllLogs() {
        List<ActivityLog> logs = activityLogRepository.findAllByOrderByTimestampDesc();
        
        List<Map<String, Object>> response = logs.stream().map(log -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", log.getId());
            map.put("userName", log.getUser() != null ? log.getUser().getName() : "System");
            map.put("userRole", log.getUser() != null ? log.getUser().getRole() : "SYSTEM");
            map.put("userEmail", log.getUser() != null ? log.getUser().getEmail() : "N/A");
            map.put("action", log.getAction());
            map.put("details", log.getDetails());
            map.put("timestamp", log.getTimestamp());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}

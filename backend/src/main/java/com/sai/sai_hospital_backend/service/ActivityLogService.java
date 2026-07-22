package com.sai.sai_hospital_backend.service;

import com.sai.sai_hospital_backend.model.ActivityLog;
import com.sai.sai_hospital_backend.model.User;
import com.sai.sai_hospital_backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(User user, String action, String details) {
        ActivityLog log = new ActivityLog(user, action, details);
        activityLogRepository.save(log);
    }
}

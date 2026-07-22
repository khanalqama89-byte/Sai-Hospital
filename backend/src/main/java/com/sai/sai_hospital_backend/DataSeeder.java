package com.sai.sai_hospital_backend;

import com.sai.sai_hospital_backend.model.Appointment;
import com.sai.sai_hospital_backend.model.LabRecord;
import com.sai.sai_hospital_backend.model.User;
import com.sai.sai_hospital_backend.repository.AppointmentRepository;
import com.sai.sai_hospital_backend.repository.LabRecordRepository;
import com.sai.sai_hospital_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LabRecordRepository labRecordRepository;

    @Override
    @SuppressWarnings("null")
    public void run(String... args) throws Exception {
        if (appointmentRepository.count() == 0) {
            Appointment app1 = new Appointment();
            app1.setFullName("Rahul Sharma");
            app1.setAge(35);
            app1.setGender("Male");
            app1.setContact("9876543210");
            app1.setEmail("rahul@example.com");
            app1.setAddress("Mumbai");
            app1.setDisease("Viral Fever");
            app1.setAppointmentDate("2024-05-10");
            app1.setAppointmentTime("10:30 AM");
            app1.setStatus("APPROVED");

            Appointment app2 = new Appointment();
            app2.setFullName("Priya Desai");
            app2.setAge(28);
            app2.setGender("Female");
            app2.setContact("9123456780");
            app2.setEmail("priya@example.com");
            app2.setAddress("Pune");
            app2.setDisease("Headache");
            app2.setAppointmentDate("2024-05-11");
            app2.setAppointmentTime("11:00 AM");
            app2.setStatus("PENDING");

            Appointment app3 = new Appointment();
            app3.setFullName("Amit Patel");
            app3.setAge(42);
            app3.setGender("Male");
            app3.setContact("9345678901");
            app3.setEmail("amit@example.com");
            app3.setAddress("Ahmedabad");
            app3.setDisease("Back Pain");
            app3.setAppointmentDate("2024-05-12");
            app3.setAppointmentTime("04:15 PM");
            app3.setStatus("REJECTED");

            appointmentRepository.saveAll(Arrays.asList(app1, app2, app3));
        }

        if (userRepository.count() == 0) {
            User u1 = new User();
            u1.setName("Admin User");
            u1.setEmail("admin@saihospital.com");
            u1.setPhoneNumber("9999999999");
            u1.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt()));

            User u2 = new User();
            u2.setName("Ramesh Kumar");
            u2.setEmail("ramesh@example.com");
            u2.setPhoneNumber("8888888888");
            u2.setPassword(BCrypt.hashpw("password", BCrypt.gensalt()));

            userRepository.saveAll(Arrays.asList(u1, u2));
        }

        if (labRecordRepository.count() == 0) {
            LabRecord lr1 = new LabRecord();
            lr1.setTest("CBC Test");
            lr1.setName("Rahul Sharma");
            lr1.setAddress("Mumbai");
            lr1.setContact("9876543210");
            lr1.setGender("Male");
            lr1.setAge(35);
            lr1.setDate("2024-05-09");

            LabRecord lr2 = new LabRecord();
            lr2.setTest("Blood Sugar");
            lr2.setName("Priya Desai");
            lr2.setAddress("Pune");
            lr2.setContact("9123456780");
            lr2.setGender("Female");
            lr2.setAge(28);
            lr2.setDate("2024-05-10");

            labRecordRepository.saveAll(Arrays.asList(lr1, lr2));
        }
    }
}

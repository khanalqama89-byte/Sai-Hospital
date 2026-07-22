-- ==========================================================
-- Sai Hospital Database Complete Setup Script
-- ==========================================================

-- 1. Create the database (if it does not exist)
CREATE DATABASE IF NOT EXISTS sai_hospital;
USE sai_hospital;

-- ==========================================================
-- 2. Create Tables
-- ==========================================================

-- Table: users (Stores Admin credentials)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

-- Table: tokens (Stores JWT tokens for authentication)
CREATE TABLE IF NOT EXISTS tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    is_logged_out BOOLEAN DEFAULT FALSE,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: appointments (Stores booked appointments from the website)
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    age INT,
    gender VARCHAR(255),
    contact VARCHAR(255),
    email VARCHAR(255),
    address VARCHAR(255),
    disease VARCHAR(255),
    appointment_date VARCHAR(255),
    appointment_time VARCHAR(255),
    status VARCHAR(255) DEFAULT 'PENDING'
);

-- Table: lab_records (Stores Pathology/Lab records)
CREATE TABLE IF NOT EXISTS lab_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test VARCHAR(255),
    name VARCHAR(255),
    address VARCHAR(255),
    contact VARCHAR(255),
    gender VARCHAR(255),
    age INT,
    date VARCHAR(255)
);

-- Table: ipd_records (Stores Admitted Patient and Discharge records)
CREATE TABLE IF NOT EXISTS ipd_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255),
    age INT,
    gender VARCHAR(255),
    disease VARCHAR(255),
    ward_bed_no VARCHAR(255),
    address VARCHAR(255),
    email VARCHAR(255),
    contact VARCHAR(255),
    admission_date DATETIME,
    discharge_date DATETIME,
    status VARCHAR(255),
    total_bill DOUBLE
);

-- ==========================================================
-- 3. Insert Default Admin User (Optional)
-- Password format will depend on your BCrypt hashing. 
-- By default, you can register a user through the Signup API.
-- ==========================================================
-- INSERT INTO users (name, email, phone_number, password) 
-- VALUES ('Admin', 'admin@saihospital.com', '1234567890', '$2a$10$YourHashedPasswordHere');

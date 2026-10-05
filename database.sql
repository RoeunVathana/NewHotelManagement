-- ==========================================
-- HOTEL MANAGEMENT SYSTEM DATABASE
-- MySQL 8+
-- ==========================================

DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE hotel_management;
USE hotel_management;

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- USER PROFILE
-- ==========================================
CREATE TABLE user_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender ENUM('Male','Female','Other'),
    phone VARCHAR(20),
    address TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==========================================
-- ROLE
-- ==========================================
CREATE TABLE Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100),
    status BOOL
);

-- ==========================================
-- USER ROLE
-- ==========================================
CREATE TABLE User_Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE
);

-- ==========================================
-- PERMISSION GROUP
-- ==========================================
CREATE TABLE permission_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PERMISSION
-- ==========================================
CREATE TABLE permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100),
    group_id INT NOT NULL,
    route_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES permission_group(id)
);

-- ==========================================
-- PERMISSION ROLE
-- ==========================================
CREATE TABLE permission_role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
);

-- ==========================================
-- CUSTOMERS
-- ==========================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male','Female','Other'),
    phone VARCHAR(20),
    email VARCHAR(150),
    nationality VARCHAR(100),
    passport_no VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- EMPLOYEES
-- ==========================================
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    gender ENUM('Male','Female','Other'),
    phone VARCHAR(20),
    email VARCHAR(150),
    role VARCHAR(100),
    salary DECIMAL(10,2),
    hire_date DATE
);

-- ==========================================
-- ROOM TYPES
-- ==========================================
CREATE TABLE room_types (
    room_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guest INT NOT NULL,
    description TEXT
);

-- ==========================================
-- ROOMS
-- ==========================================
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type_id INT NOT NULL,
    floor INT,
    status ENUM(
        'Available',
        'Reserved',
        'Occupied',
        'Cleaning',
        'Maintenance'
    ) DEFAULT 'Available',
    description TEXT,
    CONSTRAINT fk_room_type
        FOREIGN KEY (room_type_id)
        REFERENCES room_types(room_type_id)
        ON UPDATE CASCADE
);

-- ==========================================
-- RESERVATIONS
-- ==========================================
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_guest INT,
    status ENUM(
        'Pending',
        'Confirmed',
        'Cancelled',
        'Completed'
    ) DEFAULT 'Pending',
    note TEXT,
    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON UPDATE CASCADE
);

-- ==========================================
-- RESERVATION DETAILS
-- ==========================================
CREATE TABLE reservation_details (
    reservation_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    room_id INT NOT NULL,
    price DECIMAL(10,2),
    nights INT,
    subtotal DECIMAL(10,2),
    CONSTRAINT fk_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(room_id)
        ON UPDATE CASCADE
);

-- ==========================================
-- CHECK IN
-- ==========================================
CREATE TABLE check_ins (
    checkin_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    checkin_time DATETIME,
    deposit DECIMAL(10,2),
    CONSTRAINT fk_ci_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id),
    CONSTRAINT fk_ci_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
);

-- ==========================================
-- CHECK OUT
-- ==========================================
CREATE TABLE check_outs (
    checkout_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    checkout_time DATETIME,
    total_amount DECIMAL(10,2),
    damage_fee DECIMAL(10,2),
    discount DECIMAL(10,2),
    CONSTRAINT fk_co_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id),
    CONSTRAINT fk_co_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM(
        'Cash',
        'Credit Card',
        'Visa',
        'MasterCard',
        'ABA KHQR'
    ),
    payment_date DATETIME,
    transaction_id VARCHAR(100),
    status ENUM(
        'Pending',
        'Paid',
        'Refunded'
    ) DEFAULT 'Pending',
    CONSTRAINT fk_payment_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id)
        ON DELETE CASCADE
);

-- ==========================================
-- SERVICES
-- ==========================================
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    description TEXT
);

-- ==========================================
-- SERVICE ORDERS
-- ==========================================
CREATE TABLE service_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total DECIMAL(10,2),
    order_date DATETIME,
    CONSTRAINT fk_service_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(reservation_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
);


-- =========================================
-- BACKUP INFORMATION
-- =========================================

-- ==========================================
-- SAMPLE ROOM TYPES
-- ==========================================
INSERT INTO room_types(name, price_per_night, max_guest)
VALUES
('Single', 40.00, 1),
('Double', 70.00, 2),
('Deluxe', 120.00, 3),
('Suite', 250.00, 5);

-- ==========================================
-- SAMPLE SERVICES
-- ==========================================
INSERT INTO services(service_name, price)
VALUES
('Breakfast', 10.00),
('Laundry', 8.00),
('Spa', 30.00),
('Airport Pickup', 20.00);
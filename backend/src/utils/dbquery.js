// department table Query

// CREATE TABLE departments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
//     department_name VARCHAR(100) NOT NULL UNIQUE,
//     description TEXT NULL,
//     is_active TINYINT(1) DEFAULT 1,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- Constraints
//     CONSTRAINT chk_department_name_length
//         CHECK (LENGTH(department_name) >= 2)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// user table query

// CREATE TABLE users (
//     -- Primary Identifiers
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid CHAR(36) NOT NULL UNIQUE,

//     -- User Information
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(150) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,

//     -- Relationships
//     role_id INT NOT NULL,
//     department_id INT NULL,      -- 🔹 New column added
//     manager_id INT NULL,

//     -- Status & Authentication
//     is_active TINYINT(1) DEFAULT 1,
//     refreshToken VARCHAR(255) NULL,

//     -- Timestamps
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- 🔹 Role Foreign Key
//     CONSTRAINT fk_user_role
//     FOREIGN KEY (role_id)
//     REFERENCES roles(id)
//     ON DELETE RESTRICT
//     ON UPDATE CASCADE,

//     -- 🔹 Department Foreign Key (NEW)
//     CONSTRAINT fk_user_department
//     FOREIGN KEY (department_id)
//     REFERENCES departments(id)
//     ON DELETE SET NULL
//     ON UPDATE CASCADE,

//     -- 🔹 Self Reference (Manager)
//     CONSTRAINT fk_user_manager
//     FOREIGN KEY (manager_id)
//     REFERENCES users(id)
//     ON DELETE SET NULL
//     ON UPDATE CASCADE

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// CREATE TABLE roles (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid VARCHAR(100) NOT NULL UNIQUE,
//     role_name VARCHAR(100) NOT NULL,
//     department_id INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- 🔹 Department Foreign Key
//     CONSTRAINT fk_role_department
//     FOREIGN KEY (department_id)
//     REFERENCES departments(id)
//     ON DELETE RESTRICT
//     ON UPDATE CASCADE,

//     -- 🔹 Unique constraint to prevent duplicate roles in same department
//     CONSTRAINT uk_role_department UNIQUE (role_name, department_id)

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// CREATE TABLE regions (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid VARCHAR(36) NOT NULL UNIQUE,
//     region_name VARCHAR(100) NOT NULL,
//     bdm_id INT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- 🔹 BDM (Business Development Manager) Foreign Key
//     CONSTRAINT fk_region_bdm
//     FOREIGN KEY (bdm_id)
//     REFERENCES users(id)
//     ON DELETE SET NULL
//     ON UPDATE CASCADE,

//     -- 🔹 Unique constraint on region name
//     CONSTRAINT uk_region_name UNIQUE (region_name)

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// CREATE TABLE zones (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid VARCHAR(100) NOT NULL UNIQUE,
//     zone_name VARCHAR(100) NOT NULL,
//     zone_manager_id INT NULL,
//     region_id INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- 🔹 Zone Manager Foreign Key (references users table)
//     CONSTRAINT fk_zone_manager
//     FOREIGN KEY (zone_manager_id)
//     REFERENCES users(id)
//     ON DELETE SET NULL
//     ON UPDATE CASCADE,

//     -- 🔹 Region Foreign Key (references regions table)
//     CONSTRAINT fk_zone_region
//     FOREIGN KEY (region_id)
//     REFERENCES regions(id)
//     ON DELETE RESTRICT
//     ON UPDATE CASCADE,

//     -- 🔹 Unique constraint on zone name within a region
//     CONSTRAINT uk_zone_name_region UNIQUE (zone_name, region_id)

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// CREATE TABLE cities (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uuid VARCHAR(100) NOT NULL UNIQUE,
//     city_name VARCHAR(100) NOT NULL,
//     zone_id INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//                 ON UPDATE CURRENT_TIMESTAMP,

//     -- 🔹 Zone Foreign Key (references zones table)
//     CONSTRAINT fk_city_zone
//     FOREIGN KEY (zone_id)
//     REFERENCES zones(id)
//     ON DELETE RESTRICT
//     ON UPDATE CASCADE,

//     -- 🔹 Unique constraint on city name within a zone
//     CONSTRAINT uk_city_name_zone UNIQUE (city_name, zone_id)

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

// CREATE TABLE employee_cities (
//   id INT AUTO_INCREMENT PRIMARY KEY,

//   uuid CHAR(36) NOT NULL UNIQUE,

//   employee_id INT NOT NULL,

//   city_id INT NOT NULL,

//   assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//   -- 🔹 Foreign Key to users table
//   CONSTRAINT fk_employee_city_user
//   FOREIGN KEY (employee_id)
//   REFERENCES users(id)
//   ON DELETE CASCADE
//   ON UPDATE CASCADE,

//   -- 🔹 Foreign Key to cities table
//   CONSTRAINT fk_employee_city_city
//   FOREIGN KEY (city_id)
//   REFERENCES cities(id)
//   ON DELETE CASCADE
//   ON UPDATE CASCADE,

//   -- 🔹 Prevent duplicate assignment
//   UNIQUE KEY unique_employee_city (employee_id, city_id)
// );

// CREATE TABLE policies (
// id INT AUTO_INCREMENT PRIMARY KEY,
// title VARCHAR(255) NOT NULL,
// category ENUM('HR','Compliance','Finance','IT') NOT NULL,
// description TEXT NOT NULL,
// fileUrl TEXT,
// version VARCHAR(20) DEFAULT '1.0',
// lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
// status ENUM('active','draft','archived') DEFAULT 'draft',
// created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
// INDEX idx_category (category),
// INDEX idx_status (status)
// );

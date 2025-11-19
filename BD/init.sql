-- Инициализация базы данных
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Очистка существующих таблиц (опционально)
DROP TABLE IF EXISTS incident_persons;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS persons;
DROP TABLE IF EXISTS users;

-- Создание таблиц
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'user-' || uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE persons (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'person-' || uuid_generate_v4(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('suspect', 'witness', 'victim')) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'inc-' || uuid_generate_v4(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_persons (
    incident_id VARCHAR(255) REFERENCES incidents(id) ON DELETE CASCADE,
    person_id VARCHAR(255) REFERENCES persons(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, person_id)
);


-- Вставка тестовых персон
INSERT INTO persons (id, registration_number, name, address, role, phone, email) VALUES
('person-1', 'PR000001', 'John Doe', '123 Main St, City', 'victim', '+1234567890', 'john@example.com'),
('person-2', 'PR000002', 'Jane Smith', '456 Oak Ave, Town', 'witness', '+0987654321', 'jane@example.com'),
('person-3', 'PR000003', 'Bob Johnson', '789 Pine Rd, Village', 'suspect', '+1122334455', 'bob@example.com'),
('person-4', 'PR000004', 'Alice Brown', '321 Elm St, City', 'victim', '+5566778899', 'alice@example.com'),
('person-5', 'PR000005', 'Charlie Wilson', '654 Maple Dr, Town', 'witness', '+4433221100', 'charlie@example.com');

-- Вставка тестовых инцидентов
INSERT INTO incidents (id, registration_number, type, description, location, date, severity) VALUES
('inc-1', 'RN000001', 'Robbery', 'Armed robbery at convenience store', '123 Main St, City', CURRENT_TIMESTAMP - INTERVAL '2 days', 'high'),
('inc-2', 'RN000002', 'Traffic Accident', 'Two-car collision at intersection', '456 Oak Ave, Town', CURRENT_TIMESTAMP - INTERVAL '1 day', 'medium'),
('inc-3', 'RN000003', 'Burglary', 'Break-in at residential property', '789 Pine Rd, Village', CURRENT_TIMESTAMP - INTERVAL '3 days', 'high'),
('inc-4', 'RN000004', 'Assault', 'Physical altercation in park', '321 Elm St, City', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'medium'),
('inc-5', 'RN000005', 'Theft', 'Shoplifting incident', '654 Maple Dr, Town', CURRENT_TIMESTAMP - INTERVAL '12 hours', 'low');

-- Вставка связей инцидент-персона (уникальные пары, существующие ID)
INSERT INTO incident_persons (incident_id, person_id) VALUES
('inc-1', 'person-1'),  -- John Doe - victim of robbery
('inc-1', 'person-3'),  -- Bob Johnson - suspect in robbery
('inc-2', 'person-2'),  -- Jane Smith - witness to accident
('inc-2', 'person-5'),  -- Charlie Wilson - witness to accident
('inc-3', 'person-4'),  -- Alice Brown - victim of burglary
('inc-3', 'person-3'),  -- Bob Johnson - suspect in burglary
('inc-4', 'person-1'),  -- John Doe - victim of assault
('inc-4', 'person-3'),  -- Bob Johnson - suspect in assault
('inc-5', 'person-3');  -- Bob Johnson - suspect in theft
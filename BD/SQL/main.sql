DROP TABLE IF EXISTS "persons";
DROP TABLE IF EXISTS "incidents";
DROP TABLE IF EXISTS "incident_persons";
DROP TABLE IF EXISTS "users";


CREATE TABLE persons (
    id VARCHAR(255) PRIMARY KEY,
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
    id VARCHAR(255) PRIMARY KEY,
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

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, hashed_password, is_active, created_at) values (
    1, 'mark'
)
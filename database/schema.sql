-- TestMaster Database Schema

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    plan ENUM('FREE', 'PROFESSIONAL', 'ENTERPRISE') DEFAULT 'FREE',
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('SUPER_ADMIN', 'ORG_ADMIN', 'TESTER', 'VIEWER') DEFAULT 'TESTER',
    organization_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_organization(organization_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token(token),
    INDEX idx_user_id(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id INT NOT NULL,
    settings JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_organization(organization_id),
    INDEX idx_created_by(created_by),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Cases
CREATE TABLE IF NOT EXISTS test_cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('WEB', 'MOBILE', 'API', 'DESKTOP') DEFAULT 'WEB',
    steps JSON,
    data_bindings JSON,
    tags JSON,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('ACTIVE', 'DRAFT', 'DEPRECATED') DEFAULT 'ACTIVE',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_project(project_id),
    INDEX idx_type(type),
    INDEX idx_status(status),
    FULLTEXT idx_name_description(name, description),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Suites
CREATE TABLE IF NOT EXISTS test_suites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_case_ids JSON,
    execution_order ENUM('SEQUENTIAL', 'PARALLEL') DEFAULT 'SEQUENTIAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Objects (Object Repository)
CREATE TABLE IF NOT EXISTS test_objects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('WEB_ELEMENT', 'MOBILE_ELEMENT', 'API_ENDPOINT') DEFAULT 'WEB_ELEMENT',
    locators JSON,
    properties JSON,
    screenshot_url VARCHAR(500),
    parent_id INT NULL,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    INDEX idx_name(name),
    INDEX idx_parent(parent_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES test_objects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locator Strategies
CREATE TABLE IF NOT EXISTS locator_strategies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_object_id INT NOT NULL,
    strategy ENUM('XPATH', 'CSS', 'ID', 'NAME', 'CLASS', 'TAG_NAME', 'LINK_TEXT', 'PARTIAL_LINK_TEXT', 'ROLE', 'TEST_ID') NOT NULL,
    value TEXT NOT NULL,
    priority TINYINT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_object(test_object_id),
    FOREIGN KEY (test_object_id) REFERENCES test_objects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Runs
CREATE TABLE IF NOT EXISTS test_runs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    test_suite_id INT,
    environment VARCHAR(100),
    status ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'STOPPED', 'ERROR') DEFAULT 'PENDING',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    triggered_by INT,
    execution_config JSON,
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    skipped_tests INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    INDEX idx_suite(test_suite_id),
    INDEX idx_status(status),
    INDEX idx_started_at(started_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE SET NULL,
    FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Results
CREATE TABLE IF NOT EXISTS test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_run_id INT NOT NULL,
    test_case_id INT NOT NULL,
    status ENUM('PASSED', 'FAILED', 'SKIPPED', 'ERROR') NOT NULL,
    duration INT,
    error_message TEXT,
    error_stack TEXT,
    screenshots JSON,
    video_url VARCHAR(500),
    logs_url VARCHAR(500),
    retry_count INT DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_run(test_run_id),
    INDEX idx_test_case(test_case_id),
    INDEX idx_status(status),
    FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Execution Logs
CREATE TABLE IF NOT EXISTS execution_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    INDEX idx_result(test_result_id),
    INDEX idx_level(level),
    INDEX idx_timestamp(timestamp),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Environments
CREATE TABLE IF NOT EXISTS environments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500),
    variables JSON,
    credentials JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    UNIQUE KEY unique_project_env(project_id, name),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Execution Profiles
CREATE TABLE IF NOT EXISTS execution_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    browser ENUM('CHROMIUM', 'FIREFOX', 'WEBKIT', 'CHROME', 'EDGE') DEFAULT 'CHROMIUM',
    device VARCHAR(100),
    parallel_sessions INT DEFAULT 1,
    timeout_settings JSON,
    headless BOOLEAN DEFAULT FALSE,
    video_recording BOOLEAN DEFAULT TRUE,
    screenshot_on_failure BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    type ENUM('JIRA', 'GITHUB', 'GITLAB', 'SLACK', 'TEAMS', 'JENKINS', 'AZURE_DEVOPS') NOT NULL,
    config JSON NOT NULL,
    credentials_encrypted TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_organization(organization_id),
    INDEX idx_type(type),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    events JSON,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project(project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test Metrics
CREATE TABLE IF NOT EXISTS test_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    date DATE NOT NULL,
    total_tests INT DEFAULT 0,
    passed INT DEFAULT 0,
    failed INT DEFAULT 0,
    skipped INT DEFAULT 0,
    avg_duration DECIMAL(10,2),
    flaky_tests INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_date(project_id, date),
    UNIQUE KEY unique_project_date(project_id, date),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_case_id INT,
    suggestion_type ENUM('CODE_COMPLETION', 'TEST_GENERATION', 'SELF_HEALING', 'OPTIMIZATION') NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_case(test_case_id),
    INDEX idx_type(suggestion_type),
    INDEX idx_applied(applied),
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Self-Healing Logs
CREATE TABLE IF NOT EXISTS self_healing_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_result_id INT NOT NULL,
    object_id INT NOT NULL,
    old_locator JSON NOT NULL,
    new_locator JSON NOT NULL,
    healing_strategy VARCHAR(100),
    confidence DECIMAL(3,2),
    auto_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_result(test_result_id),
    INDEX idx_object(object_id),
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (object_id) REFERENCES test_objects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user(user_id),
    INDEX idx_organization(organization_id),
    INDEX idx_key_hash(key_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

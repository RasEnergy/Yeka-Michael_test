-- Create initial school
INSERT INTO schools (id, name, code, address, phone, email, is_active, created_at, updated_at)
VALUES 
  ('school_1', 'Yeka Michael Schools', 'SMS', 'Addis Ababa, Ethiopia', '+251911234567', 'info@sintmichaela.edu.et', true, NOW(), NOW());

-- Create branches
INSERT INTO branches (id, name, code, address, phone, email, school_id, is_active, created_at, updated_at)
VALUES 
  ('branch_1', 'Main Campus', 'MC', 'Bole, Addis Ababa', '+251911234567', 'main@sintmichaela.edu.et', 'school_1', true, NOW(), NOW()),
  ('branch_2', 'Secondary Campus', 'SC', 'Kazanchis, Addis Ababa', '+251911234568', 'secondary@sintmichaela.edu.et', 'school_1', true, NOW(), NOW());

-- Create academic year
INSERT INTO academic_years (id, name, start_date, end_date, is_active, created_at, updated_at)
VALUES 
  ('ay_2024', '2024/2025 Academic Year', '2024-09-01', '2025-06-30', true, NOW(), NOW());

-- Create grades
INSERT INTO grades (id, name, level, created_at, updated_at)
VALUES 
  ('grade_1', 'Grade 1', 1, NOW(), NOW()),
  ('grade_2', 'Grade 2', 2, NOW(), NOW()),
  ('grade_3', 'Grade 3', 3, NOW(), NOW()),
  ('grade_4', 'Grade 4', 4, NOW(), NOW()),
  ('grade_5', 'Grade 5', 5, NOW(), NOW()),
  ('grade_6', 'Grade 6', 6, NOW(), NOW()),
  ('grade_7', 'Grade 7', 7, NOW(), NOW()),
  ('grade_8', 'Grade 8', 8, NOW(), NOW()),
  ('grade_9', 'Grade 9', 9, NOW(), NOW()),
  ('grade_10', 'Grade 10', 10, NOW(), NOW()),
  ('grade_11', 'Grade 11', 11, NOW(), NOW()),
  ('grade_12', 'Grade 12', 12, NOW(), NOW());

-- Create classes
INSERT INTO classes (id, name, section, capacity, branch_id, grade_id, academic_year_id, is_active, created_at, updated_at)
VALUES 
  ('class_1a', 'Grade 1', 'A', 30, 'branch_1', 'grade_1', 'ay_2024', true, NOW(), NOW()),
  ('class_1b', 'Grade 1', 'B', 30, 'branch_1', 'grade_1', 'ay_2024', true, NOW(), NOW()),
  ('class_2a', 'Grade 2', 'A', 30, 'branch_1', 'grade_2', 'ay_2024', true, NOW(), NOW()),
  ('class_3a', 'Grade 3', 'A', 30, 'branch_2', 'grade_3', 'ay_2024', true, NOW(), NOW());

-- Create fee types
INSERT INTO fee_types (id, name, description, is_recurring, created_at, updated_at)
VALUES 
  ('fee_tuition', 'Tuition Fee', 'Monthly tuition fee', true, NOW(), NOW()),
  ('fee_registration', 'Registration Fee', 'One-time registration fee', false, NOW(), NOW()),
  ('fee_uniform', 'Uniform Fee', 'School uniform cost', false, NOW(), NOW()),
  ('fee_books', 'Books & Materials', 'Textbooks and learning materials', false, NOW(), NOW()),
  ('fee_transport', 'Transportation', 'School bus service', true, NOW(), NOW()),
  ('fee_lunch', 'Lunch Program', 'School meal program', true, NOW(), NOW());

-- Create SMS templates
INSERT INTO sms_templates (id, name, content, variables, is_active, created_at, updated_at)
VALUES 
  ('sms_welcome', 'Welcome Message', 'Welcome to Yeka Michael Schools, {{studentName}}! Your student ID is {{studentId}}. We look forward to your academic journey with us.', ARRAY['studentName', 'studentId'], true, NOW(), NOW()),
  ('sms_payment_reminder', 'Payment Reminder', 'Dear {{parentName}}, this is a reminder that payment for {{studentName}} (ID: {{studentId}}) is due on {{dueDate}}. Amount: ETB {{amount}}.', ARRAY['parentName', 'studentName', 'studentId', 'dueDate', 'amount'], true, NOW(), NOW()),
  ('sms_payment_received', 'Payment Confirmation', 'Payment received for {{studentName}} (ID: {{studentId}}). Amount: ETB {{amount}}. Receipt: {{receiptNumber}}. Thank you!', ARRAY['studentName', 'studentId', 'amount', 'receiptNumber'], true, NOW(), NOW());

-- Create admin user (password: admin123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, school_id, branch_id, is_active, created_at, updated_at)
VALUES 
  ('user_admin', 'admin@sintmichaela.edu.et', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'System', 'Administrator', '+251911234567', 'SUPER_ADMIN', 'school_1', NULL, true, NOW(), NOW());

-- Create branch admin (password: admin123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, school_id, branch_id, is_active, created_at, updated_at)
VALUES 
  ('user_branch_admin', 'branch.admin@sintmichaela.edu.et', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Branch', 'Administrator', '+251911234568', 'BRANCH_ADMIN', 'school_1', 'branch_1', true, NOW(), NOW());

-- Create registrar (password: registrar123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, school_id, branch_id, is_active, created_at, updated_at)
VALUES 
  ('user_registrar', 'registrar@sintmichaela.edu.et', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'School', 'Registrar', '+251911234569', 'REGISTRAR', 'school_1', 'branch_1', true, NOW(), NOW());

-- Create cashier (password: cashier123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, school_id, branch_id, is_active, created_at, updated_at)
VALUES 
  ('user_cashier', 'cashier@sintmichaela.edu.et', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'School', 'Cashier', '+251911234570', 'CASHIER', 'school_1', 'branch_1', true, NOW(), NOW());

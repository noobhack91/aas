-- Clear existing data
TRUNCATE users CASCADE;
TRUNCATE tenders CASCADE;
TRUNCATE consignees CASCADE;
TRUNCATE logistics_details CASCADE;
TRUNCATE challan_receipts CASCADE;
TRUNCATE installation_reports CASCADE;
TRUNCATE invoices CASCADE;

-- Insert sample users (passwords are 'admin123' hashed with bcrypt)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2a$10$zPiUWYnqt6UGgaDgf4iJKO8pKhUTg.yNXgJ7SSs0TG1TgqKqIQpYi', 'admin'),
('logistics', 'logistics@example.com', '$2a$10$zPiUWYnqt6UGgaDgf4iJKO8pKhUTg.yNXgJ7SSs0TG1TgqKqIQpYi', 'logistics'),
('challan', 'challan@example.com', '$2a$10$zPiUWYnqt6UGgaDgf4iJKO8pKhUTg.yNXgJ7SSs0TG1TgqKqIQpYi', 'challan'),
('installation', 'installation@example.com', '$2a$10$zPiUWYnqt6UGgaDgf4iJKO8pKhUTg.yNXgJ7SSs0TG1TgqKqIQpYi', 'installation'),
('invoice', 'invoice@example.com', '$2a$10$zPiUWYnqt6UGgaDgf4iJKO8pKhUTg.yNXgJ7SSs0TG1TgqKqIQpYi', 'invoice');

-- Insert sample tenders
INSERT INTO tenders (
  tender_number, 
  authority_type, 
  po_date, 
  contract_date, 
  lead_time_to_install, 
  lead_time_to_deliver, 
  equipment_name, 
  status, 
  accessories_pending, 
  installation_pending, 
  invoice_pending
) VALUES
('TENDER/2024/001', 'State Health Department', '2024-03-01', '2024-02-15', 30, 15, 'X-Ray Machine', 'Pending', false, true, true),
('TENDER/2024/002', 'Central Medical Supplies', '2024-03-05', '2024-02-20', 45, 20, 'MRI Scanner', 'Partially Completed', true, true, true),
('TENDER/2024/003', 'District Health Authority', '2024-03-10', '2024-02-25', 20, 10, 'ECG Machine', 'Completed', false, false, false);

-- Insert sample consignees for each tender
-- For TENDER/2024/001
INSERT INTO consignees (
  tender_id,
  sr_no,
  district_name,
  block_name,
  facility_name,
  consignment_status,
  accessories_pending,
  serial_number
) VALUES
((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/001'),
'SR001', 'North District', 'Block A', 'City Hospital',
'Processing',
'{"status": false, "count": 0, "items": []}'::jsonb,
NULL),

((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/001'),
'SR002', 'South District', 'Block B', 'Rural Health Center',
'Dispatched',
'{"status": true, "count": 2, "items": ["Cable", "Battery"]}'::jsonb,
'XR2024001');

-- For TENDER/2024/002
INSERT INTO consignees (
  tender_id,
  sr_no,
  district_name,
  block_name,
  facility_name,
  consignment_status,
  accessories_pending,
  serial_number
) VALUES
((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/002'),
'SR003', 'East District', 'Block C', 'District Hospital',
'Installation Pending',
'{"status": false, "count": 0, "items": []}'::jsonb,
'MRI2024001'),

((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/002'),
'SR004', 'West District', 'Block D', 'Community Health Center',
'Installation Done',
'{"status": true, "count": 1, "items": ["Cooling Unit"]}'::jsonb,
'MRI2024002');

-- For TENDER/2024/003
INSERT INTO consignees (
  tender_id,
  sr_no,
  district_name,
  block_name,
  facility_name,
  consignment_status,
  accessories_pending,
  serial_number
) VALUES
((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/003'),
'SR005', 'Central District', 'Block E', 'Primary Health Center',
'Invoice Done',
'{"status": false, "count": 0, "items": []}'::jsonb,
'ECG2024001'),

((SELECT id FROM tenders WHERE tender_number = 'TENDER/2024/003'),
'SR006', 'North District', 'Block F', 'Sub Center',
'Bill Submitted',
'{"status": false, "count": 0, "items": []}'::jsonb,
'ECG2024002');

-- Insert sample logistics details
INSERT INTO logistics_details (
  consignee_id,
  date,
  courier_name,
  docket_number,
  documents,
  created_by
) VALUES
((SELECT id FROM consignees WHERE sr_no = 'SR002'),
'2024-03-15',
'Express Logistics',
'DOC001',
ARRAY['document1.pdf', 'document2.pdf'],
(SELECT id FROM users WHERE username = 'logistics'));

-- Insert sample challan receipts
INSERT INTO challan_receipts (
  consignee_id,
  date,
  file_path,
  created_by
) VALUES
((SELECT id FROM consignees WHERE sr_no = 'SR003'),
'2024-03-20',
'uploads/challans/challan001.pdf',
(SELECT id FROM users WHERE username = 'challan'));

-- Insert sample installation reports
INSERT INTO installation_reports (
  consignee_id,
  date,
  file_path,
  created_by
) VALUES
((SELECT id FROM consignees WHERE sr_no = 'SR004'),
'2024-03-25',
'uploads/installations/install001.pdf',
(SELECT id FROM users WHERE username = 'installation'));

-- Insert sample invoices
INSERT INTO invoices (
  consignee_id,
  date,
  file_path,
  created_by
) VALUES
((SELECT id FROM consignees WHERE sr_no = 'SR005'),
'2024-03-30',
'uploads/invoices/invoice001.pdf',
(SELECT id FROM users WHERE username = 'invoice'));
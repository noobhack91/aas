-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM (
    'admin',
    'logistics_manager',
    'installer',
    'finance_manager',
    'tender_manager'
);

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name user_role NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_number VARCHAR(255) UNIQUE NOT NULL,
    authority_type VARCHAR(50) NOT NULL CHECK (authority_type IN ('UPSMC', 'UKSMC', 'SGPGIMS')),
    po_date DATE NOT NULL,
    contract_date DATE NOT NULL,
    lead_time_to_install INTEGER NOT NULL CHECK (lead_time_to_install > 0),
    lead_time_to_deliver INTEGER NOT NULL CHECK (lead_time_to_deliver > 0),
    equipment_name VARCHAR(255) NOT NULL,
    remarks TEXT,
    has_accessories BOOLEAN DEFAULT false,
    accessories TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(20) NOT NULL CHECK (status IN ('Draft', 'Submitted', 'In Progress', 'Partially Completed', 'Completed', 'Closed')),
    accessories_pending BOOLEAN DEFAULT false,
    installation_pending BOOLEAN DEFAULT true,
    invoice_pending BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Consignees table
CREATE TABLE IF NOT EXISTS consignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    sr_no VARCHAR(255) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    block_name VARCHAR(255) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    consignment_status VARCHAR(50) NOT NULL CHECK (
        consignment_status IN (
            'Processing',
            'Dispatched',
            'Installation Pending',
            'Installation Done',
            'Invoice Done',
            'Bill Submitted'
        )
    ),
    accessories_pending JSONB DEFAULT '{"status": false, "count": 0, "items": []}'::jsonb,
    serial_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Logistics Details table
CREATE TABLE IF NOT EXISTS logistics_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    courier_name VARCHAR(255) NOT NULL,
    docket_number VARCHAR(255) NOT NULL,
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Challan Receipts table
CREATE TABLE IF NOT EXISTS challan_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Installation Reports table
CREATE TABLE IF NOT EXISTS installation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Machines table
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    specifications JSONB DEFAULT '{}',
    warranty_period INTEGER NOT NULL CHECK (warranty_period >= 0),
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_tender_number ON tenders(tender_number);
CREATE INDEX IF NOT EXISTS idx_consignees_district ON consignees(district_name);
CREATE INDEX IF NOT EXISTS idx_consignees_block ON consignees(block_name);
CREATE INDEX IF NOT EXISTS idx_consignees_status ON consignees(consignment_status);
CREATE INDEX IF NOT EXISTS idx_consignees_tender ON consignees(tender_id);

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create index for machine search
CREATE INDEX IF NOT EXISTS idx_machines_name ON machines(name);
CREATE INDEX IF NOT EXISTS idx_machines_model ON machines(model);
CREATE INDEX IF NOT EXISTS idx_machines_manufacturer ON machines(manufacturer);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$ 
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_tenders_timestamp ON tenders;
CREATE TRIGGER update_tenders_timestamp
    BEFORE UPDATE ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_consignees_timestamp ON consignees;
CREATE TRIGGER update_consignees_timestamp
    BEFORE UPDATE ON consignees
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_logistics_timestamp ON logistics_details;
CREATE TRIGGER update_logistics_timestamp
    BEFORE UPDATE ON logistics_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_challan_timestamp ON challan_receipts;
CREATE TRIGGER update_challan_timestamp
    BEFORE UPDATE ON challan_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_installation_timestamp ON installation_reports;
CREATE TRIGGER update_installation_timestamp
    BEFORE UPDATE ON installation_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_invoice_timestamp ON invoices;
CREATE TRIGGER update_invoice_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_machines_timestamp ON machines;
CREATE TRIGGER update_machines_timestamp
    BEFORE UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

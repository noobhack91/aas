-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'logistics', 'challan', 'installation', 'invoice');
CREATE TYPE authority_type AS ENUM (
    'UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 
    'KGMU', 'BHU', 'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'
);
CREATE TYPE tender_status AS ENUM ('Draft', 'Submitted', 'In Progress', 'Partially Completed', 'Completed', 'Closed');
CREATE TYPE consignment_status AS ENUM (
    'Processing',
    'Dispatched',
    'Installation Pending',
    'Installation Done',
    'Invoice Done',
    'Bill Submitted'
);

-- Base table for common fields
CREATE TABLE base_table (
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    LIKE base_table INCLUDING ALL
);

-- Tenders table
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_number VARCHAR(255) UNIQUE NOT NULL,
    authority_type authority_type NOT NULL,
    po_number VARCHAR(255),
    po_date DATE NOT NULL,
    contract_number VARCHAR(255),
    contract_date DATE NOT NULL,
    lead_time_to_install INTEGER NOT NULL CHECK (lead_time_to_install > 0),
    lead_time_to_deliver INTEGER NOT NULL CHECK (lead_time_to_deliver > 0),
    equipment_name VARCHAR(255) NOT NULL,
    equipment_specification JSONB,
    warranty_period INTEGER,
    remarks TEXT,
    has_accessories BOOLEAN DEFAULT false,
    accessories JSONB DEFAULT '[]'::jsonb,
    status tender_status NOT NULL DEFAULT 'Draft',
    total_value DECIMAL(15,2),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    LIKE base_table INCLUDING ALL
);

-- Consignees table with improved structure
CREATE TABLE consignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    sr_no VARCHAR(255) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    block_name VARCHAR(255) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100),
    contact_person VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    pincode VARCHAR(10),
    consignment_status consignment_status NOT NULL DEFAULT 'Processing',
    installation_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    accessories_status JSONB DEFAULT '{"pending": [], "delivered": []}'::jsonb,
    serial_number VARCHAR(255),
    LIKE base_table INCLUDING ALL,
    CONSTRAINT valid_contact_number CHECK (contact_number ~ '^[0-9+()-]{10,15}$'),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_pincode CHECK (pincode ~ '^[0-9]{6}$')
);

-- Logistics Details table with improved tracking
CREATE TABLE logistics_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    shipment_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    courier_name VARCHAR(255) NOT NULL,
    courier_contact VARCHAR(20),
    tracking_number VARCHAR(255) NOT NULL,
    tracking_url TEXT,
    shipping_address TEXT NOT NULL,
    documents JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'In Transit',
    delivery_confirmation BOOLEAN DEFAULT false,
    LIKE base_table INCLUDING ALL
);

-- File management table for all document types
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    LIKE base_table INCLUDING ALL
);

-- Audit trail table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_number ON tenders(tender_number);
CREATE INDEX idx_consignees_district ON consignees(district_name);
CREATE INDEX idx_consignees_status ON consignees(consignment_status);
CREATE INDEX idx_consignees_tender ON consignees(tender_id);
CREATE INDEX idx_documents_reference ON documents(reference_id, reference_type);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- Create functions for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    )
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        CURRENT_USER::uuid
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tenders_timestamp
    BEFORE UPDATE ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_consignees_timestamp
    BEFORE UPDATE ON consignees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_logistics_timestamp
    BEFORE UPDATE ON logistics_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create audit triggers
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_tenders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tenders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_consignees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON consignees
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

    CREATE TABLE accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Consumables table
CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updating timestamps
CREATE TRIGGER update_accessories_timestamp
    BEFORE UPDATE ON accessories
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_consumables_timestamp
    BEFORE UPDATE ON consumables
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
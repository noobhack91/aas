-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'logistics', 'challan', 'installation', 'invoice')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tenders table
CREATE TABLE tenders (
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
CREATE TABLE consignees (
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
CREATE TABLE logistics_details (
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
CREATE TABLE challan_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Installation Reports table
CREATE TABLE installation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignee_id UUID NOT NULL REFERENCES consignees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    file_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_tender_number ON tenders(tender_number);
CREATE INDEX idx_consignees_district ON consignees(district_name);
CREATE INDEX idx_consignees_block ON consignees(block_name);
CREATE INDEX idx_consignees_status ON consignees(consignment_status);
CREATE INDEX idx_consignees_tender ON consignees(tender_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tenders_timestamp
    BEFORE UPDATE ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_consignees_timestamp
    BEFORE UPDATE ON consignees
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_logistics_timestamp
    BEFORE UPDATE ON logistics_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_challan_timestamp
    BEFORE UPDATE ON challan_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_installation_timestamp
    BEFORE UPDATE ON installation_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_invoice_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

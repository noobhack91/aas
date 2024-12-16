import { z } from 'zod';

// Add UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const locationSchema = z.object({
  districtName: z.string().min(1),
  blockName: z.string().min(1),
  facilityName: z.string().min(1)
});

const installationSchema = z.object({
  tender_number: z.string().min(1).max(100),
  authority_type: z.enum([
    'UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 'KGMU', 'BHU',
    'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'
  ]),
  tender_start_date: z.string().datetime(),
  tender_end_date: z.string().datetime(),
  loa_number: z.string().min(1),
  loa_date: z.string().datetime(),
  po_number: z.string().min(1),
  po_date: z.string().datetime(),
  contract_date: z.string().datetime(),
  equipment_name: z.string().min(1),
  lead_time_to_deliver: z.number().positive(),
  lead_time_to_install: z.number().positive(),
  machine_quantity: z.number().positive().default(1),
  remarks: z.string().optional(),
  has_accessories: z.boolean(),
  selected_accessories: z.array(z.string()).optional().nullable()
    .transform(val => val || []),
  has_consumables: z.boolean(),
  selected_consumables: z.array(z.string()).optional().nullable()
    .transform(val => val || []),
  selected_machines: z.array(
    z.string().regex(uuidRegex, 'Invalid UUID format')
  ).optional().nullable(),
  locations: z.array(locationSchema)
});

export function validateInstallationRequest(data) {
  return installationSchema.parse(data);
}
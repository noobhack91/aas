// src/types/index.ts  
export interface User {  
  id: string;  
  username: string;  
  email: string;  
  roles: Array<'admin' | 'super_admin' | 'logistics' | 'challan' | 'installation' | 'invoice'>;  
}  

export interface TenderDetails {
  id: string;
  tenderNumber: string;
  authorityType: string;
  poDate: string;
  contractDate: string;
  leadTimeToInstall: number;
  leadTimeToDeliver: number;
  equipmentName: string;
  status: 'Pending' | 'Partially Completed' | 'Completed' | 'Closed';
  accessoriesPending: boolean;
  installationPending: boolean;
  invoicePending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsigneeDetails {
  id: string;
  tenderId: string;
  srNo: string;
  districtName: string;
  blockName: string;
  facilityName: string;
  consignmentStatus: ConsignmentStatus;
  accessoriesPending: {
    status: boolean;
    count: number;
    items: string[];
  };
  serialNumber?: string;
}

export type ConsignmentStatus = 
  | 'Processing'
  | 'Dispatched'
  | 'Installation Pending'
  | 'Installation Done'
  | 'Invoice Done'
  | 'Bill Submitted';
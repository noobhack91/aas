export interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    consigneeId: string;
}

export interface UploadedDetails {
    date: string | null;
    filePath?: string;
    documents?: string[];
    courierName?: string;
    docketNumber?: string;
}  
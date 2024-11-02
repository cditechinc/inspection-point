export interface TreatmentPlantDigesterProperties {
    serviceInterval: 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Yearly' | 'On-Demand' | 'Not Serviced';
    gallons: string;
    material: 'Plastic' | 'Fiberglass' | 'Concrete' | 'Other' | 'Unknown';
    connectionSize: string;
    suctionRequired: boolean;
    digesterDimensions: string; // Format: '000 x 000 x 000'
    primaryTreatmentPlantAssetId?: string; // UUID of the primary treatment plant asset
    qrCode: string;
    nfcId: string;
    condition: 'Good' | 'Fair' | 'Rough' | 'Bad' | 'Failing' | 'Other';
    requireDisposalTicket: boolean;
    primaryPlantOperator: string;
    operatorContactName: string;
    operatorContactPhone: string;
    videos?: string[];
    files?: string[];
  }
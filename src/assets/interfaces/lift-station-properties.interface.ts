export interface LiftStationProperties {
    pipeDia?: string; // Pipe Diameter
    smart?: string; // Smart (text)
    size?: string; // Size (text)
    material?: 'Plastic' | 'Fiberglass' | 'Concrete' | 'Other' | 'Unknown';
    deleteProtect?: string; // Delete Protect (text)
    duty?: 'Light' | 'Normal' | 'Heavy' | 'Severe' | 'Unknown';
    rails?: string; // Rails (text)
    float?: string; // Float (text)
    pumps?: string; // Pumps (text)
    power?: string; // Power (text)
    qrCode?: string; // QR Code identifier
    nfcId?: string; // NFC ID
    inspectionInterval?: 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Yearly' | 'On-Demand' | 'Not Serviced';
  }
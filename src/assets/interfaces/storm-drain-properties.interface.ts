export interface StormDrainProperties {
    serviceInterval: 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Yearly' | 'On-Demand' | 'Not Serviced';
    drainSize: 'extra small' | 'small' | 'medium' | 'large' | 'extra large' | 'huge' | 'unknown';
    material: 'Plastic' | 'Fiberglass' | 'Concrete' | 'Other' | 'Unknown';
    waterIntrusion: boolean;
    damaged: boolean;
    internalPipeDia: string; // In inches
    qrCode: string;
    nfcId: string;
    drainDimensions: string; // Format: 'Depth*Width*Length' in feet
    duty: 'Light' | 'Normal' | 'Heavy' | 'Severe' | 'Unknown';
    drainGrateType: 'steel' | 'plastic' | 'hinged steel' | 'other' | 'unknown';
    connectedAssetLineColor: string; // Hex color code
    connectedStormDrainAssetIds?: string[]; // Array of up to 5 asset IDs
  }
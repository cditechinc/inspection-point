export interface GreaseTrapProperties {
    serviceInterval: 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Yearly' | 'On-Demand' | 'Not Serviced';
    gallons: number;
    material: 'Plastic' | 'Fiberglass' | 'Concrete' | 'Other' | 'Unknown';
    latitude: string;
    longitude: string;
    qrCode: string;
    nfcId: string;
    duty: 'Light' | 'Normal' | 'Heavy' | 'Severe' | 'Unknown';
    requireDisposalTicket: boolean;
    eveningService: boolean;
    multipleOnSiteTraps: boolean;
  }
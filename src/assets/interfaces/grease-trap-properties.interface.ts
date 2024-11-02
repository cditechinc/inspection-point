export interface GreaseTrapProperties {
    serviceInterval: 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Yearly' | 'On-Demand' | 'Not Serviced';
    gallons: number;
    material: 'Plastic' | 'Fiberglass' | 'Concrete' | 'Other' | 'Unknown';
    qrCode: string;
    nfcId: string;
    duty: 'Light' | 'Normal' | 'Heavy' | 'Severe' | 'Unknown';
    requireDisposalTicket: boolean;
    eveningService: boolean;
    multipleOnSiteTraps: boolean;
  }
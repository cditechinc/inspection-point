export class PdfCustomizationDTO {
    clientId: string;
    id: string;
    status?: string;
    scheduledDate?: Date;
    completedDate?: Date | null;
    route?: { latitude: number; longitude: number }[];
    comments?: string;
    serviceFee?: number;
    client?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      billing_address?: string;
      company_name?: string | null;
      company_type?: string | null;
      industry?: string;
      company_logo?: string | null;
      payment_method?: string;
      account_status?: string;
      custom_portal_url?: string;
      tax_exempt?: boolean;
      protected?: boolean;
      email_verified?: boolean;
      next_bill_date?: Date;
    };
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      service_address?: string;
      billing_address?: string;
      type?: string;
      status?: string;
      gate_code?: string;
      previous_phone_number?: string;
      service_contact?: string;
      quickbooksCustomerId?: string;
    };
    asset?: {
      name?: string;
      location?: string;
      latitude?: string;
      longitude?: string;
      description?: string;
      status?: string;
      inspectionInterval?: string;
      qrCode?: string;
      nfcCode?: string;
      pipeDia?: number;
      smart?: string;
      size?: string;
      material?: string;
      deleteProtect?: string;
      duty?: string;
      rails?: string;
      float?: number;
      pumps?: number;
    };
    assignedTo?: string | null;
    checklists?: Array<{
      name?: string;
      overallScore?: string;
      items?: Array<{
        id?: string;
        description?: string;
        is_completed?: boolean;
      }>;
    }>;
    scores?: Array<{
      structureScore?: string;
      panelScore?: string;
      pipesScore?: string;
      alarmScore?: string;
      alarmLightScore?: string;
      wiresScore?: string;
      breakersScore?: string;
      contactorsScore?: string;
      thermalsScore?: string;
      floatScores?: Record<string, string>;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
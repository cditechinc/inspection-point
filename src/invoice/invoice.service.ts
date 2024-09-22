import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { QuickBooksOAuthService } from '../auth/quickbooks-oauth.service';
import { ClientService } from '../client/client.service';
import { CustomerService } from '../customer/customer.service';
import { InspectionService } from './../inspection/services/inspection.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Inspection } from './../inspection/entities/inspection.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly quickBooksOAuthService: QuickBooksOAuthService,
    private readonly clientService: ClientService,
    private readonly customerService: CustomerService,
    @Inject(forwardRef(() => InspectionService))
    private readonly inspectionService: InspectionService,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
  ) {}

  async createInvoice(
    inspectionId: string,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    const clientId = createInvoiceDto.clientId;

    // Refresh the QuickBooks token if needed
    await this.quickBooksOAuthService.refreshTokenIfNeeded(clientId);

    const client = await this.clientService.findOne(clientId);
    const customer = await this.customerService.findOne(
      createInvoiceDto.customerId,
      clientId,
    );
    const inspection = await this.inspectionService.findOne(inspectionId);

    if (!client || !client.quickbooksAccessToken || !client.quickbooksRealmId) {
      throw new Error('Client is not authorized with QuickBooks');
    }

    const lineItem = {
      Amount: createInvoiceDto.amountDue,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: {
          value: '1', // The service item in QuickBooks
          name: 'Inspection Service',
        },
      },
    };

    // Ensure the due date is converted to a string in ISO format
    const invoiceData = {
      CustomerRef: {
        value: customer.quickbooksCustomerId,
      },
      Line: [lineItem],
      DueDate: createInvoiceDto.dueDate, // Convert Date to ISO string
      PrivateNote: `Invoice for inspection #${inspectionId}`,
    };

    try {
      const qbInvoice = await this.quickBooksOAuthService
        .getClient()
        .makeApiCall({
          url: `${
            this.quickBooksOAuthService.getClient().environment === 'sandbox'
              ? 'https://sandbox-quickbooks.api.intuit.com'
              : 'https://quickbooks.api.intuit.com'
          }/v3/company/${client.quickbooksRealmId}/invoice`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${client.quickbooksAccessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });

      if (qbInvoice.json) {
        console.log('Invoice created in QuickBooks:', qbInvoice.json);
        const savedInvoice = this.invoiceRepository.create({
          quickbooks_invoice_id: qbInvoice.json.Invoice.Id,
          client: client,
          customer: customer,
          inspection: inspection,
          status: qbInvoice.json.Invoice.Balance === 0 ? 'paid' : 'pending',
          amount_due: qbInvoice.json.Invoice.TotalAmt,
          amount_paid:
            qbInvoice.json.Invoice.TotalAmt - qbInvoice.json.Invoice.Balance,
          balance: qbInvoice.json.Invoice.Balance,
          due_date: qbInvoice.json.Invoice.DueDate,
          quickbooks_invoice_number: qbInvoice.json.Invoice.DocNumber,
          quickbooks_invoice_url: qbInvoice.json.Invoice.InvoiceLink,
          quickbooks_sync_status: 'synced',
        });

        return await this.invoiceRepository.save(savedInvoice);
      } else {
        console.error('QuickBooks Invoice Creation Failed:', qbInvoice);
        throw new Error('Failed to create invoice in QuickBooks');
      }
    } catch (error) {
      console.error(
        `QuickBooks API error: ${JSON.stringify(error.response?.data || error.message, null, 2)}`,
      );
      throw new InternalServerErrorException(
        `QuickBooks API error: ${error.message}`,
      );
    }
  }

  async findInvoiceById(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['client', 'customer', 'inspection'], // Ensure relations are loaded
    });
  }

  async addInspectionToInvoice(
    invoiceId: string,
    {
      inspectionId,
      serviceFee,
      pdfReportPath,
    }: { inspectionId: string; serviceFee: number; pdfReportPath: string },
  ): Promise<Invoice> {
    const invoice = await this.findInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Assuming `invoice.items` is an array of line items. If it doesn't exist, initialize it.
    if (!invoice.items) {
      invoice.items = [];
    }

    // Add the new line item for the inspection service fee
    invoice.items.push({
      description: `Inspection Service Fee for Inspection ID ${inspectionId}`,
      amount: serviceFee,
    });

    // Update the total amount due and balance
    invoice.amount_due += serviceFee;
    invoice.balance += serviceFee;

    // Attach PDF report if applicable
    if (pdfReportPath) {
      invoice.quickbooks_invoice_url = pdfReportPath;
    }

    // Save and return the updated invoice
    return this.invoiceRepository.save(invoice);
  }

  async findInvoiceByInspectionId(
    inspectionId: string,
  ): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { inspection: { id: inspectionId } },
    });
  }

  // Find all invoices with relations (client, customer, inspection)
  async findAllWithRelations(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      relations: ['client', 'customer', 'inspection'], // Load relations
    });
  }

  // Find a specific invoice by ID with relations
  async findOneWithRelations(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['client', 'customer', 'inspection'], // Load relations
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  // Update a specific invoice by ID
  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOneWithRelations(id);
    this.invoiceRepository.merge(invoice, updateInvoiceDto);
    return await this.invoiceRepository.save(invoice);
  }

  // Remove (delete) a specific invoice by ID
  async remove(id: string): Promise<void> {
    const invoice = await this.findOneWithRelations(id);
    await this.invoiceRepository.remove(invoice);
  }

  async sendInvoiceWithAttachments(
    invoiceId: string,
    clientId: string,
    inspectionId: string,
    pdfReportPath: string,
    imagePaths: string[],
  ) {
    // Ensure QuickBooks token is valid and refresh if needed
    await this.quickBooksOAuthService.refreshTokenIfNeeded(clientId);
    // Fetch the client and customer data
    const client = await this.clientService.findOne(clientId);
    if (!client) {
      throw new InternalServerErrorException('Client not found');
    }

    const invoice = await this.invoiceRepository.findOne({
      where: { quickbooks_invoice_id: invoiceId }, // Use quickbooks_invoice_id here
    });
    if (!invoice) {
      throw new InternalServerErrorException('Invoice not found');
    }

    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
    });
    if (!inspection) {
      throw new InternalServerErrorException('Inspection not found');
    }

    const customer = inspection.customer;
    if (!customer) {
      throw new InternalServerErrorException('Customer not found');
    }

    // Ensure the QuickBooks customer ID is available
    const quickbooksCustomerId = customer.quickbooksCustomerId;
    if (!quickbooksCustomerId) {
      throw new InternalServerErrorException(
        'QuickBooks Customer ID is missing',
      );
    }

    const customerEmail = customer.email;
    if (!customerEmail) {
      throw new InternalServerErrorException('Customer email not available');
    }

    // Set the absolute URL for the PDF from the S3 bucket
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfReportPath}`;

    // Payload for sending invoice with attachment
    const payload = {
      Attachments: [
        {
          ContentRef: s3Url,
          FileName: 'InspectionReport.pdf',
          MimeType: 'application/pdf',
        },
        ...imagePaths.map((path, index) => ({
          ContentRef: path,
          FileName: `InspectionImage${index + 1}.jpg`,
          MimeType: 'image/jpeg',
        })),
      ],
      SendTo: customerEmail,
    };

    // Prepare QuickBooks OAuth token and headers using QuickBooksOAuthService
    await this.quickBooksOAuthService.getClient().setToken({
      token_type: 'bearer',
      access_token: client.quickbooksAccessToken,
      refresh_token: client.quickbooksRefreshToken,
      realmId: client.quickbooksRealmId,
    });

    // Send the invoice via QuickBooks API
    try {
      const response = await this.quickBooksOAuthService
        .getClient()
        .makeApiCall({
          url: `${this.quickBooksOAuthService.getClient().environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${client.quickbooksRealmId}/invoice/${invoice.quickbooks_invoice_id}/send`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

      if (response.json) {
        return response.json;
      } else {
        throw new InternalServerErrorException(
          'Failed to send invoice in QuickBooks',
        );
      }
    } catch (error) {
      console.error(
        'Error sending invoice:',
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message,
      );
      throw new InternalServerErrorException(
        `QuickBooks API error: ${error.message}`,
      );
    }
  }
}

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './../entities/invoice.entity';
import { QuickBooksOAuthService } from './../../auth/quickbooks-oauth.service';
import { ClientService } from './../../client/client.service';
import { CustomerService } from './../../customer/customer.service';
import { InspectionService } from './../../inspection/services/inspection.service';
import { CreateInvoiceDto } from './../dto/create-invoice.dto';
import { UpdateInvoiceDto } from './../dto/update-invoice.dto';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { Services } from '../entities/services.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
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

    // Fetch the service fee associated with the inspection
    const serviceFee = inspection.serviceFee;
    if (!serviceFee) {
      throw new BadRequestException(
        'Service fee not found for this inspection',
      );
    }

    // Create line items based on the service fee
    const lineItem = {
      Amount: serviceFee.price * 1, // Assuming quantity is 1
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: {
          value: serviceFee.quickbooksServiceId, // Use QuickBooks Service ID
          name: serviceFee.name,
        },
        UnitPrice: serviceFee.price,
        Qty: 1,
      },
      Description: serviceFee.description,
    };

    // Prepare invoice data for QuickBooks
    const invoiceData = {
      CustomerRef: {
        value: customer.quickbooksCustomerId,
      },
      Line: [lineItem],
      DueDate: createInvoiceDto.dueDate,
      PrivateNote: `Invoice for inspection #${inspectionId}`,
    };

    try {
      // Create invoice in QuickBooks
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
        // Create Invoice entity
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

        // Save the invoice
        const invoice = await this.invoiceRepository.save(savedInvoice);

        // Create InvoiceItem entity
        const invoiceItem = this.invoiceItemRepository.create({
          invoice: invoice,
          serviceFee: serviceFee,
          quantity: 1,
          unitPrice: serviceFee.price,
          totalPrice: serviceFee.price * 1,
          description: serviceFee.description,
        });

        // Save the invoice item
        await this.invoiceItemRepository.save(invoiceItem);

        return invoice;
      } else {
        console.error('QuickBooks Invoice Creation Failed:', qbInvoice);
        throw new Error('Failed to create invoice in QuickBooks');
      }
    } catch (error) {
      console.error(
        `QuickBooks API error: ${JSON.stringify(
          error.response?.data || error.message,
          null,
          2,
        )}`,
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

  // Update the addInspectionToInvoice method to handle invoice items
  async addInspectionToInvoice(
    invoiceId: string,
    {
      inspectionId,
      serviceFeeId,
      pdfReportPath,
    }: { inspectionId: string; serviceFeeId: string; pdfReportPath: string },
  ): Promise<any> {
    console.log('Adding inspection to invoice:', inspectionId);

    const invoice = await this.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const inspection = await this.inspectionService.findOne(inspectionId);
    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    const serviceFee = await this.invoiceItemRepository.manager
      .getRepository(Services)
      .findOne({ where: { id: serviceFeeId } });
    if (!serviceFee) {
      throw new NotFoundException('Service fee not found');
    }

    // Create a new InvoiceItem
    const invoiceItem = this.invoiceItemRepository.create({
      invoice: invoice,
      serviceFee: serviceFee,
      quantity: 1,
      unitPrice: serviceFee.price,
      totalPrice: serviceFee.price * 1,
      description: serviceFee.description,
    });

    // Save the invoice item
    await this.invoiceItemRepository.save(invoiceItem);

    // Update the total amount due and balance
    invoice.amount_due += serviceFee.price;
    invoice.balance += serviceFee.price;

    // Save the updated invoice
    const updatedInvoice = await this.invoiceRepository.save(invoice);

    // Return the updated invoice with items
    return updatedInvoice;
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

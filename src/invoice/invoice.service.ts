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
  ) {}

  // async createInvoice(inspectionId: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
  //   const clientId = createInvoiceDto.clientId;

  //   await this.quickBooksOAuthService.refreshTokenIfNeeded(clientId);

  //   const client = await this.clientService.findOne(clientId);
  //   const customer = await this.customerService.findOne(createInvoiceDto.customerId, clientId);
  //   const inspection = await this.inspectionService.findOne(inspectionId);

  //   if (!client || !client.quickbooksAccessToken || !client.quickbooksRealmId) {
  //     throw new Error('Client is not authorized with QuickBooks');
  //   }

  //   const lineItem = {
  //     Amount: createInvoiceDto.amountDue,
  //     DetailType: 'SalesItemLineDetail',
  //     SalesItemLineDetail: {
  //       ItemRef: {
  //         value: '1', // The service item in QuickBooks
  //         name: 'Inspection Service',
  //       },
  //     },
  //   };

  //   const invoiceData = {
  //     CustomerRef: {
  //       value: customer.quickbooksCustomerId, // Now using customer
  //     },
  //     Line: [lineItem],
  //     DueDate: createInvoiceDto.dueDate,
  //     PrivateNote: `Invoice for inspection #${inspectionId}`,
  //   };

  //   try {
  //     const qbInvoice = await this.quickBooksOAuthService.getClient().makeApiCall({
  //       url: `${this.quickBooksOAuthService.getClient().environment == 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${client.quickbooksRealmId}/invoice`,
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //       body: JSON.stringify(invoiceData),
  //     });

  //     if (qbInvoice.json) {
  //       const savedInvoice = this.invoiceRepository.create({
  //         quickbooks_invoice_id: qbInvoice.json.Invoice.Id,
  //         client: client, // Pass entity directly
  //         customer: customer, // Pass entity directly
  //         inspection: inspection, // Pass entity directly
  //         status: qbInvoice.json.Invoice.Balance === 0 ? 'paid' : 'pending',
  //         amount_due: qbInvoice.json.Invoice.TotalAmt,
  //         amount_paid: qbInvoice.json.Invoice.TotalAmt - qbInvoice.json.Invoice.Balance,
  //         balance: qbInvoice.json.Invoice.Balance,
  //         due_date: qbInvoice.json.Invoice.DueDate,
  //         quickbooks_invoice_number: qbInvoice.json.Invoice.DocNumber,
  //         quickbooks_invoice_url: qbInvoice.json.Invoice.InvoiceLink,
  //         quickbooks_sync_status: 'synced',
  //       });

  //       return await this.invoiceRepository.save(savedInvoice);
  //     } else {
  //       throw new Error('Failed to create invoice in QuickBooks');
  //     }
  //   } catch (error) {
  //     throw new InternalServerErrorException(`QuickBooks API error: ${error.message}`);
  //   }
  // }

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
            'Authorization': `Bearer ${client.quickbooksAccessToken}`,
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
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOneWithRelations(id);
    this.invoiceRepository.merge(invoice, updateInvoiceDto);
    return await this.invoiceRepository.save(invoice);
  }

  // Remove (delete) a specific invoice by ID
  async remove(id: string): Promise<void> {
    const invoice = await this.findOneWithRelations(id);
    await this.invoiceRepository.remove(invoice);
  }
}

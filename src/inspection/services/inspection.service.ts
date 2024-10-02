import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Inspection, InspectionStatus } from './../entities/inspection.entity';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
} from './../dto/inspection.dto';
import { Checklist } from './../entities/checklist.entity';
import { InspectionScore } from './../entities/inspection-score.entity';
import { User } from './../../user/entities/user.entity';
import { ChecklistItem } from './../entities/checklist-item.entity';
import { Client } from './../../client/entities/client.entity';
import { Asset } from './../../assets/entities/asset.entity';
import { Customer } from './../../customer/entities/customer.entity';
import { Invoice } from './../../invoice/entities/invoice.entity';
import { InvoiceService } from './../../invoice/invoice.service';
import { PdfService } from './../../reports/services/pdf.service';
import { CreateInvoiceDto } from './../../invoice/dto/create-invoice.dto';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
    // @InjectRepository(ChecklistItem)
    // private readonly checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(InspectionScore)
    private readonly inspectionScoreRepository: Repository<InspectionScore>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // @InjectRepository(Customer)
    // private readonly customerRepository: Repository<Customer>,
    // @InjectRepository(Client)
    // private readonly clientRepository: Repository<Client>,
    // @InjectRepository(Asset)
    // private readonly assetRepository: Repository<Asset>,
    // @InjectRepository(Invoice)
    // private readonly invoiceRepository: Repository<Invoice>,
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
  ) {}

  async create(createInspectionDto: CreateInspectionDTO): Promise<Inspection> {
    return await this.inspectionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Fetch the related entities (Client, Customer, Asset)
        const client = await transactionalEntityManager.findOne(Client, {
          where: { id: createInspectionDto.clientId },
        });
        const customer = await transactionalEntityManager.findOne(Customer, {
          where: { id: createInspectionDto.customerId },
        });
        const asset = await transactionalEntityManager.findOne(Asset, {
          where: { id: createInspectionDto.assetId },
        });
        let assignedToUser: User | null = null;

        if (createInspectionDto.assignedTo) {
          assignedToUser = await transactionalEntityManager.findOne(User, {
            where: { id: createInspectionDto.assignedTo },
          });
        }

        if (!client || !customer || !asset) {
          throw new Error('Related entities not found');
        }

        // Create the inspection entity
        const inspection = transactionalEntityManager.create(Inspection, {
          ...createInspectionDto,
          client,
          customer,
          asset,
          assignedTo: assignedToUser,
          status: InspectionStatus.NOT_DONE,
        });

        // Save the inspection entity first to get the ID
        const savedInspection =
          await transactionalEntityManager.save(inspection);

        

        // Associate existing checklists
        if (createInspectionDto.checklists) {
          const checklistIds = createInspectionDto.checklists.map(
            (checklist) => checklist.id,
          );

          // Fetch the existing checklists with their items
          const checklists = await transactionalEntityManager.find(Checklist, {
            where: { id: In(checklistIds) },
            relations: ['items'], // Load items with the checklist
          });

          savedInspection.checklists = checklists;
        }

        // Fetch and associate the existing inspection scores by ID
        if (createInspectionDto.score && createInspectionDto.score.scoreId) {
          const existingScore = await transactionalEntityManager.findOne(
            InspectionScore,
            {
              where: { id: createInspectionDto.score.scoreId },
            },
          );

          if (!existingScore) {
            throw new Error('Score not found');
          }

          savedInspection.scores = [existingScore]; // Associate existing score
        }

        // Check if the inspection is recurring and schedule recurring inspections
        if (
          createInspectionDto.isRecurring &&
          createInspectionDto.intervalInDays
        ) {
          await this.scheduleRecurring(
            savedInspection,
            createInspectionDto.intervalInDays,
            createInspectionDto.recurrenceEndDate,
            transactionalEntityManager,
          );
        }

        return transactionalEntityManager.save(savedInspection);
      },
    );
  }


  async scheduleRecurring(
    inspection: Inspection,
    intervalInDays: number,
    recurrenceEndDate: Date,
    transactionalEntityManager: any,
  ): Promise<void> {
    let nextScheduledDate = new Date(inspection.scheduledDate);
    const endDate = new Date(recurrenceEndDate);

    // Loop until the nextScheduledDate is beyond the recurrenceEndDate
    while (nextScheduledDate <= endDate) {
      nextScheduledDate = new Date(
        nextScheduledDate.setDate(nextScheduledDate.getDate() + intervalInDays),
      );

      // Ensure we don't create an inspection after the end date
      if (nextScheduledDate > endDate) break;

      // Create the new recurring inspection entity
      const newInspection = transactionalEntityManager.create(Inspection, {
        ...inspection,
        id: undefined, // New ID for the new inspection
        scheduledDate: nextScheduledDate,
        status: InspectionStatus.NOT_DONE, // Reset status for the new inspection
        createdAt: undefined, // Reset timestamps
        updatedAt: undefined,
        completedDate: null, // Reset completed date
      });

      // Save the new recurring inspection
      await transactionalEntityManager.save(newInspection);
    }
  }

  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      relations: [
        'checklists',
        'scores',
        'client',
        'customer',
        'assignedTo',
        'asset',
        'invoices',
      ],
    });
  }

  async findOne(id: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: [
        'checklists',
        'checklists.items',
        'scores',
        'client',
        'customer',
        'assignedTo',
        'asset',
        'invoices',
      ],
    });
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }
    return inspection;
  }

  async update(
    id: string,
    updateInspectionDto: UpdateInspectionDTO,
  ): Promise<Inspection> {
    const inspection = await this.findOne(id);

    // Update assigned user if provided
    if (updateInspectionDto.assignedTo) {
      const assignedToUser = await this.userRepository.findOne({
        where: { id: updateInspectionDto.assignedTo },
      });

      if (!assignedToUser) {
        throw new NotFoundException(
          `User with ID ${updateInspectionDto.assignedTo} not found`,
        );
      }

      inspection.assignedTo = assignedToUser;
    }

    // Handle related entities if provided
    if (updateInspectionDto.checklists) {
      const checklists = updateInspectionDto.checklists.map((checklist) =>
        this.checklistRepository.create(checklist),
      );
      inspection.checklists = await this.checklistRepository.save(checklists);
    }

    if (updateInspectionDto.score) {
      const inspectionScore = this.inspectionScoreRepository.create({
        ...updateInspectionDto.score,
        inspection,
      });
      inspection.scores = [
        await this.inspectionScoreRepository.save(inspectionScore),
      ];
    }

    // Update the inspection with the remaining properties
    const { assignedTo, ...rest } = updateInspectionDto;
    this.inspectionRepository.merge(inspection, rest);

    // Apply status change logic based on the updated fields
    await this.updateInspectionStatus(inspection);

    return this.inspectionRepository.save(inspection);
  }

  async completeAndBillInspection(inspectionId: string): Promise<any> {
    const inspection = await this.findOne(inspectionId);

    // Prevent re-billing if the inspection is already marked as COMPLETE_BILLED
    if (inspection.status === InspectionStatus.COMPLETE_BILLED) {
      console.error(
        `Inspection ${inspectionId} is already marked as COMPLETE_BILLED.`,
      );
      throw new Error('This inspection has already been billed.');
    }

    // Check if there's already an invoice for this inspection
    const existingInvoice = inspection.invoices?.find(
      (invoice) => invoice.status === 'pending' || invoice.status === 'paid',
    );

    if (existingInvoice) {
      console.error(
        `Invoice ${existingInvoice.id} already exists for Inspection ${inspectionId}`,
      );
      throw new Error('Invoice already exists for this inspection.');
    }

    // Only proceed if the inspection is not canceled or on hold
    if (
      inspection.status !== InspectionStatus.CANCELED &&
      inspection.status !== InspectionStatus.ON_HOLD
    ) {
      // Update the inspection status to COMPLETE_BILLED
      inspection.status = InspectionStatus.COMPLETE_BILLED;
      inspection.completedDate = new Date();

      // Save the updated inspection status
      await this.inspectionRepository.save(inspection);

      // Fetch the PDF report from the S3 bucket
      const pdfReportPath = await this.pdfService.fetchPdfReport(inspection.id);

      if (!pdfReportPath) {
        throw new NotFoundException('PDF report not found in S3 bucket');
      }

      let imagePaths: string[] = [];
      for (const photo of inspection.photos) {
        imagePaths.push(photo.url); // Assuming the photo URLs are already stored in S3
      }
      console.log('Image Paths:', imagePaths);

      // Prepare the invoice data
      const invoiceData = {
        inspectionId: inspection.id,
        clientId: inspection.client.id,
        customerId: inspection.customer.id,
        quickbooksCustomerId: inspection.customer.quickbooksCustomerId,
        amountDue: inspection.serviceFee,
        dueDate: new Date().toISOString(),
        pdfReportPath: pdfReportPath.toString(),
        imagePaths,
      };

      console.log(
        `Creating invoice for inspection ${inspectionId} with data:`,
        invoiceData,
      );

      try {
        // Call the InvoiceService to create the invoice
        const newInvoice = await this.invoiceService.createInvoice(
          inspection.id,
          invoiceData,
        );

        // Fetch the updated inspection to include the newly created invoice
        const updatedInspection = await this.inspectionRepository.findOne({
          where: { id: inspectionId },
          relations: ['invoices'], // Ensure invoices are loaded
        });

        console.log(
          `Invoice successfully created for inspection ${inspectionId}.`,
        );

        // Return a custom object with the clientId, customerId, and inspectionId
        return {
          ...updatedInspection, // Spread all fields of the updatedInspection object
          clientId: updatedInspection.client?.id, // Add the clientId explicitly
          customerId: updatedInspection.customer?.id, // Add the customerId explicitly
          inspectionId: updatedInspection.id, // Add the inspectionId explicitly
        };
      } catch (error) {
        console.error(
          `QuickBooks API error: ${JSON.stringify(error.response?.data || error.message, null, 2)}`,
        );
        throw new InternalServerErrorException(
          `QuickBooks API error: ${error.message}`,
        );
      }
    }

    // Return the inspection as it is if no update or billing happened
    return inspection;
  }

  async submitAndAddToExistingInvoice(inspectionId: string, invoiceId: string) {
    // Fetch the inspection by its ID
    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Fetch the existing invoice
    const existingInvoice =
      await this.invoiceService.findInvoiceById(invoiceId);
    console.log('Invoice Status:', existingInvoice?.status); // Log the status of the invoice

    if (
      !existingInvoice ||
      (existingInvoice.status !== 'pending' &&
        existingInvoice.status !== 'Not Sent')
    ) {
      throw new BadRequestException('Invalid invoice or invoice already sent');
    }

    // Fetch the PDF report from the S3 bucket
    const pdfReportPath = await this.pdfService.fetchPdfReport(inspection.id);

    if (!pdfReportPath) {
      throw new NotFoundException('PDF report not found in S3 bucket');
    }

    // Use the service fee from the inspection
    const serviceFee = Number(inspection.serviceFee);

    // Add the inspection details and PDF report to the existing invoice
    const updatedInvoice = await this.invoiceService.addInspectionToInvoice(
      invoiceId,
      {
        inspectionId,
        serviceFee, // Using serviceFee from inspection
        pdfReportPath,
      },
    );

    // Mark the inspection as Complete Billed
    if (updatedInvoice) {
      inspection.status = InspectionStatus.COMPLETE_BILLED;
      await this.inspectionRepository.save(inspection);
    }

    return updatedInvoice;
  }

  async completeAndAddToExistingInvoice(inspectionId: string): Promise<any> {
    const inspection = await this.findOne(inspectionId);

    // Prevent re-billing if the inspection is already marked as COMPLETE_BILLED
    if (inspection.status === InspectionStatus.COMPLETE_BILLED) {
      throw new Error('This inspection has already been billed.');
    }

    // Find an existing invoice for this client and customer
    const existingInvoice =
      await this.invoiceService.findInvoiceByInspectionId(inspectionId);

    if (!existingInvoice) {
      // If no existing invoice, create a new one
      return await this.completeAndBillInspection(inspectionId);
    }

    // If an invoice exists, add the service fee to this invoice
    existingInvoice.amount_due += inspection.serviceFee;
    existingInvoice.balance += inspection.serviceFee;

    // Update the invoice
    await this.invoiceService.update(existingInvoice.id, {
      amountDue: existingInvoice.amount_due,
      balance: existingInvoice.balance,
    });

    // Mark the inspection as COMPLETE_BILLED and update the completed date
    inspection.status = InspectionStatus.COMPLETE_BILLED;
    inspection.completedDate = new Date();

    // Save the inspection and return the updated inspection with invoice information
    await this.inspectionRepository.save(inspection);

    return {
      ...inspection,
      invoiceId: existingInvoice.id, // Return the related invoice ID
    };
  }

  async completeInspectionWithoutBilling(
    inspectionId: string,
  ): Promise<Inspection> {
    const inspection = await this.findOne(inspectionId);

    if (inspection.status === InspectionStatus.COMPLETE_BILLED) {
      throw new Error('This inspection has already been billed.');
    }

    inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
    inspection.completedDate = new Date();

    return this.inspectionRepository.save(inspection);
  }

  private async updateInspectionStatus(inspection: Inspection): Promise<void> {
    const currentDate = new Date();

    if (inspection.completedDate) {
      if (inspection.serviceFee > 0) {
        inspection.status = InspectionStatus.COMPLETE_BILLED;
      } else {
        inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
      }
    } else if (
      currentDate > inspection.scheduledDate &&
      inspection.status !== InspectionStatus.COMPLETE_BILLED &&
      inspection.status !== InspectionStatus.COMPLETE_NOT_BILLED
    ) {
      inspection.status = InspectionStatus.PAST_DUE;
    }

    await this.inspectionRepository.save(inspection);
  }

  async submitAndBillCustomer(inspectionId: string) {
    // Fetch the inspection by its ID, including relations with client, customer, and photos
    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
      relations: ['client', 'customer', 'photos'], // Include photos relation here
    });

    // Check if the inspection exists
    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    const quickbooksCustomerId = inspection.customer.quickbooksCustomerId;
    const localCustomerId = inspection.customer.id;
    if (!quickbooksCustomerId) {
      throw new InternalServerErrorException(
        'QuickBooks Customer ID is missing',
      );
    }

    // Fetch the PDF report from the S3 bucket
    let pdfReportPath: string;
    let imagePaths: string[] = [];

    try {
      console.log('Fetching PDF report for inspection:', inspectionId);
      const pdfReportBuffer = await this.pdfService.fetchPdfReport(
        inspection.id,
      );

      pdfReportPath = pdfReportBuffer.toString();

      if (!pdfReportPath) {
        throw new NotFoundException('PDF report not found in S3 bucket');
      }

      // Iterate through the inspection photos and collect image URLs
      for (const photo of inspection.photos) {
        imagePaths.push(photo.url); // Assuming the photo URLs are stored in the S3 bucket
      }
      console.log('Image Paths:', imagePaths);
    } catch (error) {
      // Handle the case where the PDF report is missing from S3
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(
          `PDF report not found in S3 for inspection: ${inspectionId}`,
        );
      }
      // For other errors, throw a generic internal server error
      console.error('Error fetching PDF report from S3:', error);
      throw new InternalServerErrorException('Error fetching PDF report');
    }

    // Create the invoice in QuickBooks using the InvoiceService
    const invoiceData: CreateInvoiceDto = {
      clientId: inspection.client.id,
      customerId: localCustomerId,
      quickbooksCustomerId: quickbooksCustomerId,
      inspectionId,
      amountDue: inspection.serviceFee, // Use the service fee from the inspection
      dueDate: new Date().toISOString(), // Set the due date to now, customize as needed
      pdfReportPath, // Attach the PDF report path
      imagePaths, // Attach the image paths
    };

    try {
      console.log('Creating invoice with data:', invoiceData);
      const invoice = await this.invoiceService.createInvoice(
        inspectionId,
        invoiceData,
      );

      console.log('Invoice created:', invoice);

      // If QuickBooks responds successfully, mark the inspection as billed
      if (invoice.quickbooks_invoice_id) {
        inspection.status = InspectionStatus.COMPLETE_BILLED;
        await this.inspectionRepository.save({
          ...inspection,
          customerId: localCustomerId, // Use UUID here for PostgreSQL
        });

        // Send the invoice via QuickBooks, including the PDF and images as attachments
        // await this.invoiceService.sendInvoiceWithAttachments(
        //   invoice.quickbooks_invoice_id,
        //   inspection.client.id,
        //   inspection.id,
        //   pdfReportPath,
        //   imagePaths,
        // );

        return invoice; // Return the created invoice
      } else {
        throw new BadRequestException('Failed to create invoice in QuickBooks');
      }
    } catch (error) {
      // Handle QuickBooks specific errors and log them
      if (error.response && error.response.statusCode === 409) {
        // Handle conflict, e.g., duplicate customer name in QuickBooks
        throw new ConflictException(error.response.message);
      }

      // Log and rethrow other errors
      console.error('Error creating invoice in QuickBooks:', error);
      throw new InternalServerErrorException(
        'Failed to create invoice in QuickBooks',
      );
    }
  }

  async submitAndDontBillCustomer(inspectionId: string) {
    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
      relations: ['client', 'customer'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Fetch the PDF report from the S3 bucket
    const pdfReportPath = await this.pdfService.fetchPdfReport(inspection.id);

    if (!pdfReportPath) {
      throw new NotFoundException('PDF report not found in S3 bucket');
    }

    // Prepare the invoice data but don't send it (sendInvoice flag is set to false)
    const invoiceData: CreateInvoiceDto = {
      clientId: inspection.client.id,
      customerId: inspection.customer.id,
      quickbooksCustomerId: inspection.customer.quickbooksCustomerId,
      inspectionId,
      amountDue: inspection.serviceFee,
      dueDate: new Date().toISOString(), // Set a due date
      pdfReportPath: pdfReportPath.toString(),
      imagePaths: [], // No images for this invoice
    };

    // Create the invoice in QuickBooks using the InvoiceService without sending the email
    const invoice = await this.invoiceService.createInvoice(
      inspectionId,
      invoiceData,
    );

    // Mark the inspection as Complete Not Billed
    if (invoice.quickbooks_invoice_id) {
      inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
      await this.inspectionRepository.save(inspection);
    } else {
      throw new BadRequestException('Failed to create invoice in QuickBooks');
    }

    return invoice;
  }

  // Retrieve inspections for a specific client
  async getClientInspectionHistory(clientId: string): Promise<any> {
    const inspections = await this.inspectionRepository.find({
      where: { client: { id: clientId } },
      relations: ['client', 'customer', 'asset'],
    });
    return {
      clientId: clientId,
      totalInspections: inspections.length,
      inspections,
    };
  }

  // Retrieve inspections for a specific customer
  async getCustomerInspectionHistory(customerId: string): Promise<any> {
    const inspections = await this.inspectionRepository.find({
      where: { customer: { id: customerId } },
      relations: ['client', 'customer', 'asset'],
    });
    return {
      customerId: customerId,
      totalInspections: inspections.length,
      inspections,
    };
  }

  // Retrieve inspections for a specific asset
  async getAssetInspectionHistory(assetId: string): Promise<any> {
    const inspections = await this.inspectionRepository.find({
      where: { asset: { id: assetId } },
      relations: ['client', 'customer', 'asset'],
    });
    return {
      assetId: assetId,
      totalInspections: inspections.length,
      inspections,
    };
  }

  // Retrieve inspections for a specific asset type
  async getAssetTypeInspectionHistory(assetTypeId: string): Promise<any> {
    const inspections = await this.inspectionRepository.find({
      where: { asset: { assetType: { id: assetTypeId } } },
      relations: ['client', 'customer', 'asset', 'asset.assetType'],
    });
    return {
      assetTypeId: assetTypeId,
      totalInspections: inspections.length,
      inspections,
    };
  }
}

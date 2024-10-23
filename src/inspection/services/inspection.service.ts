import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import {
  Inspection,
  InspectionStatus,
  IntervalType,
} from './../entities/inspection.entity';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
} from './../dto/inspection.dto';
import { User } from './../../user/entities/user.entity';

import { Client } from './../../client/entities/client.entity';
import { Asset } from './../../assets/entities/asset.entity';
import { Customer } from './../../customer/entities/customer.entity';
import { Invoice } from './../../invoice/entities/invoice.entity';
import { InvoiceService } from './../../invoice/services/invoice.service';
import { PdfService } from './../../reports/services/pdf.service';
import { CreateInvoiceDto } from './../../invoice/dto/create-invoice.dto';
import { Services } from '../../invoice/entities/services.entity';
import { InspectionChecklist } from './../../checklist/entities/inspection-checklist.entity';
import { ChecklistQuestion } from './../../checklist/entities/checklist-question.entity';
import { ChecklistTemplate } from './../../checklist/entities/checklist-template.entity';
import { InspectionChecklistAnswer } from './../../checklist/entities/inspection-checklist-answer.entity';
import { AwsService } from './../../aws/aws.service';
import { Photo } from './../../assets/entities/photo.entity';
import { ServicesService } from './../../invoice/services/services.service';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(InspectionChecklist)
    private readonly inspectionChecklistRepository: Repository<InspectionChecklist>,
    @InjectRepository(ChecklistQuestion)
    private readonly checklistQuestionRepository: Repository<ChecklistQuestion>,
    @InjectRepository(ChecklistTemplate)
    private readonly checklistTemplateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(InspectionChecklistAnswer)
    private readonly inspectionChecklistAnswerRepository: Repository<InspectionChecklistAnswer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Services)
    private readonly serviceFeeRepository: Repository<Services>,
    private readonly servicesService: ServicesService,
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
    private readonly awsService: AwsService,
  ) {}

  async create(
    createInspectionDto: CreateInspectionDTO,
    files: Express.Multer.File[],
  ): Promise<Inspection> {
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
        let serviceFee: Services | null = null;

        if (createInspectionDto.assignedTo) {
          assignedToUser = await transactionalEntityManager.findOne(User, {
            where: { id: createInspectionDto.assignedTo },
          });
        }

        if (createInspectionDto.serviceFeeId) {
          serviceFee = await transactionalEntityManager.findOne(Services, {
            where: { id: createInspectionDto.serviceFeeId },
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
          serviceFee: serviceFee,
          status: InspectionStatus.NOT_DONE,
        });

        // Save the inspection entity first to get the ID
        const savedInspection =
          await transactionalEntityManager.save(inspection);

        // Handle photos upload
        if (files && files.length > 0) {
          const photos = [];
          for (const file of files) {
            const s3Path = await this.awsService.uploadFile(
              client.id,
              'inspection',
              'image',
              file.buffer,
              file.originalname,
            );
            const photo = transactionalEntityManager.create(Photo, {
              url: s3Path,
              inspection: savedInspection,
            });
            photos.push(await transactionalEntityManager.save(photo));
          }
          savedInspection.photos = photos;
        }

        // Associate and save checklists if provided
        // Associate checklist templates without answers
        if (createInspectionDto.checklists) {
          const checklists = [];

          for (const checklistDto of createInspectionDto.checklists) {
            const template = await this.checklistTemplateRepository.findOne({
              where: { id: checklistDto.templateId },
              relations: ['questions'],
            });

            if (!template) {
              throw new NotFoundException(
                `Checklist Template with ID ${checklistDto.templateId} not found`,
              );
            }

            // Create the InspectionChecklist without answers
            const inspectionChecklist =
              this.inspectionChecklistRepository.create({
                inspection: savedInspection,
                template,
              });

            const savedChecklist =
              await transactionalEntityManager.save(inspectionChecklist);
            checklists.push(savedChecklist);
          }

          savedInspection.checklists = checklists;
        }

        // Check if the inspection is recurring and schedule recurring inspections
        if (
          createInspectionDto.isReocurring &&
          createInspectionDto.inspectionInterval
        ) {
          await this.scheduleRecurring(
            savedInspection,
            createInspectionDto.inspectionInterval,
            createInspectionDto.reocurrenceEndDate,
            transactionalEntityManager,
          );
        }

        return transactionalEntityManager.save(savedInspection);
      },
    );
  }

  // Update scheduleRecurring method to handle different intervals
  async scheduleRecurring(
    inspection: Inspection,
    inspectionInterval: IntervalType,
    recurrenceEndDate: Date,
    transactionalEntityManager: any,
  ): Promise<void> {
    let nextScheduledDate = new Date(inspection.scheduledDate);
    const endDate = new Date(recurrenceEndDate);

    // Loop until the nextScheduledDate is beyond the recurrenceEndDate
    while (nextScheduledDate <= endDate) {
      switch (inspectionInterval) {
        case 'Daily':
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
          break;
        case 'Bi-Monthly':
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 15);
          break;
        case 'Monthly':
          nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1);
          break;
        case 'Quarterly':
          nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 3);
          break;
        case 'Bi-Annual':
          nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 6);
          break;
        case 'Annual':
          nextScheduledDate.setFullYear(nextScheduledDate.getFullYear() + 1);
          break;
        default:
          // For 'One-Time' or unknown intervals, exit the loop
          nextScheduledDate = endDate;
          break;
      }

      // Ensure we don't create an inspection after the end date
      if (nextScheduledDate > endDate) break;

      // Create the new recurring inspection entity
      const newInspection = transactionalEntityManager.create(Inspection, {
        ...inspection,
        id: undefined, // New ID for the new inspection
        scheduledDate: new Date(nextScheduledDate),
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
        'checklists.template',
        'checklists.template.questions',
        'checklists.answers', // If required, fetch the answers tied to each checklist
        'checklists.answers.question',
        'client',
        'customer',
        'assignedTo',
        'asset',
        'asset.assetType',
        'invoice',
        'serviceFee',
        'photos',
      ],
    });
  }

  async findOne(id: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: [
        'checklists',
        'checklists.template',
        'checklists.template.questions',
        'checklists.answers',
        'checklists.answers.question',
        'client',
        'customer',
        'assignedTo',
        'asset',
        'asset.assetType',
        'invoice',
        'photos',
        'serviceFee',
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

    // Handle checklists and answers during update
    if (updateInspectionDto.checklists) {
      const updatedChecklists = [];

      for (const checklistDto of updateInspectionDto.checklists) {
        let inspectionChecklist =
          await this.inspectionChecklistRepository.findOne({
            where: { id: checklistDto.id },
            relations: ['answers', 'answers.question'],
          });

        if (!inspectionChecklist) {
          // Create a new checklist if it doesn't exist
          const template = await this.checklistTemplateRepository.findOne({
            where: { id: checklistDto.templateId },
          });

          if (!template) {
            throw new NotFoundException(
              `Checklist Template with ID ${checklistDto.templateId} not found`,
            );
          }

          inspectionChecklist = this.inspectionChecklistRepository.create({
            inspection,
            template,
            answers: [],
          });
        }

        // Add or update answers for the checklist
        if (checklistDto.answers && checklistDto.answers.length > 0) {
          for (const answerDto of checklistDto.answers) {
            let answer = inspectionChecklist.answers.find(
              (a) => a.question && a.question.id === answerDto.questionId,
            );

            if (answer) {
              // Update existing answer
              answer.answer = answerDto.answer;

              await this.inspectionChecklistAnswerRepository.save(answer);
            } else {
              // Create a new answer
              const question = await this.checklistQuestionRepository.findOne({
                where: { id: answerDto.questionId },
              });

              if (!question) {
                throw new NotFoundException(
                  `Question with ID ${answerDto.questionId} not found`,
                );
              }

              answer = this.inspectionChecklistAnswerRepository.create({
                inspectionChecklist,
                question,
                answer: answerDto.answer,
              });

              inspectionChecklist.answers.push(answer);
            }
          }
        }

        await this.inspectionChecklistRepository.save(inspectionChecklist);
        updatedChecklists.push(inspectionChecklist);
      }

      inspection.checklists = updatedChecklists;
    }


    // Merge other properties and save the inspection
    const { assignedTo, ...rest } = updateInspectionDto;

    // Filter out undefined values from rest
    const filteredRest = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined),
    );

    console.log('Before merge, scheduledDate:', inspection.scheduledDate);
    this.inspectionRepository.merge(inspection, filteredRest);
    console.log('After merge, scheduledDate:', inspection.scheduledDate);

    // Update inspection status based on new data
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
    const existingInvoice = inspection.invoice;
    if (
      existingInvoice &&
      (existingInvoice.status === 'pending' ||
        existingInvoice.status === 'paid')
    ) {
      console.error(
        `Invoice ${existingInvoice.id} already exists for Inspection ${inspectionId}`,
      );
      throw new InternalServerErrorException(
        'Invoice already exists for this inspection.',
      );
    }

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
        amountDue: 0,
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
    const serviceFee = 0;

    // Add the inspection details and PDF report to the existing invoice
    const updatedInvoice = await this.invoiceService.addInspectionToInvoice(
      invoiceId,
      {
        inspectionId,
        serviceFeeId: inspection.serviceFee.id,
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
    const incrementAmount = 0;

    existingInvoice.amount_due += incrementAmount;
    existingInvoice.balance += incrementAmount;

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

    console.log('Updating status for inspection:', inspection);
    console.log(
      'Current date:',
      currentDate,
      'Scheduled date:',
      inspection.scheduledDate,
    );
    console.log(
      'Current status:',
      inspection.status,
      'Completed date:',
      inspection.completedDate,
    );

    if (inspection.completedDate) {
      inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
    } else if (
      currentDate > inspection.scheduledDate &&
      inspection.status !== InspectionStatus.COMPLETE_BILLED &&
      inspection.status !== InspectionStatus.COMPLETE_NOT_BILLED
    ) {
      inspection.status = InspectionStatus.PAST_DUE;
    }

    // await this.inspectionRepository.save(inspection);
  }

  async submitAndBillCustomer(inspectionId: string, serviceFeeAmount: number) {
    // Fetch the inspection by its ID, including relations with client, customer, serviceFee, and photos
    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
      relations: ['client', 'customer', 'photos', 'serviceFee'],
    });

    // Check if the inspection exists
    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    const clientId = inspection.client.id;

    // Create or fetch the ServiceFee using ServicesService
    let serviceFeeEntity = await this.serviceFeeRepository.findOne({
      where: {
        price: serviceFeeAmount,
        client: { id: clientId },
      },
    });

    if (!serviceFeeEntity) {
      const createServiceFeeDto = {
        name: `Service Fee for Inspection ${inspectionId}`,
        description: `Service fee for inspection ${inspectionId}`,
        price: serviceFeeAmount,
        isTaxable: false, // Set according to your needs
        billingIo: '', // Set if applicable
      };

      // Create the service fee using ServicesService
      serviceFeeEntity = await this.servicesService.createServiceFee(
        clientId,
        createServiceFeeDto,
      );
    }

    // Associate the service fee with the inspection
    inspection.serviceFee = serviceFeeEntity;
    await this.inspectionRepository.save(inspection);

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

    // Use the service fee price as the amount due
    const serviceFee = inspection.serviceFee;
    if (!serviceFee) {
      throw new BadRequestException(
        'Service fee not associated with inspection',
      );
    }

    const amountDue = serviceFee.price;

    // Create the invoice in QuickBooks using the InvoiceService
    const invoiceData: CreateInvoiceDto = {
      clientId: inspection.client.id,
      customerId: localCustomerId,
      quickbooksCustomerId: quickbooksCustomerId,
      inspectionId,
      amountDue: amountDue, // Use the service fee price
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

      // If QuickBooks responds successfully, send the invoice with attachments
      if (invoice.quickbooks_invoice_id) {
        // Send the invoice with attachments
        try {
          await this.invoiceService.sendInvoiceWithAttachments(
            invoice.quickbooks_invoice_id,
            clientId,
            inspectionId,
            pdfReportPath,
            imagePaths,
          );
        } catch (error) {
          console.error('Error sending invoice with attachments:', error);
          throw new InternalServerErrorException(
            'Failed to send invoice with attachments',
          );
        }

        inspection.status = InspectionStatus.COMPLETE_BILLED;

        // Associate the invoice with the inspection
        inspection.invoice = invoice;

        await this.inspectionRepository.save({
          ...inspection,
          customerId: localCustomerId,
        });

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
      relations: ['client', 'customer', 'serviceFee'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Ensure the service fee is associated with the inspection
    const serviceFee = inspection.serviceFee;
    if (!serviceFee) {
      throw new BadRequestException(
        'Service fee not associated with this inspection',
      );
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
      amountDue: serviceFee.price,
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
      inspection.invoice = invoice;
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

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, LessThan, Repository } from 'typeorm';
// import { Inspection, InspectionStatus } from './../entities/inspection.entity';
// import {
//   CreateInspectionDTO,
//   UpdateInspectionDTO,
// } from './../dto/inspection.dto';
// import { Checklist } from './../entities/checklist.entity';
// import { InspectionScore } from './../entities/inspection-score.entity';
// import { User } from './../../user/entities/user.entity';
// import { ChecklistItem } from '../entities/checklist-item.entity';
// import { Client } from './../../client/entities/client.entity';
// import { Asset } from './../../assets/entities/asset.entity';
// import { Customer } from './../../customer/entities/customer.entity';
// import { Invoice } from './../../invoice/entities/invoice.entity';
// import { InvoiceService } from './../../invoice/invoice.service';

// @Injectable()
// export class InspectionService {
//   constructor(
//     @InjectRepository(Inspection)
//     private readonly inspectionRepository: Repository<Inspection>,
//     @InjectRepository(Checklist)
//     private readonly checklistRepository: Repository<Checklist>,
//     @InjectRepository(ChecklistItem)
//     private readonly checklistItemRepository: Repository<ChecklistItem>,
//     @InjectRepository(InspectionScore)
//     private readonly inspectionScoreRepository: Repository<InspectionScore>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(Customer)
//     private readonly customerRepository: Repository<Customer>,
//     @InjectRepository(Client)
//     private readonly clientRepository: Repository<Client>,
//     @InjectRepository(Asset)
//     private readonly assetRepository: Repository<Asset>,
//     private readonly invoiceService: InvoiceService,
//   ) {}

//   async create(createInspectionDto: CreateInspectionDTO): Promise<Inspection> {
//     return await this.inspectionRepository.manager.transaction(
//       async (transactionalEntityManager) => {
//         // Fetch the related entities (Client, Customer, Asset)
//         const client = await transactionalEntityManager.findOne(Client, {
//           where: { id: createInspectionDto.clientId },
//         });
//         const customer = await transactionalEntityManager.findOne(Customer, {
//           where: { id: createInspectionDto.customerId },
//         });
//         const asset = await transactionalEntityManager.findOne(Asset, {
//           where: { id: createInspectionDto.assetId },
//         });
//         let assignedToUser: User | null = null;

//         if (createInspectionDto.assignedTo) {
//           assignedToUser = await transactionalEntityManager.findOne(User, {
//             where: { id: createInspectionDto.assignedTo },
//           });
//         }

//         if (!client || !customer || !asset) {
//           throw new Error('Related entities not found'); // Ensure all entities are found before proceeding
//         }

//         // Create the inspection entity
//         const inspection = transactionalEntityManager.create(Inspection, {
//           ...createInspectionDto,
//           client,
//           customer, // Correctly assign the customer entity
//           asset,
//           assignedTo: assignedToUser,
//           status: InspectionStatus.NOT_DONE, // Set default status
//         });

//         // Save the inspection entity first to get the ID
//         const savedInspection =
//           await transactionalEntityManager.save(inspection);

//         // Create and save the checklists
//         if (createInspectionDto.checklists) {
//           const checklists = await Promise.all(
//             createInspectionDto.checklists.map(async (checklistDto) => {
//               const checklistItems = await transactionalEntityManager.findByIds(
//                 ChecklistItem,
//                 checklistDto.checklistItemIds,
//               );
//               const checklist = transactionalEntityManager.create(Checklist, {
//                 ...checklistDto,
//                 inspection: savedInspection,
//                 items: checklistItems,
//               });
//               return transactionalEntityManager.save(checklist);
//             }),
//           );
//           savedInspection.checklists = checklists;
//         }

//         // Create and save the inspection scores
//         if (createInspectionDto.score) {
//           const inspectionScore = transactionalEntityManager.create(
//             InspectionScore,
//             {
//               ...createInspectionDto.score,
//               inspection: savedInspection,
//             },
//           );
//           savedInspection.scores = [
//             await transactionalEntityManager.save(inspectionScore),
//           ];
//         }

//         // Save the fully linked inspection entity
//         return transactionalEntityManager.save(savedInspection);
//       },
//     );
//   }

//   async findAll(): Promise<Inspection[]> {
//     return this.inspectionRepository.find({
//       relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo'],
//     });
//   }

//   async findOne(id: string): Promise<Inspection> {
//     const inspection = await this.inspectionRepository.findOne({
//       where: { id },
//       relations: [
//         'checklists',
//         'scores',
//         'client',
//         'customer',
//         'assignedTo',
//         'asset',
//       ],
//     });
//     if (!inspection) {
//       throw new NotFoundException(`Inspection with ID ${id} not found`);
//     }
//     return inspection;
//   }

//   async update(
//     id: string,
//     updateInspectionDto: UpdateInspectionDTO,
//   ): Promise<Inspection> {
//     const inspection = await this.findOne(id);

//     // Update assigned user if provided
//     if (updateInspectionDto.assignedTo) {
//       const assignedToUser = await this.userRepository.findOne({
//         where: { id: updateInspectionDto.assignedTo },
//       });

//       if (!assignedToUser) {
//         throw new NotFoundException(
//           `User with ID ${updateInspectionDto.assignedTo} not found`,
//         );
//       }

//       inspection.assignedTo = assignedToUser;
//     }

//     // Handle related entities if provided
//     if (updateInspectionDto.checklists) {
//       const checklists = updateInspectionDto.checklists.map((checklist) =>
//         this.checklistRepository.create(checklist),
//       );
//       inspection.checklists = await this.checklistRepository.save(checklists);
//     }

//     if (updateInspectionDto.score) {
//       const inspectionScore = this.inspectionScoreRepository.create({
//         ...updateInspectionDto.score,
//         inspection,
//       });
//       inspection.scores = [
//         await this.inspectionScoreRepository.save(inspectionScore),
//       ];
//     }

//     // Update the inspection with the remaining properties
//     const { assignedTo, ...rest } = updateInspectionDto;
//     this.inspectionRepository.merge(inspection, rest);

//     // Apply status change logic based on the updated fields
//     await this.updateInspectionStatus(inspection);

//     return this.inspectionRepository.save(inspection);
//   }

//   async remove(id: string): Promise<void> {
//     const inspection = await this.findOne(id);
//     await this.inspectionRepository.remove(inspection);
//   }

//   async startInspection(inspectionId: string): Promise<Inspection> {
//     const inspection = await this.findOne(inspectionId);
//     if (inspection.status === InspectionStatus.NOT_DONE) {
//       inspection.status = InspectionStatus.STARTED_NOT_FINISHED;
//       return this.inspectionRepository.save(inspection);
//     }
//     return inspection;
//   }

//   async completeAndBillInspection(inspectionId: string): Promise<Inspection> {
//     const inspection = await this.findOne(inspectionId);

//     // Check if the inspection has already been billed
//     const existingInvoice = await this.invoiceService.findInvoiceByInspectionId(inspectionId);

//     if (existingInvoice) {
//       throw new Error('An invoice has already been created for this inspection.');
//     }

//     // Only proceed if the inspection is not canceled or on hold
//     if (
//       inspection.status !== InspectionStatus.CANCELED &&
//       inspection.status !== InspectionStatus.ON_HOLD
//     ) {
//       // Update the inspection status to COMPLETE_BILLED
//       inspection.status = InspectionStatus.COMPLETE_BILLED;
//       inspection.completedDate = new Date();

//       // Save the updated inspection status
//       const updatedInspection = await this.inspectionRepository.save(inspection);

//       // Create an invoice in QuickBooks and store the response
//       const invoiceData = {
//         inspectionId: updatedInspection.id, // Link to the inspection
//         clientId: updatedInspection.client.id, // Link to the client
//         customerId: updatedInspection.customer.id, // Link to the customer
//         amountDue: updatedInspection.serviceFee, // Use the service fee for billing
//         dueDate: new Date().toISOString(), // Set the due date for the invoice
//       };

//       // Call the InvoiceService to create the invoice
//       await this.invoiceService.createInvoice(updatedInspection.id, invoiceData);

//       return updatedInspection;
//     }

//     return inspection;
//   }

//   async completeInspectionWithoutBilling(
//     inspectionId: string,
//   ): Promise<Inspection> {
//     const inspection = await this.findOne(inspectionId);
//     if (
//       inspection.status !== InspectionStatus.CANCELED &&
//       inspection.status !== InspectionStatus.ON_HOLD
//     ) {
//       inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
//       inspection.completedDate = new Date();
//       return this.inspectionRepository.save(inspection);
//     }
//     return inspection;
//   }

//   async holdInspection(inspectionId: string): Promise<Inspection> {
//     const inspection = await this.findOne(inspectionId);
//     inspection.status = InspectionStatus.ON_HOLD;
//     return this.inspectionRepository.save(inspection);
//   }

//   async cancelInspection(inspectionId: string): Promise<Inspection> {
//     const inspection = await this.findOne(inspectionId);
//     inspection.status = InspectionStatus.CANCELED;
//     return this.inspectionRepository.save(inspection);
//   }

//   async updatePastDueInspections(): Promise<void> {
//     const inspections = await this.inspectionRepository.find({
//       where: {
//         status: In([
//           InspectionStatus.NOT_DONE,
//           InspectionStatus.STARTED_NOT_FINISHED,
//         ]),
//         scheduledDate: LessThan(new Date()),
//       },
//     });

//     for (const inspection of inspections) {
//       inspection.status = InspectionStatus.PAST_DUE;
//       await this.inspectionRepository.save(inspection);
//     }
//   }

//   private async updateInspectionStatus(inspection: Inspection): Promise<void> {
//     const currentDate = new Date();

//     if (inspection.completedDate) {
//       if (inspection.serviceFee > 0) {
//         inspection.status = InspectionStatus.COMPLETE_BILLED;
//       } else {
//         inspection.status = InspectionStatus.COMPLETE_NOT_BILLED;
//       }
//     } else if (
//       currentDate > inspection.scheduledDate &&
//       inspection.status !== InspectionStatus.COMPLETE_BILLED &&
//       inspection.status !== InspectionStatus.COMPLETE_NOT_BILLED
//     ) {
//       inspection.status = InspectionStatus.PAST_DUE;
//     }

//     await this.inspectionRepository.save(inspection);
//   }
// }
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(InspectionScore)
    private readonly inspectionScoreRepository: Repository<InspectionScore>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    // @InjectRepository(Invoice)
    // private readonly invoiceRepository: Repository<Invoice>,
    private readonly invoiceService: InvoiceService,
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

        // Create and save the checklists
        if (createInspectionDto.checklists) {
          const checklists = await Promise.all(
            createInspectionDto.checklists.map(async (checklistDto) => {
              const checklistItems = await transactionalEntityManager.findByIds(
                ChecklistItem,
                checklistDto.checklistItemIds,
              );
              const checklist = transactionalEntityManager.create(Checklist, {
                ...checklistDto,
                inspection: savedInspection,
                items: checklistItems,
              });
              return transactionalEntityManager.save(checklist);
            }),
          );
          savedInspection.checklists = checklists;
        }

        // Create and save the inspection scores
        if (createInspectionDto.score) {
          const inspectionScore = transactionalEntityManager.create(
            InspectionScore,
            {
              ...createInspectionDto.score,
              inspection: savedInspection,
            },
          );
          savedInspection.scores = [
            await transactionalEntityManager.save(inspectionScore),
          ];
        }

        return transactionalEntityManager.save(savedInspection);
      },
    );
  }

  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
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

      // Prepare the invoice data
      const invoiceData = {
        inspectionId: inspection.id,
        clientId: inspection.client.id,
        customerId: inspection.customer.id,
        amountDue: inspection.serviceFee,
        dueDate: new Date().toISOString(),
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
}

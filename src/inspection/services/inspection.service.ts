import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inspection } from './../entities/inspection.entity';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
} from './../dto/inspection.dto';
import { Checklist } from './../entities/checklist.entity';
import { InspectionScore } from './../entities/inspection-score.entity';
import { User } from './../../user/entities/user.entity';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { Client } from './../../client/entities/client.entity';
import { Asset } from './../../assets/entities/asset.entity';
import { Customer } from './../../customer/entities/customer.entity';

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
  ) {}

  
  
  async create(createInspectionDto: CreateInspectionDTO): Promise<Inspection> {
    return await this.inspectionRepository.manager.transaction(async transactionalEntityManager => {
      
      // Fetch the related entities (Client, Customer, Asset)
      const client = await transactionalEntityManager.findOne(Client, { where: { id: createInspectionDto.clientId } });
      const customer = await transactionalEntityManager.findOne(Customer, { where: { id: createInspectionDto.customerId } });
      const asset = await transactionalEntityManager.findOne(Asset, { where: { id: createInspectionDto.assetId } });
      let assignedToUser: User | null = null;
      
      if (createInspectionDto.assignedTo) {
        assignedToUser = await transactionalEntityManager.findOne(User, { where: { id: createInspectionDto.assignedTo } });
      }
  
      if (!client || !customer || !asset) {
        throw new Error('Related entities not found');  // Ensure all entities are found before proceeding
      }

      // Create the inspection entity
      const inspection = transactionalEntityManager.create(Inspection, {
        ...createInspectionDto,
        client,
        customer, // Correctly assign the customer entity
        asset,
        assignedTo: assignedToUser,
      });
  
      // Save the inspection entity first to get the ID
      const savedInspection = await transactionalEntityManager.save(inspection);
  
      // Create and save the checklists
      if (createInspectionDto.checklists) {
        const checklists = await Promise.all(
          createInspectionDto.checklists.map(async (checklistDto) => {
            const checklistItems = await transactionalEntityManager.findByIds(ChecklistItem, checklistDto.checklistItemIds);
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
        const inspectionScore = transactionalEntityManager.create(InspectionScore, {
          ...createInspectionDto.score,
          inspection: savedInspection,
        });
        savedInspection.scores = [
          await transactionalEntityManager.save(inspectionScore),
        ];
      }
  
      // Save the fully linked inspection entity
      return transactionalEntityManager.save(savedInspection);
    });
  }

  
  

  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo', 'asset'],
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
    const { assignedTo, ...rest } = updateInspectionDto;

    this.inspectionRepository.merge(inspection, rest);
  
    return this.inspectionRepository.save(inspection);
  }

  async remove(id: string): Promise<void> {
    const inspection = await this.findOne(id);
    await this.inspectionRepository.remove(inspection);
  }
}

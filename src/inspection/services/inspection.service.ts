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
  ) {}

  async create(createInspectionDto: CreateInspectionDTO): Promise<Inspection> {

    console.log('Received DTO:', createInspectionDto);
    // Retrieve the assigned user, if provided
    let assignedToUser: User | null = null;
    if (createInspectionDto.assignedTo) {
      assignedToUser = await this.userRepository.findOne({
        where: { id: createInspectionDto.assignedTo },
      });
  
      if (!assignedToUser) {
        throw new NotFoundException(
          `User with ID ${createInspectionDto.assignedTo} not found`,
        );
      }
    }
  
    // Create the inspection
    const inspection = this.inspectionRepository.create({
      ...createInspectionDto,
      assignedTo: assignedToUser,
    });

    console.log('Creating Inspection:', inspection); 
  
    // Handle related entities (Checklists and Scores)
    if (createInspectionDto.checklists) {
      const checklists = await Promise.all(
        createInspectionDto.checklists.map(async (checklistDto) => {
          // Fetch the checklist items by their IDs
          const checklistItems = await this.checklistItemRepository.findBy({
            id: In(checklistDto.checklistItemIds),
          });

          if (checklistItems.length !== checklistDto.checklistItemIds.length) {
            throw new NotFoundException('Some ChecklistItems were not found');
          }

          // Create the checklist entity
          const checklist = this.checklistRepository.create({
            ...checklistDto,
            items: checklistItems,
          });

          return this.checklistRepository.save(checklist);
        })
      );
      inspection.checklists = checklists;
    }
  
    if (createInspectionDto.score) {
      const inspectionScore = this.inspectionScoreRepository.create({
        ...createInspectionDto.score,
        inspection,
      });
      inspection.scores = [
        await this.inspectionScoreRepository.save(inspectionScore),
      ];
    }
  
    return this.inspectionRepository.save(inspection);
  }
  

  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: ['checklists', 'scores', 'client', 'customer', 'assignedTo'],
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

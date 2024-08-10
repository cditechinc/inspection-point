import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { InspectionScore } from './../entities/inspection-score.entity';
import { InspectionScoreDTO, UpdateInspectionScoreDTO } from './../dto/inspection-score.dto';

@Injectable()
export class InspectionScoreService {
  constructor(
    @InjectRepository(InspectionScore)
    private readonly inspectionScoreRepository: Repository<InspectionScore>,
  ) {}

  async create(inspectionScoreDto: InspectionScoreDTO): Promise<InspectionScore> {
    const inspectionScore: DeepPartial<InspectionScore> = {
      inspection: { id: inspectionScoreDto.inspectionId },  // Assuming inspection is a relation
      structure_score: inspectionScoreDto.structure_score,
      panel_score: inspectionScoreDto.panel_score,
      pipes_score: inspectionScoreDto.pipes_score,
      alarm_score: inspectionScoreDto.alarm_score,
      alarm_light_score: inspectionScoreDto.alarm_light_score,
      wires_score: inspectionScoreDto.wires_score,
      breakers_score: inspectionScoreDto.breakers_score,
      contactors_score: inspectionScoreDto.contactors_score,
      thermals_score: inspectionScoreDto.thermals_score,
      float_scores: inspectionScoreDto.float_scores,
    };

    const createdInspectionScore = this.inspectionScoreRepository.create(inspectionScore);
    return this.inspectionScoreRepository.save(createdInspectionScore);
  }
  

  async findAll(): Promise<InspectionScore[]> {
    return this.inspectionScoreRepository.find({ relations: ['inspection'] });
  }

  async findOne(id: string): Promise<InspectionScore> {
    const inspectionScore = await this.inspectionScoreRepository.findOne({
      where: { id },
      relations: ['inspection'],
    });
    if (!inspectionScore) {
      throw new NotFoundException(`InspectionScore with ID ${id} not found`);
    }
    return inspectionScore;
  }

  async update(id: string, updateInspectionScoreDto: UpdateInspectionScoreDTO): Promise<InspectionScore> {
    const inspectionScore = await this.findOne(id);

    const updatedData: DeepPartial<InspectionScore> = {
      structure_score: updateInspectionScoreDto.structure_score,
      panel_score: updateInspectionScoreDto.panel_score,
      pipes_score: updateInspectionScoreDto.pipes_score,
      alarm_score: updateInspectionScoreDto.alarm_score,
      alarm_light_score: updateInspectionScoreDto.alarm_light_score,
      wires_score: updateInspectionScoreDto.wires_score,
      breakers_score: updateInspectionScoreDto.breakers_score,
      contactors_score: updateInspectionScoreDto.contactors_score,
      thermals_score: updateInspectionScoreDto.thermals_score,
      float_scores: updateInspectionScoreDto.float_scores,
    };

    this.inspectionScoreRepository.merge(inspectionScore, updatedData);
    return this.inspectionScoreRepository.save(inspectionScore);
  }

  async remove(id: string): Promise<void> {
    const inspectionScore = await this.findOne(id);
    await this.inspectionScoreRepository.remove(inspectionScore);
  }
}

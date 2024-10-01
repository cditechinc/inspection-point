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
      structureScore: inspectionScoreDto.structureScore,
      panelScore: inspectionScoreDto.panelScore,
      pipesScore: inspectionScoreDto.pipesScore,
      alarmScore: inspectionScoreDto.alarmScore,
      alarmLightScore: inspectionScoreDto.alarmLightScore,
      wiresScore: inspectionScoreDto.wiresScore,
      breakersScore: inspectionScoreDto.breakersScore,
      contactorsScore: inspectionScoreDto.contactorsScore,
      thermalsScore: inspectionScoreDto.thermalsScore,
      floatScores: inspectionScoreDto.floatScores,
      pumpScores: inspectionScoreDto.pumpScores,
      overallScore: inspectionScoreDto.overallScore,
      cleaning: inspectionScoreDto.cleaning,
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
      structureScore: updateInspectionScoreDto.structureScore,
      panelScore: updateInspectionScoreDto.panelScore,
      pipesScore: updateInspectionScoreDto.pipesScore,
      alarmScore: updateInspectionScoreDto.alarmScore,
      alarmLightScore: updateInspectionScoreDto.alarmLightScore,
      wiresScore: updateInspectionScoreDto.wiresScore,
      breakersScore: updateInspectionScoreDto.breakersScore,
      contactorsScore: updateInspectionScoreDto.contactorsScore,
      thermalsScore: updateInspectionScoreDto.thermalsScore,
      floatScores: updateInspectionScoreDto.floatScores,
      pumpScores: updateInspectionScoreDto.pumpScores,
      overallScore: updateInspectionScoreDto.overallScore,
      cleaning: updateInspectionScoreDto.cleaning,
    };

    this.inspectionScoreRepository.merge(inspectionScore, updatedData);
    return this.inspectionScoreRepository.save(inspectionScore);
  }

  async remove(id: string): Promise<void> {
    const inspectionScore = await this.findOne(id);
    await this.inspectionScoreRepository.remove(inspectionScore);
  }
}

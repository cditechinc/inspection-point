import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsDecimal, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistDTO } from './checklist.dto';
import { InspectionScoreDTO } from './inspection-score.dto';

export class CreateInspectionDTO {
  @IsUUID()
  clientId: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  assetId: string;

  @IsUUID()
  @IsOptional()
  assignedTo: string;

  @IsEnum(['pending', 'in_progress', 'completed', 'canceled'])
  status: string;

  @IsDate()
  scheduledDate: Date;

  @IsOptional()
  @IsDate()
  completedDate: Date;

  @IsOptional()
  @IsArray()
  route: any[];

  @IsOptional()
  @IsString()
  comments: string;

  @IsDecimal()
  serviceFee: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  checklists: ChecklistDTO[];

  @ValidateNested()
  @Type(() => InspectionScoreDTO)
  score: InspectionScoreDTO;
}

export class UpdateInspectionDTO {
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsEnum(['pending', 'in_progress', 'completed', 'canceled'])
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsDate()
  completedDate?: Date;

  @IsOptional()
  @IsArray()
  route?: any[];

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsDecimal()
  serviceFee?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  @IsOptional()
  checklists?: ChecklistDTO[];

  @ValidateNested()
  @Type(() => InspectionScoreDTO)
  @IsOptional()
  score?: InspectionScoreDTO;
}

export class InspectionDTO {
  id: string;
  clientId: string;
  customerId: string;
  assetId: string;
  assignedTo: string;
  status: string;
  scheduledDate: Date;
  completedDate: Date;
  route: any[];
  comments: string;
  serviceFee: number;
  checklists: ChecklistDTO[];
  score: InspectionScoreDTO;
  createdAt: Date;
  updatedAt: Date;
}

import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsDecimal, IsDate, IsArray, ValidateNested, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistDTO } from './checklist.dto';
import { InspectionScoreDTO } from './inspection-score.dto';
import { InspectionStatus } from '../entities/inspection.entity';

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

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(InspectionStatus)
  status: InspectionStatus;

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

  @IsBoolean()
  @IsOptional()
  inspectionPassed?: boolean; // Track if the inspection passed

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean; // Whether the inspection is recurring

  @IsOptional()
  @IsInt()
  intervalInDays?: number; // The frequency of the inspection in days

  @IsOptional()
  @IsDate()
  recurrenceEndDate?: Date;

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

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;
  
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

  @IsBoolean()
  @IsOptional()
  inspectionPassed?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsOptional()
  @IsInt()
  intervalInDays?: number;

  @IsOptional()
  @IsDate()
  recurrenceEndDate?: Date;

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
  inspectionPassed: boolean;
  isRecurring: boolean;
  intervalInDays: number;
  recurrenceEndDate: Date;
  checklists: ChecklistDTO[];
  score: InspectionScoreDTO;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsDecimal, IsDate, IsArray, ValidateNested, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistDTO } from './checklist.dto';
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

  @IsEnum(InspectionStatus)
  status: InspectionStatus;
 
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedDate?: Date;

  @IsOptional()
  @IsArray()
  route: any[];

  @IsBoolean()
  @IsOptional()
  isReocurring?: boolean; // Whether the inspection is recurring

  @IsOptional()
  @IsInt()
  inspectionInterval?: number; 

  @IsOptional()
  @IsDate()
  reocurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  checklists: ChecklistDTO[];

  
}

export class UpdateInspectionDTO {
  @IsUUID()
  @IsOptional()
  assignedTo?: string;


  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;
  
  @IsOptional()
  @IsDate()
  completedDate?: Date;

  @IsOptional()
  @IsArray()
  route?: any[];

  @IsBoolean()
  @IsOptional()
  isReocurring?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  inspectionInterval?: number;

  @IsOptional()
  @IsDate()
  recurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  @IsOptional()
  checklists?: ChecklistDTO[];

  
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
  isReocurring: boolean;
  inspectionInterval: number;
  recurrenceEndDate: Date;
  checklists: ChecklistDTO[];
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

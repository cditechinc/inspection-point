import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, IsDecimal, IsDate, IsArray, ValidateNested, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistDTO } from './checklist.dto';
import { InspectionStatus, IntervalType } from '../entities/inspection.entity';

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

  @IsEnum(IntervalType)
  @IsOptional()
  inspectionInterval?: IntervalType;

  @IsOptional()
  @IsDate()
  reocurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  checklists: ChecklistDTO[];

  @IsUUID()
@IsOptional()
serviceFeeId?: string;

  
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

  @IsEnum(IntervalType)
  @IsOptional()
  inspectionInterval?: IntervalType;

  @IsOptional()
  @IsDate()
  recurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistDTO)
  @IsOptional()
  checklists?: ChecklistDTO[];

  @IsUUID()
@IsOptional()
serviceFeeId?: string;

}

export class InspectionDTO {
  id: string;
  clientId: string;
  customerId: string;
  assetId: string;
  assignedTo: string;
  status: string;
  scheduledDate: Date;
  serviceFeeId: string;
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

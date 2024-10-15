import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsDate,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

import { InspectionStatus, IntervalType } from '../entities/inspection.entity';
import { SubmitInspectionChecklistDTO } from './../../checklist/dto/submit-inspection-checklist.dto';

class Route {
  @IsDecimal()
  latitude: number;

  @IsDecimal()
  longitude: number;
}


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

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Route)
  route: Route[];

  @IsString()
  @IsOptional()
  isReocurring?: boolean; 

  @IsEnum(IntervalType)
  @IsOptional()
  inspectionInterval?: IntervalType;

  @IsOptional()
  @IsDate()
  reocurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitInspectionChecklistDTO)
  checklists: SubmitInspectionChecklistDTO[];

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
  reocurrenceEndDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitInspectionChecklistDTO)
  @IsOptional()
  checklists?: SubmitInspectionChecklistDTO[];

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
  reocurrenceEndDate: Date;
  checklists: SubmitInspectionChecklistDTO[];
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

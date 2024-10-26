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
  ValidateIf,
  IsIn,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
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

export function IsFifteenthDay(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFifteenthDay',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const day = (value as Date).getDate();
          return day === 15;
        },
        defaultMessage(args: ValidationArguments) {
          return 'For Bi-Monthly intervals, the first scheduled date must be on the 15th.';
        },
      },
    });
  };
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

  @ValidateIf((o) => o.inspectionInterval === IntervalType.BI_MONTHLY)
  @IsDate()
  @Type(() => Date)
  @IsFifteenthDay({
    message:
      'For Bi-Monthly intervals, the first scheduled date must be on the 15th.',
  })
  scheduledDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Route)
  route: Route[];

  @IsEnum(IntervalType)
  inspectionInterval?: IntervalType;

  @ValidateIf((o) => o.inspectionInterval !== IntervalType.ONE_TIME)
  @IsDate()
  @Type(() => Date)
  reocurrenceEndDate: Date;

  @ValidateIf((o) => o.inspectionInterval === IntervalType.BI_MONTHLY)
  @IsIn([15])
  get isValidFirstDateForBiMonthly() {
    const day = this.scheduledDate.getDate();
    return day === 15;
  }

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

  @IsUUID()
  @IsOptional()
  invoiceId?: string;
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
  inspectionInterval: number;
  reocurrenceEndDate: Date;
  checklists: SubmitInspectionChecklistDTO[];
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

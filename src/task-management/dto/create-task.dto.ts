// src/task-management/dto/create-task.dto.ts

import {
    IsNotEmpty,
    IsUUID,
    IsOptional,
    IsEnum,
    IsString,
    IsDateString,
    IsArray,
    ArrayNotEmpty,
    IsBoolean,
  } from 'class-validator';
  
  export class CreateTaskDto {
    @IsUUID()
    @IsNotEmpty()
    customerId: string;
  
    @IsUUID()
    @IsOptional()
    taskTypeId?: string;
  
    @IsEnum(['Emergency', 'High', 'Normal', 'Low'])
    @IsOptional()
    taskPriority?: 'Emergency' | 'High' | 'Normal' | 'Low';
  
    @IsEnum(['One-Time', 'Daily', 'Bi-Monthly', 'Monthly', 'Quarterly', 'Annual'])
    @IsNotEmpty()
    taskInterval:
      | 'One-Time'
      | 'Daily'
      | 'Bi-Monthly'
      | 'Monthly'
      | 'Quarterly'
      | 'Annual';
  
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;
  
    @IsDateString()
    @IsOptional()
    reoccurringEndDate?: string;
  
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    assetIds: string[];
  
    @IsArray()
    @IsOptional()
    @IsUUID('all', { each: true })
    assignedUserIds: string[];
  
    @IsString()
    @IsOptional()
    taskSetId?: string;
  
    @IsBoolean()
    @IsOptional()
    autoAssign?: boolean;
  
    @IsEnum(['User Group', 'Division'])
    @IsOptional()
    autoAssignMethod?: 'User Group' | 'Division';
  
    @IsString()
    @IsOptional()
    quickbooksInvoiceNumber?: string;
  
    // Additional fields as needed
  }
  
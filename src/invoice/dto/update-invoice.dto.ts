import { IsOptional, IsString, IsNumber, IsEnum, IsISO8601 } from 'class-validator';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsISO8601() // Ensures the date is in ISO format (e.g., 2024-09-04T20:16:35.544Z)
  paidDate?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsString()
  quickbooksInvoiceNumber?: string;

  @IsOptional()
  @IsString()
  quickbooksInvoiceUrl?: string;
  
  @IsOptional()
  @IsString()
  quickbooksSyncStatus?: string;

  @IsOptional()
  @IsString()
  privateNote?: string;
}

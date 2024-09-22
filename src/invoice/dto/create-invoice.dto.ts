import { IsNotEmpty, IsNumber, IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsUUID()
  clientId: string;

  @IsNotEmpty()
  @IsString()  // QuickBooks customer ID is typically a string
  quickbooksCustomerId: string;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsUUID()
  inspectionId: string;

  @IsNotEmpty()
  @IsNumber()
  amountDue: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsNotEmpty()
  pdfReportPath: string;

  @IsNotEmpty()
  imagePaths: string[];
}

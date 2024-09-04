import { IsNotEmpty, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsUUID()
  clientId: string;

  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsNumber()
  amountDue: number;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}

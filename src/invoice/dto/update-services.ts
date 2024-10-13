import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceFeeDto } from './create-services.dto';

export class UpdateServiceFeeDto extends PartialType(CreateServiceFeeDto) {}

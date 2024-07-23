import { PartialType } from '@nestjs/mapped-types';
import { CreatePumpBrandDto } from './create-pump-brand.dto';

export class UpdatePumpBrandDto extends PartialType(CreatePumpBrandDto) {}
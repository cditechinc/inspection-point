import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'oneId', async: false })
class OneIdConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CreatePhotoDto;
    return !!(object.assetId || object.pumpId || object.pumpBrandId || object.customerId);
  }

  defaultMessage(args: ValidationArguments) {
    return 'At least one of assetId, pumpId, pumpBrandId, or customerId must be provided';
  }
}

export class CreatePhotoDto {
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsOptional()
  @IsString()
  pumpId?: string;

  @IsOptional()
  @IsString()
  pumpBrandId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @Validate(OneIdConstraint)
  entityType: string;
}

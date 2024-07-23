import { IsString } from 'class-validator';

export class CreateAssetTypeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssetTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;
}

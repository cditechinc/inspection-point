import { IsUUID, IsString } from 'class-validator';

export class CreatePhotoDto {
  @IsUUID()
  assetId: string;

  @IsString()
  url: string;
}

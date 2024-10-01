import { IsUUID, IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class InspectionScoreDTO {
  @IsUUID()
  inspectionId: string;

  @IsString()
  structureScore: string;

  @IsString()
  panelScore: string;

  @IsString()
  pipesScore: string;

  @IsString()
  alarmScore: string;

  @IsString()
  alarmLightScore: string;

  @IsString()
  wiresScore: string;

  @IsString()
  breakersScore: string;

  @IsString()
  contactorsScore: string;

  @IsString()
  thermalsScore: string;

  @IsJSON()
  floatScores: object;

  @IsJSON()
  pumpScores: object;
}

export class UpdateInspectionScoreDTO {
  @IsString()
  @IsOptional()
  structureScore?: string;

  @IsString()
  @IsOptional()
  panelScore?: string;

  @IsString()
  @IsOptional()
  pipesScore?: string;

  @IsString()
  @IsOptional()
  alarmScore?: string;

  @IsString()
  @IsOptional()
  alarmLightScore?: string;

  @IsString()
  @IsOptional()
  wiresScore?: string;

  @IsString()
  @IsOptional()
  breakersScore?: string;

  @IsString()
  @IsOptional()
  contactorsScore?: string;

  @IsString()
  @IsOptional()
  thermalsScore?: string;

  @IsJSON()
  @IsOptional()
  floatScores?: object;

  @IsJSON()
  @IsOptional()
  pumpScores?: object;
}
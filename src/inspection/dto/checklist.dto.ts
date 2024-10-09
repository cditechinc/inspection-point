import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class ChecklistDTO {
  @IsUUID()
  id: string;

  @IsUUID()
  inspectionId: string;

  @IsOptional()
  @IsString()
  structureScore?: string;

  @IsOptional()
  @IsString()
  panelScore?: string;

  @IsOptional()
  @IsString()
  pipesScore?: string;

  @IsOptional()
  @IsString()
  alarmScore?: string;

  @IsOptional()
  @IsString()
  alarmLightScore?: string;

  @IsOptional()
  @IsString()
  wiresScore?: string;

  @IsOptional()
  @IsString()
  breakersScore?: string;

  @IsOptional()
  @IsString()
  contactorsScore?: string;

  @IsOptional()
  @IsString()
  thermalsScore?: string;

  @IsOptional()
  @IsObject()
  floatScores?: object;

  @IsOptional()
  @IsObject()
  pumpScores?: object;

  @IsOptional()
  @IsString()
  overallScore?: string;

  @IsOptional()
  @IsBoolean()
  cleaning?: boolean;
}

export class UpdateChecklistDTO {
  @IsOptional()
  @IsString()
  structureScore?: string;

  @IsOptional()
  @IsString()
  panelScore?: string;

  @IsOptional()
  @IsString()
  pipesScore?: string;

  @IsOptional()
  @IsString()
  alarmScore?: string;

  @IsOptional()
  @IsString()
  alarmLightScore?: string;

  @IsOptional()
  @IsString()
  wiresScore?: string;

  @IsOptional()
  @IsString()
  breakersScore?: string;

  @IsOptional()
  @IsString()
  contactorsScore?: string;

  @IsOptional()
  @IsString()
  thermalsScore?: string;

  @IsOptional()
  @IsObject()
  floatScores?: object;

  @IsOptional()
  @IsObject()
  pumpScores?: object;

  @IsOptional()
  @IsString()
  overallScore?: string;

  @IsOptional()
  @IsBoolean()
  cleaning?: boolean;
}

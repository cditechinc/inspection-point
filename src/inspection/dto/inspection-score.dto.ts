import { IsUUID, IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class InspectionScoreDTO {
  @IsUUID()
  inspectionId: string;

  @IsString()
  structure_score: string;

  @IsString()
  panel_score: string;

  @IsString()
  pipes_score: string;

  @IsString()
  alarm_score: string;

  @IsString()
  alarm_light_score: string;

  @IsString()
  wires_score: string;

  @IsString()
  breakers_score: string;

  @IsString()
  contactors_score: string;

  @IsString()
  thermals_score: string;

  @IsJSON()
  float_scores: object;
}

export class UpdateInspectionScoreDTO {
  @IsString()
  @IsOptional()
  structure_score?: string;

  @IsString()
  @IsOptional()
  panel_score?: string;

  @IsString()
  @IsOptional()
  pipes_score?: string;

  @IsString()
  @IsOptional()
  alarm_score?: string;

  @IsString()
  @IsOptional()
  alarm_light_score?: string;

  @IsString()
  @IsOptional()
  wires_score?: string;

  @IsString()
  @IsOptional()
  breakers_score?: string;

  @IsString()
  @IsOptional()
  contactors_score?: string;

  @IsString()
  @IsOptional()
  thermals_score?: string;

  @IsJSON()
  @IsOptional()
  float_scores?: object;
}

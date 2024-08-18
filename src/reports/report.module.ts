import { Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { ReportController } from './controllers/report.controller';
import { AwsService } from '../aws/aws.service';
import { InspectionModule } from '../inspection/inspection.module'; // Import the InspectionModule if you need access to inspections

@Module({
  imports: [InspectionModule], // Import other modules as needed
  controllers: [ReportController],
  providers: [PdfService, AwsService],
})
export class ReportModule {}

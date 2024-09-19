import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AwsService } from '../../aws/aws.service';

import { InspectionService } from './../../inspection/services/inspection.service';
import { In, Repository } from 'typeorm';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PdfService {
  constructor(
    private readonly awsService: AwsService,
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>, // Inject the repository
  ) {}

  // Method to upload a PDF file to S3
  // async uploadPdfReport(
  //   clientId: string,
  //   inspectionId: string,
  //   pdfBuffer: Buffer
  // ): Promise<string> {
  //   // Ensure the `clientId` is provided
  //   if (!clientId) {
  //     throw new Error('Client ID is undefined');
  //   }

  //   // Upload the PDF file to S3
  //   const filePath = await this.awsService.uploadFile(
  //     clientId,
  //     'inspection',
  //     'pdf',
  //     pdfBuffer,
  //     `inspection-report-${inspectionId}.pdf`
  //   );

  // //   await this.inspectionRepository.save({
  // //     id: inspectionId,
  // //     client: { id: clientId },
  // //     pdfFilePath: filePath, // Store the file path for future retrieval
  // // });

  //   return filePath;
  // }

  async uploadPdfReport(
    clientId: string,
    inspectionId: string,
    pdfBuffer: Buffer,
  ): Promise<string> {
    // Ensure the `clientId` is provided
    if (!clientId) {
      throw new Error('Client ID is undefined');
    }

    // Upload the PDF file to S3
    const filePath = await this.awsService.uploadFile(
      clientId,
      'inspection',
      'pdf',
      pdfBuffer,
      `inspection-report-${inspectionId}.pdf`,
    );

    // Save the file path in the inspection record
    const inspection = await this.inspectionRepository.findOneBy({
      id: inspectionId,
    });
    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    inspection.pdfFilePath = filePath;
    await this.inspectionRepository.save(inspection);

    return filePath;
  }

  // Method to fetch an existing PDF from S3
  async fetchPdfReport(inspectionId: string): Promise<string> {
    const inspection = await this.inspectionRepository.findOneOrFail({
      where: { id: inspectionId },
    });
  
    if (!inspection || !inspection.pdfFilePath) {
      throw new NotFoundException('PDF report not found for this inspection');
    }
  
    // Return the file path directly instead of fetching the file content
    return inspection.pdfFilePath;
  }
  

  // Method to delete an existing PDF from S3
  async deletePdfReport(inspectionId: string, clientId: string): Promise<void> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error(
        'S3 bucket name is not set in the environment variables.',
      );
    }

    const fileKey = `inspection/pdf/inspection-report-${inspectionId}.pdf`;

    // Delete the file from S3
    await this.awsService.deleteFile(bucketName, fileKey);
  }
}

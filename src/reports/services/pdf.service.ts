import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { S3 } from 'aws-sdk';
import { AwsService } from '../../aws/aws.service';
import { Inspection } from '../../inspection/entities/inspection.entity';
import { PdfCustomizationDTO } from '../dto/pdf-customization.dto';
import { InspectionService } from './../../inspection/services/inspection.service';

@Injectable()
export class PdfService {
  constructor(
    private readonly awsService: AwsService,
    private readonly inspectionService: InspectionService,
  ) {}

  // Method to generate a basic PDF with core data
  async generatePdfReport(inspection: Inspection): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      console.log('PDF generated');
    });

    // Add core data to the PDF
    doc.fontSize(20).text(`Inspection Report`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Inspection ID: ${inspection.id}`);
    doc.text(`Client: ${inspection.client.name || 'N/A'}`);
    doc.text(`Customer: ${inspection.customer.name || 'N/A'}`);
    doc.text(`Asset: ${inspection.asset.name || 'N/A'}`);
    doc.text(`Scheduled Date: ${inspection.scheduledDate.toDateString()}`);
    doc.text(`Status: ${inspection.status}`);
    doc.text(`Service Fee: $${inspection.serviceFee}`);
    doc.moveDown();

    // Route Information
    if (inspection.route && inspection.route.length > 0) {
      doc.fontSize(14).text(`Route:`, { underline: true });
      inspection.route.forEach((point, index) => {
        doc
          .fontSize(12)
          .text(
            `Point ${index + 1}: Latitude ${point.latitude}, Longitude ${point.longitude}`,
          );
      });
      doc.moveDown();
    } else {
      doc.fontSize(14).text(`Route:`, { underline: true });
      doc.fontSize(12).text(`No route data available.`);
      doc.moveDown();
    }

    // Comments
    doc.fontSize(14).text(`Comments:`, { underline: true });
    doc.fontSize(12).text(inspection.comments || 'No comments');
    doc.moveDown();

    // Checklists
    if (inspection.checklists && inspection.checklists.length > 0) {
      doc.fontSize(14).text(`Checklists:`, { underline: true });
      inspection.checklists.forEach((checklist, index) => {
        doc
          .fontSize(12)
          .text(
            `Checklist ${index + 1}: ${checklist.name} - Score: ${checklist.overallScore}`,
          );
        if (checklist.items && checklist.items.length > 0) {
          checklist.items.forEach((item) => {
            doc
              .fontSize(10)
              .text(
                `- ${item.description} (Completed: ${item.is_completed ? 'Yes' : 'No'})`,
              );
          });
        } else {
          doc.fontSize(10).text(`- No items in this checklist.`);
        }
        doc.moveDown();
      });
    } else {
      doc.fontSize(14).text(`Checklists:`, { underline: true });
      doc.fontSize(12).text(`No checklists available.`);
      doc.moveDown();
    }

    // Scores
    doc.fontSize(14).text(`Scores:`, { underline: true });
    const score = inspection.scores && inspection.scores[0];
    if (score) {
      doc.fontSize(12).text(`Structure: ${score.structureScore}`);
      doc.text(`Panel: ${score.panelScore}`);
      doc.text(`Pipes: ${score.pipesScore}`);
      doc.text(`Alarm: ${score.alarmScore}`);
      doc.text(`Alarm Light: ${score.alarmLightScore}`);
      doc.text(`Wires: ${score.wiresScore}`);
      doc.text(`Breakers: ${score.breakersScore}`);
      doc.text(`Contactors: ${score.contactorsScore}`);
      doc.text(`Thermals: ${score.thermalsScore}`);
      doc.text(`Float Scores:`);
      if (score.floatScores) {
        Object.entries(score.floatScores).forEach(([key, value]) => {
          doc.text(`  - ${key}: ${value}`);
        });
      } else {
        doc.text(`  - No float scores available.`);
      }
    } else {
      doc.text(`No scores available.`);
    }
    doc.moveDown();

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });
  }

  // Method to upload the generated PDF to S3
  async generateAndUploadPdfReport(inspection: Inspection): Promise<string> {
    const clientId = inspection.client.id;

    const pdfBuffer = await this.generatePdfReport(inspection);
    const filePath = await this.awsService.uploadFile(
      clientId,
      'inspection',
      'pdf',
      pdfBuffer,
      `inspection-report-${inspection.id}.pdf`,
    );

    return filePath;
  }

  // Method to customize and generate a PDF report
  async customizeAndGeneratePdf(
    customizationDto: PdfCustomizationDTO,
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      console.log('Custom PDF generated');
    });

    // Customize the PDF based on the DTO provided
    doc.fontSize(20).text(`Customized Inspection Report`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Inspection ID: ${customizationDto.id}`);
    doc.text(`Client: ${customizationDto.client?.name || 'N/A'}`);
    doc.text(`Customer: ${customizationDto.customer?.name || 'N/A'}`);
    doc.text(`Asset: ${customizationDto.asset?.name || 'N/A'}`);
    doc.text(
      `Scheduled Date: ${new Date(customizationDto.scheduledDate).toDateString()}`,
    );
    doc.text(`Status: ${customizationDto.status}`);
    doc.text(`Service Fee: $${customizationDto.serviceFee}`);
    doc.moveDown();

    // Route Information
    if (customizationDto.route && customizationDto.route.length > 0) {
      doc.fontSize(14).text(`Route:`, { underline: true });
      customizationDto.route.forEach((point, index) => {
        doc
          .fontSize(12)
          .text(
            `Point ${index + 1}: Latitude ${point.latitude}, Longitude ${point.longitude}`,
          );
      });
      doc.moveDown();
    } else {
      doc.fontSize(14).text(`Route:`, { underline: true });
      doc.fontSize(12).text(`No route data available.`);
      doc.moveDown();
    }

    // Comments
    doc.fontSize(14).text(`Comments:`, { underline: true });
    doc.fontSize(12).text(customizationDto.comments || 'No comments');
    doc.moveDown();

    // Add other customized content as required...
    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });
  }

  // Method to update an existing PDF in S3
  async updatePdfReport(
    inspectionId: string,
    customizationDto: PdfCustomizationDTO,
  ): Promise<string> {
    // Fetch the inspection based on the inspectionId
    const inspection = await this.inspectionService.findOne(inspectionId);

    // Customize the inspection object based on the customizationDto
    Object.assign(inspection, customizationDto);

    // Generate the updated PDF with the customized data
    const pdfBuffer = await this.generatePdfReport(inspection);

    // Upload the new PDF file to S3, possibly overwriting the old one
    const clientId = inspection.client.id;
    const filePath = await this.awsService.uploadFile(
      clientId,
      'inspection',
      'pdf',
      pdfBuffer,
      `inspection-report-${inspection.id}.pdf`,
    );

    return filePath;
  }

  // Method to delete an existing PDF from S3
  async deletePdfReport(inspectionId: string, clientId: string): Promise<void> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3 bucket name is not set in the environment variables.');
    }
  
    const fileKey = `inspection/pdf/inspection-report-${inspectionId}.pdf`;
  
    // Delete the file from S3
    await this.awsService.deleteFile(bucketName, fileKey);
  }
  
}

import { Controller, Post, Param, Get, Body, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PdfService } from '../services/pdf.service';
import { InspectionService } from '../../inspection/services/inspection.service';
import { PdfCustomizationDTO } from '../dto/pdf-customization.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly inspectionService: InspectionService,
  ) {}

  // @Post('generate/:inspectionId')
  // async generateReport(@Param('inspectionId') inspectionId: string): Promise<{ filePath: string }> {
  //   const inspection = await this.inspectionService.findOne(inspectionId);
  //   const filePath = await this.pdfService.generateAndUploadPdfReport(inspection);
  //   return { filePath };
  // }

  // @Post('customize/:inspectionId')
  // async customizeReport(
  //   @Param('inspectionId') inspectionId: string,
  //   @Body() customizationDto: PdfCustomizationDTO,
  // ): Promise<{ filePath: string }> {
  //   const filePath = await this.pdfService.updatePdfReport(inspectionId, customizationDto);
  //   return { filePath };
  // }

  // @Delete('delete/:inspectionId/:clientId')
  // async deleteReport(
  //   @Param('inspectionId') inspectionId: string,
  //   @Param('clientId') clientId: string,
  // ): Promise<void> {
  //   await this.pdfService.deletePdfReport(inspectionId, clientId);
  // }

  // Route for uploading a PDF generated from the frontend
  @Post('upload/:clientId/:inspectionId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReport(
    @Param('clientId') clientId: string,
    @Param('inspectionId') inspectionId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ filePath: string }> {
    if (!file || !file.buffer) {
      throw new Error('No PDF file was uploaded.');
    }

    const filePath = await this.pdfService.uploadPdfReport(
      clientId,
      inspectionId,
      file.buffer
    );

    return { filePath };
  }

  // Route for deleting a PDF
  @Delete('delete/:clientId/:inspectionId')
  async deleteReport(
    @Param('inspectionId') inspectionId: string,
    @Param('clientId') clientId: string
  ): Promise<void> {
    await this.pdfService.deletePdfReport(inspectionId, clientId);
  }

  // Other endpoints for retrieving or managing reports can be added here
}

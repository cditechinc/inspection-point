import { Controller, Post, Param, Get, Body, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { PdfService } from '../services/pdf.service';
import { InspectionService } from '../../inspection/services/inspection.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly inspectionService: InspectionService,
  ) {}

  
  // Route for uploading a PDF generated from the frontend
  @Post('upload/:clientId/:inspectionId')
  @Roles(Role.Admin, Role.ClientAdmin)
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
  @Roles(Role.Admin, Role.ClientAdmin)
  async deleteReport(
    @Param('inspectionId') inspectionId: string,
    @Param('clientId') clientId: string
  ): Promise<void> {
    await this.pdfService.deletePdfReport(inspectionId, clientId);
  }

  // Other endpoints for retrieving or managing reports can be added here
}

import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as moment from 'moment';

@Injectable()
export class AwsService {
  private s3 = new S3();

  async createClientFolders(clientId: string): Promise<void> {
    const basePath = `clients/${clientId}`;
    const folders = ['pdfs', 'images', 'videos'];
    
    for (const folder of folders) {
      await this.s3
        .putObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${basePath}/${folder}/`,
          Body: '',
        })
        .promise();
    }
  }

  async uploadFile(
    clientId: string,
    entityType: 'asset' | 'pump' | 'pumpBrand' | 'customer',
    fileType: 'pdf' | 'image',
    file: Buffer,
    originalName: string,
  ): Promise<string> {
    const basePath = `clients/${clientId}`;
    const folder = fileType === 'pdf' ? 'pdfs' : 'images';
    const entityFolder = this.getEntityFolder(entityType);
    const fileName = this.generateFileName(fileType, originalName);
    const filePath = `${basePath}/${folder}/${entityFolder}/${fileName}`;

    await this.s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        Body: file,
      })
      .promise();

    return filePath;
  }

  private generateFileName(fileType: 'pdf' | 'image', originalName: string): string {
    const date = moment().format('MM-DD-YY');
    const randomInt = Math.floor(Math.random() * 1000);
    const nameParts = originalName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('-').replace(/\s+/g, '-');

    return `${date}-${baseName}-${randomInt}.${extension}`;
  }

  private getEntityFolder(entityType: 'asset' | 'pump' | 'pumpBrand' | 'customer'): string {
    switch (entityType) {
      case 'asset':
        return 'assets';
      case 'pump':
        return 'pumps';
      case 'pumpBrand':
        return 'pump-brands';
      case 'customer':
        return 'customers';
      default:
        throw new Error('Invalid entity type');
    }
  }
}

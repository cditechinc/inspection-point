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
    entityType: 'asset' | 'pump' | 'pumpBrand' | 'customer' | 'inspection' | 'client',
    fileType: 'pdf' | 'image',
    file: Buffer,
    originalName: string,
  ): Promise<string> {
    const basePath = `clients/${clientId}`;
    const folder = fileType === 'pdf' ? 'pdfs' : 'images';
    const entityFolder = this.getEntityFolder(entityType);
    const fileName = this.generateFileName(fileType, originalName);
    const filePath = entityType === 'inspection' 
    ? `${basePath}/${folder}/inspections/${fileName}` // Upload to pdfs/inspections folder
    : `${basePath}/${folder}/${entityFolder}/${fileName}`;

    await this.s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        Body: file,
      })
      .promise();

    return filePath;
  }

  async uploadClientPhoto(clientId: string, file: Buffer, originalName: string): Promise<string> {
    const basePath = `clients/${clientId}/images`;
    const fileName = this.generateFileName('image', originalName);
    const filePath = `${basePath}/${fileName}`;
  
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

  private getEntityFolder(entityType: 'asset' | 'pump' | 'pumpBrand' | 'customer' | 'inspection' | 'client'): string {
    switch (entityType) {
      case 'asset':
        return 'assets';
      case 'pump':
        return 'pumps';
      case 'pumpBrand':
        return 'pump-brands';
      case 'customer':
        return 'customers';
      case 'inspection':
        return 'inspections'; 
      case 'client':
        return 'clients';
      default:
        throw new Error('Invalid entity type');
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const params = {
      Bucket: bucket,
      Key: key,
    };

    return new Promise<void>((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
  
  async getPdfReport(bucket: string, key: string): Promise<Buffer> {
    const params = {
      Bucket: bucket,
      Key: key,
    };
  
    console.log('S3 Params:', params);
  
    return new Promise<Buffer>((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) {
          console.error('Error fetching PDF from S3:', err);
          return reject(err);
        }
        console.log('Successfully fetched PDF from S3');
        resolve(data.Body as Buffer);
      });
    });
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
    };
  
    const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer;
  }
  
  
}

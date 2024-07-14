import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async createS3Folder(clientId: string): Promise<void> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: `${clientId}/`,
    };

    try {
      await this.s3.putObject(params).promise();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create S3 folder');
    }
  }
}

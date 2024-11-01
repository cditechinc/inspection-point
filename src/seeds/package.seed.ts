import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../packages/entities/package.entity';

@Injectable()
export class PackageSeed {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  async run() {
    const packages = [
      {
        name: 'Basic',
        monthly_price: 9.99,
        yearly_price: 99.99,
        customer_limit: 500,
        asset_limit: 1000,
        user_limit: 10,
        inspection_limit: 500,
        photo_storage_limit: 5 * 1024, // 5 GB in MB
        video_storage_limit: 0, // Not specified in Basic
        pdf_storage_limit: 500, // 500 MB
        sms_limit: 5000,
        customer_portal: false,
      },
      {
        name: 'Advanced',
        monthly_price: 19.99,
        yearly_price: 199.99,
        customer_limit: 1000,
        asset_limit: 2500,
        user_limit: 25,
        inspection_limit: 1000,
        photo_storage_limit: 500 * 1024, // 500 GB in MB
        video_storage_limit: 10 * 1024, // 10 GB in MB
        pdf_storage_limit: 500, // 500 MB
        sms_limit: 1000,
        customer_portal: false,
      },
      {
        name: 'Ultimate',
        monthly_price: 29.99,
        yearly_price: 299.99,
        customer_limit: null, // Unlimited
        asset_limit: null, // Unlimited
        user_limit: 50,
        inspection_limit: null, // Unlimited
        photo_storage_limit: 500 * 1024, // 500 GB in MB
        video_storage_limit: 5 * 1024, // 5 GB in MB
        pdf_storage_limit: 1024, // 1 GB
        sms_limit: 10000,
        customer_portal: false,
      },
      {
        name: 'Ultimate Plus',
        monthly_price: 99.99,
        yearly_price: 999.99,
        customer_limit: null, // Unlimited
        asset_limit: null, // Unlimited
        user_limit: 100,
        inspection_limit: null, // Unlimited
        photo_storage_limit: 10000 * 1024, // 10 TB in MB
        video_storage_limit: 50 * 1024, // 50 GB in MB
        pdf_storage_limit: 10 * 1024, // 10 GB
        sms_limit: 20000,
        customer_portal: false,
      },
    ];

    for (const pkg of packages) {
      const exists = await this.packageRepository.findOne({
        where: { name: pkg.name },
      });
      if (!exists) {
        const newPackage = this.packageRepository.create(pkg);
        await this.packageRepository.save(newPackage);
      } else {
        // Optional: Update existing fields if necessary
        let shouldUpdate = false;
        for (const key in pkg) {
          if (exists[key] !== pkg[key]) {
            exists[key] = pkg[key];
            shouldUpdate = true;
          }
        }
        if (shouldUpdate) {
          await this.packageRepository.save(exists);
        }
      }
    }
  }
}

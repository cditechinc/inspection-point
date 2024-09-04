import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { ClientModule } from '../client/client.module';
import { QuickBooksOAuthService } from '../auth/quickbooks-oauth.service';
import { CustomerModule } from './../customer/customer.module';
import { InspectionModule } from './../inspection/inspection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    ClientModule,
    CustomerModule,
    forwardRef(() => InspectionModule), 
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, QuickBooksOAuthService],
  exports: [InvoiceService],
})
export class InvoiceModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { ClientModule } from '../client/client.module';
import { QuickBooksOAuthService } from '../auth/quickbooks-oauth.service';
import { CustomerModule } from './../customer/customer.module';
import { InspectionModule } from './../inspection/inspection.module';
import { AuthModule } from './../auth/auth.module';
import { UserGroupModule } from './../user-groups/user-group.module';
import { Inspection } from './../inspection/entities/inspection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Inspection]),
    ClientModule,
    CustomerModule,
    UserGroupModule,
    forwardRef(() => InspectionModule), 
    forwardRef(() => AuthModule)
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, QuickBooksOAuthService],
  exports: [InvoiceService],
})
export class InvoiceModule {}

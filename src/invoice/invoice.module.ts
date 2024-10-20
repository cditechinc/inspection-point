import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './services/invoice.service';
import { InvoiceController } from './controllers/invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { ClientModule } from '../client/client.module';
import { QuickBooksOAuthService } from '../auth/quickbooks-oauth.service';
import { CustomerModule } from './../customer/customer.module';
import { InspectionModule } from './../inspection/inspection.module';
import { AuthModule } from './../auth/auth.module';
import { UserGroupModule } from './../user-groups/user-group.module';
import { Inspection } from './../inspection/entities/inspection.entity';
import { ServiceFeeController } from './controllers/services.controller';
import { ServicesService } from './services/services.service';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Services } from './entities/services.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Inspection, InvoiceItem, Services]),
    ClientModule,
    CustomerModule,
    UserGroupModule,
    forwardRef(() => InspectionModule), 
    forwardRef(() => AuthModule)
  ],
  controllers: [InvoiceController, ServiceFeeController],
  providers: [InvoiceService, ServicesService, QuickBooksOAuthService],
  exports: [InvoiceService, ServicesService],
})
export class InvoiceModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsService } from './services/assets.service';
import { AssetsController } from './controllers/assets.controller';
import { Asset } from './entities/asset.entity';
import { Photo } from './entities/photo.entity';
import { Pump } from './entities/pump.entity';
import { PumpBrand } from './entities/pump-brand.entity';
import { AssetType } from './entities/asset-type.entity';
import { Client } from '../client/entities/client.entity';
import { User } from '../user/entities/user.entity';
import { PumpsService } from './services/pumps.service';
import { PumpBrandsService } from './services/pump-brands.service';
import { AssetTypesService } from './services/asset-types.service';
import { PhotosService } from './services/photos.service';
import { PumpsController } from './controllers/pumps.controller';
import { PumpBrandsController } from './controllers/pump-brands.controller';
import { AssetTypesController } from './controllers/asset-types.controller';
import { PhotosController } from './controllers/photos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      Photo,
      Pump,
      PumpBrand,
      AssetType,
      Client,
      User,
    ]),
  ],
  controllers: [
    AssetsController,
    PumpsController,
    PumpBrandsController,
    AssetTypesController,
    PhotosController,
  ],
  providers: [
    AssetsService,
    PumpsService,
    PumpBrandsService,
    AssetTypesService,
    PhotosService,
  ],
})
export class AssetsModule {}
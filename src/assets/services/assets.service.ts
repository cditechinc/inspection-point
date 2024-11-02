import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { Asset } from './../entities/asset.entity';
import { AwsService } from './../../aws/aws.service';
import { Client } from './../../client/entities/client.entity';
import { User } from './../../user/entities/user.entity';
import { Photo } from './../entities/photo.entity';
import { AssetType } from './../entities/asset-type.entity';
import * as multer from 'multer';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { Customer } from './../../customer/entities/customer.entity';
import { LintTrapProperties } from '../interfaces/lint-trap-properties.interface';
import { TreatmentPlantDigesterProperties } from '../interfaces/treatment-plant-digester-properties.interface';
import { GreaseTrapProperties } from '../interfaces/grease-trap-properties.interface';
import { LiftStationProperties } from '../interfaces/lift-station-properties.interface';
import { StormDrainProperties } from '../interfaces/storm-drain-properties.interface';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(AssetType)
    private assetTypeRepository: Repository<AssetType>,
    private readonly awsService: AwsService,
  ) {}

  async create(
    createAssetDto: CreateAssetDto,
    files: Express.Multer.File[],
  ): Promise<Asset> {
    const client = await this.clientsRepository.findOne({
      where: { id: createAssetDto.clientId },
    });
    if (!client) {
      throw new NotFoundException(
        `Client #${createAssetDto.clientId} not found`,
      );
    }

    const customer = await this.customerRepository.findOne({
      where: { id: createAssetDto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer #${createAssetDto.customerId} not found`,
      );
    }

    const assetType = createAssetDto.assetType
      ? await this.assetTypeRepository.findOne({
          where: { id: createAssetDto.assetType },
        })
      : undefined;
    if (createAssetDto.assetType && !assetType) {
      throw new NotFoundException(
        `AssetType #${createAssetDto.assetType} not found`,
      );
    }

    await this.validateProperties(assetType.name, createAssetDto.properties);

    // Create the asset
    const asset = this.assetsRepository.create({
      name: createAssetDto.name,
      assetType,
      status: createAssetDto.status,
      client: client,
      customer: customer,
      properties: createAssetDto.properties,
      latitude: createAssetDto.latitude,
      longitude: createAssetDto.longitude,
    });

    const savedAsset = await this.assetsRepository.save(asset);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(
          client.id,
          'asset',
          'image',
          file.buffer,
          file.originalname,
        );

        console.log(`Uploading photo for client with ID: ${client.id}`); // Debug log to ensure client ID is correct

        const photo = this.photosRepository.create({
          url,
          asset: savedAsset,
          client: client, // Explicitly setting the client object here
        });

        console.log('Photo object before saving:', photo); // Debug log for photo object

        await this.photosRepository.save(photo);
      }
    }

    // Reload the asset including the photos and other relations
    const assetWithPhotos = await this.assetsRepository.findOne({
      where: { id: savedAsset.id },
      relations: ['photos', 'client', 'customer', 'assetType'],
    });

    return assetWithPhotos;
  }

  async findAll(): Promise<Asset[]> {
    return this.assetsRepository.find({
      relations: ['photos', 'client', 'customer', 'assetType'],
    });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({
      where: { id },
      relations: ['photos', 'client', 'customer', 'assetType'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }

    console.log('Asset photoss:', asset.photos);

    return asset;
  }

  async update(
    id: string,
    updateAssetDto: UpdateAssetDto,
    files: Express.Multer.File[],
  ): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({ where: { id } });

    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }

    if (updateAssetDto.assetType) {
      const assetType = await this.assetTypeRepository.findOne({
        where: { id: updateAssetDto.assetType },
      });
      if (!assetType) {
        throw new NotFoundException(
          `AssetType #${updateAssetDto.assetType} not found`,
        );
      }
      asset.assetType = assetType;

      // Validate properties based on the new asset type
      this.validateProperties(assetType.name, updateAssetDto.properties);
    }

    // Update the asset
    Object.assign(asset, {
      name: updateAssetDto.name || asset.name,
      status: updateAssetDto.status || asset.status,
      properties: updateAssetDto.properties || asset.properties,
      latitude: updateAssetDto.latitude || asset.latitude,
      longitude: updateAssetDto.longitude || asset.longitude,
    });

    const savedAsset = await this.assetsRepository.save(asset);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(
          savedAsset.client.id,
          'asset',
          'image',
          file.buffer,
          file.originalname,
        );
        const photo = this.photosRepository.create({
          url,
          asset: savedAsset,
          client: savedAsset.client,
        });
        await this.photosRepository.save(photo);
      }
    }

    return savedAsset;
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetsRepository.remove(asset);
  }

  async findStormDrainsWithConnections(): Promise<any[]> {
    // Fetch all storm drains
    const stormDrains = await this.assetsRepository.find({
      where: { assetType: { name: 'Storm Drain' } },
      relations: ['assetType'],
    });

    // Build a map for quick access
    const stormDrainMap = new Map<string, Asset>();
    stormDrains.forEach((stormDrain) => {
      stormDrainMap.set(stormDrain.id, stormDrain);
    });

    // Prepare the response
    const response = stormDrains.map((stormDrain) => {
      const properties = stormDrain.properties as StormDrainProperties;

      // Get connected storm drains with their coordinates
      const connectedStormDrains =
        properties.connectedStormDrainAssetIds?.map((id) => {
          const connectedAsset = stormDrainMap.get(id);
          if (connectedAsset) {
            const connectedProperties =
              connectedAsset.properties as StormDrainProperties;
            return {
              id: connectedAsset.id,
              latitude: connectedAsset.latitude,
              longitude: connectedAsset.longitude,
            };
          } else {
            // Handle missing connected asset
            return {
              id,
              latitude: null,
              longitude: null,
              error: 'Connected asset not found',
            };
          }
        }) || [];

      return {
        id: stormDrain.id,
        name: stormDrain.name,
        latitude: stormDrain.latitude,
        longitude: stormDrain.longitude,
        connectedAssetLineColor: properties.connectedAssetLineColor,
        connectedStormDrains,
      };
    });

    return response;
  }

  // Method to validate properties based on asset type
  private validateProperties(
    assetTypeName: string,
    properties: Record<string, any>,
  ) {
    switch (assetTypeName) {
      case 'Lift Station':
        this.validateLiftStationProperties(properties as LiftStationProperties);
        break;
      case 'Grease Trap':
        this.validateGreaseTrapProperties(properties as GreaseTrapProperties);
        break;
      case 'Treatment Plant Digester':
        this.validateTreatmentPlantDigesterProperties(
          properties as TreatmentPlantDigesterProperties,
        );
        break;
      case 'Lint Trap':
        this.validateLintTrapProperties(properties as LintTrapProperties);
        break;
      case 'Storm Drain':
        this.validateStormDrainProperties(properties as StormDrainProperties);
        break;
      default:
        throw new BadRequestException('Unsupported asset type');
    }
  }

  private validateLiftStationProperties(properties: LiftStationProperties) {
    // Validate pipeDia
    if (properties.pipeDia !== undefined) {
      if (typeof properties.pipeDia !== 'string') {
        throw new BadRequestException(
          'Pipe Diameter (pipeDia) must be a string.',
        );
      }
    }

    // Validate smart
    if (properties.smart !== undefined) {
      if (typeof properties.smart !== 'string') {
        throw new BadRequestException('Smart must be a string.');
      }
    }

    // Validate size
    if (properties.size !== undefined) {
      if (typeof properties.size !== 'string') {
        throw new BadRequestException('Size must be a string.');
      }
    }

    // Validate material
    if (properties.material !== undefined) {
      const validMaterials = [
        'Plastic',
        'Fiberglass',
        'Concrete',
        'Other',
        'Unknown',
      ];
      if (!validMaterials.includes(properties.material)) {
        throw new BadRequestException(
          `Material must be one of: ${validMaterials.join(', ')}.`,
        );
      }
    }

    // Validate deleteProtect
    if (properties.deleteProtect !== undefined) {
      if (typeof properties.deleteProtect !== 'string') {
        throw new BadRequestException('Delete Protect must be a string.');
      }
    }

    // Validate duty
    if (properties.duty !== undefined) {
      const validDuties = ['Light', 'Normal', 'Heavy', 'Severe', 'Unknown'];
      if (!validDuties.includes(properties.duty)) {
        throw new BadRequestException(
          `Duty must be one of: ${validDuties.join(', ')}.`,
        );
      }
    }

    // Validate rails
    if (properties.rails !== undefined) {
      if (typeof properties.rails !== 'string') {
        throw new BadRequestException('Rails must be a string.');
      }
    }

    // Validate float
    if (properties.float !== undefined) {
      if (typeof properties.float !== 'string') {
        throw new BadRequestException('Float must be a string.');
      }
    }

    // Validate pumps
    if (properties.pumps !== undefined) {
      if (typeof properties.pumps !== 'string') {
        throw new BadRequestException('Pumps must be a string.');
      }
    }

    // Validate power
    if (properties.power !== undefined) {
      if (typeof properties.power !== 'string') {
        throw new BadRequestException('Power must be a string.');
      }
    }


    // Validate qrCode
    if (properties.qrCode !== undefined) {
      if (typeof properties.qrCode !== 'string') {
        throw new BadRequestException('QR Code must be a string.');
      }
    }

    // Validate nfcId
    if (properties.nfcId !== undefined) {
      if (typeof properties.nfcId !== 'string') {
        throw new BadRequestException('NFC ID must be a string.');
      }
    }

    // Validate inspectionInterval
    if (properties.inspectionInterval !== undefined) {
      const validIntervals = [
        'Weekly',
        'Monthly',
        'Bi-Monthly',
        'Quarterly',
        'Yearly',
        'On-Demand',
        'Not Serviced',
      ];
      if (!validIntervals.includes(properties.inspectionInterval)) {
        throw new BadRequestException(
          `Inspection Interval must be one of: ${validIntervals.join(', ')}.`,
        );
      }
    }
  }

  private validateGreaseTrapProperties(properties: GreaseTrapProperties) {
    // Validate serviceInterval
    if (!properties.serviceInterval) {
      throw new BadRequestException(
        'Service Interval is required for Grease Trap assets.',
      );
    } else {
      const validIntervals = [
        'Weekly',
        'Monthly',
        'Bi-Monthly',
        'Quarterly',
        'Yearly',
        'On-Demand',
        'Not Serviced',
      ];
      if (!validIntervals.includes(properties.serviceInterval)) {
        throw new BadRequestException(
          `Service Interval must be one of: ${validIntervals.join(', ')}.`,
        );
      }
    }

    // Validate gallons
    if (properties.gallons === undefined || properties.gallons === null) {
      throw new BadRequestException(
        'Gallons is required for Grease Trap assets.',
      );
    } else if (typeof properties.gallons !== 'number') {
      throw new BadRequestException('Gallons must be a number.');
    }

    // Validate material
    if (!properties.material) {
      throw new BadRequestException(
        'Material is required for Grease Trap assets.',
      );
    } else {
      const validMaterials = [
        'Plastic',
        'Fiberglass',
        'Concrete',
        'Other',
        'Unknown',
      ];
      if (!validMaterials.includes(properties.material)) {
        throw new BadRequestException(
          `Material must be one of: ${validMaterials.join(', ')}.`,
        );
      }
    }


    // Validate qrCode
    if (!properties.qrCode) {
      throw new BadRequestException(
        'QR Code is required for Grease Trap assets.',
      );
    } else if (typeof properties.qrCode !== 'string') {
      throw new BadRequestException('QR Code must be a string.');
    }

    // Validate nfcId
    if (!properties.nfcId) {
      throw new BadRequestException(
        'NFC ID is required for Grease Trap assets.',
      );
    } else if (typeof properties.nfcId !== 'string') {
      throw new BadRequestException('NFC ID must be a string.');
    }

    // Validate duty
    if (!properties.duty) {
      throw new BadRequestException('Duty is required for Grease Trap assets.');
    } else {
      const validDuties = ['Light', 'Normal', 'Heavy', 'Severe', 'Unknown'];
      if (!validDuties.includes(properties.duty)) {
        throw new BadRequestException(
          `Duty must be one of: ${validDuties.join(', ')}.`,
        );
      }
    }

    // Validate requireDisposalTicket
    if (
      properties.requireDisposalTicket === undefined ||
      properties.requireDisposalTicket === null
    ) {
      throw new BadRequestException(
        'Require Disposal Ticket is required for Grease Trap assets.',
      );
    } else if (typeof properties.requireDisposalTicket !== 'boolean') {
      throw new BadRequestException(
        'Require Disposal Ticket must be a boolean.',
      );
    }

    // Validate eveningService
    if (
      properties.eveningService === undefined ||
      properties.eveningService === null
    ) {
      throw new BadRequestException(
        'Evening Service is required for Grease Trap assets.',
      );
    } else if (typeof properties.eveningService !== 'boolean') {
      throw new BadRequestException('Evening Service must be a boolean.');
    }

    // Validate multipleOnSiteTraps
    if (
      properties.multipleOnSiteTraps === undefined ||
      properties.multipleOnSiteTraps === null
    ) {
      throw new BadRequestException(
        'Multiple On-Site Traps is required for Grease Trap assets.',
      );
    } else if (typeof properties.multipleOnSiteTraps !== 'boolean') {
      throw new BadRequestException(
        'Multiple On-Site Traps must be a boolean.',
      );
    }
  }

  private validateTreatmentPlantDigesterProperties(
    properties: TreatmentPlantDigesterProperties,
  ) {
    // Validate serviceInterval
    if (!properties.serviceInterval) {
      throw new BadRequestException(
        'Service Interval is required for Treatment Plant Digester assets.',
      );
    } else {
      const validIntervals = [
        'Weekly',
        'Monthly',
        'Bi-Monthly',
        'Quarterly',
        'Yearly',
        'On-Demand',
        'Not Serviced',
      ];
      if (!validIntervals.includes(properties.serviceInterval)) {
        throw new BadRequestException(
          `Service Interval must be one of: ${validIntervals.join(', ')}.`,
        );
      }
    }

    // Validate gallons
    if (!properties.gallons) {
      throw new BadRequestException(
        'Gallons is required for Treatment Plant Digester assets.',
      );
    } else if (typeof properties.gallons !== 'string') {
      throw new BadRequestException('Gallons must be a string.');
    }

    // Validate material
    if (!properties.material) {
      throw new BadRequestException(
        'Material is required for Treatment Plant Digester assets.',
      );
    } else {
      const validMaterials = [
        'Plastic',
        'Fiberglass',
        'Concrete',
        'Other',
        'Unknown',
      ];
      if (!validMaterials.includes(properties.material)) {
        throw new BadRequestException(
          `Material must be one of: ${validMaterials.join(', ')}.`,
        );
      }
    }

    // Validate connectionSize
    if (!properties.connectionSize) {
      throw new BadRequestException('Connection Size is required.');
    } else if (typeof properties.connectionSize !== 'string') {
      throw new BadRequestException('Connection Size must be a string.');
    }

    // Validate suctionRequired
    if (
      properties.suctionRequired === undefined ||
      properties.suctionRequired === null
    ) {
      throw new BadRequestException('Suction Required is required.');
    } else if (typeof properties.suctionRequired !== 'boolean') {
      throw new BadRequestException('Suction Required must be a boolean.');
    }

    // Validate digesterDimensions
    if (!properties.digesterDimensions) {
      throw new BadRequestException('Digester Dimensions are required.');
    } else if (typeof properties.digesterDimensions !== 'string') {
      throw new BadRequestException('Digester Dimensions must be a string.');
    } else {
      // Expected format: '000 x 000 x 000'
      const dimensionPattern = /^\d+\s*x\s*\d+\s*x\s*\d+$/;
      if (!dimensionPattern.test(properties.digesterDimensions)) {
        throw new BadRequestException(
          'Digester Dimensions must be in the format "000 x 000 x 000".',
        );
      }
    }

    // Validate primaryTreatmentPlantAssetId (optional)
    if (properties.primaryTreatmentPlantAssetId !== undefined) {
      if (typeof properties.primaryTreatmentPlantAssetId !== 'string') {
        throw new BadRequestException(
          'Primary Treatment Plant Asset ID must be a string.',
        );
      }
      // Optionally, validate UUID format
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(properties.primaryTreatmentPlantAssetId)) {
        throw new BadRequestException(
          'Primary Treatment Plant Asset ID must be a valid UUID.',
        );
      }
    }


    // Validate qrCode
    if (!properties.qrCode) {
      throw new BadRequestException('QR Code is required.');
    } else if (typeof properties.qrCode !== 'string') {
      throw new BadRequestException('QR Code must be a string.');
    }

    // Validate nfcId
    if (!properties.nfcId) {
      throw new BadRequestException('NFC ID is required.');
    } else if (typeof properties.nfcId !== 'string') {
      throw new BadRequestException('NFC ID must be a string.');
    }

    // Validate condition
    if (!properties.condition) {
      throw new BadRequestException('Condition is required.');
    } else {
      const validConditions = [
        'Good',
        'Fair',
        'Rough',
        'Bad',
        'Failing',
        'Other',
      ];
      if (!validConditions.includes(properties.condition)) {
        throw new BadRequestException(
          `Condition must be one of: ${validConditions.join(', ')}.`,
        );
      }
    }

    // Validate requireDisposalTicket
    if (
      properties.requireDisposalTicket === undefined ||
      properties.requireDisposalTicket === null
    ) {
      throw new BadRequestException('Require Disposal Ticket is required.');
    } else if (typeof properties.requireDisposalTicket !== 'boolean') {
      throw new BadRequestException(
        'Require Disposal Ticket must be a boolean.',
      );
    }

    // Validate primaryPlantOperator
    if (!properties.primaryPlantOperator) {
      throw new BadRequestException('Primary Plant Operator is required.');
    } else if (typeof properties.primaryPlantOperator !== 'string') {
      throw new BadRequestException('Primary Plant Operator must be a string.');
    }

    // Validate operatorContactName
    if (!properties.operatorContactName) {
      throw new BadRequestException('Operator Contact Name is required.');
    } else if (typeof properties.operatorContactName !== 'string') {
      throw new BadRequestException('Operator Contact Name must be a string.');
    }

    // Validate operatorContactPhone
    if (!properties.operatorContactPhone) {
      throw new BadRequestException('Operator Contact Phone is required.');
    } else if (typeof properties.operatorContactPhone !== 'string') {
      throw new BadRequestException('Operator Contact Phone must be a string.');
    }

    // Validate videos
    if (properties.videos !== undefined) {
      if (!Array.isArray(properties.videos)) {
        throw new BadRequestException('Videos must be an array of strings.');
      }
      if (properties.videos.length > 4) {
        throw new BadRequestException('A maximum of 4 videos are allowed.');
      }
      for (const video of properties.videos) {
        if (typeof video !== 'string') {
          throw new BadRequestException('Each video must be a string.');
        }
      }
    }

    // Validate files
    if (properties.files !== undefined) {
      if (!Array.isArray(properties.files)) {
        throw new BadRequestException('Files must be an array of strings.');
      }
      if (properties.files.length > 4) {
        throw new BadRequestException('A maximum of 4 files are allowed.');
      }
      for (const file of properties.files) {
        if (typeof file !== 'string') {
          throw new BadRequestException('Each file must be a string.');
        }
      }
    }
  }

  private validateLintTrapProperties(properties: LintTrapProperties) {
    // Validate serviceInterval
    if (!properties.serviceInterval) {
      throw new BadRequestException(
        'Service Interval is required for Lint Trap assets.',
      );
    } else {
      const validIntervals = [
        'Weekly',
        'Monthly',
        'Bi-Monthly',
        'Quarterly',
        'Yearly',
        'On-Demand',
        'Not Serviced',
      ];
      if (!validIntervals.includes(properties.serviceInterval)) {
        throw new BadRequestException(
          `Service Interval must be one of: ${validIntervals.join(', ')}.`,
        );
      }
    }

    // Validate gallons
    if (!properties.gallons) {
      throw new BadRequestException(
        'Gallons is required for Lint Trap assets.',
      );
    } else if (typeof properties.gallons !== 'string') {
      throw new BadRequestException('Gallons must be a string.');
    }

    // Validate material
    if (!properties.material) {
      throw new BadRequestException(
        'Material is required for Lint Trap assets.',
      );
    } else {
      const validMaterials = [
        'Plastic',
        'Fiberglass',
        'Concrete',
        'Other',
        'Unknown',
      ];
      if (!validMaterials.includes(properties.material)) {
        throw new BadRequestException(
          `Material must be one of: ${validMaterials.join(', ')}.`,
        );
      }
    }


    // Validate qrCode
    if (!properties.qrCode) {
      throw new BadRequestException(
        'QR Code is required for Lint Trap assets.',
      );
    } else if (typeof properties.qrCode !== 'string') {
      throw new BadRequestException('QR Code must be a string.');
    }

    // Validate nfcId
    if (!properties.nfcId) {
      throw new BadRequestException('NFC ID is required for Lint Trap assets.');
    } else if (typeof properties.nfcId !== 'string') {
      throw new BadRequestException('NFC ID must be a string.');
    }

    // Validate duty
    if (!properties.duty) {
      throw new BadRequestException('Duty is required for Lint Trap assets.');
    } else {
      const validDuties = ['Light', 'Normal', 'Heavy', 'Severe', 'Unknown'];
      if (!validDuties.includes(properties.duty)) {
        throw new BadRequestException(
          `Duty must be one of: ${validDuties.join(', ')}.`,
        );
      }
    }

    // Validate requireDisposalTicket
    if (
      properties.requireDisposalTicket === undefined ||
      properties.requireDisposalTicket === null
    ) {
      throw new BadRequestException(
        'Require Disposal Ticket is required for Lint Trap assets.',
      );
    } else if (typeof properties.requireDisposalTicket !== 'boolean') {
      throw new BadRequestException(
        'Require Disposal Ticket must be a boolean.',
      );
    }

    // Validate eveningService
    if (
      properties.eveningService === undefined ||
      properties.eveningService === null
    ) {
      throw new BadRequestException(
        'Evening Service is required for Lint Trap assets.',
      );
    } else if (typeof properties.eveningService !== 'boolean') {
      throw new BadRequestException('Evening Service must be a boolean.');
    }

    // Validate multipleOnSiteTraps
    if (
      properties.multipleOnSiteTraps === undefined ||
      properties.multipleOnSiteTraps === null
    ) {
      throw new BadRequestException(
        'Multiple On-Site Traps is required for Lint Trap assets.',
      );
    } else if (typeof properties.multipleOnSiteTraps !== 'boolean') {
      throw new BadRequestException(
        'Multiple On-Site Traps must be a boolean.',
      );
    }
  }

  private async validateStormDrainProperties(properties: StormDrainProperties) {
    // Validate serviceInterval
    const validIntervals = [
      'Weekly',
      'Monthly',
      'Bi-Monthly',
      'Quarterly',
      'Yearly',
      'On-Demand',
      'Not Serviced',
    ];
    if (
      !properties.serviceInterval ||
      !validIntervals.includes(properties.serviceInterval)
    ) {
      throw new BadRequestException(
        `Service Interval must be one of: ${validIntervals.join(', ')}.`,
      );
    }

    // Validate drainSize
    const validSizes = [
      'extra small',
      'small',
      'medium',
      'large',
      'extra large',
      'huge',
      'unknown',
    ];
    if (!properties.drainSize || !validSizes.includes(properties.drainSize)) {
      throw new BadRequestException(
        `Drain Size must be one of: ${validSizes.join(', ')}.`,
      );
    }

    // Validate material
    const validMaterials = [
      'Plastic',
      'Fiberglass',
      'Concrete',
      'Other',
      'Unknown',
    ];
    if (!properties.material || !validMaterials.includes(properties.material)) {
      throw new BadRequestException(
        `Material must be one of: ${validMaterials.join(', ')}.`,
      );
    }

    // Validate waterIntrusion
    if (typeof properties.waterIntrusion !== 'boolean') {
      throw new BadRequestException('Water Intrusion must be a boolean.');
    }

    // Validate damaged
    if (typeof properties.damaged !== 'boolean') {
      throw new BadRequestException('Damaged must be a boolean.');
    }

    // Validate internalPipeDia
    if (
      !properties.internalPipeDia ||
      typeof properties.internalPipeDia !== 'string'
    ) {
      throw new BadRequestException('Internal Pipe Diameter must be a string.');
    }

    
    // Validate qrCode
    if (!properties.qrCode || typeof properties.qrCode !== 'string') {
      throw new BadRequestException('QR Code must be a string.');
    }

    // Validate nfcId
    if (!properties.nfcId || typeof properties.nfcId !== 'string') {
      throw new BadRequestException('NFC ID must be a string.');
    }

    // Validate drainDimensions
    if (
      !properties.drainDimensions ||
      typeof properties.drainDimensions !== 'string'
    ) {
      throw new BadRequestException(
        'Drain Dimensions must be a string in the format "Depth*Width*Length".',
      );
    }

    // Validate duty
    const validDuties = ['Light', 'Normal', 'Heavy', 'Severe', 'Unknown'];
    if (!properties.duty || !validDuties.includes(properties.duty)) {
      throw new BadRequestException(
        `Duty must be one of: ${validDuties.join(', ')}.`,
      );
    }

    // Validate drainGrateType
    const validGrateTypes = [
      'steel',
      'plastic',
      'hinged steel',
      'other',
      'unknown',
    ];
    if (
      !properties.drainGrateType ||
      !validGrateTypes.includes(properties.drainGrateType)
    ) {
      throw new BadRequestException(
        `Drain Grate Type must be one of: ${validGrateTypes.join(', ')}.`,
      );
    }

    // Validate connectedAssetLineColor
    if (
      !properties.connectedAssetLineColor ||
      typeof properties.connectedAssetLineColor !== 'string'
    ) {
      throw new BadRequestException(
        'Connected Asset Line Color must be a hex color code string.',
      );
    }
    // Optionally, validate hex color code format
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (!hexColorRegex.test(properties.connectedAssetLineColor)) {
      throw new BadRequestException(
        'Connected Asset Line Color must be a valid hex color code.',
      );
    }

    // Validate connectedStormDrainAssetIds (Optional)
    if (properties.connectedStormDrainAssetIds !== undefined) {
      if (!Array.isArray(properties.connectedStormDrainAssetIds)) {
        throw new BadRequestException(
          'Connected Storm Drain Asset IDs must be an array.',
        );
      }
      if (properties.connectedStormDrainAssetIds.length > 5) {
        throw new BadRequestException(
          'A maximum of 5 connected storm drains are allowed.',
        );
      }
      for (const id of properties.connectedStormDrainAssetIds) {
        if (typeof id !== 'string') {
          throw new BadRequestException(
            'Each Connected Storm Drain Asset ID must be a string.',
          );
        }
        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new BadRequestException(
            'Each Connected Storm Drain Asset ID must be a valid UUID.',
          );
        }
        // Check if asset exists and is a Storm Drain
        const connectedAsset = await this.assetsRepository.findOne({
          where: { id },
          relations: ['assetType'],
        });
        if (!connectedAsset) {
          throw new BadRequestException(
            `Connected Storm Drain Asset ID ${id} does not exist.`,
          );
        }
        if (connectedAsset.assetType.name !== 'Storm Drain') {
          throw new BadRequestException(`Asset ID ${id} is not a Storm Drain.`);
        }
      }
    }
  }
}

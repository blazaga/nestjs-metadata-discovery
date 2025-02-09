import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MetadataAccessorService } from './metadata-accessor.service';
import { MetadataExplorerService } from './metadata-explorer.service';
import { Options } from './types';

@Module({})
export class MetadataDiscoveryModule {
  static forRoot<T>(
    options: Options,
    orchestrator: T & {
      registerHander: (
        metadata_key: string,
        metadata_value: string,
        handler: FunctionConstructor,
        instance: any
      ) => void;
    }
  ) {
    return {
      global: true,
      module: MetadataDiscoveryModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: 'OPTIONS',
          useValue: options,
        },
        {
          provide: 'ORCHESTRATOR',
          useClass: orchestrator,
        },
        MetadataAccessorService,
        MetadataExplorerService,
      ],
      exports: [],
    };
  }
}

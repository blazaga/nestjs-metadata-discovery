import { Injectable, Inject } from '@nestjs/common';
import { MetadataAccessorService } from './metadata-accessor.service';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Options, OrchestratorInterface } from './types';

@Injectable()
export class MetadataExplorerService {
  @Inject('OPTIONS')
  private readonly options: Options;

  @Inject('ORCHESTRATOR')
  private readonly orchestrator: OrchestratorInterface;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: MetadataAccessorService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  private async explore() {
    const instanceWrappers: InstanceWrapper[] = [];

    if (this.options.discover_controllers) {
      instanceWrappers.push(...this.discoveryService.getControllers());
    }

    if (this.options.discover_services) {
      instanceWrappers.push(...this.discoveryService.getProviders());
    }

    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;

      if (!instance || !Object.getPrototypeOf(instance)) {
        return;
      }

      this.metadataScanner.getAllMethodNames(instance).forEach((methodKey) => {
        this.lookupHandler(instance, methodKey);
      });
    });
  }

  private async lookupHandler(
    instance: Record<string, typeof Function>,
    key: string,
  ) {
    const methodRef = instance[key];

    const metadata_value = this.metadataAccessor.getMetadataValue(
      this.options.metadata_key,
      methodRef,
    );

    if (!metadata_value) {
      return;
    }

    this.orchestrator.registerHander(
      this.options.metadata_key,
      metadata_value,
      methodRef,
      instance,
    );
  }
}

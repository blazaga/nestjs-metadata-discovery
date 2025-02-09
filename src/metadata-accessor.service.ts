import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MetadataAccessorService {
  constructor(private readonly reflector: Reflector) {}

  getMetadataValue(key: string, target: typeof Function): any | undefined {
    return this.reflector.get(key, target);
  }
}

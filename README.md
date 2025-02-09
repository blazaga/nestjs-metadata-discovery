# NestJS Metadata Discovery Module

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

A NestJS Module that simplifies the creation of services that can discover metadata from methods to be consumed by decorated handlers from other classes.

## Installation

```bash
pnpm nestjs-metadata-discovery@latest
```

## Usage

1. Create a service that implements `registerHandler`. Here we have an example of a class that extends `EventEmitter` that listens for events and calls the handler that was registered in the `Service1` class.

   ```ts
   @Injectable()
   export class Service1 extends EventEmitter {
     @Inject('OPTIONS')
     private options: any;

     // Map of handlers to the tuple of Context and Decorated Method
     private map_of_handlers = new Map<string, [any, FunctionController]>();

     constructor() {
       super();
       // Listen for Some Events
       this.on('SOME_EVENT', this.handleSomeEvent.bind(this));
     }

     // Catch all Handler
     async handleSomeEvent(...args) {
       // Get handler from map of registered handlers
       const handler = this.map_of_handlers.get(metadata_value);
       if (!handler) {
         throw new Error('Handler not found');
       }
       const [context, method] = handler;
       // Call handler in the context of the class where it was defined.
       return method.apply(context, args);
     }

     registerHander(
       metadata_key: string,
       metadata_value: string,
       handler: FunctionConstructor,
       instance: any
     ) {
       // Register handler to map of registered handlers

       this.map_of_handlers.set(metadata_value, [instance, handler]);
     }
   }
   ```

2. Create a decorator that will be used to decorate the method that will be called when the event is emitted.

   ```ts
   export function Handle(some_key: string) {
     return applyDecorators(SetMetadata('EVENT_HANDLER', some_key));
   }
   ```

3. Decorate your `Service Methods` with your decorator.

   ```ts
   @Injectable()
   export class Service2 {
     @Handle('SOME_EVENT')
     async handleSomeEvent(...args) {
       // Do something
     }
   }
   ```

4. Use the `MetadataDiscoveryModule` to register your handlers.

   ```ts
   import { MetadataDiscoveryModule } from '@app/metadata-discovery';

   @Module({
     imports: [
       MetadataDiscoveryModule.forRoot(
         {
           metadata_key: 'EVENT_HANDLER', // Metadata Key to discover
           discover_controllers: true, // Discover Controllers
           discover_services: true, // Discover Services
         },
         Service1 // Service that implements `registerHandler`
       ),
       // Import other modules
     ],
     providers: [
       // Import other providers,
       Service2,
     ],
   })
   export class AppModule {}
   ```

5. When the app runs and `SOME_EVENTS` events are emitted, the `Service1` will call the methods decorated in `Service2` .

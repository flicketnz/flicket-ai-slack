import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { ConfigManagementModule } from "./modules/config-management";
import { DomainsModule } from "./modules/domains/domains.module";
import { EntrypointsModule } from "./modules/entrypoints/entrypoints.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigManagementModule,
    HealthModule,
    CqrsModule.forRoot(),
    DomainsModule,
    EntrypointsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

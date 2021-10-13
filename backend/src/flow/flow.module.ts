import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {FlowAggregatorService} from "./services/flow-aggregator.service";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { ProjectsModule } from "../projects/projects.module";
import { FlowGatewayService } from "./services/flow-gateway.service";
import { FlowController } from "./flow.controller";
import { FlowEmulatorService } from "./services/flow-emulator.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
  ],
  controllers: [
    FlowController
  ],
  providers: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService
  ],
  exports: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService
  ]
})
export class FlowModule {
}

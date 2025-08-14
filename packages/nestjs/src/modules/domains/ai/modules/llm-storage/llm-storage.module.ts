import { Module } from "@nestjs/common";
import { DynamooseModule } from "nestjs-dynamoose";

import { DynamoDBCheckpointerAdapter } from "./dynamodb.checkpointer.adapter";
import { CHECKPOINTER } from "./ports/checkpointer.port";
import { CheckpointsSchema } from "./schemas/checkpoints.schema";

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: "Checkpoints",
        schema: CheckpointsSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: CHECKPOINTER,
      // useClass: MemorySaverCheckpointerAdapter,
      useClass: DynamoDBCheckpointerAdapter,
    },
  ],
  exports: [{ provide: CHECKPOINTER, useClass: DynamoDBCheckpointerAdapter }],
})
export class LlmStorageModule {}

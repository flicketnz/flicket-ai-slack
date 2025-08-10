import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "../app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["debug", "verbose", "log", "warn"],
  });

  // GET port from config
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>("PORT");

  const server = await app.listen(port, "0.0.0.0");
  const serverDetails = server.address();

  if (serverDetails && typeof serverDetails !== "string") {
    console.log(
      `Listening on ${serverDetails.family} ${serverDetails.address}:${serverDetails.port}`,
    );
  }
}

void bootstrap();

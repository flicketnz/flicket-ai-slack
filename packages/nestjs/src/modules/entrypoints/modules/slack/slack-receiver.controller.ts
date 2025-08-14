import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
  type RawBodyRequest,
  Req,
} from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { ReceiverEvent } from "@slack/bolt";
import { getTypeAndConversation } from "@slack/bolt/dist/helpers";
import { verifySlackRequest } from "@slack/bolt/dist/receivers/verify-request";
import { type Request } from "express";
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service";
import slackConfigDef from "src/modules/config-management/configs/slack.config";

@Controller("slack")
export class SlackReceiverController {
  constructor(
    private slackService: SlackService,
    @Inject(slackConfigDef.KEY)
    private slackConfig: ConfigType<typeof slackConfigDef>,
  ) {}

  private readonly logger = new Logger(SlackReceiverController.name);

  @Post("events")
  async handler(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: Record<string, unknown>,
  ) {
    let ackCalled = false;
    let resolveFn: (value: any) => void;
    let rejectFn: (reason?: any) => void;
    const startTime = Date.now();

    try {
      verifySlackRequest({
        headers: {
          "x-slack-request-timestamp": Number.parseInt(
            req.header("x-slack-request-timestamp") ?? "",
          ),
          "x-slack-signature": req.header("x-slack-signature") ?? "",
        },
        signingSecret: this.slackConfig.signingSecret ?? "",
        body: req.rawBody?.toString("utf-8") ?? "",
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException(e.message);
      } else {
        throw new BadRequestException("Invalid Signiture");
      }
    }

    const responsePromise = new Promise((resolve, reject) => {
      resolveFn = (m) => {
        this.logger.debug(
          `Time taken to ack: ${(Date.now() - startTime) / 1000}s`,
        );

        resolve(m);
      };
      rejectFn = reject;
    });

    if (body?.type === "url_verification") {
      return { challenge: body.challenge };
    }

    const receiverEvent: ReceiverEvent = {
      ack: (response) => {
        if (ackCalled) return Promise.resolve();
        ackCalled = true;

        if (response instanceof Error) {
          rejectFn(new InternalServerErrorException(response.message));
        } else {
          resolveFn(response ?? "");
        }
        return Promise.resolve();
      },
      body,
    };

    const { type } = getTypeAndConversation(body);
    if (type === undefined) {
      throw new InternalServerErrorException(
        "Unable to determine the event type",
      );
    }

    // DONT await this - we want event listeners to operate in the background, not in the main request thread
    void this.slackService.app.processEvent(receiverEvent);

    return responsePromise;
  }
}

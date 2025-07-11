import { resolve } from "node:path";
import { Cpu, HealthCheckProtocolType, Memory, Service, Source } from "@aws-cdk/aws-apprunner-alpha";
import * as cdk from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnContainer } from "aws-cdk-lib/aws-lightsail";
import type { Construct } from "constructs";

export class FlicketSlackbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const applicationPort = Number.parseInt(
      this.node.tryGetContext("flicket-ai-slackapp_port") ?? "8000",
    );

    // Define a Docker image asset
    const dockerImageAsset = new DockerImageAsset(this, "FlicketAiSlackApp", {
      directory: resolve("..", "flicket-ai"), // Path to the directory containing the Dockerfile
      cacheFrom: [
        {
          type: "local",
          params: { src: resolve("..", "cache/flicket-ai-npm") },
        },
      ],
      cacheTo: {
        type: "local",
        params: { dest: resolve("..", "cache/flicket-ai-npm") },
      },
      buildArgs: {
        NODE_VERSION:
          this.node.tryGetContext("flicket-ai-slackapp_node-version") ?? "24",
        ALPINE_VERSION:
          this.node.tryGetContext("flicket-ai-slackapp_alpine-version") ??
          "3.21",
      },
      platform: {
        platform:
          this.node.tryGetContext("flicket-ai-slackapp_platform") ??
          "linux/amd64",
      },
    });

    const slackAppToken = this.node.tryGetContext("flicket-ai-slackapp_slack-app-token") ?? process.env.SLACK_APP_TOKEN
    const slackBotToken = this.node.tryGetContext("flicket-ai-slackapp_slack-bot-token") ?? process.env.SLACK_BOT_TOKEN
    const openRouterAPIKey = this.node.tryGetContext("flicket-ai-slackapp_open-router-api-key") ?? process.env.OPENROUTER_API_KEY

    new Service(this, "Service", {
      cpu: Cpu.QUARTER_VCPU,
      memory: Memory.HALF_GB,

      source: Source.fromAsset({
        imageConfiguration: {
          port: applicationPort,
          environmentVariables: {
            "SLACK_BOT_TOKEN": slackBotToken,
            "SLACK_APP_TOKEN": slackAppToken,
            "OPENROUTER_API_KEY": openRouterAPIKey,
            "SEARXNG_API_BASE": "https://searx.perennialte.ch/",
            "NODE_ENV": "production",
            PORT: `${applicationPort}`
          },
          environmentSecrets: {},
        },
        asset: dockerImageAsset,
      }),

      autoDeploymentsEnabled: false,
    });

    // Output the ECR URI
    new cdk.CfnOutput(this, "ECRImageUri", {
      value: dockerImageAsset.imageUri,
    });


  }
}

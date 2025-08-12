import { resolve } from "node:path";
import { Cpu, HealthCheckProtocolType, Memory, Service, Source } from "@aws-cdk/aws-apprunner-alpha";
import * as cdk from "aws-cdk-lib";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnContainer } from "aws-cdk-lib/aws-lightsail";
import type { Construct } from "constructs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

export class FlicketSlackbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const applicationPort = Number.parseInt(
      this.node.tryGetContext("flicket-ai_port") ?? "8000",
    );

    // Define a Docker image asset
    const dockerImageAsset = new DockerImageAsset(this, "FlicketAiApp", {
      directory: resolve("..", "nestjs"), // Path to the directory containing the Dockerfile
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
          this.node.tryGetContext("flicket-ai_node-version") ?? "24",
        ALPINE_VERSION:
          this.node.tryGetContext("flicket-ai_alpine-version") ??
          "3.21",
      },
      platform: {
        platform:
          this.node.tryGetContext("flicket-ai_platform") ??
          "linux/amd64",
      },
    });

    const instanceRole = new Role(this, "FlicketAiInstanceRole", {
      assumedBy: new ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });

    const slackAppToken = this.node.tryGetContext("flicket-ai_slack-app-token") ?? process.env.SLACK_APP_TOKEN
    const slackBotToken = this.node.tryGetContext("flicket-ai_slack-bot-token") ?? process.env.SLACK_BOT_TOKEN
    const openRouterAPIKey = this.node.tryGetContext("flicket-ai_open-router-api-key") ?? process.env.OPENROUTER_API_KEY
    const dynamoDbPrefix = this.node.tryGetContext("flicket-ai_dynamodb-table-prefix") ?? "FlicketAI_"

    new Service(this, "Service", {
      cpu: Cpu.QUARTER_VCPU,
      memory: Memory.HALF_GB,

      source: Source.fromAsset({
        imageConfiguration: {
          port: applicationPort,
          environmentVariables: {
            "SLACK_BOT_TOKEN": slackBotToken,
            "SLACK_APP_TOKEN": slackAppToken,
            "LLM_PRIMARY_PROVIDER": "openai",
            "LLM_OPENAI_KEY": openRouterAPIKey,
            "LLM_OPENAI_BASE_URL": "https://openrouter.ai/api/v1",
            "LLM_OPENAI_MODEL": "anthropic/claude-3.5-haiku",
            "LLM_TOOLS_SEARXNG_ENABLED": "true",
            "LLM_TOOLS_SEARXNG_API_BASE": "https://search.canine.tools/",
            "LLM_TOOLS_SLACK_ENABLED":"true",
            "NODE_ENV": "production",
            DYNAMODB_TABLE_PREFIX: dynamoDbPrefix,
            PORT: `${applicationPort}`
          },
          environmentSecrets: {},
        },
        asset: dockerImageAsset,
      }),
      instanceRole,
      autoDeploymentsEnabled: false,
    });

    

    const checkpointTable = new Table(this, 'FlicketAiCheckpointTable', {
      partitionKey: {name:'threadId',type: AttributeType.STRING },
      sortKey: { name:'recordId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName:`${dynamoDbPrefix}Checkpoints`,
    });
    checkpointTable.grantReadWriteData(instanceRole);

    // Output the ECR URI
    new cdk.CfnOutput(this, "ECRImageUri", {
      value: dockerImageAsset.imageUri,
    });


  }
}

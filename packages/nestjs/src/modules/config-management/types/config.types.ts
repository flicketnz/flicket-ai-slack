export enum NodeEnv {
  PRODUCTION = "production",
  DEVELOPMENT = "development",
  TEST = "test",
}

export enum LLM_Provider {
  OPENAI = "openai",
}

export interface DynamoDBConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  tablePrefix: string;
}

export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  appToken?: string;
  socketMode: boolean;
}

export interface AppConfig {
  dynamodb: DynamoDBConfig;
  slack: SlackConfig;
}

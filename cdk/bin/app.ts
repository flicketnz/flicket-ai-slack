#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FlicketSlackbotStack } from '../lib/flicket-slackbot-stack';

const app = new cdk.App();

new FlicketSlackbotStack(app, 'FlicketSlackbotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
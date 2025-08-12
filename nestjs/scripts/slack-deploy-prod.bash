#!/usr/bin/env bash

# set the prod deploy flag for the manifest amendments
export PROD_DEPLOY=true

APP_ID=$(jq -r '.apps[].app_id' ".slack/apps.json")
TEAM_ID=$(jq -r '.apps[].team_id' ".slack/apps.json")
EXTRA_ARGS=""

# if the env var for token is set, then add it to the slack deploy url
if [ -n "$SLACK_SERVICE_TOKEN" ]; then
  EXTRA_ARGS="--token $SLACK_SERVICE_TOKEN"
fi

# Run the deploy. (this also triggers cdk via the deploy hook)
# --force will enable writing manifest changes without asking permission
slack deploy --force --app $APP_ID --team $TEAM_ID $EXTRA_ARGS
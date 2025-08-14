#!/usr/bin/env bash


# get the team id from config
SLACK_TEAM_ID=$(jq -r ".[].team_id" ~/.slack/credentials.json)

# Get the configuration token and store it in a variable
CONFIG_TOKEN=$(jq -r ".${SLACK_TEAM_ID}.token" ~/.slack/credentials.json)

APPS_DEV_JSON=".slack/custom-managed-apps.json"

# Ensure the file exists and is valid JSON
if [ ! -f "$APPS_DEV_JSON" ]; then
  echo "Delete Failed ❌"
  echo "$APPS_DEV_JSON does not exist - looks like you never setup a local app to delete."
  exit 1
fi

# Check if custom_managed_local_app exists
APP_ID=$(jq -r '.custom_managed_local_app.app_id // empty' "$APPS_DEV_JSON")
if [ -z "$APP_ID" ]; then
  echo "Delete Failed ❌"
  echo "custom_managed_local_app not defined in $APPS_DEV_JSON."
  exit 1
fi

# delete app with slack cli
slack app delete --team $SLACK_TEAM_ID --app $APP_ID --force


# Check if deletion was successful
SUCCESS=$?
if [ "$SUCCESS" = "0" ]; then
  # Remove the custom_managed_local_app entry
  jq 'del(.custom_managed_local_app)' "$APPS_DEV_JSON" > "$APPS_DEV_JSON.tmp" && mv "$APPS_DEV_JSON.tmp" "$APPS_DEV_JSON"
  echo "Removed custom_managed_local_app from $APPS_DEV_JSON."
fi



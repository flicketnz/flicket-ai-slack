#!/usr/bin/env bash

# get the team id from config
SLACK_TEAM_ID=$(jq -r ".[].team_id" ~/.slack/credentials.json)

# Get the configuration token and store it in a variable
CONFIG_TOKEN=$(jq -r ".${SLACK_TEAM_ID}.token" ~/.slack/credentials.json)

# get local manifest
MANIFEST_JSON=$(./scripts/slack-get-manifest.bash)

APPS_DEV_JSON=".slack/custom-managed-apps.json"

# Ensure the file exists and is valid JSON
if [ ! -f "$APPS_DEV_JSON" ]; then
  echo '{}' > "$APPS_DEV_JSON"
fi

# Check if custom_managed_local_app already exists
if jq -e '.custom_managed_local_app' "$APPS_DEV_JSON" | grep -vq null; then
  echo "Inital Setup Failed ❌"
  echo "custom_managed_local_app already exists in $APPS_DEV_JSON."
  exit 1
fi

# The --data-urlencode is important for sending the manifest correctly
API_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $CONFIG_TOKEN" \
  --data-urlencode "manifest=$MANIFEST_JSON" \
  "https://slack.com/api/apps.manifest.create?team_id=${SLACK_TEAM_ID}")


# Extract the app_id from the API response
APP_ID=$(echo $API_RESPONSE | jq -r '.app_id')

echo "Successfully created a new app with ID: $APP_ID"


# Update or add the custom_managed_local_app object
jq --arg app_id "$APP_ID" --arg team_id "$SLACK_TEAM_ID" \
  '.custom_managed_local_app = {app_id: $app_id, team_id: $team_id}' \
  "$APPS_DEV_JSON" > "$APPS_DEV_JSON.tmp" && mv "$APPS_DEV_JSON.tmp" "$APPS_DEV_JSON"

# swap the .slack/config.json manifest.source value to remote
jq '.manifest.source = "remote"' .slack/config.json > .slack/config.json.tmp && mv .slack/config.json.tmp .slack/config.json

# link the app
slack app link --app $APP_ID --environment local --team $SLACK_TEAM_ID 

# swap manifest.source value back to local
jq '.manifest.source = "local"' .slack/config.json > .slack/config.json.tmp && mv .slack/config.json.tmp .slack/config.json
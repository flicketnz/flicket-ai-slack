#!/usr/bin/env bash


# get the team id from config
SLACK_TEAM_ID=$(jq -r ".[].team_id" ~/.slack/credentials.json)

# Get the configuration token and store it in a variable
CONFIG_TOKEN=$(jq -r ".${SLACK_TEAM_ID}.token" ~/.slack/credentials.json)

APPS_DEV_JSON=".slack/custom-managed-apps.json"

# Exit with error if apps.dev.json is undefined
if [ ! -f "$APPS_DEV_JSON" ]; then
  echo "Update Failed ❌"
  echo "$APPS_DEV_JSON does not exist."
  exit 1
fi

# Exit with error if custom_managed_local_app is not present
if ! jq -e '.custom_managed_local_app' "$APPS_DEV_JSON" | grep -vq null; then
  echo "Update Failed ❌"
  echo "custom_managed_local_app not defined in $APPS_DEV_JSON."
  exit 1
fi


# Get the manifest
MANIFEST_JSON=$(./scripts/slack-get-manifest.bash)

# Validate the manifest using the existing validation script
./scripts/slack-validate-manifest.bash || exit 1

# Update the manifest (call update API)
APP_ID=$(jq -r '.custom_managed_local_app.app_id' "$APPS_DEV_JSON")
UPDATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $CONFIG_TOKEN" \
  --data-urlencode "app_id=$APP_ID" \
  --data-urlencode "manifest=$MANIFEST_JSON" \
  "https://slack.com/api/apps.manifest.update?team_id=${SLACK_TEAM_ID}")

UPDATE_OK=$(echo "$UPDATE_RESPONSE" | jq -r '.ok')
if [ "$UPDATE_OK" = "true" ]; then
  echo "Manifest update succeeded ✅"
else
  echo "Manifest update failed ❌"
  echo "Errors:"
  echo "$UPDATE_RESPONSE" | jq -r '.errors[]?'
  exit 1
fi

#!/usr/bin/env bash


# Get the configuration token and store it in a variable
SLACK_TEAM_ID=$(jq -r ".[].team_id" ~/.slack/credentials.json)
CONFIG_TOKEN=$(jq -r ".${SLACK_TEAM_ID}.token" ~/.slack/credentials.json)

MANIFEST_JSON=$(./scripts/slack-get-manifest.bash)


API_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $CONFIG_TOKEN" \
  --data-urlencode "manifest=$MANIFEST_JSON" \
  "https://slack.com/api/apps.manifest.validate?team_id=${SLACK_TEAM_ID}")


# Extract the app_id from the API response
SUCCESS=$(echo "$API_RESPONSE" | jq -r '.ok')

if [ "$SUCCESS" = "true" ]; then
  echo "Manifest validation succeeded ✅"
else
  echo "Manifest validation failed ❌"
  echo "Errors:"
  echo "$API_RESPONSE" | jq -r '.errors[]?'
  exit 1
fi



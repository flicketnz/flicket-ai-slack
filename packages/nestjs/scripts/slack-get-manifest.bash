#!/usr/bin/env bash

# get username from git config, which is probably a better source thatn the users login name which could be anything
USER_NAME=$(git config --global user.name)

# if SLACK_SERVICE_TOKEN is set - define the EXTRA_ARGS that can be appended to any slack command
EXTRA_ARGS=""
if [ -n "$SLACK_SERVICE_TOKEN" ]; then
  EXTRA_ARGS="--token $SLACK_SERVICE_TOKEN"
fi


# Check for --protocol=message-boundaries and --boundary, and echo the value passed to --boundary if both are present - this makes the slack manifest commands that call this via hooks ,work properly
PROTOCOL_FOUND=false
BOUNDARY_VALUE=""
for arg in "$@"; do
  if [[ "$arg" == "--protocol=message-boundaries" ]]; then
    PROTOCOL_FOUND=true
  fi
  if [[ "$arg" == --boundary=* ]]; then
    BOUNDARY_VALUE="${arg#--boundary=}"
  fi
done

if $PROTOCOL_FOUND && [ -n "$BOUNDARY_VALUE" ]; then
  echo "$BOUNDARY_VALUE"
fi


# App name to use in replacement
REPLACEMENT_NAME=" (${USER_NAME}) (local)"

if [ "$PROD_DEPLOY" = "true" ]; then
  # Dont replace the Name
  REPLACEMENT_NAME=""
  # Get App and Team ID of production app
  APP_ID=$(jq -r '.apps[].app_id' ".slack/apps.json")
  TEAM_ID=$(jq -r '.apps[].team_id' ".slack/apps.json")

  # Get Existing prod manifest
  CURRENT_MANIFEST=$(slack manifest --app $APP_ID --team $TEAM_ID $EXTRA_ARGS)

  # extract Request URL from existing app
  REQUEST_URL=$(echo $CURRENT_MANIFEST | jq -r '.settings.event_subscriptions.request_url')
fi


MANIFEST_JSON=$(jq -c --monochrome-output \
  --arg name "$REPLACEMENT_NAME" '
  .display_information.name = (
    .display_information.name as $orig |
    ($orig | length) as $orig_len |
    ($name | length) as $name_len |
    if ($orig_len + $name_len) > 36 then
      ($orig | .[0:36-$name_len]) + $name
    else
      $orig + $name
    end
  )
  | .features.bot_user.display_name += $name
' .slack/manifest.json)


# Add the request URLs to the appropraite places for prodcution. Disable socket mode. Set always online 
if [ "$PROD_DEPLOY" = "true" ]; then
  MANIFEST_JSON=$(echo $MANIFEST_JSON | jq -c --monochrome-output \
    --arg requestUrl "$REQUEST_URL" '
      .settings.socket_mode_enabled = false | 
      .settings.interactivity.request_url = $requestUrl | 
      .settings.event_subscriptions.request_url = $requestUrl | 
      .features.bot_user.always_online = true
    ')
fi

echo $MANIFEST_JSON
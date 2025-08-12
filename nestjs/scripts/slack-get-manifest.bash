#!/usr/bin/env bash

# get username from git config, which is probably a better source thatn the users login name which could be anything
USER_NAME=$(git config --global user.name)


# Check for --protocol=message-boundaries and --boundary, and echo the value passed to --boundary if both are present
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

# we dont have any indication what app is being requested when the get-manifest is called. 
# so I dont think we can use this to manipulate the names :-/ but if we dont hte validation fails. 

# ARGS_SERIALIZED="$*"
# touch serialised_args.log
# echo $ARGS_SERIALIZED > serialised_args.log

REPLACEMENT_NAME=" (${USER_NAME})"

if [ "$PROD_DEPLOY" = "true" ]; then
  REPLACEMENT_NAME=""
fi


jq -c --monochrome-output \
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
' .slack/manifest.json

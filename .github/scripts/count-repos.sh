#!/bin/sh

# count the repos we have in our example apps page and the number we have in our organization and make sure they match

#fusionauth-containers, fusionauth-theme-helper, etc
EXTRA_IN_JSON_NOT_NAMED_CORRECTLY=4 

# fusionauth-example-template
EXTRA_IN_GH_NOT_DISPLAYABLE=1 

COUNT_IN_JSON=`cat astro/src/content/json/exampleapps.json|jq '.|length'`

COUNT_EXAMPLE_REPOS=`gh repo list fusionauth --no-archived --visibility public -L 300 |grep fusionauth-example|wc -l |sed 's/ *//g'`
COUNT_QUICKSTART_REPOS=`gh repo list fusionauth --no-archived --visibility public -L 300 |grep fusionauth-quickstart|wc -l |sed 's/ *//g'`

echo "$COUNT_QUICKSTART_REPOS + $COUNT_EXAMPLE_REPOS + EXTRA_IN_GH_NOT_DISPLAYABLE - $COUNT_IN_JSON - $EXTRA_IN_JSON_NOT_NAMED_CORRECTLY"|bc

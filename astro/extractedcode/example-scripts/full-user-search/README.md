# Get all the users

FusionAuth user search has some limits. See https://fusionauth.io/docs/v1/tech/reference/limitations/#user-searches for the current limitations.

As of 1.48.0, you do not need to use this script to retrieve more than 10,000 users from FusionAuth. You can instead paginate through all of them. See the [extended pagination documentation](https://fusionauth.io/docs/v1/tech/core-concepts/search#extended-pagination). 

This project contains helpful scripts to work around these limits and allow you to download all your users.

## Full User Download, No Pagination

The `fulluserdownload.sh` script iterates the users with an email prefix of `a-z` or `0-9`. (Elasticsearch is case insensitive.) If there are more than 10000 results for any segment, it uses a second set of prefixes: `aa`, `ab`, `ac` and so on.

If you need to search usernames or have so many users that you need to do a third letter on the prefix, you'll have to modify the script.

## Full User Download, With Pagination

The `paginatefulluserdownload.sh` script uses pagination to pull down all users. 

This only works with FusionAuth versions 1.48.0 or greater.

## Prerequisites

* bash
* curl
* jq https://stedolan.github.io/jq/download/
* an API key that can hit the `/api/user/search` endpoint
* using FusionAuth with the Elasticsearch search engine

## Setup

Update `fulluserdownload.sh` with your API key and your FusionAuth instance hostname.


## Usage

```
./fulluserdownload.sh
```

All users will be in a `users.json` file. They will be in an array with the key `users`.

## SSO stats

If you want to find out how many of your users are logging in with various identity providers, use `ssostats.sh`. 

It expects the `users.json` file to exist, and you need to update it with an API key capable of retrieving identity provider links.

## User Count

If you want to have an accurate count of users, you can use `countusers.sh`. This will return an exact count of users without retrieving all their data, reducing load on your instance. 

If you want to find user counts that match a certain query, modify `queryString` in this script.

## Learn more

Learn more about FusionAuth: https://fusionauth.io

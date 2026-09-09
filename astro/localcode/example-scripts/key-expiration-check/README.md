# Find all the keys before a certain month.

You can search for keys that are going to expire in a certain period of time (deadline) by using the [Key Search API](https://fusionauth.io/docs/v1/tech/apis/keys#search-for-keys).

This project contains a script to demonstrate that.

## Prerequisites

* bash
* curl
* jq https://stedolan.github.io/jq/download/
* an API key that can hit the `/api/key/search` endpoint

## Setup

Update `find-expiring-keys.sh` with your API key, your desired deadline and your FusionAuth instance hostname.

## Usage

```
./find-expiring-keys.sh
```

The id and expiration time will be printed to stdout.

## Learn more

Learn more about FusionAuth: https://fusionauth.io

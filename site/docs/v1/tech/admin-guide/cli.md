---
layout: doc
title: FusionAuth CLI
description: Learn about the FusionAuth admin CLI tool
---

The FusionAuth command line interface (CLI) tool allows you to manipulate FusionAuth from the command line. The focus of the CLI is on allowing easy management of commonly modified customization code and markup, such as emails, themes or lambdas. It is not a full featured replacement for any of the [client libraries](/docs/v1/tech/client-libraries/), which wrap all of the API.

## Prerequisites

The CLI tool requires node. It's tested with version 19 but should work with modern versions of node.

## Installation

You can install this using `npm`.

```
npm i -g @fusionauth/cli
```

Then you can run commands.

```
fusionauth theme:download -k <APIKEY> <themeid>

# modify your theme

fusionauth theme:upload -k <APIKEY> <themeid>
```

To learn more about the commands, use the `--help` switch.

```
fusionauth --help
```

## Updating 

To update to the most recent version, use `npm update`.

```
npm update -g @fusionauth/cli
```

## Functionality

This tool allows you to easily retrieve and publish FusionAuth configurations from the command line.

This includes:

* emails
* lambdas
* themes

The CLI is designed to work with complex version controlled configuration and includes support for localized content.

## Source Code

The FusionAuth CLI is open source.

You can [view the source code](https://github.com/FusionAuth/fusionauth-node-cli) and the [the npm package](https://www.npmjs.com/package/@fusionauth/cli).

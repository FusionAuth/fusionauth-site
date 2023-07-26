---
layout: doc
title: FusionAuth CLI
description: Learn about the FusionAuth admin CLI tool
---

The FusionAuth command line interface (CLI) tool allows you to manipulate FusionAuth from the command line.

## Prerequisites

The CLI tool requires node. It's tested with version 19 but should work with modern versions of node.

## Installation

You can install this using `npm`.

```
npm i -g @fusionauth/cli
```


Then you can run commands.

```
fusionauth -k <APIKEY> theme:download <themeid>
# modify your theme
fusionauth -k <APIKEY> theme:upload <themeid>
```

To learn more about the commands, use the `--help` switch.

```
fusionauth --help
```

## Functionality

This tool allows you to easily retrieve and publish FusionAuth configuration from the command line.

This includes:

* themes
* emails (coming soon)
* lambdas (coming soon)

The CLI is designed to work with complex version controlled configuration and includes support for localized content.

## Source Code

The FusionAuth CLI is open source.

You can view the source code here: https://github.com/FusionAuth/fusionauth-node-cli

You can view the npm package here: https://www.npmjs.com/package/@fusionauth/cli

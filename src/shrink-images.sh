#!/bin/bash

function usage() {
  #print pretty usage and exit
  cat <<HELP_USAGE
    Shrinks PNG files with tinyPNG on the command line. Make sure you set the TINYPNG_API_KEY env var.

    $0 /full/path/to/filename
HELP_USAGE
  exit 0;
}

if [ "x$1" = "x" ]; then
  usage;
  exit 1;
fi

absFile=$1

compressedFile=`curl -s --user api:${TINYPNG_API_KEY} --data-binary @${absFile} -i https://api.tinify.com/shrink | grep -i location | awk '{print $2}' | sed 's/.$//'`
echo "-- Downloading from TinyPNG : ${compressedFile}"
curl -s -X GET "${compressedFile}" --output ${absFile}

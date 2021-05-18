#!/bin/bash

# Script to take screenshots in the correct format

# how to run : fa-screenshot fileName tp
# filename (optional)- name of the file to save screenshot to. extension png is automatically added.
# tp (optional)- use tinypng instead of pngquant for compression
# TODO: 1. add parameter parsing 2. accept switch for destination folder 3. switch for quieter output

# Author - Sanjay


function printFileAttribs() {
  attributes=`/usr/local/bin/identify ${absFile}`
  echo "Current dimensions of the screenshot are : "`echo ${attributes} | cut -d' ' -f3`
  echo "Current size of the screenshot is : "`echo ${attributes} | cut -d' ' -f7`
}

function compressUsingTPNG() {
  API_KEY=1QPDBdzWpqs2pRKK9VyJyyzhwVQJ2s5h;
  compressedFile=`curl -s --user api:${API_KEY} --data-binary @${absFile} -i https://api.tinify.com/shrink | grep -i location | awk '{print $2}' | sed 's/.$//'`
  echo "-- Downloading from TinyPNG : >${compressedFile}<"
  curl -s -X GET "${compressedFile}" --output ${absFile}
}


echo
echo "-- checking if imagemagick is installed..."
if [ ! -f "/usr/local/bin/convert" ]; then
  echo "Installing imagemagick..."
  brew install imagemagick;
else
  echo "imagemagick is installed"
fi

echo
echo "-- Checking whether pngquant is installed"
if [ ! -f "/usr/local/bin/pngquant" ]; then
  echo "Installing pngquant"
  brew install pngquant
else
  echo "pngquant is installed"
fi

echo
echo "-- Checking whether safari is running"
safaricount=`ps cax | grep -i "safari.app" | grep -iv grep | wc -l`;

if [ "${safaricount}" == "0" ]; then
  echo "Safari is not running. Exiting..."
  exit 0;
else
  echo "Safari is running"
fi

echo
echo "-- Resizing safari window..."
osascript <<EOD
set theApp to "Safari"

set appHeight to 1100
set appWidth to 1080

tell application "Finder"
	set screenResolution to bounds of window of desktop
end tell

set screenWidth to item 3 of screenResolution
set screenHeight to item 4 of screenResolution

tell application theApp
	activate
	reopen
	set xAxis to 640
	set yAxis to 360
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
EOD

echo
echo "-- Creating screenshots folder on the desktop"
tempFolder=${HOME}/Desktop/screenshots/
if [ ! -d ${tempFolder} ]; then
  mkdir ${tempFolder};
else
  echo "Screenshots folder already exists";
fi

#file name is date-time format
if [ "${1}" == "" ]; then
  fileName=`date +'%y%m%d-%H%M%S'`
else
  fileName=${1}
fi


absFile="${tempFolder}${fileName}.png"

echo
echo "-- Capturing screenshot to file : ${fileName}"
screencapture -l $(osascript -e 'tell app "Safari" to id of window 1') ${absFile}

echo
echo "-- Checking image properties"
printFileAttribs

echo
echo "-- Resizing screenshot"
/usr/local/bin/convert -geometry 1600x ${absFile} ${absFile}

echo
echo "-- Compressing png"
if [ "${2}" == "tp" ]; then
  compressUsingTPNG
else
  /usr/local/bin/pngquant --quality=65-80 ${absFile}
  #remove old file and rename compressed to new
  basename=`basename ${absFile} .png`
  rm ${absFile}
  mv "${tempFolder}${basename}-fs8.png" ${absFile}
  printFileAttribs
fi

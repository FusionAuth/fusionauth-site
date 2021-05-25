#!/bin/bash

# Script to take screenshots in the correct format

# how to run : fa-screenshot fileName tp
# filename (optional)- name of the file to save screenshot to. extension png is automatically added.
# tp (optional)- use tinypng instead of pngquant for compression
#TODO: switch for accepting window positioning and sizing parameters.


# Author - Sanjay


function printFileAttribs() {
  attributes=`/usr/local/bin/identify ${absFile}`
  printOut "Current dimensions of the screenshot are : "`echo ${attributes} | cut -d' ' -f3`
  printOut "Current size of the screenshot is : "`echo ${attributes} | cut -d' ' -f7`
}

function compressUsingTPNG() {
  echo "-- Using TinyPNG for compression"

  API_KEY=`printenv | grep TINYPNG_API_KEY | awk -F '=' '{print $2}'`
  if [ "${API_KEY}" == "" ]; then
    echo "Error : TinyPNG API key not found in environment. Not compressing".
  else
    compressedFile=`curl -s --user api:${API_KEY} --data-binary @${absFile} -i https://api.tinify.com/shrink | grep -i location | awk '{print $2}' | sed 's/.$//'`
    printOut "-- Downloading from TinyPNG : ${compressedFile}"
    curl -s -X GET "${compressedFile}" --output ${absFile}
  fi
}

function printOut() {
  if [ ${silent} == "no" ]; then
    echo
    echo ${1}
  fi
}


function usage() {
  #print pretty usage and exit
  cat <<HELP_USAGE

    $0  [-s] [-t] [-d] <destination folder> [-h]

   -s  Silent mode
   -t  Use TinyPNG API instead of pngquant library
   -d  Move screenshots to given folder
   -h  Print this usage
HELP_USAGE
  exit 0;
}


silent="no"
useTP="no"
destination=""
while getopts ":std:h" options; do
    case "${options}" in
        s)
            silent="yes"
            ;;
        t)
            useTP="yes"
            ;;
        d)
           destination=${OPTARG}
           if [[ "${destination}" == "" || ! -d ${destination} ]]; then
             echo "Please specify valid destination folder"
             exit 1;
           fi
           ;;
         h)
           usage
           ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))


printOut "-- checking if imagemagick is installed..."
if [ ! -f "/usr/local/bin/convert" ]; then
  echo "Installing imagemagick..."
  brew install imagemagick;
else
  printOut "imagemagick is installed"
fi

printOut "-- Checking whether pngquant is installed"
if [ ! -f "/usr/local/bin/pngquant" ]; then
  echo "Installing pngquant"
  brew install pngquant
else
  printOut "pngquant is installed"
fi


printOut "-- Checking whether safari is running"
safaricount=`ps cax | grep -i "safari.app" | grep -iv grep | wc -l`;

if [ "${safaricount}" == "0" ]; then
  echo "Safari is not running. Exiting..."
  exit 1;
else
  printOut "Safari is running"
fi


printOut "-- Resizing safari window..."
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


printOut "-- Creating screenshots folder on the desktop"
tempFolder=${HOME}/Desktop/screenshots/
if [ ! -d ${tempFolder} ]; then
  mkdir ${tempFolder};
else
  printOut "Screenshots folder already exists";
fi

#file name is date-time format
if [ "${1}" == "" ]; then
  fileName=`date +'%y%m%d-%H%M%S'`
else
  fileName=${1}
fi

fileName="${fileName}.png"
absFile=${tempFolder}${fileName}

echo
echo "-- Capturing screenshot to file : ${fileName}"
screencapture -l $(osascript -e 'tell app "Safari" to id of window 1') ${absFile}

printOut "-- Checking image properties"
printFileAttribs

printOut "-- Resizing screenshot"
/usr/local/bin/convert -geometry 1600x ${absFile} ${absFile}

printOut "-- Compressing png"
if [ "${useTP}" == "yes" ]; then
  compressUsingTPNG
else
  /usr/local/bin/pngquant --quality=65-80 ${absFile}
  #remove old file and rename compressed to new
  basename=`basename ${absFile} .png`
  rm ${absFile}
  mv "${tempFolder}${basename}-fs8.png" ${absFile}
  printFileAttribs
fi


# move to desination folder
if [ "${destination}" != "" ]; then
    mv ${absFile} ${destination}/${fileName}
fi


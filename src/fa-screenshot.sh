#!/bin/bash

# Script to take screenshots in the correct format

# how to run : fa-screenshot 

# Author - Sanjay


function printFileAttribs() {
  identify=`which identify`
  attributes=`$identify ${absFile}`
  printOut "Current dimensions of the screenshot are : "`echo ${attributes} | cut -d' ' -f3`
  printOut "Current size of the screenshot is : "`echo ${attributes} | cut -d' ' -f7`
}

function compressUsingTinyPNG() {
  echo "-- Using TinyPNG for compression"

  API_KEY=`printenv | grep TINYPNG_API_KEY | awk -F '=' '{print $2}'`
  if [ "${API_KEY}" == "" ]; then
    echo "Error : TinyPNG API key not found in environment. Not continuing. Please set TINYPNG_API_KEY".
    exit 1
  else
    compressedFile=`curl -s --user api:${API_KEY} --data-binary @${absFile} -i https://api.tinify.com/shrink | grep -i location | awk '{print $2}' | sed 's/.$//'`
    printOut "-- Downloading from TinyPNG : ${compressedFile}"
    curl -s -X GET "${compressedFile}" --output ${absFile}
  fi
}

function printOut() {
  if [ ${verbose} == "yes" ]; then
    echo
    echo ${1}
  fi
}


function usage() {
  #print pretty usage and exit
  cat <<HELP_USAGE

    $0  [-s] [-d destination folder] [-f filename] [-u url] [-h] 

   -f  Filename for screenshot. If not provided, defaults to datetime. No suffix needed, a .png suffix will be appended.
   -u  URL to open before taking screenshot. Will cause a slight delay.
   -d  Move screenshots to given folder.
   -x  How far to move the safari window on the x axis (number). Default is 640.
   -v  Verbose mode.
   -h  Print this usage
HELP_USAGE
  exit 0;
}

verbose="no"
useTP="no"
filename=`date +'%y%m%d-%H%M%S'`
destination=""
xAxis=640
url=""
while getopts ":stx:f:u:d:h" options; do
    case "${options}" in
        v)
            verbose="yes"
            ;;
        t)
            useTP="yes"
            ;;
        x)
            xAxis=${OPTARG}
            ;;
        u)
            url=${OPTARG}
            ;;
        f)
           filename=${OPTARG}
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

which -s convert
status=$?
if [ $status -eq 1 ]; then
  echo "Installing imagemagick..."
  brew install imagemagick;
else
  printOut "imagemagick is installed"
fi

printOut "-- Checking whether pngquant is installed"
which -s pngquant
status=$?
if [ $status -eq 1 ]; then
  echo "Installing pngquant"
  brew install pngquant
else
  printOut "pngquant is installed"
fi

if [ `defaults read "Apple Global Domain" AppleReduceDesktopTinting` == "0" ]; then
  echo "Window will not have a gray background."
  echo "Go to System Setting -> Appearance"
  echo "And disable 'Allow wallpaper tinting in windows'"
  exit 1;
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

tell application theApp to activate
delay 0.1
tell application "System Events" to tell process theApp
    key code 29 using {command down} -- this resets the size to the default zoom
    delay 0.1
end tell

tell application theApp
	activate
	reopen
	set xAxis to $xAxis
	set yAxis to 200
	set the bounds of the first window to {xAxis, yAxis, appWidth + xAxis, appHeight + yAxis}
end tell
EOD

if [ "x$url" != "x" ]; then
  osascript<<EOD
tell application "Safari" to set the URL of the front document to "$url"
delay 1
EOD
fi


printOut "-- Creating screenshots folder on the desktop"
tempFolder=${HOME}/Desktop/screenshots/
if [ ! -d ${tempFolder} ]; then
  mkdir ${tempFolder};
else
  printOut "Screenshots folder already exists";
fi

filename="${filename}.png"
absFile=${tempFolder}${filename}

echo
echo "-- Capturing screenshot to file : ${filename}"
screencapture -l $(osascript -e 'tell app "Safari" to id of window 1') ${absFile}

printOut "-- Checking image properties"
printFileAttribs

printOut "-- Resizing screenshot"
convert=`which convert`
$convert -geometry 1600x ${absFile} ${absFile}

printOut "-- Compressing png"
compressUsingTinyPNG

# move to destination folder
if [ "${destination}" != "" ]; then
    mv ${absFile} ${destination}/${filename}
fi

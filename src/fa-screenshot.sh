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
filename=`date +'%y%m%d-%H%M%S'`
destination=""
xAxis=640
url=""
while getopts ":vx:f:u:d:h" options; do
    case "${options}" in
        v)
            verbose="yes"
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

which -s magick
status=$?
if [ $status -eq 1 ]; then
  echo "Installing imagemagick..."
  brew install imagemagick;
else
  printOut "imagemagick is installed"
fi


if [ $(defaults read "Apple Global Domain" AppleReduceDesktopTinting 2>/dev/null || echo -n 0) == "0" ]; then
  echo "Disabling wallpaper tinting in windows to get a consistent gray background."
  echo "To revert this change, execute 'defaults write \"Apple Global Domain\" AppleReduceDesktopTinting 0'"
  echo "or go to System Settings -> Appearance and enable 'Allow wallpaper tinting in windows'."
  defaults write "Apple Global Domain" AppleReduceDesktopTinting 1
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

osaret=$?

if [ $osaret != 0 ]; then
  echo "osascript failed. Check permissions under System Settings -> Privacy & Security for both Accessibility and Automation."
  exit 1
fi


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
magick ${absFile} -geometry 1600x ${absFile}

# move to destination folder
if [ "${destination}" != "" ]; then
    mv ${absFile} ${destination}/${filename}
fi

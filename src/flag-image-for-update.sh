#!/bin/bash

# Script to mark screenshots that need to be udpated for a feature branch 
# (but we want to wait until all UI changes are done)
#
# Overlays transparent red text "update for issue1" to make it visible
# (the image size becomes larger, but then a GHA will shrink it)
#
# Usage:
# flag-image-for-update.sh <image_file>

script_dir="$(dirname $0)"

convert $1  -gravity Center -pointsize 120 -fill "#f004" -draw 'text 0,0 "Needs Update"' -set comment "update for issue1" $1
$script_dir/shrink-images.sh $1
convert $1 -set comment "update for issue1" $1



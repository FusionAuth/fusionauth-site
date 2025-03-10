#!/bin/bash

# script to mark screenshots that need to be udpated for issue1 (but we want to wait until all UI changes are done)
#
# overlays transparent red text "update for issue1" to make it visible
# shrinks the image
# adds metadata comment so we can programmatically find the images that need updating
#
# Usage:
# label-for-issue1.sh <image_file>
#
# extract the comment with:
# identify -format %c

script_dir="$(dirname $0)"

convert $1  -gravity Center -pointsize 120 -fill "#f004" -draw 'text 0,0 "update for issue1"' -set comment "update for issue1" $1
$script_dir/shrink-images.sh $1
convert $1 -set comment "update for issue1" $1



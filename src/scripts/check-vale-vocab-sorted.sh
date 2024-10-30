#!/bin/sh

# first line shows output of unsorted item, r
# second just an exit code. 

#this needs to be LC_ALL=C because otherwise you run into issues between how macos sorts it and how linux/GH actions sorts it

echo `LC_ALL=C sort -cu config/vale/styles/config/vocabularies/FusionAuth/accept.txt`
exit `LC_ALL=C sort -Cu config/vale/styles/config/vocabularies/FusionAuth/accept.txt`

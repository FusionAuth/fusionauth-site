#!/bin/bash

file=$1;

if [[ $file != *site/_posts* ]]; then
  # not a blog post
  exit 0;
fi

res=`grep -c 'layout: blog-post' $1`

if [ $res -ne 1 ]; then
  echo "improper layout"
  exit 1
fi

res=`grep -c 'title: ' $1`

if [ $res -ne 1 ]; then
  echo "no title"
  exit 1
fi

res=`grep -c 'description: ' $1`

if [ $res -ne 1 ]; then
  echo "no description"
  exit 1
fi

res=`grep -c 'author: ' $1`

if [ $res -ne 1 ]; then
  echo "no author"
  exit 1
fi

res=`grep -c 'image: blogs/' $1`

if [ $res -ne 1 ]; then
  echo "no image"
  exit 1
fi

res=`grep -c 'category: blog' $1`

if [ $res -ne 1 ]; then
  echo "improper category"
  exit 1
fi

res=`grep -c 'excerpt_separator' $1`

if [ $res -ne 1 ]; then
  echo "no excerpt separator"
  exit 1
fi

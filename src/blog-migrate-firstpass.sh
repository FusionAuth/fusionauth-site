#!/bin/bash

if [ "x$1" = "x" ]; then
  echo "Need file to move."
  exit 1
fi

src_dir=site/_posts
dest_dir=astro/src/content/blog
filename=$1
dest=`echo $filename|sed 's!.*/!!'|sed 's/.md$/.mdx/'|sed 's![0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-!!'`
pubdate=`echo $filename|sed 's!.*/!!'|sed 's!\([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\)-.*!\1!'`

#echo $filename 
echo "http://localhost:3000/blog/$dest"|sed 's/.mdx$//'
#echo $pubdate

git mv $src_dir/$filename $dest_dir/$dest

RES=$?

if [ $RES -ne 0 ]; then
  echo "git mv not successful"
  exit 1
fi


cat $dest_dir/$dest | sed 's^<!--more-->^{/* more */}^' |sed 's/^category: /categories: /'|sed 's/^author: /authors: /'|sed "s/^layout: blog-post/publish_date: $pubdate /" | sed 's/^image: blogs/image: \/img\/blogs/'  > t
mv t $dest_dir/$dest

# tbd
# cat t |sed 's^{% include _image.liquid src="([^"]*)".*alt="([^"]*)".*%}^![\2](\1)^'

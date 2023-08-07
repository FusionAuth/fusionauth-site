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
echo "http://localhost:3000/blog/$dest"
#echo $pubdate

git mv $filename $dest_dir/$dest

cat $dest_dir/$dest | sed 's^<!--more-->^{/* more */}^' |sed 's/^category: /categories: /'|sed 's/^author: /authors: /'|sed "s/^layout: blog-post/publish_date: $pubdate /"  > t
mv t $dest_dir/$dest

# tbd
# cat t |sed 's^{% include _image.liquid src="([^"]*)".*alt="([^"]*)".*%}^![\2](\1)^'


docker pull fusionauth/fusionauth-app


if [ "x$1" = "x" ]; then
  echo "Must provide unique id which is good for dirname"
  exit 1
fi

UNIQID=$1

FA_VERSION=latest
if [ "x$2" != "x" ]; then
  FA_VERSION=$2
fi

echo "using $FA_VERSION"
mkdir -p tmp/$UNIQID
cp -pr template/* tmp/$UNIQID/
cp -pr template/.env tmp/$UNIQID/

for i in tmp/$UNIQID/*.yml; do
  sed 's/REPLACE_WITH_UNIQID/'$UNIQID'/g' $i > $i.bak ; mv $i.bak $i
  sed 's/REPLACE_WITH_FA_VERSION/'$FA_VERSION'/g' $i > $i.bak ; mv $i.bak $i
done

echo "new environment: tmp/$UNIQID"

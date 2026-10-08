# Create Email Template Files from FusionAuth deployment
To get the latest Email Templates you can download them from a new FusionAuth deployment.

## Setup FusionAuth
Start FusionAuth instance:
```
docker compose up -d
```
Open your FusionAuth instance on your local machine http://localhost:9011 and set up a user and an API key `RySMQQxaTxuoqW5LetZ3YBLJZ28FKV_IpFBHZQaeb5zCy1Eko6lXCMQ_`

## Extract Email Templates from the FusionAuth instance
Extract the Email Templates with the fusionauth cli.
```
mkdir fusionauth-cli;
cd fusionauth-cli/;
npm i @fusionauth/cli;
npx fusionauth email:download -k RySMQQxaTxuoqW5LetZ3YBLJZ28FKV_IpFBHZQaeb5zCy1Eko6lXCMQ_;
```

Move the files in to a single folder with the Email Template name. By creating an email_templates folder.
```
mkdir email_templates;
```
And take the output of this and run it in the console.
```
for fullTemplateName in `ls emails/*/name.txt`; do
  templateName=`cat $fullTemplateName | nawk -F"] " '{ print $2 }'`;
  fileTemplateName=`sed 's/ /_/g' <<< $templateName`;
  echo `echo $fullTemplateName | nawk -F/ '{ print "cp ./emails/"$2"/body.txt" }'` ./email_templates/$fileTemplateName.txt.ftl;
  echo `echo $fullTemplateName | nawk -F/ '{ print "cp ./emails/"$2"/body.html" }'` ./email_templates/$fileTemplateName.html.ftl;
done;
```
Then replace your terraform Email Templates with the files created.

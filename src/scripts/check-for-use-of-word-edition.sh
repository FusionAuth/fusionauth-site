#!/bin/sh

# look for use of the word edition, except where allowed

echo `grep -Ri edition astro/src/content | grep -v 'IDEA'|grep -v 'Scouting'|grep -v '0-reactor-ed'|grep -v 'Gluu Server Community Edition'|grep -v 'TR/webauthn-2/'|grep -v 'API-Security/editions'|grep -v fusionauth-colorado-company-to-watch|grep -v 'edition.cnn.com'|grep -v 'hey are also called editions'|grep -v 'also known as an edition'`
exit `find astro/src/content -type f -print|xargs grep -i edition | grep -v 'IDEA'|grep -v 'Scouting'|grep -v '0-reactor-ed'|grep -v 'Gluu Server Community Edition'|grep -v 'TR/webauthn-2/'|grep -v 'API-Security/editions'|grep -v fusionauth-colorado-company-to-watch|grep -v 'edition.cnn.com'|grep -v 'hey are also called editions'|grep -v 'also known as an edition' | wc -l | sed 's/[ ]*//g'`

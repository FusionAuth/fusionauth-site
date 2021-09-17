#!/usr/bin/env bash

# sets up savant

# Savant
mkdir -p ~/dev/savant
cd ~/dev/savant
curl http://savant.inversoft.org/org/savantbuild/savant-core/1.0.0/savant-1.0.0.tar.gz > savant-1.0.0.tar.gz
tar -xzvf savant-1.0.0.tar.gz
ln -s savant-1.0.0 current
rm savant-1.0.0.tar.gz
mkdir -p ~/.savant/plugins

# Groovy
mkdir -p ~/dev/groovy
cd ~/dev/groovy
curl https://archive.apache.org/dist/groovy/2.4.6/distribution/apache-groovy-sdk-2.4.6.zip > apache-groovy-sdk-2.4.6.zip
unzip apache-groovy-sdk-2.4.6.zip
rm apache-groovy-sdk-2.4.6.zip
curl https://archive.apache.org/dist/groovy/2.5.5/distribution/apache-groovy-sdk-2.5.5.zip > apache-groovy-sdk-2.5.5.zip
unzip apache-groovy-sdk-2.5.5.zip
rm apache-groovy-sdk-2.5.5.zip
GROOVY_HOME=${HOME}/dev/groovy
echo -e "2.4=${GROOVY_HOME}/groovy-2.4.6\n2.5=${GROOVY_HOME}/groovy-2.5.5" > ~/.savant/plugins/org.savantbuild.plugin.groovy.properties

# Java
echo -e "14=${JAVA_HOME}" > ~/.savant/plugins/org.savantbuild.plugin.java.properties

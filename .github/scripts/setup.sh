#!/usr/bin/env bash

# sets up savant

mkdir -p ~/.savant/plugins

if [ ! -d ~/dev/savant ]; then

  # Savant
  mkdir -p ~/dev/savant
  cd ~/dev/savant
  curl -fSL http://savant.inversoft.org/org/savantbuild/savant-core/1.0.0/savant-1.0.0.tar.gz > savant-1.0.0.tar.gz
  tar -xzf savant-1.0.0.tar.gz
  ln -s savant-1.0.0 current
  rm savant-1.0.0.tar.gz

fi

if [ ! -d ~/dev/groovy ]; then
  # Groovy
  mkdir -p ~/dev/groovy
  cd ~/dev/groovy
  curl -fSL https://archive.apache.org/dist/groovy/2.4.6/distribution/apache-groovy-sdk-2.4.6.zip > apache-groovy-sdk-2.4.6.zip
  unzip -qq apache-groovy-sdk-2.4.6.zip
  rm apache-groovy-sdk-2.4.6.zip
  curl -fSL https://archive.apache.org/dist/groovy/2.5.5/distribution/apache-groovy-sdk-2.5.5.zip > apache-groovy-sdk-2.5.5.zip
  unzip -qq apache-groovy-sdk-2.5.5.zip
  rm apache-groovy-sdk-2.5.5.zip
  GROOVY_HOME=${HOME}/dev/groovy

fi

# always set this up, it's lightweight
echo -e "2.4=${GROOVY_HOME}/groovy-2.4.6\n2.5=${GROOVY_HOME}/groovy-2.5.5" > ~/.savant/plugins/org.savantbuild.plugin.groovy.properties

# Java
echo -e "14=${JAVA_HOME}" > ~/.savant/plugins/org.savantbuild.plugin.java.properties

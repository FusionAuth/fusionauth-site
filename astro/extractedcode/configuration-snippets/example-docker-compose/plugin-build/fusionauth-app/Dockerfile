FROM maven AS build
WORKDIR /app
RUN git init . &&\
  git remote add -t \* -f origin https://github.com/FusionAuth/fusionauth-example-password-encryptor.git &&\
  git checkout master &&\
  mvn compile package

FROM fusionauth/fusionauth-app:latest
COPY --chown=fusionauth:fusionauth --from=build /app/target/fusionauth-example-password-encryptor*.jar /usr/local/fusionauth/plugins/

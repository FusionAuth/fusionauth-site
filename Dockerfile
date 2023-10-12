FROM ruby:2.7.5

ARG SAVANT_VERSION="2.0.0-RC.4"
ARG BUNDLER_VERSION="2.4.6"
ARG OPENJDK_VERSION="17"
ENV JAVA_HOME="/usr/lib/jvm/java-${OPENJDK_VERSION}-openjdk-amd64"

WORKDIR /srv/jekyll

RUN wget https://github.com/savant-build/savant-core/releases/download/${SAVANT_VERSION}/savant-${SAVANT_VERSION}.tar.gz -O /tmp/savant.tar.gz && \
    tar xvf /tmp/savant.tar.gz -C /usr/local/lib && \
    ln -s /usr/local/lib/savant-${SAVANT_VERSION}/bin/sb /usr/local/bin && \
    gem install bundler -v ${BUNDLER_VERSION} && \
    apt-get update && \
    apt-get install -y openjdk-${OPENJDK_VERSION}-jdk-headless nodejs

# Leveraging cache
COPY ["Gemfile", "Gemfile.lock", "./"]
RUN bundle install

COPY . ./

CMD ["sb", "compile"]

# Docker Image for shinify

# Format: FROM    repository[:version]
FROM       phusion/baseimage:0.9.15

# Format: MAINTAINER Name <email@addr.ess>
MAINTAINER Xu Lvcai <xulvcai2008@gmail.com>


# Set correct environment variables.
ENV HOME /root

# Regenerate SSH host keys. baseimage-docker does not contain any, so you
# have to do that yourself. You may also comment out this instruction; the
# init system will auto-generate one during boot.
RUN /etc/my_init.d/00_regen_ssh_host_keys.sh

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]


RUN apt-get update -y
 
#install dependencies
RUN apt-get -y install build-essential libssl-dev wget git libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev g++
 
#configuration for node
ENV NODE_VERSION 0.10.21
ENV NODE_ARCH x64
 
#installation node
WORKDIR /tmp
RUN wget http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$NODE_ARCH.tar.gz
RUN tar xvzf node-v$NODE_VERSION-linux-$NODE_ARCH.tar.gz
RUN rm -rf /opt/nodejs
RUN mv node-v$NODE_VERSION-linux-$NODE_ARCH /opt/nodejs
 
RUN ln -sf /opt/nodejs/bin/node /usr/bin/node
RUN ln -sf /opt/nodejs/bin/npm /usr/bin/npm
 
# Installation:
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

# Update apt-get sources AND install MongoDB
RUN apt-get update && apt-get install -y mongodb-org

# Create the MongoDB data directory
RUN mkdir -p /data/db


#initialize system
RUN mkdir -p /opt/shinify

RUN npm install -g node-gyp

WORKDIR /opt/shinify/

#downloading app
RUN git clone https://github.com/fdubbsMobile/shinify.git
RUN cd shinify && npm install

EXPOSE 3000

RUN chmod +x ./shinify/docker/start.sh
ENTRYPOINT ["./shinify/docker/start.sh"]
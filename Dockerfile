FROM node:slim
LABEL Name=BP Version=1.0.0
EXPOSE 8080 35729
RUN npm install webpack -g
RUN npm install http-server -g
RUN mkdir -p /home/boilerplate
WORKDIR /home/boilerplate
COPY . /home/boilerplate
RUN npm install
ENTRYPOINT http-server /home/boilerplate/dist
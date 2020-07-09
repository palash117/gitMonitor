FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
ENV NODE_CONFIG_DIR=/usr/src/app/config
ENV STORAGE_ENV=/usr/src/app/storage
RUN apt-get install -y locales locales-all
ENV LC_ALL en_IN.UTF-8
ENV LANG en_IN.UTF-8
ENV LANGUAGE en_IN.UTF-8

CMD [ "node", "script.js" ]
#docker run --name gitmon3 -v C:\Users\palashWindows\dev\configData:/usr/src/app/config 2cc421deb0bb
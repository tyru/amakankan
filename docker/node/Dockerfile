FROM node:6.9.4

ENV PATH /root/.yarn/bin:$PATH
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.18.1

WORKDIR /app

COPY \
  package.json \
  yarn.lock \
  /app/
RUN yarn install

COPY . /app

FROM node:20-alpine

WORKDIR /app
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk --no-cache update && \
    apk --no-cache add chromium

COPY ["package.json", "package-lock.json", "./"]
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

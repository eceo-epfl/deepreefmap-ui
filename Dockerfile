FROM node:22.23.2-alpine AS builder

# Set the working directory in the container
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Copy the rest of your application source code to the container
COPY . .
RUN yarn build

FROM nginx:1.31-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose the port your application will listen on (if applicable)
EXPOSE 80

# Start your Yarn application
CMD ["nginx", "-g", "daemon off;"]

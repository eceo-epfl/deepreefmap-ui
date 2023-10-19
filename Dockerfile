FROM node:20.8.1-alpine as builder

# Set the working directory in the container
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of your application source code to the container
COPY . .
RUN yarn build

FROM nginx:1.12-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Expose the port your application will listen on (if applicable)
EXPOSE 80

# Start your Yarn application
CMD ["nginx", "-g", "daemon off;"]

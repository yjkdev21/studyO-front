# Stage 1: Build React app
FROM node:20 AS build

WORKDIR /app
COPY frontend/ .
RUN npm install
RUN npm run build

# Stage 2: Serve with serve
FROM node:20

WORKDIR /app
COPY --from=build /app/build /app/build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]

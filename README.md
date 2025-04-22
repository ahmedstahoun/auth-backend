
# Authentication API

A simple authentication API built using NestJS and MongoDB with Mongoose. This app provides endpoints for user registration, login, and user management.

## Description

This application provides secure authentication services using JWT (JSON Web Tokens) and MongoDB as the database. It is built with the powerful NestJS framework, ensuring scalability and maintainability.

## Prerequisites

- Node.js (v16 or later)
- npm (or Yarn)
- MongoDB instance (local or cloud)

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/auth-app.git
cd auth-app
```

### 2. Install dependencies

```bash
npm install
```

This will install all the necessary dependencies for the app to run.

### 3. Set up environment variables

Create a `.env` file in the root directory and configure the environment variables:

```env
SERVER_HOST=127.0.0.1
SERVER_PORT=3001

DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_NAME=authApp
DATABASE_USERNAME=
DATABASE_PASSWORD=

AUTH_JWT_KEY=secretKey
AUTH_JWT_ACCESS_TOKEN_EXPIRATION=300s
AUTH_JWT_ACCESS_REFRESH_EXPIRATION=24h
```

> 💡 If you're using MongoDB Atlas, make sure to update the database credentials accordingly.

### 4. Connect to MongoDB using Mongoose

#### Option 1: Using MongoDB locally

Ensure MongoDB is installed and running on your machine. Start it with:

```bash
mongod
```

This will start a local MongoDB instance on `mongodb://localhost:27017`.

#### Option 2: Using MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Create a new cluster.
3. Whitelist your IP and create a database user.
4. Copy the provided connection string and update your `.env` values accordingly.

### 5. Compile and run the project

For development mode:

```bash
npm run start:dev
```

For production mode:

```bash
npm run start:prod
```

### 6. Run tests

To run unit tests:

```bash
npm run test
```

For end-to-end tests:

```bash
npm run test:e2e
```

To check test coverage:

```bash
npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application, follow the deployment guide to deploy it efficiently.

If you're using cloud platforms like AWS, you can use Mau to deploy with ease:

```bash
npm install -g mau
mau deploy
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

## License

NestJS Authentication API is MIT licensed.

## Stay in touch

**Author** - Ahmed Tahoun

# Storefront Backend Project

### Installing

Simply, run the following command to install the project dependencies:

```bash
npm i
```

### Setup environment

First, create a `.env` file with all the required environment variables:

```bash
NODE_ENV=dev

DB_HOST=localhost
DB_USERNAME=<your_db_username>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
DB_NAME_TEST=<your_test_db_name>
DB_PORT=<your_db_port>

JWT_SECRET=<your_jwt_secret>
```

Next, you need to run the database migrations:

```bash
npm run migrations:up
```

## Running the application

Use the following command to run the application in watch mode:

```bash
npm run dev
```

Use the following command to run the application in using node:

```bash
npm start
```

The application will run on <http://localhost:5000/>.

## Running the unit tests

Use the following command to run the unit tests:

```bash
npm run test
```

## Built With

- [NodeJS](https://nodejs.org/) - The JavaScript runtime
- [db-migrate](https://db-migrate.readthedocs.io/en/latest/) - The database migration tool
- [Express](https://expressjs.com) - The web framework
- [TypeScript](https://www.typescriptlang.org/) - Types JS extension
- [Jasmine](https://jasmine.github.io/) - The unit testing framework

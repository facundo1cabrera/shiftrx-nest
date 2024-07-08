# The Auction Platform Backend
This is the backend for the auction application, developed using Node.js with TypeScript and NestJS. The application allows users to create and manage auctions, place bids, and view auctions' bids in real-time. It uses PostgreSQL for the database and Prisma as the ORM. Authentication is handled using JWT.

## instalation

This backend service is currently live [here](https://shiftrx-nest-production-10c1.up.railway.app/health-check), but here is the instalation guide if you want to run it locally:

1) clone the repository
```
  git clone https://github.com/facundo1cabrera/shiftrx-nest.git shiftrx-nest
  cd shiftrx-nest
```

2) rename the .env.example file to .env and:
    - add a random string to variables: JWT_SECRET_KEY and JWT_REFRESH_KEY
    -  
4) Run the following command to set up the database with docker
```
docker compose -f docker-compose.database.yml up -d
```

4) Run the following command to apply migrations
```
npx prisma migrate deploy
```

5) Replace the env variable DATABASE_URL in the .env file to:
```
DATABASE_URL="postgresql://postgres:asdfhasdfkjhasdfqwye8rudsaifnzxvnwrglkz@postgres:5432/shiftdb?schema=public"
```
6) Stop the database container
```
docker compose down
```

7) run the docker-compose file
```
docker compose up -d
```

8) Query all the endpoints with the Frontend or either with the postman collection.


## Run tests

This project has unit tests for the bid, auction and user services as well as integration tests for the BidController.
To run the tests you should clone the repository, install the dependencies and run npm run test
```
git clone https://github.com/facundo1cabrera/shiftrx-nest.git shiftrx-nest
cd shiftrx-nest
npm install
npm run test
```

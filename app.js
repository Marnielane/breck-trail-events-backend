const express = require('express');
// const bodyParser = require('body-parser-graphql');
const { graphqlHTTP } = require('express-graphql');
const port = process.env.PORT || 8000
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth')

const app = express();

dotenv.config();
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_DB
} = process.env

// app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
});

app.use(isAuth)

app.use(
    '/graphql', 
    graphqlHTTP({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true
    })
);

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${
            process.env.MONGO_PASSWORD
        }@cluster0.0uyib.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        console.log("connected")
        app.listen(port);
    })
    .catch(err => {
        console.log(err);
    });


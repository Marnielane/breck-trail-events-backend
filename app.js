const express = require('express');
// const bodyParser = require('body-parser-graphql');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Event = require('./models/event');

const app = express();
dotenv.config();
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_DB
} = process.env

// app.use(bodyParser.json());

app.use(
    '/graphql', 
    graphqlHTTP({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return Event.find()
                    .then(events => {
                        return events.map(event => {
                            return { ...event._doc, _id: event.id };
                        });
                    })
                    .catch(err => {
                        throw err;
                    });
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });
                return event
                    .save()
                    .then(result => {
                        console.log(result);
                        return { ...result._doc, _id: result._doc._id.toString() };
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    });
            }
        },
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


"use strict";
const http = require("http");
const request3 = require("request");
const path = require("path");
const express = require("express");
const ejs = require("ejs")
const bodyParser = require("body-parser"); 
const portNumber = process.env.PORT || 3000;
const app = express();
require("dotenv").config({ path: path.resolve(__dirname, './.env') });
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

async function main() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.djzkhh3.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    app.use(bodyParser.urlencoded({extended:false})); 
    try {
        client.connect();
        process.stdin.setEncoding("utf8");
        app.set("views", path.resolve(__dirname, "templates"));
        app.set("view engine", "ejs");

        app.use(express.static(__dirname+'/public'));

        app.get("/", (request, response) => {
            let category = 'food';
           

            request3.get({
                url: 'https://api.api-ninjas.com/v1/quotes?category=food',
                headers: {
                  'X-Api-Key': 'GGG1CnsIwtLV3ow1GYz8zQ==iYG3IQu8D2l5fhBs'
                },
              }, function(error, response2, body2) {
                if(error) return console.error('Request failed:', error);
                else if(response2.statusCode != 200) return console.error('Error:', response2.statusCode, body2.toString('utf8'));
                else { 
                    const temp = JSON.parse(body2);
                    for (var x of temp) {
                        const values = {quote : x.quote, author: x.author};
                        response.render(`index.ejs`, values);
                    }
                }
              });

        });
        app.get("/menu", (request, response) => {
            response.render(`menu.ejs`);
        });
        app.get("/about", (request, response) => {
            response.render(`about.ejs`);
        });
        app.get("/location", (request, response) => {
            response.render(`location.ejs`);
        });
        app.get("/mail", (request, response) => {
            const values = {
                portNumber : portNumber
            };
            response.render(`mail.ejs`, values);
        });
        app.get("/review", (request, response) => {
            const values = {
                portNumber : portNumber
            };
            response.render(`review.ejs`, values);
        });

        app.post("/mail", (request, response) => { 
            let {firstName, lastName, email, birthday} = request.body;
            const values = {
                firstName : firstName,
                lastName : lastName,
                email: email,
                birthday : birthday
            };
            client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(values);
            response.render(`mailConfirmation.ejs`, values)
        });
        app.post("/review", (request, response) => { 
            let {email} = request.body;
            let filter = {email: email};
            const result = client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

            result.then((res) => {
                if (res) {
                    const result = client.db(databaseAndCollection.db)
                   .collection(databaseAndCollection.collection)
                   .deleteOne(filter);

                    const values  = {
                        firstName : res.firstName,
                    }
                    response.render(`removed.ejs`, values);
                }
                else {
                    response.render(`emailNotFound.ejs`);
                }
            });
        })
        
        app.listen(portNumber);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
const { response } = require('express');
const express = require('express')

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

var cors = require('cors')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@myfirstcluster.duw99.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("fantasyKingdomDB");
        const servicesCollection = database.collection("services");

        // get all service detail
        app.get('/services', async (request, response) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            response.send(services);
        });

        // get specific service details
        app.get('/service/:id', async (request, response) => {
            const id = request.params.id;
            const query = { _id: ObjectId(id) };
            const order = await servicesCollection.findOne(query);
            response.send(order);

        });

        // POST API
        app.get('/addServices', async (request, response) => {

            // create a document to insert
            const service = {
                title: "Combo Package",
                include: [
                    "One Ticket for One person",
                    "Fantasy Kingdom Entry",
                    "8 Rides at Fantasy Kingdom",
                    "Water Kingdom Entry",
                    "Unlimited Rides at Water Kingdom",
                    "Xtreme Racing 3 Lap / 3D Cinema",
                    "Lunch / Dinner"
                ],
                price: 1500,
                image: "https://fantasykingdom.net/wp-content/uploads/2021/08/combo-package-2.jpg",
                description: "How to avail: Customers have to show the soft copy of this invoice to the information counter of Fantasy Kingdom Complex.<br/> <br/>Ticket validity: 15 days validity will be available from the invoice date.The ticket is not refundable.<br/> <br/>Park guidelines: Free Entry for Children under 3 feet to Fantasy Kingdom park only.Outside foods are not allowed.Some rides can be closed for maintenance.Everyone is required to wear a face mask during the visit.Temperature checks will be required upon arrival, and guests with a temperature of 100.4 degrees or greater will not be admitted.Management reserves the right to change the terms and conditions without any prior reason.<br/> <br/>Park Hours: Sunday - Thursday: 11 AM – 7: 00 PM and Friday & Saturday / Holiday: 10AM – 8: 00PM."
            }

            const result = await servicesCollection.insertOne(service);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        })

        const orderCollection = database.collection("orders");

        //add order
        app.post('/addOrder', async (request, response) => {
            const order = request.body;

            const result = await orderCollection.insertOne(order);
            console.log(result);
            response.send(result);
        });

        // get my order list
        app.get('/myOrder/:email', async (request, response) => {
            const email = request.params.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const myOrders = await cursor.toArray();
            response.send(myOrders);

        });

        // get all order list
        app.get('/allOrder', async (request, response) => {
            const cursor = orderCollection.find({});
            const myOrders = await cursor.toArray();
            response.send(myOrders);

        });

        // delete specific order
        app.delete('/deleteOrder/:id', async (request, response) => {
            const id = request.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            response.json(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
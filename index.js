const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Stripe secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

//Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.l1ydak8.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run (){
    try{
        const productsCollection = client.db('mobileBazar').collection('products');
        const categoryCollection = client.db('mobileBazar').collection('category');
        const bookingsCollection = client.db('mobileBazar').collection('bookings');
        const usersCollection = client.db('mobileBazar').collection('users');
        const addProductsCollection = client.db('mobileBazar').collection('addProducts');
        const paymentsCollection = client.db('mobileBazar').collection('payments');

        app.get('/products', async(req, res) =>{
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result)

        });

        app.get('/category/:name', async(req, res) => {
            const name = req.params.name;
            const filter = {name}
            const result = await categoryCollection.find(filter).toArray();
            res.send(result);
        });


        app.get('/categories/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const result = await categoryCollection.findOne(filter);
            res.send(result);
        });


        app.post('/bookings', async (req, res) => {
            const query = req.body
            const result = await bookingsCollection.insertOne(query)
            res.send(result)

        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await bookingsCollection.findOne(filter)
            res.send(result)
        });

        // create stripe payment method for mongodb database.
        app.post('/create-payment-intent', async(req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                'payment_method_types': [
                    'card'
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // create payment database for mongodb database
        app.post('/payments', async(req,res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);

            // update payment to bookingsCollection
            const id = payment.bookingId;
            const filter = {_id: ObjectId(id)}
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updateDoc)
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const query = req.body
            const result = await usersCollection.insertOne(query)
            res.send(result)

        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })





        app.put('/users/admin/:id', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        //My order data get
        app.get('/myorder', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await bookingsCollection.find(query).toArray()
            res.send(result);
        });

        app.post('/addproducts', async(req, res) =>{
            const query = req.body;
            const result = await addProductsCollection.insertOne(query)
            res.send(result)
        })

        app.get('/addproducts', async(req, res) => {
            const query = {};
            const addproducts = await addProductsCollection.find(query).toArray();
            res.send(addproducts);

        })
    }
    finally{

    }
}
run().catch(console.log);



app.get('/', async(req, res) => {
    res.send('Mobile Bazar is running')
})

app.listen(port, () => console.log(`Mobile Bazar is running on port ${port}`))
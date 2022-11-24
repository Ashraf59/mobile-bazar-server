const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


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

        app.get('/products', async(req, res) =>{
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result)

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
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;

const app = express();


//Middleware
app.use(cors());
app.use(express.json());


async function run (){
    
}
run().catch(console.log);



app.get('/', async(req, res) => {
    res.send('Mobile Bazar is running')
})

app.listen(port, () => console.log(`Mobile Bazar is running on port ${port}`))
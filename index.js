const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())

app.get('/', (req,res)=>{
    res.send("It's Funtown")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlguchx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const usersCollections = client.db('funtownFrolicDb').collection('users')
const classesCollections = client.db('funtownFrolicDb').collection('classes')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

app.post('/users', async(req,res) => {
    const user = req.body;
    console.log(user)
    // const user = {email: email}
    const result = await usersCollections.insertOne(user)
    res.send(result)
})

app.get('/classes', async(req,res) => {
    const query ={
        status: 'approved'
    }
    const result = await classesCollections.find(query).toArray();
    res.send(result)
})





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, (req,res) => {
    console.log('Funtown is running port', port)
})
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());

app.get('/', (req, res) => {
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

const verifyJwt = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: "Unauthorized access" })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: "Unauthorized access" })
        }
        req.decoded = decoded
        next()
    })
}

const usersCollections = client.db('funtownFrolicDb').collection('users')
const classesCollections = client.db('funtownFrolicDb').collection('classes')

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        // generate jwt token
        app.post('/jwt', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        // user related apis
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollections.findOne(query)
            if (existingUser) {
                return res.send({ message: 'User already exist' })
            }
            // const user = {email: email}
            const result = await usersCollections.insertOne(user)
            res.send(result)
        })

        // class related apis
        app.get('/classes', async (req, res) => {
            const query = {
                status: 'approved'
            }
            const options = {
                sort: { 'enrolled': -1 }
            }
            const result = await classesCollections.find(query, options).toArray();
            res.send(result)
        })

        // instructor related apis
        app.get('/instructors', async (req, res) => {
            const query = {}
            const options = {
                sort: { 'enrolled': -1 }
            }
            const result = await classesCollections.find(query, options).toArray();
            res.send(result)
        })
        app.get('/instructor', async (req, res) => {
            const result = await classesCollections.find().toArray()
            res.send(result)
        })
        app.get('/instructor/class', async (req, res) => {
            const query = { instructorEmail: req.query.email };
            const result = await classesCollections.find(query).toArray();
            res.send(result);
        })





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, (req, res) => {
    console.log('Funtown is running port', port)
})
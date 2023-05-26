const express = require('express')
const app = express()
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1eww0o2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,

});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err) => {
            if (err) {
                console.log(err)
                return err
            }
        });
        const kidsToySet = client.db('kidsToyDb').collection('toysCollection');


        app.get('/myToys/:email', async (req, res) => {

            const result = await kidsToySet
                .find({
                    email: req.params.email,
                })
                .toArray();
            res.send(result);
        })


        app.get("/allToys/:text", async (req, res) => {
            const text = req.params.text;

            const result = await kidsToySet
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },

                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get("/allToys", async (req, res) => {
            const limit = req.query.showAll === "true" ? 9999 : parseInt(req.query.limit) || 20; 
            try {
                const result = await kidsToySet.find().limit(limit).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error retrieving toys:", error);
                res.status(500).send({ error: "Internal server error" });
            }
        });



        app.get("/allToys/showAll", async (req, res) => {
            try {
                const result = await kidsToySet.find().toArray();
                res.send(result);
            } catch (error) {
                console.error("Error retrieving toys:", error);
                res.status(500).send({ error: "Internal server error" });
            }
        });


        app.get("/allToySingleInfo/:id", async (req, res) => {

            const result = await kidsToySet.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);
        });
        app.get("/toyTabDetails/:id", async (req, res) => {

            const result = await kidsToySet.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);
        });
        app.post('/addToys', async (req, res) => {
            const addedToys = req.body;

            const result = await kidsToySet.insertOne(addedToys);
            res.send(result);
        });
        app.put("/updateToy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description,
                },
            };
            const result = await kidsToySet.updateOne(filter, updateDoc);
            res.send(result);
        });
        app.delete('/deleteToy/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await kidsToySet.deleteOne(query)
            res.send(result);

        })

        app.post('/sortToys', async (req, res) => {
            try {
                const userEmail = req.body.userEmail;
                const sortOrder = req.body.sortOrder === 'ascending' ? 1 : -1;

                const sortedToys = await kidsToySet.find({ userEmail }).sort({ price: sortOrder }).toArray();
                res.json(sortedToys);
            } catch (error) {
                console.error('Error sorting toys:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('kidsToy is running')
})

app.listen(port, () => {
    console.log(`kidsToy Server is running on port ${port}`)
})
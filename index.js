const cors = require('cors');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3jci.mongodb.net/?retryWrites=true&w=majority`;
console.log('shoe shop connect');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('shoe-shop').collection('product');

        app.get('/product', async (req, res) => {
            // show all data from mongodb
            // const query = {};
            // const cursor = productCollection.find(query);
            // const products = await cursor.toArray();
            // res.send(products);

            // show page and size
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
           const cursor = productCollection.find(query);
           let products;
            if(page || size){
                // 0 --> skip: 0 get: 0-10(10):
                // 1 --> skip: 1*10 get: 11-20(10):
                // 2 --> skip: 2*10 get: 21-30(10):
                // 3 --> skip: 3*10 get: 31-40(10):
                // 4 --> skip: 4*10 get: 41-50(10):
                products = await cursor.skip(page*size).limit(size).toArray();
            }
        else{
            products = await cursor.toArray();
        }
          
            res.send(products);
        });

app.get('/productCount', async (req, res)=>{
    // rule first
// const query = {};
// const cursor = productCollection.find(query);
// const count = await cursor.count();
// res.send({count});
//rule second
const count = await productCollection.estimatedDocumentCount();
res.send({count});
})

// use post to get products by ids
app.post('/productByKeys', async(req, res)=>{
    const keys = req.body;
    const ids = keys.map(id => ObjectId(id));
    const query ={_id: {$in: ids}};
    const cursor = productCollection.find(query);
    const products = await cursor.toArray();
    // console.log(keys)
    res.send(products);
})

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('shoe shop is coming soon');
})

app.listen(port, () => {
    console.log('port is running ', port);
})
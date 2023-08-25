const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");

require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ug5vbmv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();

		const basicPackagesCollection = client.db("Rishita-Driving-School").collection("Basic Packages");
		const individualPackagesCollection = client.db("Rishita-Driving-School").collection("Individual Packages");
		const standardPackagesCollection = client.db("Rishita-Driving-School").collection("Standard Packages");

		const stateDB = client.db("RDS-State-Wise-Price");

		app.get("/basic-packages", async (req, res) => {
			const cursor = basicPackagesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/individual-packages", async (req, res) => {
			const cursor = individualPackagesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/standard-packages", async (req, res) => {
			const cursor = standardPackagesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/all-states", async (req, res) => {
			const collectionNames = await stateDB.listCollections().toArray();
			const names = collectionNames.map(collection => collection.name);
			res.send(names);
		});

		app.get("/get-state-data/:stateName", async (req, res) => {
			const stateName = req.params.stateName;
			const stateData = await stateDB.collection(stateName).find().toArray();
			res.send(stateData);
		});

		app.get("/state/price/:stateName", async (req, res) => {
			const stateName = req.params.stateName;
			const stateData = await stateDB.collection(stateName).find().toArray();
			res.send(stateData);
		});

		app.get("/state/price/:stateName/basic", async (req, res) => {
			const stateName = req.params.stateName;
			const stateData = await stateDB
				.collection(stateName)
				.find({ packageCategory: { $regex: "basic", $options: "i" } })
				.toArray();
			res.send(stateData);
		});
		app.get("/state/price/:stateName/standard", async (req, res) => {
			const stateName = req.params.stateName;
			const stateData = await stateDB
				.collection(stateName)
				.find({ packageCategory: { $regex: "standard", $options: "i" } })
				.toArray();
			res.send(stateData);
		});
		app.get("/state/price/:stateName/individual", async (req, res) => {
			const stateName = req.params.stateName;
			const stateData = await stateDB
				.collection(stateName)
				.find({ packageCategory: { $regex: "individual", $options: "i" } })
				.toArray();
			res.send(stateData);
		});

		app.post("/create-state-wise-price", (req, res) => {
			try {
				const packageData = req.body;
				console.log(packageData);

				const collection = stateDB.collection(packageData.stateName);

				collection.insertOne(packageData, (err, result) => {
					if (err) {
						console.error("Error inserting document:", err);
						res.status(500).json({ error: "An error occurred" });
					} else {
						res.status(201).json({ message: "Package created successfully" });
					}
				});
			} catch (error) {
				console.error("Error:", error);
				res.status(500).json({ error: "An error occurred" });
			}
		});

		app.post("/update-state-wise-price", async (req, res) => {
			try {
				const packageData = req.body;
				console.log(packageData);

				const collection = stateDB.collection(packageData.stateName);

				const result = await collection.replaceOne({ packageName: packageData.packageName }, packageData);
			} catch (error) {
				console.error("Error:", error);
				res.status(500).json({ error: "An error occurred" });
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

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

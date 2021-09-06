const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0hcik.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cors());
app.use(express.static("news"));
app.use(express.static("review"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello from db it's working working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const newsCollection = client.db("news").collection("news");
  const ordersCollection = client.db("news").collection("orders");
  const adminCollection = client.db("news").collection("admin");

  app.post("/news", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const textarea = req.body.textarea;
    const price = req.body.price;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    newsCollection
      .insertOne({ name, textarea, price, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  app.get("/news", (req, res) => {
    newsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    newsCollection.findOneAndDelete({ _id: id }).then((result) => {
      res.send(!!result.value);
    });
  });

  app.get("/singleNews/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    newsCollection.find({ _id: id }).toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/admin", (req, res) => {
    const order = req.body;
    adminCollection.insertOne(order).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    console.log(email);
    adminCollection.find({ email: email }).toArray((err, items) => {
      res.send(items.length > 0);
    });
  });
});

app.listen(process.env.PORT || port);

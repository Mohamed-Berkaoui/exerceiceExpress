const express = require("express");
const path = require("path");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const cluster = new MongoClient(process.env.DB_URI);

const app = express();

function connectToCollection() {
  return cluster.db("app").collection("todos");
}
app.use(express.static(path.join(__dirname, "styles")));

app.use(express.urlencoded({ extended: true }));

app.get("/", async function (req, res) {
  try {
    const todos = await connectToCollection().find().toArray();
    res.render("index.ejs", { todos });
  } catch (error) {
    res.send(error.message);
  }
});
app.get("/addtodo", function (req, res) {
  res.render("addtodo.ejs");
});

app.post("/addtodo", async function (req, res) {
  //{task:}
  try {
    const todosCollection = connectToCollection();
    await todosCollection.insertOne({ ...req.body, status: false });
    res.redirect("/addtodo");
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/update", async function (req, res) {
  //{id:}
  try {
    const task = await connectToCollection().findOne({
      _id: new ObjectId(req.body.id),
    });
    const updatedTask = await connectToCollection().updateOne(
      { _id: new ObjectId(req.body.id) },
      { $set: { status: !task.status } }
    );
    if (updatedTask.modifiedCount == 1) res.redirect("/");
    else {
      throw new Error();
    }
  } catch (error) {
    res.send(error.message);
  }
});
app.listen(process.env.PORT, async () => {
  await cluster.connect();
  console.log("server running on port 8000");
});

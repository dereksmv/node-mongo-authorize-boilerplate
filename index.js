const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();

const users = require("./controllers/userController");

const db = process.env.MONGO_URI;

const port = process.env.PORT;

mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false } )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err))

app.use(express.json());
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

app.use("/api/authorize", users);

app.listen(port, console.log("Server up and running on port " + port))

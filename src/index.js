const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require('dotenv').config({path: __dirname + '/.env'});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

const app = express();

app.use(express.static("../public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Home.html");
});

app.get("/:position", function (req, res) {
  res.sendFile(__dirname + "/Login.html");
});

app.post("/:position", function (req, res) {
  //console.log(req.params);
  //req.params is either student or faculty or facultyUpload
  //req.body is Email and Passowrd
  //console.log(req.params);
  if (req.params.position === "Faculty") {
    res.sendFile(__dirname + "/faculty.html");
  } else if (req.params.position === "facultyUpload") {
    // we need to access the files here to store them in google drive
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    let sampleFile = req.files.UploadedFile;
    const uploadPath = __dirname + "/uploads/" + sampleFile.name;
    sampleFile.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err);

      res.send("File uploaded!");
    });
  }
});

app.listen("3000", function () {
  console.log("Server is ready at port 3000");
});

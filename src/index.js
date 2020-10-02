const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});



//----------------DB Section-------------------------------//
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to mongocloud");
});

const UserSchema=mongoose.Schema({
  Email:String,
  Password:String
});

const FacultyDB=mongoose.model('faculty',UserSchema);
const StudentDB=mongoose.model('student',UserSchema);

//----------------DB Section-------------------------------//



//---------------------Declarations-----------------------//
const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload());

app.set('view engine', 'ejs'); 


//---------------------Declarations-----------------------//


//---------------------Gets-----------------------//

app.get("/", function (req, res) {
  //res.sendFile(__dirname + "/Home.html");
  res.render("Home");
});

app.get("/:position", function (req, res) {
  //res.sendFile(__dirname + "/Login.html");
  const data={
    Warning:""
  }
  res.render("Login",data);
});

//---------------------Gets-----------------------//




app.post("/:position", async function (req, res) {
  //console.log(req.params);
  //req.params is either student or faculty or facultyUpload
  //req.body is Email and Passowrd
  //console.log(req.params);
  if(req.params.position==='Student'){
    StudentDB.findOne(req.body,function(err,responce){
      if(err){
        res.send(err);
      }
      else if(responce==null){
          // should raise an error
          //res.sendFile(__dirname+'/Login.html')
          const data={
            Warning:"UserName or Passowrd is wronge",
          }
          res.render("Login",data);
      }
      else{
        res.sendFile("student login is succesfull");
      }
    });
  }
  if (req.params.position === "Faculty") {
    await FacultyDB.findOne(req.body,function(err,responce){
      if(err){
        res.send(err);
      }
      else if(responce==null){
        // should raise an error
         // res.sendFile(__dirname+'/Login.html');
         const data={
          Warning:"UserName or Passowrd is wronge",
        }
        res.render("Login",data);
      }
      else{
        //res.sendFile(__dirname + "/faculty.html");
        res.render('faculty');
      }
    })
    
  } 
  else if (req.params.position === "facultyUpload") {
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

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});
const fs = require('fs');


//---------------Make Upload Directory8--------------------//
function MakdeUploadDir(path,data){
    if(data==null){
      return null;
    }
    else{
      let keys=Object.keys(data);
      keys.forEach(element => {
        if(!fs.existsSync(path+"/"+element)){
          fs.mkdirSync(path+"/"+element);
        }
        MakdeUploadDir(path+element+'/',data[element]);
      });
    }
}


let rawdata = fs.readFileSync('src\\data.json');
let data=JSON.parse(rawdata);

path=__dirname+"/uploads/"
MakdeUploadDir(path,data.years);// this will create a os directory as data.json data

//---------------Make Upload Directory8--------------------//


//----------------DB Section-------------------------------//
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to mongocloud");
});

const UserSchema=mongoose.Schema({
  Name:String,
  Designation:String,
  Branch:String,
  Email:String,
  Year:String,
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
  if(req.params.position === "SignUp"){
    res.render("SignUp");
  }
  else{
    const data={
      Warning:""
    }
    res.render("Login",data);

  }
  //res.sendFile(__dirname + "/Login.html");
  
});

//---------------------Gets-----------------------//


async function StudentLogin(req,res){
  await StudentDB.findOne(req.body,function(err,responce){
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
      res.render('student');
    }
  });
}

async function FacultyLogin(req,res){
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
  });
}

async function UploadRequest(req,res){
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  console.log(req.body);
  let sampleFile = req.files.UploadedFile;
  let year=req.body.Year+"\\";
  let branch=req.body.Branch+"\\";
  let subject=req.body.subject+"\\";
  const uploadPath = __dirname + "\\uploads\\" +year+branch+subject+sampleFile.name;
  console.log(uploadPath);
  sampleFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    res.send("File uploaded!");
  });
}

async function AddUser(req,res){
  if(req.body.Designation==='student'){
    const data=new StudentDB(req.body);
    await data.save();
    res.send('data is uploaded to data base');
  }
  else{
    const data=new FacultyDB(req.body);
    await data.save();
    res.send('data is uploaded to data base');
  }
  
}



app.post("/:position", async function (req, res) {
  //console.log(req.params);
  //req.params is either student or faculty or facultyUpload
  //req.body is Email and Passowrd
  //console.log(req.params);
  if(req.params.position==='Student'){
    await StudentLogin(req,res);
  }
  else if (req.params.position === "Faculty") {
    await FacultyLogin(req,res);
  } 
  else if (req.params.position === "facultyUpload") {
    // we need to access the files here to store them in google drive
    await UploadRequest(req,res);
  }
  else if(req.params.position === "SignUp"){
    await AddUser(req,res);
  }
});

app.listen("3000", function () {
  console.log("Server is ready at port 3000");
});

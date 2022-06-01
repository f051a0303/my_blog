/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _____Chi Ming Lai______ Student ID: ___158400200_____ Date: __31-05-2022_______
*
*  Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/
var express = require("express");
const res = require("express/lib/response");
var app = express();
var path = require ("path");
const data = require("./blog-service.js");
var HTTP_PORT = process.env.PORT || 8080;


app.use(express.static("public"));

var onHTTPStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
}

// homepage but redirect to about
app.get("/",function(req,res){
    res.redirect("/about");
});

//about page using html file
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/blog",(req,res)=>{
    data.getPublishedPosts().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log("Failed to show blog");
    });
});

app.get("/posts",(req,res)=>{
    data.getAllPosts().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log("Failed to show posts");
    });
});

app.get("/categories",(req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log("Failed to show categories");
    });
});

app.use((req,res)=>{
    res.status(404).sendFile(path.join(__dirname, "views/error.html"));
});

// start the server 
data.initialize().then(()=>{
    app.listen(HTTP_PORT,onHTTPStart);
}).catch((err)=>{
    console.log("Failed to start the server: " + err);
});
    
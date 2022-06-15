/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _____Chi Ming Lai______ Student ID: ___158400200_____ Date: __14-06-2022_______
*
*  Online (Heroku) Link: ______https://boiling-earth-40990.herokuapp.com/______
*
********************************************************************************/
// require libraries
var express = require("express");
const res = require("express/lib/response");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
//
// set cloudinary config
cloudinary.config({
    cloud_name:'daem860r2',
    api_key:'871195893638831',
    api_secret:'rm1sLymdDlU31kNuWOjpYkD_iMc',
    secure:true
});

const upload = multer();

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

// new routes
app.get("/posts/add",(req,res)=>{
    res.sendFile(path.join(__dirname, "views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        data.addPost(req.body).then(()=>{
            res.redirect("/posts");
        });
    });
});


// blog route
app.get("/blog",(req,res)=>{
    data.getPublishedPosts().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log("Failed to show blog");
    });
});

// posts route  - assignment 3
app.get("/posts",(req,res)=>{

    // if no filter
    if(!req.query.category && !req.query.minDate){
        data.getAllPosts().then((data)=>{
            res.json(data);
        }).catch((err)=>{
            console.log("Failed to show posts");
        });
    }

    // if by category
    if(req.query.category){
        data.getPostsByCategory(parseInt(req.query.category)).then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.json({message: "no results returned"});
            console.log("Failed to show posts by category");
        });
    }
    // if by min Date
    if(req.query.minDate){
        data.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.json({message: "no results returned"});
            console.log("Failed to show posts by min Date");
        });
    }
});

// query posts by id // assignment 3
app.get("/post/:id", (req,res)=>{
    data.getPostById(req.params.id).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message: "no results returned"});
        console.log("Failed to show posts by ID");
    });

});




// categories route
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
    
/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _____Chi Ming Lai______ Student ID: ___158400200_____ Date: __30-06-2022_______
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
var app = express();
//
// set cloudinary config
cloudinary.config({
    cloud_name:'daem860r2',
    api_key:'871195893638831',
    api_secret:'rm1sLymdDlU31kNuWOjpYkD_iMc',
    secure:true
});

const upload = multer();

var path = require ("path");
const data = require("./blog-service.js");
const { isAbsolute } = require("path");
var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers:{
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
    } }));
app.set('view engine', '.hbs');


// new middleware function
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

var onHTTPStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
}

// homepage but redirect to about
app.get("/",function(req,res){
    res.redirect("/blog");
});

//assignment 4, change to hbs
app.get("/about", function(req,res){

    res.render('about',{
        data: isAbsolute,
        layout: "main"
    });
});

//assignment 4, change to hbs
app.get("/posts/add",(req,res)=>{
   
    res.render('addPost',{
    data: isAbsolute,
    layout: "main"
   });
});


// assignment 3
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


app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts; // "posts" is a object array refers to array of posts
        viewData.post = post; // "post" is a single object refers to the latest post

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await data.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// assignment 4 update to res.render
app.get("/posts",(req,res)=>{

    // if no filter
    if(!req.query.category && !req.query.minDate){
        data.getAllPosts().then((data)=>{
            res.render("posts",{posts:data, layout:"main"});
        }).catch((err)=>{
            res.render("posts", {message: "no results"});
            console.log("Failed to show posts");
        });
    }

    // if by category
    if(req.query.category){
        data.getPostsByCategory(parseInt(req.query.category)).then((data)=>{
            res.render("posts",{posts:data, layout:"main"});
        }).catch((err)=>{
            res.render("posts", {message: "no results returned"});
            console.log("Failed to show posts by category");
        });
    }
    // if by min Date
    if(req.query.minDate){
        data.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.render("posts",{posts:data, layout:"main"});
        }).catch((err)=>{
            res.render("posts", {message: "no results returned"});
            console.log("Failed to show posts by min Date");
        });
    }
});


// assignment 4 update render
app.get("/post/:id", (req,res)=>{
    data.getPostById(req.params.id).then((data)=>{
        res.render("posts",{posts:data, layout:"main"});
    }).catch((err)=>{
        res.render("posts", {message: "no results returned"});
        console.log("Failed to show posts by ID");
    });

});


// assignment 4 update render
app.get("/categories",(req,res)=>{
    data.getCategories().then((data)=>{
        res.render("categories",{categories:data, layout:"main"});
    }).catch((err)=>{
        res.render("categories", {message: "no results"});
        console.log("Failed to show categories");
    });
});

app.use((req,res)=>{
    res.status(404).render("error", {layout:"main"});
});

// start the server 
data.initialize().then(()=>{
    app.listen(HTTP_PORT,onHTTPStart);
}).catch((err)=>{
    console.log("Failed to start the server: " + err);
});
    
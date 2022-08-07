/****************************************************************************** 
*  Name: _____Chi Ming Lai______ Student ID: ___158400200_____ Date: __26-07-2022_______
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
const clientSessions = require('client-sessions');
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
const authData = require("./authService.js");

const { isAbsolute } = require("path");
var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));

//-------------------------------------------------------------//
//-------------------------Client Session----------------------//
// a6 middle ware (client sessions)
app.use(clientSessions({
    cookieName:"session",
    secret:"Web322Application",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

// middleWare
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
})

// Helper middleware function
var ensureLogin = (req,res,next)=>{
    if(!req.session.user){
        res.redirect("/login");
    }else{
        next();
    }
}
//-------------------------Client Session----------------------//
//-------------------------------------------------------------//

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
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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

// new middleware for add categories
app.use(express.urlencoded({extended:true}));

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
app.get("/posts/add", ensureLogin, (req,res)=>{
   data.getCategories().then((data)=>{
        res.render("addPost", {categories: data});
   }).catch((err)=>{
    res,render("addPost", {categories: []});
   })
});

//as5 function
app.get("/categories/add", ensureLogin, (req,res)=>{
   
    res.render('addCategory',{
    data: isAbsolute,
    layout: "main"
   });
});


// assignment 3
app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req,res)=>{

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
        }).catch((err)=>{
            res.render("posts", {message: "failed to add post"});
        })
    });
});

// as5 
app.post("/categories/add", ensureLogin, (req,res)=>{

    data.addCategory(req.body).then(()=>{
        res.redirect("/categories");
    })
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

// as5 updated
app.get("/posts", ensureLogin, (req,res)=>{

    // if no filter
    if(!req.query.category && !req.query.minDate){
        data.getAllPosts().then((data)=>{
            if(data.length >0){
                res.render("posts",{posts:data, layout:"main"});
            }else{
                res.render("posts", {message: "no results"});
            }
        }).catch((err)=>{
            res.render("posts", {message: "no results"});
            console.log("Failed to show posts");
        });
    }

    // if by category
    if(req.query.category){
        data.getPostsByCategory(parseInt(req.query.category)).then((data)=>{
            if(data.length >0){
                res.render("posts",{posts:data, layout:"main"});
            }else{
                res.render("posts", {message: "no results"});
            }
        }).catch((err)=>{
            res.render("posts", {message: "no results returned"});
            console.log("Failed to show posts by category");
        });
    }
    // if by min Date
    if(req.query.minDate){
        data.getPostsByMinDate(req.query.minDate).then((data)=>{
            if(data.length >0){
                res.render("posts",{posts:data, layout:"main"});
            }else{
                res.render("posts", {message: "no results"});
            }
        }).catch((err)=>{
            res.render("posts", {message: "no results returned"});
            console.log("Failed to show posts by min Date");
        });
    }
});


// assignment 4 update render
app.get("/post/:id", ensureLogin, (req,res)=>{
    data.getPostById(req.params.id).then((data)=>{
        res.render("posts",{posts:data, layout:"main"});
    }).catch((err)=>{
        res.render("posts", {message: "no results returned"});
        console.log("Failed to show posts by ID");
    });

});


// assignment 4 update render
app.get("/categories", ensureLogin, (req,res)=>{
    data.getCategories().then((data)=>{
        if(data.length >0){
            res.render("categories",{categories:data, layout:"main"});
        }else{
            res.render("categories", {message: "no results"});
        }
    }).catch((err)=>{
        res.render("categories", {message: "no results"});
        console.log("Failed to show categories");
    });
});

app.get("/categories/delete/:id", ensureLogin, (req,res)=>{
    data.deleteCategoryById(req.params.id).then(()=>{
        res.redirect("/categories");
    }).catch((err)=>{
        res.status(500).send({message: "Unable to Remove Category/Category not found"});
        console.log("Unable to Remove Category/Category not found");
    })
})

app.get("/posts/delete/:id", ensureLogin,  (req,res)=>{
    data.deletePostById(req.params.id).then(()=>{
        res.redirect("/posts");
    }).catch((err)=>{
        res.status(500).send({message: "Unable to Remove Post/Post not found"});
        console.log("Unable to Remove Post/Post not found");
    })
})

// -------------------- Login -----------------------------

app.get("/login", (req,res)=>{
    res.render("login",{layout:"main"});
})

app.get("/register", (req,res)=>{
    res.render("register",{layout:"main"});
})


app.post("/register",(req,res)=>{
    authData.registerUser(req.body).then(()=>{
        res.render("register",{successMessage:"User created"});
    }).catch((err)=>{
        res.render("register",{errorMessage:err, userName:req.body.userName});
    });
})

app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user)=>{
        req.session.user = {
            userName:user.userName,
            email:user.email,
            loginHistory:user.loginHistory
        }

        res.redirect('/posts');
    }).catch((err)=>{
        res.render("login",{errorMessage:err, userName:req.body.userName});
    });
})

app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect('/');
})

app.get("/userHistory",ensureLogin,(req,res)=>{
    res.render("userHistory",{layout:"main"});
})



//---------------------------------------------------------


app.use((req,res)=>{
    res.status(404).render("error", {layout:"main"});
});

// start the server updated
data.initialize().then(authData.initialize).then(()=>{
    app.listen(HTTP_PORT,onHTTPStart);
}).catch((err)=>{
    console.log("Failed to start the server: " + err);
});




    
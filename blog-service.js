const fs = require ("fs");

let posts = [];
let categories = [];

module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        fs.readFile("./data/posts.json", (err,data)=>{
            if(err){
                reject(err);
            }
            else{
                posts = JSON.parse(data);
            }
        });
        fs.readFile("./data/categories.json", (err,data1)=>{
            if(err){
                reject(err);
            }
            else{
                categories = JSON.parse(data1);
                resolve();
            }
        });
    });
}

// All posts
module.exports.getAllPosts = function(){
    return new Promise((resolve,reject)=>{
        if(posts.length == 0){
            reject("No posts returned");
        }
        else{
            resolve(posts);
        }
    });
}

// published Posts
module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        let publishedPosts = [];
        for(let i = 0; i < posts.length; i++){
            if(posts[i].published == true){
                publishedPosts.push(posts[i]);
            }
        }

        if(posts.length == 0){
            reject("No posts returned");
        }else{
            resolve(publishedPosts);
        }

    });
}

// All categories
module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        if(categories.length == 0){
            reject("No categories returned");
        }else{
            resolve(categories);
        }
    });
}

// Add post
module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{
        
        postData.id = posts.length + 1; // set the id property of postData to be the length of the "posts" array plus one (1). 
        postData.published = (postData.published)? true:false; //o	If postData.published is undefined, explicitly set it to false, otherwise set it to true    
        posts.push(postData);  // o	Push the updated PostData object onto the "posts" array 
        resolve(); // resolve the Promise
    });
}



// assignment 3 function
module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject)=>{
        let selectedPosts = [];
        console.log(category);
        for(let i = 0; i < posts.length; i++){
            if(posts[i].category == category){ 
                selectedPosts.push(posts[i]);
            }
        }

        if(posts.length == 0){
            reject("no results returned");
        }else{
            resolve(selectedPosts);
        }
    });
}

// assignment 3 function
module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject)=>{
        let selectedPosts = [];
        for(let i = 0; i < posts.length; i++){
            if(new Date(posts[i].postDate) >= new Date(minDateStr)){
               selectedPosts.push(posts[i]);
            }
        }

        if(posts.length == 0){
            reject("no results returned");
        }else{
            resolve(selectedPosts);
        }
    });
}

// Assignment 3 function
module.exports.getPostById = function(id){
    return new Promise((resolve, reject)=>{
        let matchPost;
        let isFound = false;
        for(let i = 0; i < posts.length && isFound == false; i++){
            if(posts[i].id == id){
                matchPost = posts[i];
                isFound = true;
            }
        }

        if(isFound == false){
            reject("no result returned");
        }else{
            resolve(matchPost);
        }
    })
}
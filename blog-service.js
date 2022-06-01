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
const Sequelize = require('sequelize');
var sequelize = new Sequelize('dbgfc016d0sq8j', 'kzpbqlyhqinmpw', 'ea0c1d458c7788bcbeacaa549410b5084de4819eb95559bba22c13cb08c0f1c1', {
    host: 'ec2-44-195-162-77.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl:{rejectUnauthorized: false}
    },
    query:{raw: true}
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});


var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});


Post.belongsTo(Category, {foreignKey: 'category'});

// as5 updated
module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{
        sequelize.sync().then(()=>{
            resolve();
        }).catch(()=>{
            reject("unable to sync the database");
        });
    });
}

// as5 updated
module.exports.getAllPosts = function(){
    return new Promise((resolve, reject)=>{
        Post.findAll().then((data)=>{
            resolve(data);
        }).catch(()=>{
            reject("no results returned");
        });
    });
}

// changes maybe needed later on
module.exports.getPostsByCategory = function(p_category){
    return new Promise((resolve, reject)=>{
        Post.findAll({
            where:{
                category:p_category
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

// as5 updated
module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject)=>{
        const {gte} = Sequelize.Op;
        Post.findAll({
            where:{
                postDate:{
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
        
    });
}

// changes maybe needed later
module.exports.getPostById = function(p_id){
    return new Promise((resolve, reject)=>{
        Post.findAll({
            where:{
                id:p_id
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}


module.exports.addPost = function (postData) {
    return new Promise((resolve, reject)=>{
        postData.published = postData.published ? true : false;

        for (var prop in postData) {
            if (postData[prop] === '')
                postData[prop] = null;
        }

        postData.postDate = new Date();

        Post.create(postData).then(()=> {
            resolve();
        }).catch((err) => {
            reject("unable to create post");
        });

    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject)=>{
        for(var i in categoryData){
            if(categoryData[i] == ""){
                categoryData[i] = null;
            }
        }

        Category.create(categoryData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to create category");
        });
    })
}



// as5 updated
module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject)=>{
        Post.findAll({
            where:{
                published: true
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

// as5 updated
module.exports.getPublishedPostsByCategory = function(p_category){
    return new Promise((resolve, reject)=>{
        Post.findAll({
            where:{
                published:true,
                category:p_category
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}


// as5 updated
module.exports.getCategories = function(){
    return new Promise((resolve, reject)=>{
        Category.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}


module.exports.deleteCategoryById = function(p_id){
    return new Promise((resolve, reject)=>{
        Category.destroy({
            where:{
                id:p_id
            }
        }).then(function(){
            resolve();
        }).catch((err)=>{
            reject("deletion was rejected");
        });
    });
}

module.exports.deletePostById = function(p_id){
    return new Promise((resolve, reject)=>{
        Post.destroy({
            where:{
                id:p_id
            }
        }).then(function(){
            resolve();
        }).catch((err)=>{
            reject("deletion was rejected");
        });
    });
}














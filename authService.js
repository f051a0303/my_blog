var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

// define what a user schema should looks like
var userSchema = new Schema({
    "userName":{
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[
        {
            "dateTime":Date,
            "userAgent":String
        }
    ]
});

let User;

// initialize the connection to mongodb
module.exports.initialize = function(){
    return new Promise(function(resolve,reject){
        let db = mongoose.createConnection("mongodb+srv://alexlai7777:F051a0303@senecaweb.emtof.mongodb.net/web322_week8");
        
        db.on('error',err=>{
            reject(err);
        });
        db.once('open',()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

function containSpaces(str){
    for(let i = 0; i < str.length; ++i){
        if(str[i] == " "){
            return true;
        }
    }
}


// User registration/Sign up
module.exports.registerUser = function(userData){
    return new Promise(function(resolve, reject){
        if(userData.password != userData.password2){
            reject("Passwords do not match");
        }else if(containSpaces(userData.password) || containSpaces(userData.userName)){ //UserName or password not allow to have spaces
            reject("User name and password cannot contain spaces");
        }else{
            bcrypt.hash(userData.password,10).then(hash=>{
                userData.password = hash; // stored the encrypted password to userData before saving it to database
                let newUser = new User(userData);
                newUser.save((err)=>{
                    if(err){
                        if(err.code == 11000){
                            reject("User Name already taken");
                        }else{
                            reject("There was an error creating the user: " + err);
                        }
                    }else{
                        resolve();
                    }
                })
            }).catch((err)=>{
                reject("There was an error encrypting the password");
            });
        }
    })
}

// check User is existed or not 
// will return the user object if both userName and password is correct
module.exports.checkUser = function(userData){
    return new Promise(function(resolve,reject){
        User.find({userName:userData.userName})
        .exec()
        .then((users)=>{
            if(!users){
                reject("Unable to find user: " + userData.userName);
            }else{
                if(userData.password == users[0].password){
                    console.log("pass password is: " + userData.password + "database password is: " + users[0].password);
                }
                // decrypt and compare the from user and database, return true if same, false otherwise
                bcrypt.compare(userData.password,users[0].password).then((result)=>{
                    if(result){
                        users[0].loginHistory.push({dateTime:(new Date()).toString(), userAgent:userData.userAgent});

                        User.updateOne(
                            {userName:users[0].userName},
                            {$set:{loginHistory:users[0].loginHistory}}
                        ).exec().then(()=>{
                            resolve(users[0]);
                        })
                    }else{
                        reject("Incorrect Password for user: " + userData.userName);
                    }

                }).catch((err)=>{
                    reject("Unknown error occur when comparing decrypted message: " + err);
                });
            }
        }).catch((err)=>{
            reject("Unable to find user: " + userData.userName);
        });
    })

}
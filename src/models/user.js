const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const path = require("path");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const fs = require("fs");

const userSchema = mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 1
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: (value) => {
            if(!validator.isEmail(value)){
                throw new Error("Email is not a valid email!");
            }
        }
    },
    password:{
        type: String,
        required: true,
        minLength: 7,
        validate: (value) => {
            if(value.toLowerCase().includes("password")){
                throw new Error("Password should not have the word password!");
            }
        }
    },
    profileImage: {
        type: String,
        default: "profile.png"
    },
    confirm:{
        type: Boolean,
        default: false
    }
});

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});

userSchema.pre("save", async function(next){
    const user = this;

    if(user.isModified("password")){
        user.password = await bcryptjs.hash(user.password, 8);
    }

    next();
});

userSchema.statics.findByCredentials = async (email, password) => { 
    const user = await User.findOne({email: email});

    if(!user){
        return {error: "Invalid Credentials."}
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if(!isMatch){
        return {error: "Invalid Credentials."}
    }

    if(!user.confirm){
        return {error: "Please confirm your email!"}
    }

    return user;
}

userSchema.statics.getPublicData = (user) => {
    return {
        _id: user._id,
        name: user.name,
        age: user.age,
        email:user.email,
        profileImage: user.profileImage
    }
}

userSchema.statics.uploadAvatar = async (file) => {
    const fileExtension = file.name.split(".").pop();

    // Only allow allowed files
    const allowedFiles = ["jpg", "png", "jpeg", "JPEG"];

    if(!allowedFiles.includes(fileExtension)){
        return {error: "Please upload image files!"};
    }

    // Check if the file size exceed the limit
    const allowedSize = 2 * 1024 * 1024;

    if(file.size > allowedSize){
        return {error: "File size should be less than 2mb!"};
    }

    // give unique name for the file
    const fileName = new ObjectId().toHexString() + "." + fileExtension;
    
    // save the file
    try{
        await file.mv(path.resolve("./public/images/" + fileName));
        return {fileName: fileName};
    }catch(e){
        return {error: "Something went wrong. Unable to upload profile image!"}
    }       
}

userSchema.statics.removeProfileImage = (fileName) => {
    fs.unlink("./public/images/" + fileName, (e) => {
        if(e){
            console.log(e);
        }
    });
}

const User = mongoose.model("User", userSchema);

module.exports = User;


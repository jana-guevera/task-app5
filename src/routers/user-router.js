const express = require("express");
const User = require("../models/user.js");

const authApi = require("../middleware/api-auth.js");
const auth = require("../middleware/auth.js");

const email = require("../utils/email.js");

const router = express.Router();

// ===================================== Routes For Pages =========================================
router.get("/", (req, res) => {
    if(req.session.user){
        req.session.user = undefined;
    }   

    res.render("index", {msg: req.query.msg});
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/profile", auth, async (req, res) => {
    res.render("profile", {user: req.session.user});
});

router.get("/confirm_account", async (req, res) => {
    const userId = req.query.userid;

    try{
        const user = await User.findByIdAndUpdate(userId, {confirm: true});

        if(user){
            return res.redirect("/?msg=Email confirmed. Please login!");
        }

        res.redirect("/");
    }catch(e){
        res.redirect("/");
    }
});

// ===================================== Resource Endpoints for User model =====================================
router.post("/api/users/login", async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if(user.error){
            return res.send(user);
        }

        req.session.user = user;
        res.send(User.getPublicData(user));
    }catch(e){
        res.send("Something went wrong. Unable to login!");
    }
});

router.post("/api/users", async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        await email.sendConfirmEmail(user);
        res.send(User.getPublicData(user));
    }catch(e){
        console.log(e);
        res.send({error: e.message});
    }
});

router.get("/api/users", authApi, async (req, res) => {
    const id = req.session.user._id;

    try{
        const user = await User.findById(id, {password: 0});

        if(user){
            return res.send(user);
        }

        res.send({error: "User not found!"});
    }catch(e){
        res.send({error: "Something went wrong. Please try again!"});
    }
});

router.patch("/api/users", authApi, async (req, res) => {
    const id = req.session.user._id;

    const allowedUpdates = ["name", "age", "password", "email", "profileImage"];
    const updates = Object.keys(req.body);

    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if(!isValid){
        return res.send({error: "Invalid updates!"});
    }

    if(req.files){
        const file = await User.uploadAvatar(req.files.profileImage);

        if(file.error){
            return res.send(file.error);
        }

        req.body.profileImage = file.fileName;
        updates.push("profileImage");
    }

    try{
        const user = await User.findById(id);
        const prevImage = user.profileImage;

        if(!user){
            return res.send({error: "User not found!"});
        }

        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        await user.save();
        req.session.user = User.getPublicData(user);
        res.send(User.getPublicData(user));

        if(req.body.profileImage && prevImage !== "profile.png"){
            User.removeProfileImage(prevImage);
        }
    }catch(e){
        res.send({error: e.message});
    }
});

router.delete("/api/users", authApi, async (req, res) => {
    const id = req.session.user._id;

    try{
        const user = await User.findByIdAndDelete(id);

        if(user){
            return res.send(User.getPublicData(user));
        }

        res.send({error: "User not found!"});
    }catch(e){
        res.send({error: "Something went wrong. Please try again!"});
    }
});

module.exports = router;
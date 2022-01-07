const express = require("express");
const Task = require("../models/task.js");

const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth");

const router = express.Router();


//========================================== Pages Routes for Task model ===================================
router.get("/tasks", auth, (req, res) => {
    res.render("tasks", {user: req.session.user});
});

//========================================== Resource Endpoints (API) for Task model ===================================
router.post("/api/tasks", apiAuth, async (req, res) => {
    req.body.owner = req.session.user._id;
    const task = new Task(req.body);

    try{
        await task.save();
        res.send(task);
    }catch(e){
        res.send({error: e.message});
    }
});

router.get("/api/tasks", apiAuth, async (req, res) => {
    const ownerID = req.session.user._id;
    try{
        var tasks = [];

        if(req.query.search){
            tasks = await Task.find({owner: ownerID, description: {$regex: req.query.search, $options: "i"}});
        }else{
           tasks = await Task.find({owner: ownerID});
        }

        res.send(tasks);
    }catch(e){
        res.send({error: "Something went wrong. Please try again!"});
    }
});

router.get("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOne({_id: id, owner: req.session.user._id});

        if(task){
            return res.send(task);
        }

        res.send({error: "Task not found!"});

    }catch(e){
        res.send({error: "Something went wrong. Please try again!"});
    }
});

router.patch("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);

    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if(!isValid){
        return res.send({error: "Invalid updates!"});
    }

    try{
        const task = await Task.findOneAndUpdate({_id: id, owner: req.session.user._id}, req.body, {new: true});
        if(task){
            return res.send(task)
        }

        res.send({error: "Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

router.delete("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({_id: id, owner: req.session.user._id});

        if(task){
            return res.send(task);
        }

        res.send({error: "Task not found!"});
    }catch(e){
        res.send({error: "Something went wrong. Please try again!"});
    }
});

module.exports = router;
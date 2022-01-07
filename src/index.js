const path = require("path");
const express = require("express");
const hbs = require("hbs");
const session = require("express-session");
const fileUpload = require("express-fileupload");

require("./db/mongoose.js");

const userRouter = require("./routers/user-router.js");
const taskRouter = require("./routers/task-router.js");

const app = express();
const port = process.env.PORT;

app.use(session({secret: process.env.SESSION_SECRET, saveUninitialized: true, resave: true}));

const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");

app.use(express.static(publicPath));
app.use(fileUpload());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


console.log(process.env.PORT);
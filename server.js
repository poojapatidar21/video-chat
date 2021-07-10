const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser  = require('body-parser');
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));


import user from "./models/user.js"

mongoose.connect('mongodb+srv://Pooja_Patidar:K44U2kBCG42.4q.@cluster0.gdgqn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true});
app.get("/", (req, res) => {
  res.render("login", { roomId: req.params.room });
});
app.get("/start", (req, res) => {
  res.render("start", { roomId: req.params.room });
});
app.get("/room", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function () {
  // app.get("/:room", (req, res) => {
  //   res.render("room", { roomId: req.params.room });
  // });
  app.post("/addUser", async (req, res) => {
    console.log("1")
    console.log(req.body);
    let result = await user.find({ userName: req.body.userName })
    console.log(result)
    if (result.length > 0) {
      res.json({status:404,msg:"username already exist"})
    }
    else {
      var user1 = new user({
        userName:req.body.userName,
        password: req.body.password,
      });
      await user1.save();
      res.json({status:200,msg:"username added"})
    }
  });
 });

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId,userName);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
  socket.on("disconnect", (userId,userName)=>{
    socket.broadcast.emit("callended",userId,userName);
  });
});


server.listen(process.env.PORT || 3030);
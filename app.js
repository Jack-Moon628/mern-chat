let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);


app.use(express.static("public"));
app.set("views", __dirname + "/views");

app.get("/", function(req, res){
    res.sendFile("index.html", { root : "./views" });
});

io.on("connection", function(socket){
    console.log("user connected.");

    socket.on("message", function(msg){
        console.log(socket.id + " message: " + msg);
        let reMsg = {
            name : "Hugo",
            time : getTime(),
            msg : msg
        }
        io.emit("message", reMsg);
    });
});

server.listen(3000);
console.log("Listening on http://*:3000");

function getTime(){
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
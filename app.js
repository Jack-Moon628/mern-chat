let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);


app.use(express.static("public"));
app.set("views", __dirname + "/views");

app.get("/", function(req, res){
    res.sendFile("index.html", { root : "./views" });
});

app.get("/avator/", function(req, res){
    res.send("heihei.");
});

// connected/online users' list
let connectedUsers = [];

io.on("connection", function(socket){
    console.log("user connected.");

    let client = {
        socket : socket,
        name : null
    }

    // send user list online
    socket.emit("msg userlist", connectedUsers);

    socket.on("message", function(msg){
        if(client.name == null){
            client.name = msg;

            let bcMsg = {
                name : client.name,
                msg : "enter",
                type : "system",
                status : "green-text"
            }

            connectedUsers.push({
                name: client.name,
                time: getTime()
            });
            // send user list online
            io.emit("msg userlist", connectedUsers);

            io.emit("message", bcMsg);
        }else{
            console.log(client.name + "'s message: " + msg);
            let reMsg = {
                name : client.name,
                time : getTime(),
                msg : msg,
                type : "msg"
            }
            socket.broadcast.emit("message", reMsg);
        }
        
    });

    socket.on('disconnect', function(){
        // update online userlist
        connectedUsers.splice(connectedUsers.indexOf(client.name));
        io.emit("msg userlist", connectedUsers);

        let bcMsg = {
            name : client.name,
            msg : "leave",
            type : "system",
            status : "red-text"
        }
        console.log(client.name + " disconnected.");
        io.emit("message", bcMsg);
    })
});

server.listen(3000);
console.log("Listening on http://*:3000");

function getTime(){
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
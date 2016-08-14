let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);
let fs = require("fs");


app.use(express.static("public"));
app.set("views", __dirname + "/views");
app.set("public", __dirname + "/public");

app.get("/", function(req, res){
    res.sendFile("index.html", { root : "./views" });
});

app.get("/avator/", function(req, res){
    let avatorList = fs.readdirSync(app.get("public") + "/img/");
    res.send(avatorList);
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

    socket.on("message", function(obj){
        if(client.name == null){
            client.name = obj.msg;

            let bcMsg = {
                name : client.name,
                msg : "enter",
                type : "SYSTEM",
                status : "green-text"
            }

            connectedUsers.push({
                name: client.name,
                avator: obj.avator,
                time: getTime()
            });
            // send user list online
            io.emit("msg userlist", connectedUsers);

            io.emit("message", bcMsg);
        }else{
            console.log(client.name + "'s message: " + obj.msg);
            let reMsg = {
                name : client.name,
                time : getTime(),
                msg : obj.msg,
                avator: obj.avator,
                type : "BROADCAST_USER"
            }
            socket.broadcast.emit("message", reMsg);
        }
        
    });

    socket.on("change avator", function(imgUrl){
        let index = getIndex(connectedUsers, "name", client.name);
        let currentClient = connectedUsers[index];
        currentClient.avator = imgUrl;

        io.emit("online user update", connectedUsers);
    });

    socket.on('disconnect', function(){
        if(client.name != null){
            let bcMsg = {
                name : client.name,
                msg : "leave",
                type : "SYSTEM",
                status : "red-text"
            }
            console.log(client.name + " disconnected.");

            connectedUsers.splice(getIndex(connectedUsers, "name", client.name));
            
            io.emit("message", bcMsg);
            io.emit("online user update", connectedUsers);
        }
    })
});

server.listen(3000);
console.log("Listening on http://*:3000");

function getTime(){
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function getIndex(arr, key, val){
    for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if(e[key] == val){
            return i;
        }
    }
}
'use strict'

let express = require("express");
let app = express();
let server = require("http").createServer(app);
let io = require("socket.io")(server);
let fs = require("fs");
let util = require('util');


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
let clientList = [];

io.on("connection", function(socket){
    console.log("user connected.");

    let client = {
        id : socket.id,
        name : null
    }

    console.log("socket: " + util.inspect(socket, true, 0, true));
    // console.log("client list: " + util.inspect(io.sockets.clients().sockets, true, 1, true));
    // console.log("equal? " + (socket == io.sockets.clients().sockets[socket.id]));

    // send user list online
    socket.emit("msg userlist", connectedUsers);

    socket.on("message", function(obj){
        if(client.name == null){
            // check if name exist
            let index = getIndex(connectedUsers, "name", obj.msg);
            if(index == -1){
                client.name = obj.msg;

                let bcMsg = {
                    name : client.name,
                    action : "enter",
                    actionObj : "Chatroom",
                    type : "SYSTEM",
                    status : "green-text"
                }

                clientList.push({
                    name: client.name,
                    id: socket.id
                });

                connectedUsers.push({
                    name: client.name,
                    avator: obj.avator,
                    time: getTime()
                });
                // send user list online
                io.emit("msg userlist", connectedUsers);

                io.emit("message", bcMsg);

                console.log("new user: " + client.name);
            }else{
                let bcMsg = {
                    name : 'Name: "' + obj.msg + '"',
                    action : "already",
                    actionObj : "EXISTED",
                    type : "SYSTEM",
                    status : "red-text",
                    repeat : 1
                }

                socket.emit("message", bcMsg);
            }

        }else{
            console.log(client.name + "'s message: " + obj.msg);
            console.log(client.name + "'s private: " + (obj.private == 1));
            // console.log(client.name + "'s connected: " + client.socket.connected);
            // let tmp_index = getIndex(clientList, "name", client.name);
            // console.log(client.name + " client socket: " + util.inspect(client.socket, true, 0, true));
            // console.log(clientList[tmp_index].name + " clientList socket: " + util.inspect(clientList[tmp_index].socket, true, 0, true));
            // console.log("if eq: " + client.socket == clientList[tmp_index].socket);
            if(obj.private == 1){
                console.log("target: " + util.inspect(obj.target, true, null, true));
            }
            let reMsg = {
                name : client.name,
                time : getTime(),
                msg : obj.msg,
                avator: obj.avator,
                type : obj.private == 1 ? "PRIVATE_USER" : "BROADCAST_USER"
            }

            if(obj.private == 1){
                // for (let i = 0; i < obj.target.length; i++) {
                //     if(obj.target[i] && obj.target[i].hasOwnProperty("isPrivateTgt") == true && obj.target[i].isPrivateTgt == true){
                //         let name = obj.target[i].name;
                //         let index = getIndex(clientList, "name", name);
                //         console.log("private tgt: " + util.inspect(clientList[index], false, 1, true));
                //         clientList[index].socket.emit("message", reMsg);
                //     }
                // }
                for (let key in obj.target) {
                    if (obj.target.hasOwnProperty(key)) {
                        let elem = obj.target[key];
                        if(elem.isPrivateTgt == true){
                            let name = elem.name;
                            let index = getIndex(clientList, "name", name);
                            let socketId = clientList[index].id;
                            console.log("socketId: " + socketId);
                            io.sockets.clients().sockets[socketId].emit("message", reMsg);
                        }
                    }
                }
                // console.log("connected users: " + util.inspect(clientList, false, 1, true));
                // socket.broadcast.emit("message", reMsg);                
            }else{
                socket.broadcast.emit("message", reMsg);
            }
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
                action : "leave",
                actionObj : "Chatroom",
                type : "SYSTEM",
                status : "red-text"
            }
            console.log(client.name + " disconnected.");

            connectedUsers.splice(getIndex(connectedUsers, "name", client.name), 1);

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
    if(arr.length == 0) return -1;
    for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if(e[key] == val){
            return i;
        }
    }
    return -1;
}
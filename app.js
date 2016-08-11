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
});

server.listen(3000);
console.log("Listening on http://*:3000");
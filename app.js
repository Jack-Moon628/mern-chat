let express = require("express");

let app = express();

app.use(express.static("public"));
app.set("views", __dirname + "/views");

app.get("/", function(req, res){
    res.send("<h2>Socket.io Chat</h2>");
});

app.listen(3000);
console.log("Listening on http://*:3000");
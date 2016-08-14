let username = null;

// angular
let app = angular.module("app", []);
app.controller("appCtrl", function($scope){
    $scope.avatorUrl = "img/3.png";
})

app.controller("msgListCtrl", function($scope){
    $scope.users = [];
});

app.controller("userOnlineCtrl", function($scope){
    $scope.userOnlineList = [];
});

app.controller("avatorCtrl", function($scope, $http){
    $scope.avatorList = [];

    $http.get("/avator/").success(function(res){
        $scope.avatorList = res;
    });

    $scope.selectAvator = function($event){
        let $img = $($event.target);

        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        $sc.avatorUrl = $img.attr("src");
    }
});

//socket.io
let socket = io();

$("#msg-input").keydown(function(event){
    if(event.keyCode == 13){
        sendMsg($(this));
    }
});

$("#msg-sendbtn").click(function(event){
    sendMsg($("#msg-input"));
});

function sendMsg($inputElem){
    let msg = $inputElem.val();
    if(msg == "") return;

    socket.send(msg);
    $inputElem.val("");

    if(username == null){
        username = msg;
        $("#username").text(msg);
    }else{
        let newMsg = {
            name : username,
            time : getTime(),
            msg : msg,
            type : "msg",
            align : "right-align"
        }
        msgListAdd(newMsg);
    }
}

socket.on("message", function(msg){
    msgListAdd(msg);
});

socket.on("msg userlist", function(msg){
    let $elem = angular.element('[ng-controller=userOnlineCtrl]');
    let $scope = $elem.scope();

    $scope.userOnlineList = msg;
    $scope.$apply();
})

function msgListAdd(msg){
    let $elem = angular.element('[ng-controller=msgListCtrl]');
    let $scope = $elem.scope();
    $scope.users.push(msg);
    $scope.$apply();

    // scroll to the end of message list
    let liElem = $("#msg-list").children().last().get(0);
    liElem.scrollIntoView({block: "end", behavior: "smooth"});
}

function getTime(){
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
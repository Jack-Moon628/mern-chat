// angular
let app = angular.module("app", []);
app.controller("appCtrl", function($scope){
    $scope.currentUserInfo = {
        name: null,
        avator: ""
    }
})

app.controller("msgListCtrl", function($scope){
    $scope.users = [
        {
            name : "Choose",
            action : "YOUR NAME",
            actionObj : "First",
            type : "SYSTEM",
            status : "red-text"
        }
    ];
});

app.controller("userOnlineCtrl", function($scope){
    $scope.userOnlineList = [];
});

app.controller("avatorCtrl", function($scope, $http){
    $scope.avatorList = [];

    $http.get("/avator/").success(function(res){
        $scope.avatorList = res;

        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        $sc.currentUserInfo.avator = "img/" + Math.floor(Math.random() * 8 + 1) + ".png";
    });

    $scope.selectAvator = function($event){
        let $img = $($event.target);

        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        $sc.currentUserInfo.avator = $img.attr("src");

        if($sc.currentUserInfo.name != null){
            // broadcast new avator
            socket.emit("change avator", $sc.currentUserInfo.avator);
        }
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

socket.on("message", function(msg){
    msgListAdd(msg);

    if(msg.repeat == 1){
        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        let currentUserInfo = $sc.currentUserInfo;

        currentUserInfo.name = null;
        $("#username").text("Your name:");

        $sc.$apply();
    }
});

socket.on("msg userlist", function(msg){
    let $elem = angular.element('[ng-controller=userOnlineCtrl]');
    let $scope = $elem.scope();

    $scope.userOnlineList = msg;
    $scope.$apply();
});

socket.on("online user update", function(res){
    let $scope = angular.element("[ng-controller=userOnlineCtrl]").scope();
    $scope.userOnlineList = res;
    $scope.$apply();
})

function sendMsg($inputElem){
    let msg = $inputElem.val();
    if(msg == "") return;

    let $sc = angular.element("[ng-controller=appCtrl]").scope();
    let currentUserInfo = $sc.currentUserInfo;

    let obj = {
        msg: msg,
        avator: currentUserInfo.avator 
    }
    socket.send(obj);
    $inputElem.val("");

    if(currentUserInfo.name == null){
        currentUserInfo.name = msg;
        $("#username").text(msg);
        $("#profile-username").text(msg);
        $sc.$apply();
    }else{
        let newMsg = {
            name : currentUserInfo.name,
            time : getTime(),
            msg : msg,
            type : "CURRENT_USER",
        }
        msgListAdd(newMsg);
    }
}

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
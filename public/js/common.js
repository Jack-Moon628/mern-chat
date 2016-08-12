let username = null;

// angular
let app = angular.module("app", []);
app.controller("msgListCtrl", function($scope){
    $scope.users = [];
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
            time : '2014',
            msg : msg,
            type : "msg",
            align : "right-align"
        }

        msgListAdd(newMsg);

        // let $elem = angular.element('[ng-controller=msgListCtrl]');
        // let $scope = $elem.scope();
        // $scope.users.push(newMsg);
        // $scope.$apply();

        // // scroll to the end of message list
        // let liElem = $("#msg-list").children().last().get(0);
        // liElem.scrollIntoView({block: "end", behavior: "smooth"});
    }
}

socket.on("message", function(msg){
    // let $elem = angular.element('[ng-controller=msgListCtrl]');
    // let $scope = $elem.scope();
    // $scope.users.push(msg);
    // $scope.$apply();

    // // scroll to the end of message list
    // let liElem = $("#msg-list").children().last().get(0);
    // liElem.scrollIntoView({block: "end", behavior: "smooth"});
    msgListAdd(msg);
});

function msgListAdd(msg){
    let $elem = angular.element('[ng-controller=msgListCtrl]');
    let $scope = $elem.scope();
    $scope.users.push(msg);
    $scope.$apply();

    // scroll to the end of message list
    let liElem = $("#msg-list").children().last().get(0);
    liElem.scrollIntoView({block: "end", behavior: "smooth"});
}
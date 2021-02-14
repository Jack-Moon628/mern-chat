// angular
let app = angular.module("app", []);
app.controller("appCtrl", function($scope) {
    $scope.currentUserInfo = {
        name: null,
        avator: ""
    };

    $scope.privateMode = 0;
    $scope.showShortcut = 0;

    $scope.offlineNotify = function() {
        let elem = $("<span>Choose your <span class='blue-text text-lighten-2'>Name</span></span>");
        Materialize.toast(elem, 3000);
    }

    $scope.setting = function() {
        console.log("setting clicked.");
        $("#settingModal").openModal();
    }
})

app.controller("msgListCtrl", function($scope) {
    $scope.users = [
        // {
        //     name : "Choose",
        //     action : "YOUR NAME",
        //     actionObj : "First",
        //     type : "SYSTEM",
        //     status : "red-text"
        // }
    ];
});

app.controller("userOnlineCtrl", function($scope) {
    $scope.userOnlineList = [];
});

app.controller("avatorCtrl", function($scope, $http) {
    $scope.avatorList = [];

    $http.get("/avator/").success(function(res) {
        $scope.avatorList = res;

        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        $sc.currentUserInfo.avator = "img/" + Math.floor(Math.random() * 8 + 1) + ".png";
    });

    $scope.selectAvator = function($event) {
        let $img = $($event.target);

        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        $sc.currentUserInfo.avator = $img.attr("src");

        if ($sc.currentUserInfo.name != null) {
            // broadcast new avator
            socket.emit("change avator", $sc.currentUserInfo.avator);
        }
    }
});

//socket.io
let socket = io();

$("#msg-input").keydown(function(event) {
    if (event.keyCode == 13) {
        sendMsg($(this));
    }
});

$("#msg-sendbtn").click(function(event) {
    sendMsg($("#msg-input"));
});

socket.on("message", function(msg) {
    msgListAdd(msg);

    // can not be online if username already existed
    if (msg.repeat == 1) {
        let $sc = angular.element("[ng-controller=appCtrl]").scope();
        let currentUserInfo = $sc.currentUserInfo;

        currentUserInfo.name = null;
        $sc.$apply();
    }
});

socket.on("msg userlist", function(msg) {
    let $elem = angular.element('[ng-controller=userOnlineCtrl]');
    let $scope = $elem.scope();

    $scope.userOnlineList = msg;
    $scope.$apply();
});

socket.on("online user update", function(res) {
    let $scope = angular.element("[ng-controller=userOnlineCtrl]").scope();
    $scope.userOnlineList = res;
    $scope.$apply();
})

function sendMsg($inputElem) {
    // grab data from input value
    let msg = $inputElem.val();
    // check data
    if (msg == "") return;

    // get scope for using currentUserInfo
    let $sc = angular.element("[ng-controller=appCtrl]").scope();
    let currentUserInfo = $sc.currentUserInfo;

    // contruct obj to transport to server
    let obj = {
        msg: msg,
        avator: currentUserInfo.avator,
        private: angular.copy($sc.privateMode)
    }

    /**
     * if private mode is enabled.
     * send userlist who can get private msg to server.
     */
    if (obj.private == 1) {
        let $sc = angular.element("[ng-controller=userOnlineCtrl]").scope();
        let target = $sc.userOnlineList;
        obj = Object.assign(obj, { target: target });
    }
    socket.send(obj);

    // set msg input to be ""
    $inputElem.val("");

    // check currentUserInfo.name
    if (currentUserInfo.name == null) {
        currentUserInfo.name = msg;
        $sc.$apply();
    } else {
        let newMsg = {
            name: currentUserInfo.name,
            time: getTime(),
            msg: msg,
            type: $sc.privateMode == 1 ? "CURRENT_PRIVATE_USER" : "CURRENT_USER"
        }
        msgListAdd(newMsg);
    }
}

function msgListAdd(msg) {
    let $elem = angular.element('[ng-controller=msgListCtrl]');
    let $scope = $elem.scope();
    $scope.users.push(msg);
    $scope.$apply();

    // scroll to the end of message list
    let liElem = $("#msg-list").children().last().get(0);
    liElem.scrollIntoView({ block: "end", behavior: "smooth" });
}

function getTime() {
    let date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}
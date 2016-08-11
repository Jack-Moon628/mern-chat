// angular
let app = angular.module("app", []);
app.controller("msgListCtrl", function($scope){
    $scope.users = [];

    //socket.io
    let socket = io();

    $("#msg-input").keydown(function(event){
        if(event.keyCode == 13){
            let msg = $(this).val();
            if(msg == "") return;
            socket.send(msg);
            $(this).val("");
        }
    })

    socket.on("message", function(msg){
        let s = angular.element("#body").scope();
        let $elem = angular.element('[ng-controller=msgListCtrl]');
        // alert($elem.attr("id"));
        let $scope = $elem.scope();
        $scope.users.push({
            name : msg.name,
            time : msg.time,
            msg : msg.msg
        });
        $scope.$apply();
    });

});

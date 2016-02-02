define(['app'],
    function (app) {
        app.controller('globalIconsController', [
            '$scope', '$rootScope', 
            function ($scope, $rootScope) {
                'use strict';

                //$scope.showAppMenu = false;
                //$rootScope.showSearchBox = false;
                $rootScope.showContextMenu = false;
                $scope.openAppMenu = function () {
                    //$scope.showAppMenu = true;
                    $rootScope.$broadcast("appMenuShow");
                };

                //$scope.openSearchBox = function () {
                //    $rootScope.showSearchBox = true;
                //    //$rootScope.$broadcast("appMenuShow");
                //};

                //$scope.openContextMenu = function () {
                //    alert('hi');
                //    //$rootScope.showContextMenu = true;
                //    //$rootScope.$broadcast("appMenuShow");
                //};

                //$scope.colseApp = function () {
                //    $scope.showAppMenu = false;
                //};

                $scope.saveUserSettings = function () {
                    var data = leftContextMenuService.buildContent($rootScope.showContextMenu);
                    leftContextMenuService.saveUserSettings(data, $rootScope.loggedInUser.UserId);
                };

            }]);
    });
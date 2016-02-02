define(['app'], function (app) {
    app.controller('leftContextMenuController', ['$scope', '$rootScope', 'leftContextMenuService',
        function ($scope, $rootScope, leftContextMenuService) {

            'use strict';

            leftContextMenuService.getLeftContextMenuUserSettings(1).then(function (data) {
                if (data) {
                    var item = angular.fromJson(data.Content);
                    $rootScope.showContextMenu = true;
                } else {
                    $rootScope.showContextMenu = true;
                }
            });

            leftContextMenuService.getDesktopAppDownloadUrl().then(function (downloadurl) {
                $scope.desktopAppDownloadUrl = downloadurl;
            });

            if (!angular.isFunction($scope.onCreateMenuClick)) {
                $scope.onCreateMenuClick = function () {
                    $state.go($scope.editStateName);
                };
            }

            $scope.showFilterBox = function () {
                $scope.leftFilterMenuVisibility.isHidden = !$scope.leftFilterMenuVisibility.isHidden;
            };

            $scope.saveUserSettings = function () {
                var data = leftContextMenuService.buildContent($rootScope.showContextMenu);
                leftContextMenuService.saveUserSettings(data, 1);
            };

            $scope.$on('$destroy', function () {
                $rootScope.showContextMenu = false;
            });
        }]);
});
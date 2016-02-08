define(['app'],
function (app) {
    app.controller('userGridContainerController', [
        '$scope',
        '$rootScope',
        'genericGridCommonService',
        function (
            $scope,
            $rootScope,
            genericGridCommonService) {
            'use strict';

            $rootScope.resources = {};
            $rootScope.loggedInUser = { UserId: 1 };


            $scope.leftFilterMenuVisibility = {
                isHidden: false
            };

            $scope.stateData = {
                style: {
                    cssFile: 'css/user-mgmt.css',
                    cssClass: 'user-mgmt'
                },
                contextTpl: 'templates/context-menu.html'
            };
            genericGridCommonService.gridRequestModel.businessCaseTypes = null;
            genericGridCommonService.gridRequestModel.leftMenuFilter = $scope.selectedLeftMenu;
            $scope.gridType = 'kendo';

            $scope.activeSearchConfig = {
                hasActiveSearch: false,
                searchCriteriaBox: false
            };

            $scope.showFilterBox = function () {
                $scope.leftFilterMenuVisibility.isHidden = !$scope.leftFilterMenuVisibility.isHidden;
            };

            $scope.hideFilter = function () {
                $scope.leftFilterMenuVisibility.isHidden = true;
                $scope.$root.showContextMenu = false;
            };

            $scope.resetActiveSearchArea = function () {
                $scope.activeSearchConfig.hasActiveSearch = false;
                $scope.activeSearchConfig.searchCriteriaBox = false;
            }
        }
    ]);
});
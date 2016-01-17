define(['shell/app', 'shellService/login-service'], function (app) {
    app.controller('genericSearchTemplateController', [
        '$scope','$rootScope',
        'gridSearchService',
        'busyScreenService', function ($scope, $rootScope,
            gridSearchService,
            busyScreenService) {
            'use strict';

            //ng-controller="genericSearchTemplateController"

            $scope.searchModel = {};

            $scope.showFields = function () {
                gridSearchService.addNewField();
            };

            $scope.searchByFields = function () {
                busyScreenService.open();
                gridSearchService.refresh();
                busyScreenService.close();
            };

            $scope.searchCriteriaBox = false;

            $scope.searchText = function () {
                busyScreenService.open();
                gridSearchService.refresh();
                busyScreenService.close();
                //$rootScope.showSearchBox = !$rootScope.showSearchBox;
            };

            /*$scope.searchTextOnEnterKeyPress = function ($event) {
                if ($event.keyCode == 13) {
                    $scope.searchText();
                }
            };*/

            $scope.selectCategory = function (searchCriteria) {
                gridSearchService.selectCriteria(searchCriteria);
            };

            $scope.deleteSavedSearch = function (searchId) {
                busyScreenService.open();
                gridSearchService.deleteSavedSearch(searchId).then(function () {
                    busyScreenService.close();
                });
            };

            $scope.$on("saveCriteria", function (event, savedSearchData) {
                gridSearchService.save(savedSearchData);
            });

            $scope.loadSavedSearch = function (searchId) {
                gridSearchService.loadSavedSearch($scope.searchModel, searchId);
            };
        }
    ]);
});
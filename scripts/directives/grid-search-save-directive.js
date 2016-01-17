define(['shell/shell-directive-module', 'shell/services/generic-list/saved-search-category-service'],
    function (shellDirectiveModule) {
        shellDirectiveModule.directive('gridSearchSave', ['genericGridCommonService', 'genericGridSettingService', '$rootScope', 'notificationService', 'savedSearchCategoryService', 'gridSearchService',
            function (genericGridCommonService, genericGridSettingService, $rootScope, notificationService, savedSearchCategoryService, gridSearchService) {
                'use strict';

                return {
                    restrict: 'A',
                    templateUrl: 'shell/partials/generic-list/grid-search-save.html',
                    replace: true,

                    controller: ['$scope', function ($scope) {

                        $scope.sharingOptions = [
                            { Id: 1, Name: 'Privat' },
                            { Id: 2, Name: 'Öffentlich' }
                        ];

                        function getSavedSearchCategory() {
                            savedSearchCategoryService.get().then(function (data) {
                                $scope.savedSearchCategories = data;
                                $scope.reloadTemplatedAutocomplete = !$scope.reloadTemplatedAutocomplete;
                            });
                        }

                        getSavedSearchCategory();

                        $scope.saveSearchBoxData = {};
                        $scope.saveSearchCategory = function () {
                            var categoryName = $("#searchCategoryText").val();
                            savedSearchCategoryService.save(categoryName).then(function () {
                                getSavedSearchCategory();
                            });

                        };

                        $scope.saveCriteria = function () {
                            //$rootScope.$broadcast("saveCriteria", $scope.saveSearchBoxData);
                            gridSearchService.save($scope.saveSearchBoxData);
                            $scope.isSearchSaveBoxOpen = false;
                            $scope.saveSearchBoxData = {};
                        };
                    }]
                };

            }]);
    });

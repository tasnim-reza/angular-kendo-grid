define(['shell/shell-directive-module', 'shell/services/generic-list/saved-search-category-service'],
    function (shellDirectiveModule) {
        shellDirectiveModule.directive('gridFilterMenu', ['genericGridCommonService', 'genericGridSettingService', '$rootScope', 'notificationService', 'savedSearchCategoryService', 'gridSearchService',
            function (genericGridCommonService, genericGridSettingService, $rootScope, notificationService, savedSearchCategoryService, gridSearchService) {
                'use strict';

                return {
                    restrict: 'A',
                    templateUrl: 'shell/partials/generic-list/grid-filter-menu.html',
                    replace: true,
                    scope: {
                        gridMenuConfig: '=config'
                    },
                    controller: ['$scope', function ($scope) {

                        $scope.removeTag = function (tag, filter) {
                            tag.IsSelected = !tag.IsSelected;
                            $scope.gridMenuConfig.refreshGrid($scope.gridMenuConfig.stateGenericSearch);
                            filter.IsSelected = _.where(filter.filterData, { IsSelected: true }).length > 0;
                        };

                        $scope.removeFieldTag = function (tag) {
                            tag.value = "";
                            _.each(tag.field.FieldData, function (fieldData, i) {
                                tag.field.FieldData[i] = {};
                                tag.field.FieldData[i].Value = "";
                            });

                            $scope.gridMenuConfig.refreshGrid($scope.gridMenuConfig.stateGenericSearch);
                        };

                        $scope.removeSearchKeyTag = function () {
                            $scope.gridMenuConfig.stateGenericSearch.selectedSearchCriteria.searchText = "";
                            $scope.gridMenuConfig.stateGenericSearch.SearchKey = "";
                            $scope.gridMenuConfig.refreshGrid($scope.gridMenuConfig.stateGenericSearch);
                        };
                    }]
                };

            }]);
    });

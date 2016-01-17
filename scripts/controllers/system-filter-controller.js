//define(['shell/app'], function (app) {
//    app.controller('systemFilterController', ['gridSearchService', '$scope', 'genericListLeftMenuService', 'genericGridCommonService',
//        function (gridSearchService, $scope, genericListLeftMenuService, genericGridCommonService) {
//            'use strict';

//            $scope.systemFilterModel = gridSearchService.getSearchModel();

//            $scope.onLeftMenuClick = function (filter) {
//                gridSearchService.deselectFilters();
//                gridSearchService.clearActiveSearch();
//                filter.IsActive = true;
//                gridSearchService.refresh();
//                $scope.systemFilterModel.showConditionalFilter = true;
//                $scope.activeSearchConfig.hasActiveSearch = false;
//            };
//        }]);
//});
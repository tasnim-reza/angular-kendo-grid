define(['app'], function (app) {
    app.controller('genericSearchController', [
        '$scope',
        'gridSearchService',
        'busyScreenService',
        'genericGridCommonService',
        '$timeout',
        'rowSelectionColumnCheckBoxService',

        function (
            $scope,
            gridSearchService,
            busyScreenService,
            genericGridCommonService,
            $timeout,
            rowSelectionColumnCheckBoxService
            ) {
            'use strict';

            $scope.searchModel = gridSearchService.getSearchModel();

            $scope.searchText = function () {
                //rowSelectionService.clearSelection();
                rowSelectionColumnCheckBoxService.resetRowSelection();
                if ($scope.searchModel.SearchKey) $scope.activeSearchConfig.hasActiveSearch = true;
                else $scope.activeSearchConfig.hasActiveSearch = false;

                gridSearchService.executeRegisteredFunc(gridSearchService.registeredFuncKey.onSearchText);

                busyScreenService.open();
                gridSearchService.refresh();
                busyScreenService.close();
            };

            $scope.showFields = function () {
                gridSearchService.addNewField();
            };

            $scope.searchByFields = function () {
                //rowSelectionService.clearSelection();
                rowSelectionColumnCheckBoxService.resetRowSelection();

                gridSearchService.executeRegisteredFunc(gridSearchService.registeredFuncKey.onSearchByFields);

                busyScreenService.open();
                $scope.activeSearchConfig.hasActiveSearch = true;
                gridSearchService.refresh();
                $scope.activeSearchConfig.searchCriteriaBox = true;
                busyScreenService.close();
            };

            $scope.selectCategory = function (searchCriteria, filter) {
                //rowSelectionService.clearSelection();

                gridSearchService.executeRegisteredFunc(gridSearchService.registeredFuncKey.onSelectCategory);

                rowSelectionColumnCheckBoxService.resetRowSelection();
                gridSearchService.selectCriteria(searchCriteria, filter);
                $timeout(function () {
                    $scope.checkActiveSearch();
                }, 1000);

            };

            $scope.deleteSavedSearch = function (tag) {
                busyScreenService.open();

                if (tag.IsSelected) {
                    gridSearchService.clearActiveSearch();
                    //$scope.searchModel.systemFilters.FilterMenu.FilterMenuItems[0].IsSelected = true;
                    $scope.activeSearchConfig.hasActiveSearch = false;
                    genericGridCommonService.refreshGrid();
                }

                gridSearchService.deleteSavedSearch(tag.Id).then(function () {
                    busyScreenService.close();
                });
            };

            $scope.loadSavedSearch = function (savedSearchItem) {

                gridSearchService.executeRegisteredFunc(gridSearchService.registeredFuncKey.onLoadSavedSearch);

                //rowSelectionService.clearSelection();
                rowSelectionColumnCheckBoxService.resetRowSelection();
                $scope.activeSearchConfig.hasActiveSearch = true;
                gridSearchService.deselectFilters();
                savedSearchItem.IsSelected = true;
                gridSearchService.loadSavedSearch($scope.searchModel, savedSearchItem.Id, savedSearchItem.GridSettingId);
            };

            $scope.resetFieldSearch = function () {
                busyScreenService.open();
                _.each($scope.searchModel.Fields, function (field) {
                    _.each(field.FieldData, function (field1) {
                        field1.Value = '';
                    });
                });
                _.each($scope.searchModel.selectedSearchCriteria.fields, function (tag) {
                    tag.value = "";
                    _.each(tag.field.FieldData, function (fieldData, i) {
                        tag.field.FieldData[i].Value = "";
                    });
                });
                $scope.checkActiveSearch();
                gridSearchService.refresh();
                busyScreenService.close();
            };

            $scope.checkActiveSearch = function () {
                var hasFilter = _.any($scope.searchModel.selectedSearchCriteria.filters, function (filter) { return filter.IsSelected; }),
                    hasField = _.any($scope.searchModel.selectedSearchCriteria.fields, function (field) { return field.value != ''; }),
                    hasSearchText = $scope.searchModel.selectedSearchCriteria.searchText != '';
                $scope.activeSearchConfig.hasActiveSearch = hasFilter || hasField || hasSearchText;
            };

            $scope.togglePinnedSaveSearch = function (savedSearchItem) {
                savedSearchItem.IsPinned = !savedSearchItem.IsPinned;

                console.warn('need to impletement in memory');

                //settingService.getApiServiceResource('SavedSearch').put(savedSearchItem);


            };

        }]);
});
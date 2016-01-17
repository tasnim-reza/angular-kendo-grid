define(['shell/app'], function (app) {
    app.controller('activeSearchCriteriaFilterController', [
       '$q', 'settingService', 'shellUtilityService', '$scope', 'gridSearchService', 'genericGridCommonService', 'savedSearchCategoryService', 'rowSelectionColumnCheckBoxService', function ($q, settingService, shellUtilityService, $scope, gridSearchService, genericGridCommonService, savedSearchCategoryService, rowSelectionColumnCheckBoxService) {
           'use strict';

           $scope.sharingOptions = [
                           { Id: 1, Name_En: 'Private', Name_De: 'Privat', Name_Fr: 'Privé', Name_It: 'Privato', },
                           { Id: 1, Name_En: 'Public', Name_De: 'Öffentlichkeit', Name_Fr: 'Public', Name_It: 'Pubblico', },
           ];

           $scope.activeSearchCriteria = gridSearchService.getSearchModel();

           $scope.onSystemMenuClick = function (filter) {
               rowSelectionColumnCheckBoxService.resetRowSelection();
               gridSearchService.deselectFilters();
               gridSearchService.clearActiveSearch();
               filter.IsActive = true;
               gridSearchService.refresh();
               $scope.activeSearchCriteria.showConditionalFilter = true;
               $scope.activeSearchConfig.hasActiveSearch = false;
           };

           $scope.removeTag = function (tag, filter) {
               tag.IsSelected = !tag.IsSelected;
               //gridModelService.refreshGrid($scope.activeSearchCriteria);
               filter.IsSelected = _.where(filter.filterData, { IsSelected: true }).length > 0;
               $scope.checkActiveSearch();
               gridSearchService.setSelectionOrder(tag, filter);
               genericGridCommonService.refreshGrid();
           };

           $scope.removeFieldTag = function (tag) {
               tag.value = "";
               _.each(tag.field.FieldData, function (fieldData, i) {
                   tag.field.FieldData[i].Value = "";
               });
               $scope.checkActiveSearch();
               genericGridCommonService.refreshGrid();

               //ToDo: the above code block will be refactored during search criteria refactor
               /*var index = $scope.activeSearchCriteria.selectedSearchCriteria.fields.indexOf(tag);
           if (index >= 0) {
               $scope.activeSearchCriteria.selectedSearchCriteria.fields.splice(index, 1);
               genericGridCommonService.refreshGrid();
           }*/
           };

           $scope.removeSearchKeyTag = function () {
               $scope.activeSearchCriteria.selectedSearchCriteria.searchText = '';
               $scope.activeSearchCriteria.selectedSearchCriteria.savedSearchName = '';
               $scope.activeSearchCriteria.SearchKey = '';
               $scope.checkActiveSearch();
               //genericGridCommonService.refreshGrid();
               gridSearchService.refresh();

               //gridModelService.refreshGrid($scope.activeSearchCriteria);
           };

           $scope.executeSavedSearch = function (savedSearchItem) {
               gridSearchService.deselectFilters();
               savedSearchItem.IsSelected = true;
               gridSearchService.loadSavedSearch($scope.activeSearchCriteria, savedSearchItem.Id, savedSearchItem.GridSettingId);
               $scope.activeSearchConfig.hasActiveSearch = true;

               //only for conditional filter
               $scope.activeSearchCriteria.showConditionalFilter = false;
           };

           $scope.hasPinnedItem = function (savedSearches) {
               //ToDo: this method used inside of ng-repeat
               return _.any(savedSearches, function (item) { return item.IsPinned || item.IsSelected; });
           };

           $scope.removeActiveSearch = function () {
               $scope.activeSearchCriteria.saveSearchBoxData = {};
               gridSearchService.deselectFilters(true);
               if ($scope.activeSearchCriteria.systemFilters.FilterMenu) {
                   $scope.activeSearchCriteria.systemFilters.FilterMenu.FilterMenuItems[0].IsSelected = true;
               }
               clearActiveSearch();
               //genericGridCommonService.refreshGrid();
               gridSearchService.refresh();
           };

           $scope.saveSearchCategory = function () {
               var categoryName = shellUtilityService.formatNewCategoryName($scope.activeSearchCriteria.saveSearchBoxData.selectedCatName);//$("#searchCategoryText").val();
               $scope.activeSearchCriteria.saveSearchBoxData.selectedCatName = categoryName;
               getSavedSearchCategory(categoryName).then(function (isExist) {
                   if (!isExist) {
                       savedSearchCategoryService.save(categoryName).then(function () {
                           getSavedSearchCategory(categoryName).then(function () {
                               var latestItem = _.find($scope.savedSearchCategories, function (item) { return item.Name.toLowerCase() === categoryName.toLowerCase(); });
                               if (latestItem) {
                                   $scope.activeSearchCriteria.saveSearchBoxData.selectedCatItemId = latestItem.Id;
                               }
                           });
                       });
                   }
               });
           };

           $scope.checkActiveSearch = function () {
               var hasFilter = _.any($scope.activeSearchCriteria.selectedSearchCriteria.filters, function (filter) { return filter.IsSelected; }),
                   hasField = _.any($scope.activeSearchCriteria.selectedSearchCriteria.fields, function (field) { return field.value != ''; }),
                   hasSearchText = $scope.activeSearchCriteria.selectedSearchCriteria.searchText != '';
               $scope.activeSearchConfig.hasActiveSearch = hasFilter || hasField || hasSearchText;
           };

           $scope.saveCriteria = function () {
               //$rootScope.$broadcast("saveCriteria", $scope.saveSearchBoxData);
               gridSearchService.save($scope.activeSearchCriteria.saveSearchBoxData);
               $scope.isSearchSaveBoxOpen = false;
               // $scope.activeSearchCriteria.saveSearchBoxData = {};
           };

           function clearActiveSearch() {
               gridSearchService.clearActiveSearch();
               $scope.activeSearchConfig.hasActiveSearch = false;
           }

           function getSavedSearchCategory(categoryName) {
               var deferred = $q.defer();
               if (_.any($scope.savedSearchCategories, function (item) { return item.Name === categoryName; })) {
                   deferred.resolve(true);
               } else {
                   savedSearchCategoryService.get().then(function (data) {
                       $scope.savedSearchCategories = data;
                       $scope.reloadTemplatedAutocomplete = !$scope.reloadTemplatedAutocomplete;
                       var isFound = _.any($scope.savedSearchCategories, function (item) { return item.Name === categoryName; });
                       deferred.resolve(isFound);
                   });
               }
               return deferred.promise;
           }

           getSavedSearchCategory();
       }
    ]).filter('sortedPinnedItem', function () {
        return function (input) {
            var flattedItems = _.flatten(_.pluck(_.rest(input, 1), 'searches'));
            var pinnedOrSelectedItems = _.filter(flattedItems, function (item) { return item.IsPinned || item.IsSelected; });
            return _.sortBy(pinnedOrSelectedItems, function (item) { return [!item.IsPinned, item.Title].join(''); });
        };
    });
});
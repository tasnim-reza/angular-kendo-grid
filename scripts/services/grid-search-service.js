define(['app'], function (app) {
    app.service('gridSearchService', [
        '$filter',
        'genericListLeftMenuService',
        '$q',
        '$rootScope',
        'busyScreenService',
        '$timeout',
        'genericGridCommonService',
        function (
            $filter,
            genericListLeftMenuService,
            $q,
            $rootScope,
            busyScreenService,
            $timeout,
            genericGridCommonService) {
            'use strict';

            var self = this,
                gridModelService,
                stopSelection,
                registeredFunc = {},
                    stateName = 'kendo grid';

            this.searchModel = {
                stateGenericSearchId: null,
                searchFieldSetList: [],
                searchFieldSetListPending: [],
                searchFields: {},
                searchFilterList: [],
                remainingField: {},
                selectedSearchCriteria: {
                    fields: [],
                    filters: [],
                    searchText: ""
                },
                SearchKey: "",
                conditionalFilters: [],
                searchCustomCategories: [],
                systemFilters: [],
                showConditionalFilter: true,
                saveSearchBoxData: {}
            };

            this.getSystemFilters = function (stateGenericSearchId) {
                if (!stateGenericSearchId) stateGenericSearchId = self.searchModel.stateGenericSearchId.toLowerCase();
                var deferred = $q.defer();
                genericListLeftMenuService.getGenericListLeftMenu(stateGenericSearchId).then(function (data) {
                    self.searchModel.systemFilters = data;
                    deferred.resolve(data);
                });
                return deferred.promise;
            };

            this.deselectFilters = function (dontClearConditionalFilters) {
                self.searchModel.SearchKey = '';
                self.searchModel.selectedSearchCriteria.searchText = '';
                self.searchModel.selectedSearchCriteria.savedSearchName = '';
                _.each(self.searchModel.searchCustomCategories, function (category) {
                    if (category) {
                        _.each(category.searches, function (searchItem) {
                            searchItem.IsSelected = false;
                        });
                    }
                });

                if (self.searchModel.systemFilters.FilterMenu) {
                    _.each(self.searchModel.systemFilters.FilterMenu.FilterMenuItems, function (filter) {
                        filter.IsSelected = false;
                    });
                }

                if (!dontClearConditionalFilters && self.searchModel.conditionalFilters && self.searchModel.conditionalFilters.length > 0) {
                    _.each(self.searchModel.conditionalFilters, function (cond) {
                        cond.IsActive = false;
                    });
                }
            };

            this.getExistingSearchByStateGenericSearchId = function (stateGenericSearchId, stateName) {
                var deferred = $q.defer();
                //settingService.getApiServiceResource('SavedSearch').query({ stateGenericSearchId: stateGenericSearchId, stateName: stateName }, function (data) {
                //    //ToDo: we have to retrive specific columns not whole object
                //    var searchCustomCategories = [];
                //    var recentlyUsedCategories = _.where(data, { CategoryId: SavedSearchCategoryEnum.RecentlyUsed });
                //    var catNames = [];


                //    catNames = _.uniq(_(data).pluck('CategoryName'));

                //    if (recentlyUsedCategories.length > 0) {
                //        catNames.splice(catNames.indexOf(recentlyUsedCategories[0].CategoryName), 1);
                //        catNames.unshift(recentlyUsedCategories[0].CategoryName);
                //    }

                //    for (var i in catNames) {
                //        var category =
                //            {
                //                name: catNames[i],
                //                searches: _.where(data, { CategoryName: catNames[i] }),
                //            };

                //        searchCustomCategories.push(category);
                //    }

                //    deferred.resolve(searchCustomCategories);

                //});

                deferred.resolve(savedSearch);

                return deferred.promise;
            };

            this.getSearchModel = function () {
                //if (!self.searchModel.stateGenericSearchId) throw "stateGenericSearchId is required !!";

                self.getExistingSearchByStateGenericSearchId(self.searchModel.stateGenericSearchId, stateName).then(function (data) {
                    self.searchModel.searchCustomCategories = getSortedCategory(data);
                    //self.searchModel.searchCustomCategories = data;
                });

                return self.searchModel;
            };

            this.addNewField = function () {
                self.searchModel.remainingField.selectedField.IsDefault = true;
                self.searchModel.searchFieldSetList.push(self.searchModel.remainingField.selectedField);
                self.searchModel.searchFieldSetListPending = _.without(self.searchModel.searchFieldSetListPending,
                    _.findWhere(self.searchModel.searchFieldSetListPending, { ColumnName: self.searchModel.remainingField.selectedField.ColumnName }));
            };

            this.updateSearchModel = function (data) {
                //ToDo: this method called two time, during databind/request end and when i click loadSaveSearch both time object structure is not same
                console.log('update data');
                console.log(data);
                if (!data) return;
                if (!$rootScope.$$phase) {
                    $rootScope.$apply(function () {
                        self.updateSearchData(data);
                    });
                } else {
                    self.updateSearchData(data);
                }
            };

            this.updateSearchData = function (data) {
                if (self.searchModel.selectedSearchCriteria) {
                    self.searchModel.SearchKey = self.searchModel.selectedSearchCriteria.searchText;
                }

                self.searchModel.searchSettings = data;
                if (!self.searchModel.Fields) {
                    self.searchModel.Fields = data.Fields;
                }

                if (!self.searchModel.SearchKey) {
                    self.searchModel.SearchKey = data.SearchKey;
                }

                self.searchModel.searchFieldSetList = _.where(self.searchModel.Fields, { IsDefault: true });
                self.searchModel.searchFieldSetListPending = _.where(self.searchModel.Fields, { IsDefault: (false || undefined) });

                self.searchModel.conditionalFilters = data.ConditionalFilters;
                self.searchModel.SearchUrl = data.SearchUrl;

                //ToDo: should fix the data model othrwise too much looping
                _.each(data.Filters, function (filter) {
                    var findFilter = _.find(self.searchModel.searchFilterList, function (item) { return item.ColumnName === filter.ColumnName; });
                    if (findFilter) {
                        _.each(filter.FilterData, function (filterData) {
                            var findFilterData = _.find(findFilter.FilterData, function (item) {
                                return item.Label === filterData.Label;
                            });
                            if (findFilterData && findFilterData.SelectionOrder) {
                                filterData.SelectionOrder = findFilterData.SelectionOrder;
                            }
                        });
                    }
                });

                _.each(data.Fields, function (field) {
                    var foundField = _.find(self.searchModel.Fields, function (item) { return item.ColumnName === field.ColumnName; });
                    if (foundField) {
                        _.each(field.FieldData, function (fieldData) {
                            var foundFieldData = _.find(foundField.FieldData, function (item) {
                                return item.LabelResourceId === fieldData.LabelResourceId;
                            });
                            if (foundFieldData) {
                                foundFieldData.Value = fieldData.Value;
                            }
                        });
                    }
                });

                self.searchModel.searchFilterList = data.Filters;
                //self.searchModel.searchFieldSetList

                busyScreenService.close();
            };

            this.getBySavedSearchId = function (savedSearchId) {
                var deferred = $q.defer();
                settingService.getApiServiceResource('SavedSearch').get({ savedSearchId: savedSearchId }, function (data) {
                    deferred.resolve(data);
                });

                return deferred.promise;
            };

            this.refresh = function (isLoadingSavedSearch, gridSettingId) {
                handleNationality(self.searchModel.searchFieldSetList).then(function () {
                    setGridTags();
                    var stateGenericSearch = {
                        Filters: self.searchModel.searchFilterList,
                        Fields: self.searchModel.searchFieldSetList,
                        SearchKey: self.searchModel.SearchKey,
                        selectedSearchCriteria: self.searchModel.selectedSearchCriteria,
                        ConditionalFilters: _.filter(self.searchModel.conditionalFilters, function (item) { return item.IsActive; }),
                        SearchUrl: self.searchModel.SearchUrl,
                    }, isDefaultSetting = false;

                    if (!isLoadingSavedSearch) {
                        var savedSearchData =
                        {
                            saveSearchName: self.searchModel.selectedSearchCriteria.savedSearchName,
                            selectedCatItemId: SavedSearchCategoryEnum.RecentlyUsed,
                            selectedCatName: "Recently Used",
                        };

                        self.save(savedSearchData);
                    }

                    if (isLoadingSavedSearch && !gridSettingId) isDefaultSetting = true;


                    gridModelService.refresh(stateGenericSearch, gridSettingId, isDefaultSetting);
                });
            };

            //ToDo: need to refactor see person-list-controller onLeftMenuClick
            this.refreshGridWithDefaultSetting = function (stateGenericSearch, gridSettingId) {
                gridModelService.refresh(stateGenericSearch, gridSettingId, true);
            };

            this.save = function (savedSearchData) {
                var genericSearch = {
                    StateGenericSearch: {
                        Filters: this.searchModel.searchFilterList,
                        Fields: this.searchModel.Fields,
                        ConditionalFilters: self.searchModel.conditionalFilters,
                        SearchKey: this.searchModel.SearchKey,
                        Title: savedSearchData.saveSearchName,
                        CategoryId: savedSearchData.selectedCatItemId,
                        CategoryName: savedSearchData.selectedCatName,
                        Id: this.searchModel.stateGenericSearchId,
                        StateName: stateName
                    },
                    GridSetting: null,
                    SavedSearchId: savedSearchData.id
                };

                if (angular.isFunction(genericGridCommonService.gridSetting.masterUrl)) {
                    genericSearch.StateGenericSearch.SearchUrl = genericGridCommonService.gridSetting.masterUrl();
                } else {
                    genericSearch.StateGenericSearch.SearchUrl = genericGridCommonService.gridSetting.masterUrl;
                }


                if (savedSearchData.enableGridSetting)
                    genericSearch.GridSetting = genericGridCommonService.getCurrentGridSetting();

                settingService.getApiServiceResource('SavedSearch').save(genericSearch, function (savedSearchIdObj) {
                    savedSearchData.id = savedSearchIdObj.savedSearchId;

                    self.getExistingSearchByStateGenericSearchId(genericSearch.StateGenericSearch.Id, stateName).then(function (data) {
                        self.searchModel.searchCustomCategories = getSortedCategory(data);
                    });
                });

            };

            function getSortedCategory(data) {
                var selectedSearchId;
                _.each(self.searchModel.searchCustomCategories, function (item) {
                    if (item) {
                        var foundItem = _.find(item.searches, function (item1) { return item1.IsSelected; });
                        if (foundItem) selectedSearchId = foundItem.Id;
                    }
                });

                var recentlyUsed = data[0];
                data.splice(0, 1);
                var orderBy = $filter('orderBy')(data, 'name');

                _.each(orderBy, function (item) {
                    var foundItem = _.find(item.searches, function (item1) { return item1.Id == selectedSearchId; });
                    if (foundItem) foundItem.IsSelected = true;
                });

                orderBy.splice(0, 0, recentlyUsed);

                return orderBy;
            }

            this.loadSavedSearch = function (searchModel, searchId, gridSettingId) {
                busyScreenService.open();
                self.getBySavedSearchId(searchId).then(function (data) {
                    self.updateSearchModel(data, true);

                    if (self.searchModel.saveSearchLoaded) {
                        self.searchModel.saveSearchLoaded(data.SearchUrl);
                    }

                    self.refresh(true, gridSettingId);
                    updateSaveSearchBoxData(searchId, data);
                });
            };

            this.pinnedSaveSearch = function (searchModel, searchId, gridSettingId, pinnedItem) {
                busyScreenService.open();
                self.getBySavedSearchId(searchId).then(function (data) {
                    searchModel.SearchKey = data.SearchKey;
                    self.searchModel.selectedSearchCriteria.searchText = data.SearchKey;
                    self.searchModel.Fields = null;
                    self.updateSearchModel(data, true);
                    self.refresh(true, gridSettingId);
                    //update pinned item
                });
            };

            this.clearActiveSearch = function () {
                _.each(self.searchModel.selectedSearchCriteria.filters, function (filter) {
                    filter.IsSelected = false;
                    _.each(filter.filterData, function (filterData, i) {
                        filterData.IsSelected = false;
                    });
                });

                _.each(self.searchModel.selectedSearchCriteria.fields, function (tag) {
                    tag.value = "";
                    _.each(tag.field.FieldData, function (fieldData, i) {
                        tag.field.FieldData[i].Value = "";
                    });
                });

                _.each(self.searchModel.searchFilterList, function (filter) {
                    filter.IsSelected = false;
                    _.each(filter.FilterData, function (filterData, i) {
                        filterData.IsSelected = false;
                    });
                });

                _.each(self.searchModel.searchFieldSetList, function (tag) {
                    _.each(tag.FieldData, function (fieldData, i) {
                        tag.FieldData[i].Value = "";
                    });
                });

                self.searchModel.selectedSearchCriteria.searchText = "";
                self.searchModel.SearchKey = "";
            };

            //this.unPinnedSaveSearch = function (searchModel, searchId, gridSettingId, pinnedItem) {
            //    busyScreenService.open();
            //    self.getBySavedSearchId(searchId).then(function (data) {
            //        searchModel.SearchKey = data.SearchKey;
            //        self.searchModel.selectedSearchCriteria.searchText = data.SearchKey;
            //        self.searchModel.Fields = null;
            //        self.updateSearchModel(data, true);
            //        self.refresh(true, gridSettingId);
            //        //update pinned item
            //    });
            //};

            this.selectCriteria = function (searchCriteria, filter) {
                searchCriteria.IsSelected = !searchCriteria.IsSelected;
                self.setSelectionOrder(searchCriteria, filter);
                $timeout.cancel(stopSelection);
                stopSelection = $timeout(function () {
                    busyScreenService.open();
                    self.refresh();
                }, 1000);
            };

            this.setSelectionOrder = function (searchCriteria, filter) {
                if (searchCriteria.IsSelected) {
                    var maxOrderedCriteria = _.max(filter.FilterData, function (item) {
                        return item.SelectionOrder;
                    });
                    if (angular.isObject(maxOrderedCriteria)) {
                        searchCriteria.SelectionOrder = maxOrderedCriteria.SelectionOrder + 1;
                    } else {
                        searchCriteria.SelectionOrder = 1;
                    }
                } else {
                    _.each(filter.FilterData, function (filterData) {
                        if (filterData.SelectionOrder > searchCriteria.SelectionOrder)
                            filterData.SelectionOrder--;
                    });
                    searchCriteria.SelectionOrder = null;
                }
            };

            this.deleteSavedSearch = function (id) {
                _.each(self.searchModel.searchCustomCategories, function (category) {
                    _.each(category.searches, function (searchItem, index) {
                        if (searchItem.Id == id) {
                            category.searches.splice(index, 1);
                        }
                    });
                });

                var deferred = $q.defer();
                settingService.getApiServiceResource('SavedSearch').delete({ id: id }, function (data) {
                    deferred.resolve();
                });
                return deferred.promise;
            };

            this.constructSearchModel = function (gridModel, stateGenericSearchId) {
                gridModelService = gridModel;
                gridModelService.constructSearchModel(self);
                self.searchModel.stateGenericSearchId = stateGenericSearchId;
            };

            this.clearSelectedSearchCriteria = function () {
                self.searchModel.selectedSearchCriteria.fields = [];
                self.searchModel.selectedSearchCriteria.filters = [];
                self.searchModel.selectedSearchCriteria.searchText = '';
            };

            this.registeredFuncKey = {
                onSearchText: 'onSearchText',
                onSearchByFields: 'onSearchByFields',
                onSelectCategory: 'onSelectCategory',
                onLoadSavedSearch: 'onLoadSavedSearch'
            }

            this.registerFunc = function (key, func) {
                if (!registeredFunc[key])
                    registeredFunc[key] = func;
            };

            this.executeRegisteredFunc = function (key) {
                if (registeredFunc[key]) registeredFunc[key]();
            };

            this.initService = function () {
                //self.searchModel.stateGenericSearchId = null;
                self.searchModel.searchFieldSetList.length = 0;
                self.searchModel.searchFieldSetListPending = [];
                self.searchModel.searchFields = {};
                self.searchModel.searchFilterList = [];
                self.searchModel.remainingField = {};
                self.searchModel.selectedSearchCriteria.fields = [];
                self.searchModel.selectedSearchCriteria.filters = [];
                self.searchModel.selectedSearchCriteria.searchText = '';
                self.searchModel.SearchKey = '';
                self.searchModel.Fields = null;
                self.searchModel.searchCustomCategories = [];
                self.searchModel.systemFilters = [];
                self.searchModel.showConditionalFilter = true;
                self.searchModel.saveSearchBoxData = {};
                registeredFunc = {};
            };

            function setGridTags() {
                self.searchModel.selectedSearchCriteria = {
                    fields: [],
                    filters: [],
                    searchText: "",
                    savedSearchName: ""
                };

                var searchName = "";
                _.each(self.searchModel.searchFilterList, function (filter) {
                    var selectedFilter = {
                        displayText: $rootScope.resources[filter.DisplayResourceId],
                        filterData: [],
                        IsSelected: false
                    };

                    var searchNameFilter = "";
                    _.each(filter.FilterData, function (filterData) {
                        if (filterData.IsSelected) {
                            if (searchNameFilter) {
                                searchNameFilter += ", ";
                            }
                            searchNameFilter += filterData.Label;
                            selectedFilter.filterData.push(filterData);
                        }
                    });

                    if (selectedFilter.filterData.length > 0) {
                        searchName += selectedFilter.displayText + ": " + searchNameFilter + "; ";
                        selectedFilter.IsSelected = true;
                        self.searchModel.selectedSearchCriteria.filters.push(selectedFilter);
                    }

                });

                _.each(self.searchModel.Fields, function (field) {
                    var fieldVal = "";
                    _.each(field.FieldData, function (fieldData) {
                        if (fieldVal) {
                            fieldVal += " - ";
                        }

                        if (fieldData && (fieldData.DisplayValue || fieldData.Value)) {
                            fieldVal += fieldData.DisplayValue ? fieldData.DisplayValue : fieldData.Value;
                        }
                    });

                    if (fieldVal) {
                        var fieldTag =
                        {
                            displayText: $rootScope.resources[field.DisplayResourceId],
                            value: fieldVal,
                            field: field
                        };

                        searchName += fieldTag.displayText + ":" + fieldTag.value + "; ";
                        self.searchModel.selectedSearchCriteria.fields.push(fieldTag);
                    }
                });

                self.searchModel.selectedSearchCriteria.searchText = self.searchModel.SearchKey;

                if (self.searchModel.SearchKey) {
                    searchName = $rootScope.resources["SearchKey"] + ":" + self.searchModel.SearchKey + "; " + searchName;
                }

                self.searchModel.selectedSearchCriteria.savedSearchName = searchName;
            }

            function handleNationality(fields) {
                var deferred = $q.defer();

                var foundVal = _.find(fields, function (item) { return item.ColumnName === 'NationalityId'; });
                if (foundVal && foundVal.FieldData[0].Value != '') {
                    deferred.resolve();

                    //lookupDataService.getLookupData(lookupDataService.lookupDataKey.country).then(function (data) {
                    //    foundVal.FieldData[0].DisplayValue = _.find(data, function (item) { return item.CountryId.toString() === foundVal.FieldData[0].Value.toString(); })['ShortName' + $rootScope.currentCulture];
                    //    deferred.resolve();
                    //});
                } else deferred.resolve();

                return deferred.promise;
            }

            function updateSaveSearchBoxData(searchId, data) {
                self.searchModel.saveSearchBoxData = {
                    id: searchId,
                    selectedCatItemId: data.CategoryId,
                    saveSearchName: data.Title,
                    selectedCatName: data.CategoryName,
                    selectedSharingOption: data.SharingOption
                };
            }
        }]);
});
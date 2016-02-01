define(['app'], function (app) {
    app.service('genericGridDataModelService', ['$injector', function ($injector) {
        'use strict';

        function GenericGridDataModel() {
            var gridService,
                searchService;
            
            this.refresh = function (searchFilters, gridSettingId, isDefaultSetting) {
                gridService.refreshGrid(searchFilters, gridSettingId, isDefaultSetting);
            };

            this.constructGridModel = function (grdService) {
                gridService = grdService;
            };

            this.constructSearchModel = function (srcService) {
                searchService = srcService;
            };

            this.updateSearchModel = function (data) {
                if (searchService) {
                    searchService.updateSearchModel(data, false);
                }
            };
        }

        return function () {
            return $injector.instantiate(GenericGridDataModel);
        };
    }]);
});
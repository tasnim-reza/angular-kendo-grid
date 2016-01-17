define([
    'uam/uam-module',
    'shellService/generic-list/generic-grid-data-model-service',
    'uamService/uam-setting-service',
    'uamService/uam-service'
], function (uamModule) {
    uamModule.controller('userGridController', [
        '$scope',
        'genericGridDataModelService',
        'gridSearchService',
        'uamSettingService',
        '$state',
        function (
            $scope,
            genericGridDataModelService,
            gridSearchService,
            uamSettingService,
            $state) {

            var gridId = 'UamUser',
                gridDataModelService = new genericGridDataModelService(),
                stateGenericSearchId = gridId;

            $scope.$parent.searchModel = gridSearchService.getSearchModel();
            $scope.$parent.searchModel.searchIn = null;

            gridSearchService.constructSearchModel(gridDataModelService, stateGenericSearchId);

            $scope.userGridConfig = {
                gridId: gridId,
                masterUrl: uamSettingService.baseUrl.queryServerApi + 'UserApi/Post',
                getStatusDescription: getStatusDescription,
                gridDataModel: gridDataModelService,
                primaryKey: 'Id',
                onRowDoubleClick: onRowDoubleClick,
                buttonColumnStyle: null,
                getStyleInfo: getStyleInfo
            };

            function getStyleInfo() {
                return {
                    cssClass: 'user-mgmt-fg-style',
                    iconClass: 'icon-user',
                };
            }

            function getStatusDescription(status) {
                return status ? $scope.resources.Active : $scope.resources.Inactive;
            }
            $scope.resetActiveSearchArea();

            function onRowDoubleClick(dataItem) {
                var stateConfig;
                stateConfig = {
                    stateName: "userdetail",
                    param: {
                        userid: dataItem["Id"]
                    }
                };
                $state.go(stateConfig.stateName, stateConfig.param);
            }

        }
    ]);
});
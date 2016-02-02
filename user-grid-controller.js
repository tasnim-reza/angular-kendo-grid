define(['app'
], function (app) {
    app.controller('userGridController', [
        '$scope',
        'genericGridDataModelService',
        'gridSearchService',
        function (
            $scope,
            genericGridDataModelService,
            gridSearchService) {

            var gridId = 'UamUser',
                gridDataModelService = new genericGridDataModelService(),
                stateGenericSearchId = gridId;

            $scope.$parent.searchModel = gridSearchService.getSearchModel();
            $scope.$parent.searchModel.searchIn = null;

            gridSearchService.constructSearchModel(gridDataModelService, stateGenericSearchId);

            $scope.userGridConfig = {
                gridId: gridId,
                masterUrl: 'UserApi/Post',
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
                //$state.go(stateConfig.stateName, stateConfig.param);
            }

        }
    ]);
});
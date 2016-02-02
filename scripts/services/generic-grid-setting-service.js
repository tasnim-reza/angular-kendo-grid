define(['app'], function (app) {
    app.service('genericGridSettingService', ['$q', 'genericGridColumnService', 'genericGridCommonService',
        function ($q, genericGridColumnService, genericGridCommonService) {
            'use strict';

            var self = this;

            self.getConfig = function (requestModel, gridSettingId, isDefaultSetting) {
                var deferred = $q.defer(),
                    configModel = {
                        masterUrl: null,
                        masterColumns: null,
                        masterPageSize: 10,
                        masterDefaultGroup: null,
                        masterDefaultSort: null,
                        pagerButtonCount: null,
                        hasColumnSeparator: true,
                        isEnableContextMenu: false,
                        hasPager: true
                    };

                if (requestModel.detailsGridId) {
                    configModel.details = {
                        gridId: requestModel.detailsGridId,
                        url: requestModel.detailsUrl,
                        childRelationShipKey: requestModel.childRelationShipKey,
                        parentRelationShipKey: requestModel.parentRelationShipKey,
                        columns: null,
                        selectable: false,
                        childRequestType: requestModel.childRequestType,
                        businessCaseTypes: requestModel.businessCaseTypes,
                        detailsOrderByFilter: requestModel.detailsOrderByFilter
                    };
                }

                configModel.masterUrl = requestModel.masterUrl;

                if (angular.isDefined(requestModel.hasPager)) configModel.hasPager = requestModel.hasPager;

                if (!gridSetting.GridStyle) return;

                mapGridSettingToConfig(gridSetting, configModel, requestModel);
                genericGridColumnService.columnList = _.pluck(_.pluck(gridSetting.GridStyle.Columns, 'DataField').filter(Boolean), 'Value').filter(Boolean);

                genericGridColumnService.getColumns(gridSetting.GridStyle.Columns, requestModel).then(function (datas) {
                    configModel.masterColumns = _.first(datas);

                    if (configModel.details) {
                        loadDetailsSetting(configModel, deferred, requestModel);
                    } else {
                        deferred.resolve(configModel);
                    }
                });


                return deferred.promise;
            };

            self.saveConfig = function (model) {
                $.ajax({
                    url: gridSettingUrl,
                    type: "POST",
                    data: model,
                    async: false
                });
            };

            self.deleteConfig = function (model) {
                var deferred = $q.defer();
                gridSettingResource.delete(model, function (result) {
                    deferred.resolve(result);
                    console.log(result);
                }, function (error) {
                    console.log(error);
                });
                return deferred.promise;
            };

            self.getDetailTransport = function (e, requestType) {
                var transport;
                switch (requestType) {
                    case 'api':
                        transport = {
                            read: {
                                url: genericGridCommonService.gridSetting.details.url,
                                dataType: 'json',
                                type: "GET",
                                //data: genericGridCommonService.gridRequestModel
                            },
                            parameterMap: function (options) {
                                options = {
                                    BusinessCaseId: e.data[genericGridCommonService.gridSetting.details.parentRelationShipKey], //'83964E71-B285-CD80-7919-B06D7189F652',
                                    BusinessCaseTypes: genericGridCommonService.gridSetting.details.businessCaseTypes,
                                    ColumnList: genericGridColumnService.detailColumnList
                                };
                                return options;
                            }
                        };
                        break;
                    default:
                        transport = {
                            read: function (options) {
                                var query = {
                                    '$select': genericGridColumnService.detailColumnList,
                                    '$filter': genericGridCommonService.gridSetting.details.childRelationShipKey + ' eq (guid\'' + e.data[genericGridCommonService.gridSetting.details.parentRelationShipKey] + '\')',
                                    //'$orderby': 'MessageDate desc'
                                };

                                if (genericGridCommonService.gridSetting.details.detailsOrderByFilter) {
                                    query['$orderby'] = genericGridCommonService.gridSetting.details.detailsOrderByFilter;
                                }

                                //ewrSettingService.getServiceResource(genericGridCommonService.gridSetting.details.url).get(query, function (data) {
                                //    options.success(data.value);
                                //}, function (error) {
                                //    options.error(error);
                                //});
                            }
                        };
                        break;
                }
                return transport;
            };

            function loadDetailsSetting(configModel, deferred, requestModel) {
                resource.get(gridSettingQueryParam(configModel.details.gridId),
                    function (gridSetting) {
                        if (!gridSetting.GridStyle) { deferred.reject(); }//ToDo

                        genericGridColumnService.getDetailsColumns(gridSetting.GridStyle.Columns, requestModel).then(function (datas) {
                            configModel.details.columns = _.first(datas);
                            deferred.resolve(configModel);
                        });
                        genericGridColumnService.detailColumnList = _.pluck(_.pluck(gridSetting.GridStyle.Columns, 'DataField').filter(Boolean), 'Value').filter(Boolean);
                    },
                    function (error) {
                        deferred.reject(error);
                    });
            }

            function mapGridSettingToConfig(gridSettings, configModel, requestModel) {
                if (!gridSettings.GridStyle) return; //ToDo

                configModel.gridId = gridSettings.Id;
                configModel.selectable = false;
                configModel.pagerButtonCount = (gridSettings.GridStyle.PaginationFrontBackPageCount * 2) + 1;
                configModel.hasColumnSeparator = gridSettings.GridStyle.HasColumnSeparator;
                configModel.isRowSelectable = gridSettings.GridStyle.IsRowSelectable;
                configModel.isSingleSelectable = gridSettings.GridStyle.IsSingleSelectable;
                configModel.masterPageSize = gridSettings.GridStyle.PageSize;
                configModel.masterMaxPageSize = gridSettings.GridStyle.PageSizeMax;
                configModel.masterMinPageSize = gridSettings.GridStyle.PageSizeMin;
                configModel.masterDefaultSort = genericGridColumnService.getSortedColumns(gridSettings.GridStyle.Columns);
                configModel.masterDefaultGroup = genericGridColumnService.getGroupColumns(gridSettings.GridStyle.Columns);
                configModel.onRowSelect = requestModel.onRowSelect;
                configModel.isHiddenReportButton = requestModel.isHiddenReportButton;
                configModel.isHiddenRefreshButton = requestModel.isHiddenRefreshButton;
                configModel.primaryKey = requestModel.primaryKey;
            }

            function gridSettingQueryParam(gridId, gridSettingId, isDefaultSetting) {
                if (gridSettingId)
                    return { 'gridSettingId': gridSettingId };
                else
                    return { 'gridId': gridId, 'stateName': genericGridCommonService.currentStateName, 'isDefaultSetting': isDefaultSetting ? isDefaultSetting : false };
            }
        }]);
});
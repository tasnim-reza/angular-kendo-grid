define(['app'], function(app) {
    app.service('rowSelectionColumnCheckBoxService', ['$log', 'genericGridCommonService', '$timeout',
        function ($log, genericGridCommonService, $timeout) {

            var rowIdSavingEnabled = true,
                selectedRowIdList = [],
                self = this;

            this.dataModel = {
                count: 0,
                isMasterBoxChecked: false,
                rowStatus: {}
            };

            self.updateRowStatus = function(rowId, status) {
                self.dataModel.rowStatus[rowId].isChecked = status;
            };

            self.getRowStatus = function(rowId) {
                if (!self.dataModel.rowStatus[rowId]) self.dataModel.rowStatus[rowId] = { isChecked: false };
                return self.dataModel.rowStatus[rowId];
            };

            self.clearRowStatus = function() {
                for (var key in self.dataModel.rowStatus) {
                    self.dataModel.rowStatus[key].isChecked = false;
                };
                selectedRowIdList = [];
                self.dataModel.isMasterBoxChecked = false;
                self.dataModel.count = 0;
            };

            self.checkedAll = function() {
                for (var key in self.dataModel.rowStatus) {
                    self.dataModel.rowStatus[key].isChecked = true;
                    self.incrementCounter(key);
                };
            };

            this.resetRowSelection = function() {
                self.dataModel.isMasterBoxChecked = false;
                self.dataModel.count = 0;
                self.dataModel.rowStatus = {};
                selectedRowIdList = [];
            };

            this.isRowIdSelected = function(rowId) {
                return (_.indexOf(selectedRowIdList, rowId) >= 0);
            };

            this.getSavedIdList = function() {
                return angular.copy(selectedRowIdList);
            };

            this.incrementCounter = function(rowId) {
                this.dataModel.count = this.dataModel.count + 1;
                if (rowIdSavingEnabled) {
                    insertRowId(rowId);
                }
                console.log(selectedRowIdList);
            };

            this.decrementCounter = function(rowId) {
                this.dataModel.count = this.dataModel.count - 1;
                if (rowIdSavingEnabled) {
                    removeRowId(rowId);
                }
                console.log(selectedRowIdList);
            };

            self.singleClickOnRow = function(e, selectedRow, dataItem, gridRequestModel, gridConfig) {
                if (e.ctrlKey) return;

                if (gridConfig.generateGridParentUrl)
                    gridConfig.generateGridParentUrl(dataItem);

                var rowId = dataItem.id;

                if (!rowId) throw "RowId is not found, Please check grid configuration 'PrimaryKey' field.";

                selectedRow.addClass('row-selection').siblings().removeClass('row-selection');

                if (gridConfig.gridRequestModel)
                    setGridRequestModel(gridConfig, gridRequestModel, selectedRow);

                setCheckBoxAsChecked(rowId);

                if (angular.isFunction(genericGridCommonService.gridSetting.onRowSelect)) {
                    var selectedIdList = self.getSavedIdList();
                    genericGridCommonService.gridSetting.onRowSelect(null, null, selectedIdList);
                }
            };

            self.doubleClickOnRow = function(e, selectedRow, dataItem, gridConfig) {
                if (_.isFunction(gridConfig.onRowDoubleClick)) {
                    gridConfig.onRowDoubleClick(dataItem);
                }
            };

            function setCheckBoxAsChecked(rowId) {
                if (selectedRowIdList.indexOf(rowId) < 0) {
                    self.clearRowStatus();
                    self.incrementCounter(rowId);
                    self.updateRowStatus(rowId, true);
                    self.setMasterCheckBoxState();
                }
            }

            function setGridRequestModel(gridConfig, gridRequestModel, selectedRow) {
                gridRequestModel.skip = gridRequestModel.skip + $(selectedRow).index();
                gridRequestModel.take = 1;
                gridRequestModel.total = genericGridCommonService.grid.dataSource.total();
                gridConfig.gridRequestModel.model = gridRequestModel;
            }

            self.setMasterCheckBoxState = function() {
                var isAllItemsSelected = _.all(self.dataModel.rowStatus, function(key) {
                        return key.isChecked;
                    }),
                    isItemsPartiallySelected = _.some(self.dataModel.rowStatus, function(key) {
                        return key.isChecked;
                    });
                $timeout(function() {
                    if (isAllItemsSelected) {
                        self.dataModel.isMasterBoxChecked = true;
                    } else if (isItemsPartiallySelected) {
                        self.dataModel.isMasterBoxChecked = undefined;
                    } else {
                        self.dataModel.isMasterBoxChecked = false;
                    }
                });
            };

            function insertRowId(rowId) {
                if (rowId) {
                    if (_.indexOf(selectedRowIdList, rowId) < 0)
                        selectedRowIdList.push(rowId);
                } else {
                    $log.warn('missing row id');
                }
            }

            function removeRowId(rowId) {
                if (rowId) {
                    selectedRowIdList.splice(_.indexOf(selectedRowIdList, rowId), 1);
                } else {
                    $log.warn('missing row id');
                }
            }
        }
    ]);
});
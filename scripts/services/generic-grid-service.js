define(['app'], function (app) {
    app.service('genericGridService', [
        '$injector',
        'genericGridColumnService',
        'genericGridCommonService',
        'gridSearchService',
        'rowSelectionService',
        '$document',
        'rowSelectionColumnCheckBoxService',
        function (
            $injector,
            genericGridColumnService,
            genericGridCommonService,
            gridSearchService,
            rowSelectionService,
            $document,
            rowSelectionColumnCheckBoxService) {
            'use strict';

            function GenericGrid($compile, genericGridSettingService, $rootScope, scp, $window) {

                var self = this,
                    columnMenuTemplate = '<div grid-column-menu="kendo-grid" model="%s"></div>',
                    columnImageMenuTemplate = '<div grid-image-column-menu="kendo-grid" model="%s"></div>',
                    gridConfigMenu = '<div grid-config-menu="kendo-grid" config="gridMenuConfig" class="clearfix"></div>',
                    gridFilterMenu = '<div grid-filter-menu config="gridMenuConfig" class="clearfix"></div>',
                    gridSearchSave = '<div grid-search-save></div>',
                    gridPager = '<nav class="pull-right custom-pager" grid-pager="kendo-grid" config="gridPagerConfig"></nav>',
                    scope = scp,
                    gridGroupDataModel = {
                        collapseDataModel: {},
                        filterDataModel: []
                    },
                    userId = $rootScope.loggedInUser.UserId,
                    maxLevelSort = 3,
                    maxLevelGroup = 3,
                    previousGroupList = [],
                    gridFilterModel = {},
                    groupCountList = [],
                    gridRequestModel,
                    detailGridIdPrefix = 'detail-grid-id-';

                this.gridColumnResize = function (e) {
                    var that = this,
                        visibleColumns = _.filter(genericGridCommonService.grid.columns, function (item) { return !item.hidden; }),
                        index = _.indexOf(visibleColumns, e.column),
                        contentTable = that.tbody.parent(),
                        options = that.options,
                        col,
                        footer = that.footer || $(),
                        diff = null,
                        minWidth = parseInt(e.column.minWidth),
                        maxWidth = parseInt(e.column.maxWidth),
                        headerTable = that.thead.parent();

                    if (options.scrollable) {
                        col = headerTable.find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")")
                            .add(contentTable.children("colgroup").find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")"))
                            .add(footer.find("colgroup").find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")"));
                    } else {
                        col = contentTable.children("colgroup").find("col:not('.k-group-col, .k-hierarchy-col'):eq(" + index + ")");
                    }

                    if (e.newWidth < minWidth) {
                        diff = minWidth - e.newWidth;
                        contentTable.width(contentTable.width() + diff);
                        headerTable.width(headerTable.width() + diff);
                        e.newWidth = minWidth;
                    } else if (e.newWidth > maxWidth) {
                        diff = e.newWidth - maxWidth;
                        contentTable.width(contentTable.width() - diff);
                        headerTable.width(headerTable.width() - diff);
                        e.newWidth = maxWidth;
                    }
                    e.column.width = e.newWidth;
                    col.css('width', e.newWidth);
                };

                this.initGridColumnMenu = function () {
                    var menuTpl = $document.find('body').append('<grid-column-menu>').find('grid-column-menu');

                    //genericGridCommonService.grid.thead.find('tr th').not('.k-hierarchy-cell').not('[data-field="RowSelection"]').not('[data-field="Button"]')
                    //    .each(function (i, item) {
                    var menuScope = $rootScope.$new();
                    //menuScope.columnElement = item;
                    $compile(menuTpl)(menuScope);
                    //});

                    //scope[e.field] = e.field;
                    //var foundCol = _.find(genericGridCommonService.gridSetting.masterColumns, function (item) { return e.field === item.field; }),
                    //    width = 300;

                    //if (foundCol.isSelectable) {
                    //    var newScope = $rootScope.$new();
                    //    newScope[e.field] = e.field;
                    //    e.container.empty().width(width).append($compile(_.sprintf(columnImageMenuTemplate, e.field))(newScope));
                    //}
                    //else if (foundCol.GridStyleColumnId === 'Button') {
                    //    e.container.remove();
                    //} else
                    //    e.container.width(width).empty().append($compile(_.sprintf(columnMenuTemplate, e.field))(scope));
                };

                this.setDefaultGridSetting = function () {
                    if (genericGridCommonService.gridSetting.hasColumnSeparator) genericGridCommonService.grid.element.removeClass('grid-no-border');
                    else genericGridCommonService.grid.element.addClass('grid-no-border');
                };

                var gridHeight = function () {
                    if (!(genericGridCommonService.grid && genericGridCommonService.grid.element)) return;
                    var contentHeight = genericGridCommonService.grid.element.parent().height();
                    genericGridCommonService.grid.element.css("height", contentHeight + 'px');

                    var gridPagerHeight = $('.k-grid-pager').outerHeight(true);
                    var gridHeaderHeight = $('.k-grid-header').outerHeight(true);
                    var tableContentHeight = contentHeight - (gridPagerHeight + gridHeaderHeight);
                    $(genericGridCommonService.grid.element).find(' > .k-grid-content').css("height", tableContentHeight + 'px');
                    return contentHeight;
                };

                this.setGridHeight = function () {
                    gridHeight();
                    $(window).resize(gridHeight);
                };

                this.setGridHeightWithDetail = function () {
                    var endHeight = -1;
                    var timer = setInterval(function () {
                        gridHeight();
                        if (endHeight == $('.detail-pane').height())
                            clearInterval(timer);
                        endHeight = $('.detail-pane').height();
                    }, 200);
                };

                genericGridCommonService.setGridHeightWithDetail(this.setGridHeightWithDetail);

                this.collapseGroup = function (group) {
                    createCollapsedGroupData(group);
                    mapCollapseRowFilter();
                    genericGridCommonService.grid.dataSource.read();
                };

                this.expandGroup = function (group) {
                    updateCollapsedGroupData(group);
                    mapCollapseRowFilter();
                    genericGridCommonService.grid.dataSource.read();
                };

                var setGridRequirments = function () {
                    var menuConfig = scope.gridMenuConfig;
                    menuConfig.pageSize = genericGridCommonService.gridSetting.masterPageSize;
                    menuConfig.maxPageSize = genericGridCommonService.gridSetting.masterMaxPageSize;
                    menuConfig.minPageSize = genericGridCommonService.gridSetting.masterMinPageSize;
                    menuConfig.resetGridSetting = resetGridSetting;
                    menuConfig.refreshGrid = self.refreshGrid;
                    menuConfig.isHiddenReportButton = genericGridCommonService.gridSetting.isHiddenReportButton;
                };

                var setGridMist = function () {
                    $('.search-tag').append($compile(gridConfigMenu)(scope));
                    //var filterMenu = $('.nav-content-box .content-box-items'),
                    //    searchSave = $('.nav-content-box .content-title .btn-toolbox');

                    //if (filterMenu.find('[grid-filter-menu]').length > 0)
                    //    filterMenu.find('[grid-filter-menu]').remove();
                    //filterMenu.append($compile(gridFilterMenu)(scope));

                    //if (searchSave.find('[grid-search-save]').length > 0)
                    //    searchSave.find('[grid-search-save]').remove();
                    //searchSave.prepend($compile(gridSearchSave)(scope));
                };

                this.initGridMenu = function () {
                    setGridRequirments();
                    setGridMist();
                };

                this.initPager = function () {
                    scope.gridPagerConfig = {
                        buttonCount: genericGridCommonService.gridSetting.pagerButtonCount
                    };
                    $('.page-footer').empty().append($compile(gridPager)(scope));
                };

                this.dataBound = function (e) {
                    updateGroupCollapseInfo();
                    setDefaultColumnSetting();
                    if (scope.gridPagerConfig && angular.isFunction(scope.gridPagerConfig.resetPager))
                        scope.gridPagerConfig.resetPager();
                    if (genericGridCommonService.gridSetting.details) {
                        //this.expandRow(this.tbody.find("tr.k-master-row:visible").first());
                        genericGridCommonService.grid.tbody.delegate('.k-detail-row tbody tr', 'click', onChildRowClick);
                    }

                    onMasterRowClick();

                    //genericGridCommonService.gridSetting.createRowSelection();
                    if (genericGridCommonService.gridOnDataBound)
                        genericGridCommonService.gridOnDataBound(e);

                };

                this.getMasterDataSource = function () {

                    var oldSorts = null,
                        oldGroups = null,
                        dataSourceConfig = {
                            transport: {
                                read: {
                                    url: genericGridCommonService.gridSetting.masterUrl,
                                    dataType: 'json',
                                    type: "POST",
                                    data: genericGridCommonService.gridRequestModel,
                                    complete: function (xhr) {
                                        if ($window.location.hostname != "localhost") {
                                            if (xhr.status == 200 || xhr.status == 302) {
                                                var authState = xhr.getResponseHeader('isiwebauthstate');
                                                if (authState == null || authState != "valid") {
                                                    //loginService.clearLoginData();
                                                    $window.location.reload(true);
                                                }
                                            }
                                        }
                                    },
                                    beforeSend: function (xhr) {
                                        //if ($.cookie('user-culture') != undefined) {
                                        //    xhr.setRequestHeader('user-culture', $.cookie('user-culture'));
                                        //}

                                        if ($rootScope.loggedInUser.tenantId) {
                                            xhr.setRequestHeader('PreferredTenantId', $rootScope.loggedInUser.tenantId);
                                        }

                                        //ToDo: Reza: need to refactor grid cell related scope
                                        genericGridColumnService.destroyGridCell(true);
                                    }
                                },
                                parameterMap: masterParameterMap
                            },
                            requestStart: function (e) {
                                if (genericGridCommonService.grid) {
                                    var sorts = genericGridCommonService.grid.dataSource.sort();
                                    var groups = genericGridCommonService.grid.dataSource.group();

                                    if (sorts && sorts.length == 0) {
                                        sorts = genericGridColumnService.defaultSort;
                                    }

                                    processGroup(e, sorts, groups, oldSorts, oldGroups);
                                    resetSort(sorts);
                                } else resetSort(genericGridCommonService.gridSetting.masterDefaultSort);
                            },
                            requestEnd: function (e) {
                                oldGroups = genericGridCommonService.grid.dataSource.group();
                                oldSorts = genericGridCommonService.grid.dataSource.sort();
                                if (e.response) {
                                    groupCountList = e.response.GroupCount;
                                    scope.config.gridDataModel.updateSearchModel(e.response.StateGenericSearch);
                                }
                                console.log('Response from server: ');
                                console.log(e.response);
                            },
                            pageSize: genericGridCommonService.gridSetting.masterPageSize,
                            serverPaging: true,
                            serverSorting: true,
                            serverFiltering: true,
                            schema: {
                                model: {
                                    id: genericGridCommonService.gridSetting.primaryKey
                                },
                                data: function (val) {
                                    return val.Data;
                                },
                                total: function (val) {
                                    return val.Total;
                                }
                            },
                            group: genericGridCommonService.gridSetting.masterDefaultGroup,
                            sort: genericGridCommonService.gridSetting.masterDefaultSort
                        };

                    return new kendo.data.DataSource(dataSourceConfig);
                };

                this.refreshGrid = function (searchFilters, gridSettingId, isDefaultSetting, masterUrl) {
                    //if (searchFilters.SearchUrl) {
                    //    scope.config.masterUrl = searchFilters.SearchUrl;
                    //}
                    if (isDefaultSetting) {
                        destroyGrid();
                        gridFilterModel = searchFilters;
                        scope.gridMenuConfig.stateGenericSearch = searchFilters;
                        genericGridSettingService.getConfig(scope.config, null, isDefaultSetting).then(function (data) {
                            genericGridCommonService.gridSetting.reloadGridWithSetting(data);
                        });
                    } else if (gridSettingId) {
                        destroyGrid();
                        gridFilterModel = searchFilters;
                        scope.gridMenuConfig.stateGenericSearch = searchFilters;
                        genericGridSettingService.getConfig(scope.config, gridSettingId).then(function (data) {
                            genericGridCommonService.gridSetting.reloadGridWithSetting(data);
                        });
                    } else {
                        gridFilterModel = searchFilters;
                        scope.gridMenuConfig.stateGenericSearch = searchFilters;

                        //quick fix
                        $('[kendo-grid]').find(".k-icon.k-i-expand").trigger("click");
                        //end

                        genericGridCommonService.grid.dataSource.page(1);
                    }
                };

                this.changeGridSetting = function (newScope) {
                    scope = newScope;
                };

                this.detailInit = function (e) {
                    var detailGridId = detailGridIdPrefix + e.masterRow.index(),
                        detailGrid = e.detailRow.find(".container").addClass(detailGridId).kendoGrid({
                            dataSource: getChildDataSource(e),
                            columns: genericGridCommonService.gridSetting.details.columns,
                            selectable: genericGridCommonService.gridSetting.details.selectable,
                        });
                    detailGrid = $(detailGrid).data('kendoGrid');
                    detailGrid.bind('dataBound', function () {
                        detailGrid.tbody.find('tr').attr('data-dgid', detailGridId);
                    });
                };

                this.disableGridColumnReorder = function () {
                    _.forEach(genericGridColumnService.notReordeableCols, function (column) {
                        var dropable = $('th[data-field="' + column.field + '"]', '[kendo-grid]').data('kendoDropTarget');
                        if (dropable)
                            dropable.destroy();
                    });
                    var draggable = $('[kendo-grid]').data("kendoDraggable") || $('[kendo-grid]').data("kendoReorderable").draggable;
                    if (draggable)
                        draggable.bind("dragstart", function (e) {
                            if (_.any(genericGridColumnService.notReordeableCols, function (item) { return item.field === $(e.currentTarget).data('field'); })) {
                                e.preventDefault();
                            }
                        });
                };

                function setDefaultColumnSetting() {
                    _.each(genericGridCommonService.grid.columns, function (col, idx) {
                        genericGridCommonService.wrap(col.wrappedOrOverflowed, col.field);
                        genericGridCommonService.textAlign(col.align, col.field);
                    });
                }

                function createCollapsedGroupData(group) {
                    var groupData = genericGridCommonService.grid.dataSource.group(),
                        collapseGroupData = {
                            groupKey: '',
                            isCollapse: false,
                            level: 0,
                            value: '',
                            child: {}
                        },
                        level = group.find(".k-group-cell").length,
                        offset,
                        $value,
                        tr,
                        root = group,
                        collaspsedGroupClass = 'collapsedGroup';
                    if (level == 0) {
                        $value = getSelectdRowValue(group, level);
                        if (gridGroupDataModel.collapseDataModel[$value]) {
                            collapseGroupData = gridGroupDataModel.collapseDataModel[$value];
                        } else {
                            collapseGroupData.groupKey = $value;
                            collapseGroupData.value = groupData[0].field;
                        }
                        collapseGroupData.isCollapse = true;
                    } else {
                        group.addClass(collaspsedGroupClass);
                        group.prevAll("tr.k-grouping-row").each(function () {
                            tr = $(this);
                            offset = tr.find(".k-group-cell").length;
                            if (offset == 0) {
                                root = tr;
                                return false;
                            }
                        });
                        $value = getSelectdRowValue(root, 0);
                        if (gridGroupDataModel.collapseDataModel[$value]) collapseGroupData = gridGroupDataModel.collapseDataModel[$value];
                        else {
                            collapseGroupData.groupKey = $value;
                            collapseGroupData.value = groupData[0].field;
                        }
                        var groupNode,
                            parentNode = $value,
                            preoffset = 1;
                        root.nextAll("tr.k-grouping-row").each(function () {
                            tr = $(this);
                            offset = tr.find(".k-group-cell").length;
                            if (offset == 0) {
                                return false;
                            }
                            if (offset <= level) {
                                if (offset > preoffset)
                                    parentNode = $value;
                                if (offset < preoffset) {
                                    if (_.isEmpty(collapseGroupData.child[parentNode].child)) {
                                        delete collapseGroupData.child[parentNode];
                                    }
                                }
                                $value = getSelectdRowValue(tr, offset);
                                groupNode = {
                                    groupKey: $value,
                                    isCollapse: false,
                                    level: offset,
                                    value: groupData[offset].field,
                                    child: {}
                                };
                                if (tr.hasClass(collaspsedGroupClass)) {
                                    tr.removeClass(collaspsedGroupClass);
                                    groupNode.isCollapse = true;
                                }
                                if (offset == 1) {
                                    if (collapseGroupData.child[$value]) {
                                        collapseGroupData.child[$value].isCollapse = groupNode.isCollapse || collapseGroupData.child[$value].isCollapse;
                                    } else if ((offset == level && groupNode.isCollapse) || (offset != level))
                                        collapseGroupData.child[$value] = groupNode;
                                } else {
                                    if (collapseGroupData.child[parentNode].child[$value]) {
                                        collapseGroupData.child[parentNode].child[$value].isCollapse = groupNode.isCollapse || collapseGroupData.child[parentNode].child[$value].isCollapse;
                                    } else if (groupNode.isCollapse)
                                        collapseGroupData.child[parentNode].child[$value] = groupNode;
                                }
                                preoffset = offset;
                            }
                        });
                        //if (collapseGroupData.child[parentNode] && _.isEmpty(collapseGroupData.child[parentNode].child)) {
                        //    delete collapseGroupData.child[parentNode];
                        //}
                    }
                    gridGroupDataModel.collapseDataModel[collapseGroupData.groupKey] = collapseGroupData;
                    console.log(gridGroupDataModel.collapseDataModel);
                }

                function getSelectdRowValue(tr, offset) {
                    var groups = genericGridCommonService.grid.dataSource.group(),
                        value = genericGridCommonService.grid.dataItem(tr)[groups[offset].field];
                    return value == null ? "" : value;
                }

                function mapCollapseRowFilter() {
                    var groups = genericGridCommonService.grid.dataSource.group();
                    gridGroupDataModel.filterDataModel = [];
                    _.forEach(gridGroupDataModel.collapseDataModel, function (collapseData) {
                        if (collapseData.isCollapse) {
                            gridGroupDataModel.filterDataModel.push({ logic: "And", filters: [{ field: groups[0].field, operator: "eq", value: collapseData.groupKey }] });
                        } else {
                            _.forEach(collapseData.child, function (firstLevel) {
                                if (firstLevel.isCollapse) {
                                    gridGroupDataModel.filterDataModel.push({
                                        logic: "And",
                                        filters: [
                                            {
                                                field: groups[0].field,
                                                operator: "eq",
                                                value: collapseData.groupKey
                                            },
                                            { field: groups[1].field, operator: "eq", value: firstLevel.groupKey }
                                        ]
                                    });
                                } else {
                                    _.forEach(firstLevel.child, function (secondLevel) {
                                        if (secondLevel.isCollapse) {
                                            gridGroupDataModel.filterDataModel.push({
                                                logic: "And",
                                                filters: [
                                                    {
                                                        field: groups[0].field,
                                                        operator: "eq",
                                                        value: collapseData.groupKey
                                                    },
                                                    {
                                                        field: groups[1].field,
                                                        operator: "eq",
                                                        value: firstLevel.groupKey
                                                    },
                                                    { field: groups[2].field, operator: "eq", value: secondLevel.groupKey }
                                                ]
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    console.log(gridGroupDataModel.filterDataModel);
                }

                function collapseSingleGroup(group, collapseData) {
                    if (collapseData.isCollapse) {
                        group.addClass("collapsed-group");
                        group = $(group).find(".k-icon").addClass("k-i-expand").removeClass("k-i-collapse").end();
                        group.find("td:first").attr("aria-expanded", false);
                        hideChildRow(group);
                    } else {
                        var tr, offset, value, parentNode;
                        group.nextAll("tr.k-grouping-row").each(function () {
                            tr = $(this);
                            offset = tr.find(".k-group-cell").length;
                            if (offset == 0)
                                return false;
                            value = getSelectdRowValue(tr, offset);
                            if (offset == 1) {
                                parentNode = value;
                                if (collapseData.child[value] && collapseData.child[value].isCollapse) {
                                    hideChildRow(tr);
                                }
                            } else {
                                if (collapseData.child[parentNode] && collapseData.child[parentNode].child[value] && collapseData.child[parentNode].child[value].isCollapse) {
                                    hideChildRow(tr);
                                }
                            }
                        });
                    }
                    console.log(collapseData);
                }

                function hideChildRow(group) {
                    group.addClass("collapsed-group");
                    group.find("td:first").attr("aria-expanded", false);
                    group = $(group).find(".k-icon").addClass("k-i-expand").removeClass("k-i-collapse").end();
                    var level = group.find(".k-group-cell").length,
                        footerCount = 1,
                        offset,
                        tr;
                    group.find("td:first").attr("aria-expanded", false);
                    group.nextAll("tr").each(function () {
                        tr = $(this);
                        offset = tr.find(".k-group-cell").length;

                        if (tr.hasClass("k-grouping-row")) {
                            footerCount++;
                        } else if (tr.hasClass("k-group-footer")) {
                            footerCount--;
                        }

                        if (offset <= level || (tr.hasClass("k-group-footer") && footerCount < 0)) {
                            return false;
                        }
                        tr.hide();
                    });
                    return group;
                }

                function updateCollapsedGroupData(group) {
                    var level = group.find(".k-group-cell").length,
                        tr,
                        offset,
                        value,
                        parent = group,
                        root,
                        expandGroupClass = 'expandGroup';
                    value = getSelectdRowValue(group, level);
                    if (level == 0 && gridGroupDataModel.collapseDataModel[value]) {
                        gridGroupDataModel.collapseDataModel[value].isCollapse = false;
                    } else {
                        group.addClass(expandGroupClass);
                        group.prevAll("tr.k-grouping-row").each(function () {
                            tr = $(this);
                            offset = tr.find(".k-group-cell").length;
                            if (offset == 0) {
                                parent = tr;
                                return false;
                            }
                        });
                        root = getSelectdRowValue(parent, offset);
                        if (gridGroupDataModel.collapseDataModel[root]) {
                            var parentNode = root,
                                preoffset = 1;
                            parent.nextAll("tr.k-grouping-row").each(function () {
                                tr = $(this);
                                offset = tr.find(".k-group-cell").length;
                                if (offset == 0) {
                                    return false;
                                }
                                if (offset <= level) {
                                    if (offset > preoffset)
                                        parentNode = value;
                                    if (offset < preoffset) {
                                        if (gridGroupDataModel.collapseDataModel[root].child[parentNode] && _.isEmpty(gridGroupDataModel.collapseDataModel[root].child[parentNode].child)) {
                                            delete gridGroupDataModel.collapseDataModel[root].child[parentNode];
                                        }
                                    }
                                    value = getSelectdRowValue(tr, offset);
                                    if (tr.hasClass(expandGroupClass)) {
                                        tr.removeClass(expandGroupClass);
                                        if (offset == 1) {
                                            if (gridGroupDataModel.collapseDataModel[root].child[value]) {
                                                gridGroupDataModel.collapseDataModel[root].child[value].isCollapse = false;
                                                if (_.isEmpty(gridGroupDataModel.collapseDataModel[root].child[value].child)) {
                                                    delete gridGroupDataModel.collapseDataModel[root].child[value];
                                                }
                                            }
                                        } else {
                                            if (gridGroupDataModel.collapseDataModel[root].child[parentNode] &&
                                                gridGroupDataModel.collapseDataModel[root].child[parentNode].child[value]) {
                                                gridGroupDataModel.collapseDataModel[root].child[parentNode].child[value].isCollapse = false;
                                                if (_.isEmpty(gridGroupDataModel.collapseDataModel[root].child[parentNode].child[value].child)) {
                                                    delete gridGroupDataModel.collapseDataModel[root].child[parentNode].child[value];
                                                }
                                            }
                                        }
                                    }
                                    preoffset = offset;
                                }
                            });
                            if (_.isEmpty(gridGroupDataModel.collapseDataModel[root])) {
                                delete gridGroupDataModel.collapseDataModel[root];
                            }
                        }
                    }
                }

                function updateGroupCollapseInfo() {
                    var value,
                        level,
                        tr,
                        i = 0;

                    genericGridCommonService.grid.tbody.find("tr.k-grouping-row").each(function () {
                        tr = $(this);
                        level = tr.find(".k-group-cell").length;
                        if (level == 0) {
                            value = getSelectdRowValue(tr, level);
                            if (gridGroupDataModel.collapseDataModel[value]) {
                                collapseSingleGroup(tr, gridGroupDataModel.collapseDataModel[value]);
                            }
                        }
                        if (groupCountList && groupCountList[i])
                            tr.find("td:not(.k-group-cell)").append('(' + groupCountList[i] + ')');
                        i++;
                    });
                }

                function processGroup(e, sorts, groups, oldSorts, oldGroups) {
                    //if (_.any(sorts, function (sort, i) {
                    //    return _.any(oldGroups, function (group) {
                    //        var isExistInOldGroup = sort.field === group.field;
                    //        if (isExistInOldGroup)
                    //            sorts.splice(i, 1);
                    //        return isExistInOldGroup;
                    //});
                    //})) {
                    //    e.preventDefault();
                    //    return;
                    //} else if (_.any(sorts, function (sort, i) {
                    //    return _.any(groups, function (group) {
                    //        var isExistInNewGroup = sort.field === group.field;
                    //        if (!(groups && groups.length > maxLevelGroup) && isExistInNewGroup)
                    //            sorts.splice(i, 1);
                    //        return isExistInNewGroup;
                    //});
                    //})) {
                    //}

                    if (groups && groups.length > maxLevelGroup) {
                        var foundGroup = null;
                        _.each(groups, function (item) {
                            if (!_.any(oldGroups, function (oi) { return _.isEqual(item, oi); }))
                                foundGroup = item;
                        });
                        resetGroup(foundGroup);
                        groups.splice(groups.length - 1, 1);
                        e.preventDefault();
                        return;
                    }
                }

                function resetSort(sorts) {
                    if (!sorts) return;

                    if (sorts.length > maxLevelSort) {
                        sorts[sorts.length - 2] = sorts[sorts.length - 1];
                        sorts.splice(sorts.length - 1, 1);
                        genericGridCommonService.grid.dataSource.sort(sorts);
                    }

                    $('.ch-sort-order').text('');
                    _.each(sorts, function (sort, index) {
                        $('#' + sort.field).text(index + 1);
                    });
                }

                function resetGroup(group) {
                    $('.k-group-indicator[data-field="' + group.field + '"]').remove();
                }

                function masterParameterMap(options) {
                    if (!genericGridCommonService.grid) return options;
                    //var gridColumns = [];
                    //_.forEach(genericGridCommonService.grid.columns, function (column) {
                    //    if ((column.GridStyleColumnId !== 'Icon') && (column.GridStyleColumnId !== 'Button') && (column.GridStyleColumnId !== 'Image'))
                    //        gridColumns.push(column.field);
                    //});
                    //if (gridColumns.length !== 0) options.ColumnList = gridColumns;

                    options.ColumnList = genericGridColumnService.columnList;
                    var groups = genericGridCommonService.grid.dataSource.group(),
                        i = groups.length - 1;
                    if (!options.group) options.group = [];
                    if (!angular.isArray(options.sort)) options.sort = [];
                    if (_.isEmpty(options.sort)) options.sort = genericGridColumnService.defaultSort;
                    _.forEach(groups, function (group) {
                        if (!_.any(options.group, function (groupItem) { return groupItem.field === group.field; }))
                            options.group.push(group);
                        if (!_.any(options.sort, function (sortItem) { return sortItem.field === groups[i].field; }))
                            options.sort.unshift(groups[i]);
                        i--;
                    });
                    checkGroupChanged(groups);
                    if (gridGroupDataModel && gridGroupDataModel.filterDataModel.length)
                        options.filter = gridGroupDataModel.filterDataModel;

                    options.StateGenericSearch = gridFilterModel;
                    options.GridId = scope.config.gridId;
                    options.StateName = 'kendo';

                    gridRequestModel = options;
                    console.log('Grid request send to the server: ');
                    console.log(options);

                    removeAllFalsyProperties(options.StateGenericSearch);

                    genericGridCommonService.setCurrentQueryOptions(options);

                    return options;
                }

                function removeAllFalsyProperties(obj) {
                    for (var i in obj) {
                        if (obj[i] === null) {
                            delete obj[i];
                        } else if (typeof obj[i] === 'object') {
                            removeAllFalsyProperties(obj[i]);
                        }
                    }
                }

                function checkGroupChanged(groups) {
                    var i;
                    if (gridGroupDataModel) {
                        if (groups.length != previousGroupList.length) {
                            gridGroupDataModel.filterDataModel = [];
                            gridGroupDataModel.collapseDataModel = {};
                        } else {
                            i = 0;
                            _.forEach(groups, function (group) {
                                if (group.field != previousGroupList[i].field) {
                                    gridGroupDataModel.filterDataModel = [];
                                    gridGroupDataModel.collapseDataModel = {};
                                    return false;
                                }
                                i++;
                            });
                        }
                    }
                    previousGroupList = groups;
                }

                function getChildDataSource(e) {
                    return new kendo.data.DataSource({
                        transport: genericGridSettingService.getDetailTransport(e, genericGridCommonService.gridSetting.details.childRequestType)
                    });
                }

                function onMasterRowClick() {
                    var rows = genericGridCommonService.grid.tbody.find('>tr[data-uid] td:not(.k-hierarchy-cell)').not($('td .grid-selection-cell').parent()).not($('td .grid-btn').parent());
                    var timeouts = [];

                    rows.click(function (e) {
                        var selectedRow = $(this).parent(),
                            dataItem = genericGridCommonService.grid.dataItem(selectedRow);
                        //ToDo: Rony - why do we use timeout hack ?
                        timeouts.push(setTimeout(function () {
                            rowSelectionColumnCheckBoxService.singleClickOnRow(e, selectedRow, dataItem, gridRequestModel, scope.config);
                        }, 500));
                    });

                    rows.dblclick(function (e) {
                        //ToDo: Rony - why do we use timeout hack ?
                        for (var i = 0; i < timeouts.length; i++) {
                            clearTimeout(timeouts[i]);
                        }
                        timeouts = [];

                        var selectedRow = $(this).parent(),
                            dataItem = genericGridCommonService.grid.dataItem(selectedRow);

                        rowSelectionColumnCheckBoxService.doubleClickOnRow(e, selectedRow, dataItem, scope.config);
                    });
                }

                function onChildRowClick(e) {
                    var selectedRow = this,
                        detailGridId = $(selectedRow).data('dgid'),
                        childDataItem = $('.' + detailGridId).data('kendoGrid').dataItem(selectedRow),
                        stateConfig = scope.config.generateGridDetailUrl(childDataItem);

                    //if (stateConfig)
                    //    $state.go(stateConfig.stateName, stateConfig.param);
                }

                function resetGridSetting() {
                    genericGridSettingService.deleteConfig({
                        gridId: genericGridCommonService.gridSetting.gridId,
                        stateName: genericGridCommonService.currentStateName
                    }).then(function () {
                        destroyGrid();
                        gridSearchService.clearSelectedSearchCriteria();
                        rowSelectionService.initService();
                        genericGridSettingService.getConfig(scope.config).then(function (data) {
                            genericGridCommonService.gridSetting.initGrid(data);
                        });
                    });
                }

                function destroyGrid() {
                    serviceInitialization();
                    if (genericGridCommonService.grid) {
                        genericGridCommonService.grid.destroy();
                        //genericGridCommonService.grid.element.empty();
                        genericGridCommonService.grid = null;
                    }
                    $('.search-tag').empty();
                    $('.nav-content-box .content-box-items').find('[grid-filter-menu]').remove();
                    $('.nav-content-box .content-title .btn-toolbox').find('[grid-search-save]').remove();
                    $('.page-footer .custom-pager').remove();
                    $('[kendo-grid]').empty();
                }

                function serviceInitialization() {
                    genericGridColumnService.initService();
                }

            }

            GenericGrid.$inject = ['$compile', 'genericGridSettingService', '$rootScope', 'scp', '$window'];

            return function (scp) {
                return $injector.instantiate(GenericGrid, { scp: scp });
            };
        }
    ]);
});
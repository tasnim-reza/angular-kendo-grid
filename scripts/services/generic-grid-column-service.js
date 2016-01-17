define(['shell/shell-service-module', 'shellService/template-loader-service'], function (shellServiceModule) {
    shellServiceModule.service('genericGridColumnService', ['$rootScope', '$filter', 'templateLoaderService', 'settingService', '$q', '$compile',
        function ($rootScope, $filter, templateLoaderService, settingService, $q, $compile) {
            'use strict';

            var self = this;

            self.detailColumnList = null;

            self.columnList = null;

            self.notReordeableCols = [];

            self.hasNotColumnMenuFields = [];

            self.defaultSort = null;

            self.getColumns = function (columnSettings, configModel) {
                var promises = [],
                    outerDeferred = $q.defer(),
                    columns = [],
                    sortedColumnSettings = _.sortBy(columnSettings, function (col) { return col.ColumnOrder; }),
                    keyColumn = _.find(sortedColumnSettings, function (item) { return item.DataField && item.DataField.IsKey; });;

                angular.forEach(sortedColumnSettings, function (column, idx) {
                    var col = {},
                        sortOrderTemplate = '<span class="ch-sort-order" id="%s"></span>',
                        field = null;

                    if (column.DataField) {
                        sortOrderTemplate = _.sprintf(sortOrderTemplate, column.DataField.Value);
                        field = column.DataField.Value;
                    } else {
                        field = column.GridStyleColumnId;
                    }

                    col.title = $rootScope.resources[column.TitleResourceKey] || column.GridStyleColumnId;
                    col.field = field;
                    col.headerTemplate = col.title + sortOrderTemplate;
                    col.GridStyleColumnId = column.GridStyleColumnId;
                    col.hidden = column.IsHidden;
                    col.sortable = column.IsSortable;
                    col.groupable = column.IsGroupable;
                    if (column.Width) col.width = column.Width + 'px'; //ToDo: should removed last column width  (&& sortedColumnSettings.length-1 !== idx)
                    col.maxWidth = column.WidthMax + 'px';
                    col.minWidth = column.WidthMin + 'px';
                    col.align = column.Align;
                    col.wrappedOrOverflowed = column.WrappedOrOverflowed;
                    col.isSelectable = column.IsSelectable;
                    col.isReorderable = column.IsReorderable;
                    col.hasColumnMenu = column.HasColumnMenu;

                    if (!column.IsReorderable) self.notReordeableCols.push(col);
                    if (!column.HasColumnMenu)
                        self.hasNotColumnMenuFields.push(col.field);

                    //if (column.IsGroupable && (column.ColumnStyleId === "Date" || column.ColumnStyleId == "DateTime")) {
                    //    col.template = function (dataItem) {
                    //        //TODO:The format should comes from the columstyle. The grid setting must have column named as ColumnFormat
                    //        var format = 'dd.MM.yyyy';
                    //        if (column.ColumnStyleId == "DateTime") {
                    //            format = 'dd.MM.yyyy HH:mm:ss';
                    //        }
                    //        return getLocalizedDate(dataItem[col.field], format);
                    //    };
                    //    col.groupHeaderTemplate = function (dataItem) { return col.title + ': ' + getLocalizedDate(dataItem.value); };
                    //}

                    if (column.IsGroupable && column.DataType === "Date") {
                        col.template = function (dataItem) {
                            //TODO:Need to define all supported date formats
                            var dbFormat = dataItem.DateOfBirthFormat;
                            var gridFormat = column.DataFormat;
                            var finalFormat = column.DataFormat;
                            if (dbFormat) {
                                if (_.str.include(gridFormat, dbFormat)) {
                                    finalFormat = dbFormat;
                                }
                            }
                            return getLocalizedDate(dataItem[col.field], finalFormat);
                        };
                        col.groupHeaderTemplate = function (dataItem) { return col.title + ': ' + getLocalizedDate(dataItem.value); };
                    }

                    /*switch (column.ColumnStyleId) {
                        case 'Image':
                            createImageColumn(col, sortOrderTemplate, sortedColumnSettings);
                            break;
                        case 'Button':
                            createButtonColumn(col, configModel, column);
                            break;
                        case 'Icon':
                            createIconColumn(col, column.Type, column.Url, sortOrderTemplate, sortedColumnSettings);
                            break;
                        default:
                            break;
                    }*/
                    //Todo: need a refactor to generalize grid template
                    if (column.ColumnStyleId === 'Template' || column.ColumnStyleId === 'TemplateHasColumnMenu' || column.ColumnStyleId === 'TemplateReorderable') {
                        var deferred = $q.defer();

                        if (column.IsSelectable) { //only for selectable column //Todo: should remove this column property
                            var cellTemplate = '<div class="grid-selection-cell" grid-cell-template url="%s" uid="%s"></div>',
                                headerTpl = '<div class="grid-selection-cell" grid-cell-header-template url="%s" uid="%s"></div>';
                            col.headerTemplate = function (dataItem) {
                                var tpl = _.sprintf(headerTpl, column.HeaderTemplateUrl, dataItem.uid);
                                convertInToAngularTemplate(configModel, dataItem, tpl);
                                return tpl;
                            },
                            col.template = function (dataItem) {
                                var tpl = _.sprintf(cellTemplate, column.CellTemplateUrl, dataItem.uid);
                                convertInToAngularTemplate(configModel, dataItem, tpl);
                                return tpl;
                            };
                            deferred.resolve(columns);
                            //});
                        } else if (column.GridStyleColumnId === 'Button') { // button column // todo
                            var cellTemplate2 = '<div grid-cell-template url="%s" uid="%s"></div>';
                            templateLoaderService.getTemplate(column.HeaderTemplateUrl).then(function (html) {
                                if (keyColumn) {
                                    col.headerTemplate = kendo.template(html.data)({ keyColumn: keyColumn.DataField.Value, additionalData: configModel });
                                } else {
                                    col.headerTemplate = kendo.template(html.data)({ additionalData: configModel }); // todo
                                }

                                col.template = function (dataItem) {
                                    var tpl = _.sprintf(cellTemplate2, column.CellTemplateUrl, dataItem.uid + 'btn');
                                    convertInToAngularTemplate(configModel, dataItem, tpl);
                                    return tpl;
                                };
                                deferred.resolve(columns);
                            });
                        } else if (!column.HeaderTemplateUrl && column.CellTemplateUrl) {
                            templateLoaderService.getTemplate(column.CellTemplateUrl).then(function (html) {
                                col.template = function (dataItem) {
                                    return kendo.template(html.data)({ data: dataItem, genericGridConfig: configModel });
                                };
                                deferred.resolve(columns);
                            });
                        } else if (column.HeaderTemplateUrl && column.CellTemplateUrl) {
                            templateLoaderService.getTemplate(column.HeaderTemplateUrl).then(function (html) {
                                col.headerTemplate = html.data;
                                templateLoaderService.getTemplate(column.CellTemplateUrl).then(function (html1) {
                                    col.template = function (dataItem) {
                                        return kendo.template(html1.data)({ data: dataItem, genericGridConfig: configModel });
                                    };
                                    deferred.resolve(columns);
                                });
                            });
                        }
                        promises.push(deferred.promise);
                    }

                    //ToDo: The below code segment will be removed after BusinessCasePerson api refactored with localization support
                    if (column.GridStyleColumnId === 'Sex') {
                        col.template = function (dataItem) {
                            var sexValue = dataItem[col.field];
                            if (sexValue) return sexValue;
                            else {
                                sexValue = dataItem[col.field + '_' + $rootScope.currentCulture];
                                sexValue = sexValue ? sexValue[0].toUpperCase() + sexValue.substring(1) : "";
                                return sexValue;
                            }
                        };
                    }

                    columns.push(col);
                });

                if (promises.length === 0) {
                    promises.push(outerDeferred.promise);
                    outerDeferred.resolve(columns);
                }

                return $q.all(promises);
            };

            self.getSortedColumns = function (columnSettings) {
                var sortedColumns = _.sortBy(_.filter(columnSettings,
                    function (item) {
                        return item.SortOrder;
                    }),
                    function (col) {
                        return col.IsSortable && col.SortNo;
                    });

                setDefaultSort(columnSettings);

                return _.map(sortedColumns, function (col) {
                    return {
                        //field: col.DataField.IsSupportLocalization === true ? col.DataField.Value + $rootScope.currentCulture : col.DataField.Value,
                        field: col.DataField.Value,

                        dir: col.SortOrder
                    };
                });
            };

            self.getGroupColumns = function (columnSettings) {
                var sortedColumns = _.sortBy(_.filter(columnSettings,
                    function (item) {
                        return item.GroupOrder;
                    }),
                    function (col) {
                        return col.IsGroupable && col.GroupNo;
                    });
                return _.map(sortedColumns, function (col) {
                    return {
                        field: col.DataField.Value,
                        dir: col.GroupOrder
                    };
                });
            };

            self.getDetailsColumns = function (columnSettings, configModel) {
                self.detailColumnList = null;
                return self.getColumns(columnSettings, configModel);
            };

            self.initService = function () {
                self.notReordeableCols = [];
                self.detailColumnList = null;
                self.columnList = null;
                self.defaultSort = null;
            };

            function getLocalizedDate(field, format) {
                if (!field) return '';
                //return $filter('date')(field, 'fullDate');
                return $filter('date')(field, format);
                //return kendo.parseDate(field, "yyyy/MM/dd");
                //'dd.MM.yyyy'
            };

            function createImageColumn(col, sortOrderTemplate, sortedColumnSettings) {
                col.headerTemplate = createImageColumnHeader(sortOrderTemplate, sortedColumnSettings);
                col.template = function (dataItem) {
                    //var src = 'data:image/jpeg; base64, ' + dataItem[col.field];
                    var src = '';
                    if (dataItem.Sex_En === 'Male' || dataItem.Sex_De === 'männlich')
                        src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODNDNUZCRDU5MEFBMTFFM0JBMTZFOUNGMEIwMDMyMDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODNDNUZCRDY5MEFBMTFFM0JBMTZFOUNGMEIwMDMyMDAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4M0M1RkJEMzkwQUExMUUzQkExNkU5Q0YwQjAwMzIwMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4M0M1RkJENDkwQUExMUUzQkExNkU5Q0YwQjAwMzIwMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnGgj5EAAAUqSURBVHja7FyLceIwEFWYK8DXgVJBTAUxFYRUEKggpIJABSQVQCqAVACpIKQCfBXgDjhrZn23UeQv0koCvRlNGDy2pcfT00pa5ep4PDJHwfOS5OUWfS7DNi9pXr7g8861xlw5RnSUl2FeHvMSn/CcLC/rvLwB8YFohCkQHGl+rlD6LC/LSydaWMIC7MEkhLKfbNlKzwEVbwhILn7Qz7yMLk3RC1uNBhsZXwLRNkm2QnbPkl3YJplBHabnqmgRuq0cC3EHFCEgJdEibNsbCN90hH99iL3PwjrmDpJczEAn56JoDmp2FULN1yZVTaXoZ+Y2ItOqplC062rGqv7ts6KHzA9EJutKQfQD8we3vlqHadsQ8e8bhGj4nbegzrZRTgqDon4Iog2W0bEbDnlZVVzf5yWpeXeUlyk8qw0iE1yYto6bimvrku93MIGIaq7XzeYymGL3K96lQuyjR8clBIjGv5eQOGDlW1fF9aylHdxDSS+F6AyI2ikGHkziQwlhbUmWe5Dw33FNb4h89GgZQ3RtL3lyVHGfQGygfjF4PUfvmZrg4hdh6LSWvJKjz/dIqapY1tQWFNm2lmnrwN38FX3G/ruUunKsCOFeCGavXhO9Q/66LfkhZjWRCsUuCC8RhzdEp9Jf+ful4hoejGYNIwWdRO98JPpPSddMobzW2M4Lo4H3RG8rPHBco9ZXZnjXQ7HGkfluHUwxAdlW3EOpZjwAG4tCKIjOWs64PojVzNG48OEr0VglTZcg18RqThr0Mi+I/mip6IxQzQJ350I0HhA5cwt4V2Vr8kWURKsGRNsYKnqet0QztMZx5xjRD4o6ek30h4OK5qg+KTO8wEStaKM7zS3xTKVmSqKxYlywD/kHfzsXonFjuuxO68YE1WHHCNalKYl2xT7E+x8p1UxNdIrItpmL94zULCZGy3MjGquHW4pAOPuezEi2pmLjDMseGiwmMgPid2+kH/ia0WwsWDnDMkMxNaVXDyWSqXZvrCkaq1o0tE/QfeVjHcYTz11QNFY1JxoYF+znXmRG2mLDCTRV5RMlrSSEiZYbG+21eXI2gcGp6MoDAxOHGN6BLaNP6c22rYOx74kxkaJ76/DllfTMJxsk27YOlYV8Qh7cqc+MpOcKzG220wWiuZQsfjjRs1UkL2y30wWii6zOg0KBUYfnOEeyS0SXkX2ANNomhE8U9y9caZ9LRJcpssAKQjUu2cRIyrUuMHGpbTbCOw7TYZE1Oi6JFp5Z95OsO3jurmRGKr5/Z///s9hZRR0cFCardVRxTwKTi6bY1zyPK+75hHpFvlvHqIasQ4NGxjAw1llKXV3mNT/USjr64bx1CGsYseb/Wq3tcmki2UTWsE5ND5amsG7+onU9RLM9LDoe4DQZHUQVvaHuUOlc0wSK6WrI/Hg6dM0KdZDcNcQ0RvSkwxHgukbpCsuSkrDPSt1MxLs6sAcVdVH4sGW00qXnxRSD4ZR4FzuFQe+rZPCLYDn0BgZKqpyRJ9Yij7sN0cWyo43da1exhslRpotoeQE9oNlMtNXC/yiQ3EiE8SmKHsHOR0A9KrfjqogOJGsku4zo4MmnRUk/clVURLv6P0R9wo/1G9VguAokn4xEXk+XFS0uzgNP2vz6Xw4JJjpYhn4sIcb+Zh2TQLJ2iMiNY0UHNRtWdQ8xH0g2gyFWdJGvHGAG9z2YnASSzeKux8KyJwViQfRt4IGG6GAbBBCD4THQEIgORAcEogPRgeiAQHQgOqA10ZuW9xQpWAEt8FeAAQDOBj/HRTHsvgAAAABJRU5ErkJggg==';
                    else if (dataItem.Sex_En === 'Female' || dataItem.Sex_De === 'männlich')
                        src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzgxRDQ5MUE5MEFBMTFFM0IyNzFCQTJGMEQxMkFCN0MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzgxRDQ5MUI5MEFBMTFFM0IyNzFCQTJGMEQxMkFCN0MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozODFENDkxODkwQUExMUUzQjI3MUJBMkYwRDEyQUI3QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozODFENDkxOTkwQUExMUUzQjI3MUJBMkYwRDEyQUI3QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoRtkQcAAAVLSURBVHja7FyLbdswEL0IGUCZoMoEViYIO0GUCaxMYGcCyxO4mcDOBHYnsDJBvIG9Qb2BKwKnRnX1oSQeeVT1gAOKFKLop8fH4/fmcrnACHrcMq9fkEWI8ZiFj/8uwwHjI4tdFmdOP+SGoaIlkdMsIiS6KzZZvCH5I9EIqdQ5EhxoLjvN4iWLk80f6DEgOMnimMWCgGQJgeUn/6uipTWskWxTkDbybEPdniUVbzF8w++W/v9Z06EOhmhJ7B7VbNOu9mgpgyQ6RK8MwT7yVhUOjWjfgh+rKjscEtFbJkquItsfAtGJaT/saCNOEx1gfswdAgdMzhK9BndANWAiJ1posAyTE0M+pTAoiZ72HMF9z+LBMNk6xGGUaKmOuOOzSyQ4xaHyiwULcYboqKNNfId/J392hskWFF5NRfRTR5LTiv/fGCZ75grRogPJTRP0OdkmPDtygeiw5UjrGdRXQTaKH0VH/h9wJ7pNBV9r7KIpI1kaIJu9olUgO7kfPfJr2Wneo8pZLcSaIvqbIlE6Orc8/btDC9oAk8XYa9xaanIUndoOo65eIWZEkUI/cnJprqMMaQMhVDgVcvI7qF8Z3w2B6FcmrXmDHr+sGNmCy0Rz9NAEsxjSDtU00UvgiZR65OkZVvMJ+CKlyqFNE70E3hCuEf1hohcnwBNlh2hK0e/AH1HHEa41otMKRXMn2XdN0WUWETInekpdZyqir3PSGWOSAyiff5646NER8NoOVkRc8wFYEx1U+F3EkGS/prWxtw5R8XeOO5bmDS1NcCb6sUbpwhE1a1e1SUVzU3WTmutEY53osKETEUxUHShmQmytQ6ViKwZErxSzIF+Xfegmeqqo+tgiyaJlBiS4ER22+PqqiqLoANcE4jFK9JT4B+uyjKCDgHxORLe1g8iwhcQ93hdxITru+NVXYGbCKezZCfeeq9F1RPnYY27gBLQbzn2sX9/mfw89Fi88TWoOejwvn6U6gqbzeNvMtqKPoGemK9+8eNZMsi5rOqOqzzYUPQd904k6jzBTHIfO7xQxbh0+wdyFLFPePpD0KCPBMiisaNa13D5EU57tXqAi26RjMXxdsEI54Omk6q4eHRMMONKK4a70RLm4+xN7/UNhaCx/+COU378kn3sjIP6MWdKJmuiQKEu4w7J1XJgiSciPbOjqrIvYYflk1uEDzc0xJ1RKCl+7+PuQ8FBQ/onAQqLWo0WpaMXws/i80OH6fUEW6xbP77MQJeVQ4RfWUYk/VeswcYnIM5RvtMkXdieF94cFxeYXCh4qlEd5RYR67q/4ReYXeuxbtC7V2Bqod6JSF9UzLPnpqSdd04YlEBippvICoN3iIL3/HRRPlvUZgssUbwp61wBTbIo6sCUgeoNWdYCWJxe8jso7Yh4tCFQdayqHQs0x5u2tMxmvZVPcYwSETVLHMhflAnA+Ap1TEB3h/IEAevRd5poD/WKCjx9TeeDmKarD9PWWXZe5AjC7SUeozhI2Eb0G4tuzGj5wW4uycYlhPuMYdyV6DXb3X7S1kAjs7oKq5curUZNNkotNc07wUSjJjlSJjizaRRlU7qNbAJ+N7usyz74esOhaMdaNuoFMfic0JxxwBrFS0WvgeQSizkJWDOsrP35SpWiBeSFXlK1CU8/O9cWfvSDelc9xhl+i3hXzOi+uFR2gN7uAXCXc1fxXfXNFz8AdLByr86yoaIoFTEqvfnCoBcr63nnQfO6Eo1cvHKtv6AHva+GrEDtW30gSPYER1Jh4jtmGqwg94H/FwxAQeMD31oFBwRspGIkeiR4xEj0SPRI9YiR6SPgtwAAtJ6YPoDF1QAAAAABJRU5ErkJggg==";
                    else
                        src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjdENkZDNzM5MEFCMTFFM0I3REY4NzY3QjQzMEMxNUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjdENkZDNzQ5MEFCMTFFM0I3REY4NzY3QjQzMEMxNUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCN0Q2RkM3MTkwQUIxMUUzQjdERjg3NjdCNDMwQzE1RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCN0Q2RkM3MjkwQUIxMUUzQjdERjg3NjdCNDMwQzE1RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsWhcRMAAAH7SURBVHja7N3hTcMwEIbhNguQDSgblAnICB2BDcgGCRMUJihM0jIBbEA7QbtBOEv+ESGU5uzYscX7SSdEa+XcR+Xq/gnLrusWmaSUqqWe7O+vUi9Slxw2v8wAug9c/nrukgt4ytBDwIvcwFOE1gBnA54StA9w8uApQE8JnCz4nNAhgZMDnwPaF/jL/lxnBW6gI1Up1UqdO7ds7TX619s6Xuts91LGev05AJvUA9evPa4bDTzk6JhqBh+l7q6s+ZZapTzDi0DArX3xzQQfdO8Trbm258buuQ3x4VwkDDzXSSgIeJEB8M1Ea2YF95nRsc7BZkbfD8xO0/vTc0aHn+EznSK02Q3sZxdxH86nlNSB+9lLbXr72djH5ogafMzoiPlVObeMHilD0ABPCP4XNMABwPvQAAcEN9AARwA30LUCuHFseJD6UKy/lXp07PUmdVKsf5CqHHs9jwZXngdd0yr7VB69KmWv1qPX6D4Ff91xAjTQQBOggQYaAqCBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNND/NOZOjnvF+sqxz9HW2Jg7S64de5l/iKO5a/lq4X439YMGuuP9FucdDTTQQBOggQYaBqCBJrr8CDAAPLzSBaKZL5kAAAAASUVORK5CYII=";
                    /*
                    Person Male Icon_____________________________________________
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODNDNUZCRDU5MEFBMTFFM0JBMTZFOUNGMEIwMDMyMDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODNDNUZCRDY5MEFBMTFFM0JBMTZFOUNGMEIwMDMyMDAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4M0M1RkJEMzkwQUExMUUzQkExNkU5Q0YwQjAwMzIwMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4M0M1RkJENDkwQUExMUUzQkExNkU5Q0YwQjAwMzIwMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnGgj5EAAAUqSURBVHja7FyLceIwEFWYK8DXgVJBTAUxFYRUEKggpIJABSQVQCqAVACpIKQCfBXgDjhrZn23UeQv0koCvRlNGDy2pcfT00pa5ep4PDJHwfOS5OUWfS7DNi9pXr7g8861xlw5RnSUl2FeHvMSn/CcLC/rvLwB8YFohCkQHGl+rlD6LC/LSydaWMIC7MEkhLKfbNlKzwEVbwhILn7Qz7yMLk3RC1uNBhsZXwLRNkm2QnbPkl3YJplBHabnqmgRuq0cC3EHFCEgJdEibNsbCN90hH99iL3PwjrmDpJczEAn56JoDmp2FULN1yZVTaXoZ+Y2ItOqplC062rGqv7ts6KHzA9EJutKQfQD8we3vlqHadsQ8e8bhGj4nbegzrZRTgqDon4Iog2W0bEbDnlZVVzf5yWpeXeUlyk8qw0iE1yYto6bimvrku93MIGIaq7XzeYymGL3K96lQuyjR8clBIjGv5eQOGDlW1fF9aylHdxDSS+F6AyI2ikGHkziQwlhbUmWe5Dw33FNb4h89GgZQ3RtL3lyVHGfQGygfjF4PUfvmZrg4hdh6LSWvJKjz/dIqapY1tQWFNm2lmnrwN38FX3G/ruUunKsCOFeCGavXhO9Q/66LfkhZjWRCsUuCC8RhzdEp9Jf+ful4hoejGYNIwWdRO98JPpPSddMobzW2M4Lo4H3RG8rPHBco9ZXZnjXQ7HGkfluHUwxAdlW3EOpZjwAG4tCKIjOWs64PojVzNG48OEr0VglTZcg18RqThr0Mi+I/mip6IxQzQJ350I0HhA5cwt4V2Vr8kWURKsGRNsYKnqet0QztMZx5xjRD4o6ek30h4OK5qg+KTO8wEStaKM7zS3xTKVmSqKxYlywD/kHfzsXonFjuuxO68YE1WHHCNalKYl2xT7E+x8p1UxNdIrItpmL94zULCZGy3MjGquHW4pAOPuezEi2pmLjDMseGiwmMgPid2+kH/ia0WwsWDnDMkMxNaVXDyWSqXZvrCkaq1o0tE/QfeVjHcYTz11QNFY1JxoYF+znXmRG2mLDCTRV5RMlrSSEiZYbG+21eXI2gcGp6MoDAxOHGN6BLaNP6c22rYOx74kxkaJ76/DllfTMJxsk27YOlYV8Qh7cqc+MpOcKzG220wWiuZQsfjjRs1UkL2y30wWii6zOg0KBUYfnOEeyS0SXkX2ANNomhE8U9y9caZ9LRJcpssAKQjUu2cRIyrUuMHGpbTbCOw7TYZE1Oi6JFp5Z95OsO3jurmRGKr5/Z///s9hZRR0cFCardVRxTwKTi6bY1zyPK+75hHpFvlvHqIasQ4NGxjAw1llKXV3mNT/USjr64bx1CGsYseb/Wq3tcmki2UTWsE5ND5amsG7+onU9RLM9LDoe4DQZHUQVvaHuUOlc0wSK6WrI/Hg6dM0KdZDcNcQ0RvSkwxHgukbpCsuSkrDPSt1MxLs6sAcVdVH4sGW00qXnxRSD4ZR4FzuFQe+rZPCLYDn0BgZKqpyRJ9Yij7sN0cWyo43da1exhslRpotoeQE9oNlMtNXC/yiQ3EiE8SmKHsHOR0A9KrfjqogOJGsku4zo4MmnRUk/clVURLv6P0R9wo/1G9VguAokn4xEXk+XFS0uzgNP2vz6Xw4JJjpYhn4sIcb+Zh2TQLJ2iMiNY0UHNRtWdQ8xH0g2gyFWdJGvHGAG9z2YnASSzeKux8KyJwViQfRt4IGG6GAbBBCD4THQEIgORAcEogPRgeiAQHQgOqA10ZuW9xQpWAEt8FeAAQDOBj/HRTHsvgAAAABJRU5ErkJggg==" />
                    
                    Person Female Icon___________________________________________
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzgxRDQ5MUE5MEFBMTFFM0IyNzFCQTJGMEQxMkFCN0MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzgxRDQ5MUI5MEFBMTFFM0IyNzFCQTJGMEQxMkFCN0MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozODFENDkxODkwQUExMUUzQjI3MUJBMkYwRDEyQUI3QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozODFENDkxOTkwQUExMUUzQjI3MUJBMkYwRDEyQUI3QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoRtkQcAAAVLSURBVHja7FyLbdswEL0IGUCZoMoEViYIO0GUCaxMYGcCyxO4mcDOBHYnsDJBvIG9Qb2BKwKnRnX1oSQeeVT1gAOKFKLop8fH4/fmcrnACHrcMq9fkEWI8ZiFj/8uwwHjI4tdFmdOP+SGoaIlkdMsIiS6KzZZvCH5I9EIqdQ5EhxoLjvN4iWLk80f6DEgOMnimMWCgGQJgeUn/6uipTWskWxTkDbybEPdniUVbzF8w++W/v9Z06EOhmhJ7B7VbNOu9mgpgyQ6RK8MwT7yVhUOjWjfgh+rKjscEtFbJkquItsfAtGJaT/saCNOEx1gfswdAgdMzhK9BndANWAiJ1posAyTE0M+pTAoiZ72HMF9z+LBMNk6xGGUaKmOuOOzSyQ4xaHyiwULcYboqKNNfId/J392hskWFF5NRfRTR5LTiv/fGCZ75grRogPJTRP0OdkmPDtygeiw5UjrGdRXQTaKH0VH/h9wJ7pNBV9r7KIpI1kaIJu9olUgO7kfPfJr2Wneo8pZLcSaIvqbIlE6Orc8/btDC9oAk8XYa9xaanIUndoOo65eIWZEkUI/cnJprqMMaQMhVDgVcvI7qF8Z3w2B6FcmrXmDHr+sGNmCy0Rz9NAEsxjSDtU00UvgiZR65OkZVvMJ+CKlyqFNE70E3hCuEf1hohcnwBNlh2hK0e/AH1HHEa41otMKRXMn2XdN0WUWETInekpdZyqir3PSGWOSAyiff5646NER8NoOVkRc8wFYEx1U+F3EkGS/prWxtw5R8XeOO5bmDS1NcCb6sUbpwhE1a1e1SUVzU3WTmutEY53osKETEUxUHShmQmytQ6ViKwZErxSzIF+Xfegmeqqo+tgiyaJlBiS4ER22+PqqiqLoANcE4jFK9JT4B+uyjKCDgHxORLe1g8iwhcQ93hdxITru+NVXYGbCKezZCfeeq9F1RPnYY27gBLQbzn2sX9/mfw89Fi88TWoOejwvn6U6gqbzeNvMtqKPoGemK9+8eNZMsi5rOqOqzzYUPQd904k6jzBTHIfO7xQxbh0+wdyFLFPePpD0KCPBMiisaNa13D5EU57tXqAi26RjMXxdsEI54Omk6q4eHRMMONKK4a70RLm4+xN7/UNhaCx/+COU378kn3sjIP6MWdKJmuiQKEu4w7J1XJgiSciPbOjqrIvYYflk1uEDzc0xJ1RKCl+7+PuQ8FBQ/onAQqLWo0WpaMXws/i80OH6fUEW6xbP77MQJeVQ4RfWUYk/VeswcYnIM5RvtMkXdieF94cFxeYXCh4qlEd5RYR67q/4ReYXeuxbtC7V2Bqod6JSF9UzLPnpqSdd04YlEBippvICoN3iIL3/HRRPlvUZgssUbwp61wBTbIo6sCUgeoNWdYCWJxe8jso7Yh4tCFQdayqHQs0x5u2tMxmvZVPcYwSETVLHMhflAnA+Ap1TEB3h/IEAevRd5poD/WKCjx9TeeDmKarD9PWWXZe5AjC7SUeozhI2Eb0G4tuzGj5wW4uycYlhPuMYdyV6DXb3X7S1kAjs7oKq5curUZNNkotNc07wUSjJjlSJjizaRRlU7qNbAJ+N7usyz74esOhaMdaNuoFMfic0JxxwBrFS0WvgeQSizkJWDOsrP35SpWiBeSFXlK1CU8/O9cWfvSDelc9xhl+i3hXzOi+uFR2gN7uAXCXc1fxXfXNFz8AdLByr86yoaIoFTEqvfnCoBcr63nnQfO6Eo1cvHKtv6AHva+GrEDtW30gSPYER1Jh4jtmGqwg94H/FwxAQeMD31oFBwRspGIkeiR4xEj0SPRI9YiR6SPgtwAAtJ6YPoDF1QAAAAABJRU5ErkJggg==" />

                    Person Institution Icon______________________________________
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjdENkZDNzM5MEFCMTFFM0I3REY4NzY3QjQzMEMxNUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjdENkZDNzQ5MEFCMTFFM0I3REY4NzY3QjQzMEMxNUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCN0Q2RkM3MTkwQUIxMUUzQjdERjg3NjdCNDMwQzE1RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCN0Q2RkM3MjkwQUIxMUUzQjdERjg3NjdCNDMwQzE1RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsWhcRMAAAH7SURBVHja7N3hTcMwEIbhNguQDSgblAnICB2BDcgGCRMUJihM0jIBbEA7QbtBOEv+ESGU5uzYscX7SSdEa+XcR+Xq/gnLrusWmaSUqqWe7O+vUi9Slxw2v8wAug9c/nrukgt4ytBDwIvcwFOE1gBnA54StA9w8uApQE8JnCz4nNAhgZMDnwPaF/jL/lxnBW6gI1Up1UqdO7ds7TX619s6Xuts91LGev05AJvUA9evPa4bDTzk6JhqBh+l7q6s+ZZapTzDi0DArX3xzQQfdO8Trbm258buuQ3x4VwkDDzXSSgIeJEB8M1Ea2YF95nRsc7BZkbfD8xO0/vTc0aHn+EznSK02Q3sZxdxH86nlNSB+9lLbXr72djH5ogafMzoiPlVObeMHilD0ABPCP4XNMABwPvQAAcEN9AARwA30LUCuHFseJD6UKy/lXp07PUmdVKsf5CqHHs9jwZXngdd0yr7VB69KmWv1qPX6D4Ff91xAjTQQBOggQYaAqCBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNNBAE6CBJkADDTQBGmgCNND/NOZOjnvF+sqxz9HW2Jg7S64de5l/iKO5a/lq4X439YMGuuP9FucdDTTQQBOggQYaBqCBJrr8CDAAPLzSBaKZL5kAAAAASUVORK5CYII=" />

                    Person App Icon______________________________________________
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjhCNDhFQUM5MEI0MTFFM0FDMzNGMzJDN0Y5MEZEMjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjhCNDhFQUQ5MEI0MTFFM0FDMzNGMzJDN0Y5MEZEMjgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OEI0OEVBQTkwQjQxMUUzQUMzM0YzMkM3RjkwRkQyOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2OEI0OEVBQjkwQjQxMUUzQUMzM0YzMkM3RjkwRkQyOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsVhlRIAAAPvSURBVHja7N2NcZswFABgOdcB2KB0AzpByQQhE9idIHSCxhM4mQBnArsTmExgb2BvYG9ApcvLlXLiR6Cfh/TenS45B/Pz8SQk/rKoqopRmI8FQRM0QVMQNEGHHnczW9+YlwJKTBltBvg3L6vG51te1rxcCHpaJLw8SYDZ3MCxQqeQwani99CCY4MeC4weHAu0LmC04K6hTQGjA3cFbQsYDbhtaFfAzdjz8spL6Rs0FuBmlJDh5dyhRf93iRDYOrgp6BVk8KyGySbBdUPPFdg4uC5oX4CNgU+F9hVYO/hY6FCAtYGrQocK3IwT9MO3uqEJWB4XyPDtFOgIgJ8IeDq4DFoA5wAckaEe8Do0ARsEF9AEbAFcQOeKwF9Z/zW8enfofSYoS4Vj0VoVfEw/OuXloLBCzzOBPrDhJ78WqjO/o9ptJwiaoP2KL8jXTxycMl5+wO9J7W83GApf4IC7h88IWiESGPJnHdNEtYOX6AUVzMG1wDk3HRtejj3IbZFB76HANibABB0BcK5hXisAjwla3o9NNDc/ByyZfYeouUgMzFdk9I6g/400c8PzXxH0R+/CRo0JGjpldm6uiVxntWvopcVlPYQMnXm6LFTQiYOuVxIitIvBRBRqRrs4+AY/MvQ6XEKXgSzTObSLc8eXEKFPDnZskNC2q/LJ5Ya6hra58e8hQ797WnuCbTpuoUPfLDUf+5D70Z/xZmEZfwjafLZdKKPtQLwh2EY05zpMYYhjwAtB/998mBi1vTIkt4lhOnv3y0CT9IJl4zBB7zX3dX8yRDc9YjsfrQvHyjs45gx9AewpsWUIH+fAeIVlPwF7q2FHBQNdB1NpRtY15Dg06CFQ4iKtuGXrzD5u261jfx/Q1oq/3zeaC3FjYwU/V2zY1W+zB07x+JtiSav+uPKSdcwjEs838nKWfDeXTB/z8szLAb4jSgHr0pw2aVmntunr67SphoWymwnoHaw0awErYEd0xWrMxsByjz3zPvfMP21JAFTQeQfAc6UWm44d1rYTjwrzP3dkeAS1Bx30tWOlswEZ3NUEbXqqfALTjF1GVw0sMEFfYWNlWVFUeuMMmXZQzN4px5QCA3QbcqwZwlbkA7GV3aZ270S/9STprh2Zwzs3J4ToZhYt21m66kevJSfsxUABzZNQI0P0u2XP1DxO6WuPhS4l5xMiGCD48HIVkdmpZEDzOHaGY97XEddOADVXLmf+hID9Jsni3RhwXa/MTNnwl6XMKdYtNffmClrl7S0+ZLWTk0qxp8if2avlISMd0BnzOx6wQD94Dq2ltupoo6/M//flLTBAh/B/+giaoAmaoAnaY2gdr2O7ZxS98VeAAQB8knD5Ztj/HwAAAABJRU5ErkJggg==" />
                    */
                    //return '<img class="square30 gap-p5 persons-bg-style" src="' + src + '">';
                    return getImageCellTemplate(src, 'persons');
                };
            }

            function createButtonColumn(col, configModel, column) {
                col.title = '';
                col.headerTemplate = '';
                var icon = "";


                col.template = function (dataItem) {
                    var btnConfig = configModel.generateGridOpenButtonUrl(dataItem);

                    if (btnConfig.iconClass) {
                        icon = '<i class="' + btnConfig.iconClass + '"></i>';
                    }
                    var template = '<div class="grid-btn btn-group pull-right"><a href="javascript:void(0)" style="background-color :'
                        + btnConfig.color + '" class="btn btn-small move-in-bg-style disabled">' + icon + $rootScope.resources[column.TitleResourceKey] + '</a></div>';

                    if (btnConfig.url) {
                        template = '<div class="grid-btn btn-group pull-right"><a href="' + btnConfig.url + '" style="background-color :' + btnConfig.color +
                            '" class="btn btn-small move-in-bg-style">' + icon + $rootScope.resources[column.TitleResourceKey] + '</a></div>';
                    }

                    return template;
                };
            }

            function createIconColumn(col, type, url, sortOrderTemplate, sortedColumnSettings) {
                if (type) {
                    col.title = "<i class='" + type + "'></i>";
                    col.template = function (dataItem) {
                        var template = '<span class="disabled"><i class="' + type + '"></i></span>';

                        if (dataItem.TotalErrorMessage)
                            template = '<span class="red"><i class="' + type + '"></i> <span class="count">' + dataItem.TotalErrorMessage + '</span></span>';
                        else if (dataItem.NotificationType === NotificationTypeEnum.Error)
                            template = '<span class="red"><i class="' + type + '"></i></span>';
                        return template;
                    };
                } else if (url) {
                    col.headerTemplate = createImageColumnHeader(sortOrderTemplate, sortedColumnSettings);
                    col.template = function (dataItem) {
                        return getImageCellTemplate(url, 'movein');
                    };
                }
            }

            function createImageColumnHeader(sortOrderTemplate, sortedColumnSettings) {
                var keyColumn = _.find(sortedColumnSettings, function (item) { return item.DataField && item.DataField.IsKey; }),
                    imgColumnHeaderTpl = "<a href='javascript:void(0)' class='inline-block v-mid bg-dark-opacity gap-right-m5 text-center enable-flipper' data-keycolumn='%s' data-isallselected='false'  style='width:30px'>" +
                                            "<i class='white v-mid icon-check disabled' style='width:20px; display:inline-block; font-size: 18px;'></i>" +
                                         "</a>" +
                                        "<small class='count'></small>";
                if (keyColumn) imgColumnHeaderTpl = _.sprintf(imgColumnHeaderTpl, keyColumn.DataField.Value);

                return imgColumnHeaderTpl + sortOrderTemplate;
            }

            function getImageCellTemplate(src, imageStyle) {
                return "<div class='flip-container square30 clickable'>" +
                            "<div class='flipper'>" +
                                "<div class='front " + imageStyle + "-bg-style white gap-p5'>" +
                                    "<img src=" + src + " alt='Move' />" +
                                "</div>" +
                                "<div class='back " + imageStyle + "-bg-style white gap-p5'>" +
                                    "<i class='icon icon-check'></i>" +
                                "</div>" +
                            "</div>" +
                        "</div>";
            }

            function setDefaultSort(columnSettings) {
                var defaultSortCol = _.find(columnSettings, function (item) { return item.DataField && item.DataField.IsKey; });
                self.defaultSort = [
                {
                    compare: undefined,
                    dir: "asc",
                    field: defaultSortCol.DataField.Value
                }];
            }

            function convertInToAngularTemplate(configModel, dataItem, html) {
                var newScope = $rootScope.$new();
                newScope.genericGridConfig = configModel;
                newScope.data = dataItem;
                newScope.uid = dataItem.uid;
                $compile(html)(newScope);

                self.gridCellScopes.push(newScope);
            }

            //ToDo: Reza: need to refactor grid cell related scope
            self.gridCellScopes = [];
            self.destroyGridCell = function (isInnerRefresh) {
                _.each(self.gridCellScopes, function (scope) {
                    if (!(isInnerRefresh && scope.uid === undefined))
                        scope.$destroy();
                });
                self.gridCellScopes = [];
            };

        }]);
});
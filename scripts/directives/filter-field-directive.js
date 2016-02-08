'use strict';

define(['app'],
    function(app) {
        app.directive('filterField', [
            '$compile', function($compile) {
            return {
                restrict: 'E',
                    link: function(scope, element, attrs) {
                    switch (attrs.type) {
                        case '2':
                            element.append($compile('<input class="span6" ng-model="searchFieldSet.FieldData[0].Value"  kendo-date-picker type="text"></input>')(scope));
                            if (scope.searchFieldSet.FieldData.length == 2) {
                                element.append($compile('<input class="span6" ng-model="searchFieldSet.FieldData[1].Value"  kendo-date-picker type="text"></input>')(scope));
                            }
                            break;
                        case '5':
                            generateDropDown();
                            break;

                        case '6':
                            element.append($compile('<nationality-dropdown-short validation model-code="nationalityStatusCode" model-name="searchFieldSet.FieldData[0].Value" validation tabindex="2"></nationality-dropdown>')(scope));
                            break;
                        case '8':
                            var tmpl = '<input class="span12" ng-model="searchFieldSet.FieldData[0].Value" type="text" ui-mask=' + scope.searchFieldSet.FormatValue + '></input>';
                            element.append($compile(tmpl)(scope));
                            break;
                        case '9':
                            var tmpl2 = '<input class="span12" ng-model="searchFieldSet.FieldData[0].Value" type="text" number-only></input>';
                            element.append($compile(tmpl2)(scope));
                            break;

                        case '10': //autocomplete
                            generateAutoComplete();
                            break;
                        default:
                            element.append($compile('<input class="span12" ng-model="searchFieldSet.FieldData[0].Value" type="text"></input>')(scope));
                    }
                    
                    function generateDropDown() {
                        switch (scope.searchFieldSet.DropDownType) {
                        case 'Group':
                            break;
                            default:
                                lookupDataService.getLookupData(scope.searchFieldSet.DataSource).then(function(data) {
                                    scope.businessCaseTypeCode = data;
                                    var template = '<select ng-change="dropdownchange()" class="span6" ng-model="searchFieldSet.FieldData[0]" ng-options="b.' + scope.searchFieldSet.DisplayField + ' for b in businessCaseTypeCode"><option value=""></option></select>';
                                    element.append($compile(template)(scope));
                                });
                        }
                    }

                    function generateAutoComplete() {
                        switch (scope.searchFieldSet.DirectiveName) {
                            case 'auto-complete-templated':
                                var template = '<input type="text"' +
                                                    ' id="autoComplete_' + _.getGuid() + '"' +
                                                    ' class="span12"' +
                                                    ' ng-model="searchFieldSet.FieldData[0].Value"' +
                                                    ' auto-complete-templated' +
                                                    ' au-template="' + scope.searchFieldSet.Template + '"' +
                                                    ' au-dont-clear-on-blur="' + !scope.searchFieldSet.IsClearOnBlur + '"' +
                                                    ' au-field="' + scope.searchFieldSet.Field + '"' +
                                                     (scope.searchFieldSet.OnSelect != null ? ' au-select="' + scope.searchFieldSet.OnSelect + '"' : '') +
                                                    ' au-items="' + scope.searchFieldSet.Items + '" />';
                                /*'au-model="task"' +
                                'au-select="onAssignedToSelect"' +
                                'ng-change="ValidStateChangeEnum.changeStatusForAssignTo()" />';*/
                                element.append($compile(template)(scope));
                                break;
                        }
                    }

                    scope.dropdownchange = function () {
                        if (scope.searchFieldSet.FieldData[0]) {
                            scope.searchFieldSet.FieldData[0].DisplayValue = scope.searchFieldSet.FieldData[0][scope.searchFieldSet.DisplayField];
                            scope.searchFieldSet.FieldData[0].Value = scope.searchFieldSet.FieldData[0][scope.searchFieldSet.ValueField];
                        }
                    };
                }
            };
            }
        ]).directive('numberOnly', [
            '$compile', 'lookupDataService', function ($compile, lookupDataService) {
                return {
                    restrict: "A",
                    require: "ngModel",
                    //scope: { val: "=" },
                    link: function (scope, element, attr) {
                        element.bind("keypress", function (e) {
                            if (e.charCode == 0) {
                                return;
                            }
                            var event = e || window.event;
                            var key = event.keyCode || event.which;

                            key = scope.searchFieldSet.FieldData[0].Value + String.fromCharCode(key);
                            if (!(new RegExp(scope.searchFieldSet.FormatValue).test(key))) {
                                event.returnValue = false;
                                if (event.preventDefault)
                                    event.preventDefault();
                            }
                            //}
                        });
                    }
                };
            }
        ]);
    });

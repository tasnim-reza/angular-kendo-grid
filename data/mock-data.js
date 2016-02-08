var savedSearchId = { "$id": "1", "savedSearchId": 7 };

var savedSearch = [
    {
        "$id": "1",
        "UserId": "cea03048-a6e5-4c6c-a403-b4ba37df90d1",
        "CategoryId": "5f5feada-0c8d-4109-bab8-09ce497a0001",
        "CategoryName": "Recently Used",
        "Id": 7,
        "Title": "Benutzergruppe: Ruf Super; ",
        "StateGenericSearchId": "UamUser",
        "GridSettingId": null,
        "IsPinned": null,
        "SharingOption": null
    }
];

var gridSetting = {
    "$id": "1",
    "GridStyle": {
        "$id": "2",
        "Columns": [
            {
                "$id": "3",
                "CellTemplateUrl": null,
                "ColumnOrder": 0,
                "ColumnStyleId": "GUID",
                "DataField": {
                    "$id": "4",
                    "IsKey": true,
                    "Value": "Id"
                },
                "GridStyleColumnId": "Id",
                "GroupNo": null,
                "GroupOrder": null,
                "HeaderTemplateUrl": null,
                "IsSelectable": null,
                "SortNo": null,
                "SortOrder": null,
                "TitleResourceKey": "Id",
                "Align": 1,
                "DataFormat": null,
                "DataType": null,
                "Id": "GUID",
                "IsGroupable": null,
                "IsHidden": true,
                "IsReorderable": true,
                "IsSortable": null,
                "ParentColumnStyleId": null,
                "Width": 250,
                "WidthMax": 300,
                "WidthMin": 200,
                "WrappedOrOverflowed": null,
                "HasColumnMenu": true
            }, {
                "$id": "5",
                "CellTemplateUrl": "templates/grid-image-column-checkbox-cell-template.html",
                "ColumnOrder": 1,
                "ColumnStyleId": "TemplateHasColumnMenu",
                "DataField": null,
                "GridStyleColumnId": "RowSelection",
                "GroupNo": null,
                "GroupOrder": null,
                "HeaderTemplateUrl": "templates/grid-image-column-checkbox-header-template.html",
                "IsSelectable": true,
                "SortNo": null,
                "SortOrder": null,
                "TitleResourceKey": null,
                "Align": 1,
                "DataFormat": null,
                "DataType": null,
                "Id": "TemplateHasColumnMenu",
                "IsGroupable": false,
                "IsHidden": false,
                "IsReorderable": false,
                "IsSortable": false,
                "ParentColumnStyleId": null,
                "Width": 100,
                "WidthMax": 100,
                "WidthMin": 100,
                "WrappedOrOverflowed": 1,
                "HasColumnMenu": false
            }, { "$id": "6", "CellTemplateUrl": null, "ColumnOrder": 2, "ColumnStyleId": "StringSmall", "DataField": { "$id": "7", "IsKey": false, "Value": "Name" }, "GridStyleColumnId": "Name", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": 0, "SortOrder": "asc", "TitleResourceKey": "DisplayName", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": true, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "8", "CellTemplateUrl": null, "ColumnOrder": 3, "ColumnStyleId": "StringSmall", "DataField": { "$id": "9", "IsKey": false, "Value": "FirstName" }, "GridStyleColumnId": "FirstName", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "FirstName", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "10", "CellTemplateUrl": null, "ColumnOrder": 4, "ColumnStyleId": "StringSmall", "DataField": { "$id": "11", "IsKey": false, "Value": "LastName" }, "GridStyleColumnId": "LastName", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "LastName", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "12", "CellTemplateUrl": null, "ColumnOrder": 5, "ColumnStyleId": "StringSmall", "DataField": { "$id": "13", "IsKey": false, "Value": "UserName" }, "GridStyleColumnId": "UserName", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "UserName", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "14", "CellTemplateUrl": null, "ColumnOrder": 6, "ColumnStyleId": "StringSmall", "DataField": { "$id": "15", "IsKey": false, "Value": "OrganisationFunction" }, "GridStyleColumnId": "OrganisationFunction", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "OrganisationFunction", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "16", "CellTemplateUrl": null, "ColumnOrder": 7, "ColumnStyleId": "StringSmall", "DataField": { "$id": "17", "IsKey": false, "Value": "Initials" }, "GridStyleColumnId": "Initials", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "Initials", "Align": 1, "DataFormat": null, "DataType": null, "Id": "StringSmall", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 200, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "18", "CellTemplateUrl": "templates/grid-status-column-cell-template.html", "ColumnOrder": 8, "ColumnStyleId": "TemplateHasColumnMenu", "DataField": { "$id": "19", "IsKey": false, "Value": "IsActive" }, "GridStyleColumnId": "Status", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "Status", "Align": 1, "DataFormat": null, "DataType": null, "Id": "TemplateHasColumnMenu", "IsGroupable": false, "IsHidden": false, "IsReorderable": false, "IsSortable": false, "ParentColumnStyleId": null, "Width": 100, "WidthMax": 100, "WidthMin": 100, "WrappedOrOverflowed": 1, "HasColumnMenu": true }, { "$id": "20", "CellTemplateUrl": null, "ColumnOrder": 9, "ColumnStyleId": "Date", "DataField": { "$id": "21", "IsKey": false, "Value": "LastModifiedDate" }, "GridStyleColumnId": "LastModifiedDate", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": "LastModifiedDate", "Align": 1, "DataFormat": "dd.MM.yyyy", "DataType": "Date", "Id": "Date", "IsGroupable": true, "IsHidden": false, "IsReorderable": true, "IsSortable": true, "ParentColumnStyleId": null, "Width": 175, "WidthMax": 250, "WidthMin": 150, "WrappedOrOverflowed": 0, "HasColumnMenu": true }
        ],
        "HasColumnSeparator": true,
        "Id": "UamUserGrid",
        "IsRowSelectable": true,
        "IsSingleSelectable": null,
        "PageSize": 15,
        "PageSizeMax": 30,
        "PageSizeMin": 10,
        "PaginationFrontBackPageCount": 3
    },
    "GridStyleId": "UamUserGrid",
    "Id": "UamUser",
    "OverridableColumns": [{ "$id": "22", "CellTemplateUrl": null, "ColumnOrder": null, "ColumnStyleId": null, "DataField": null, "GridStyleColumnId": "RowSelection", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": null, "Align": null, "DataFormat": null, "DataType": null, "Id": null, "IsGroupable": null, "IsHidden": null, "IsReorderable": null, "IsSortable": null, "ParentColumnStyleId": null, "Width": 100, "WidthMax": 100, "WidthMin": 100, "WrappedOrOverflowed": null, "HasColumnMenu": false }, { "$id": "23", "CellTemplateUrl": null, "ColumnOrder": null, "ColumnStyleId": null, "DataField": null, "GridStyleColumnId": "Name", "GroupNo": null, "GroupOrder": null, "HeaderTemplateUrl": null, "IsSelectable": null, "SortNo": null, "SortOrder": null, "TitleResourceKey": null, "Align": null, "DataFormat": null, "DataType": null, "Id": null, "IsGroupable": null, "IsHidden": true, "IsReorderable": null, "IsSortable": null, "ParentColumnStyleId": null, "Width": null, "WidthMax": null, "WidthMin": null, "WrappedOrOverflowed": null, "HasColumnMenu": null }],
    "RemoveColumnIds": []
};

var gridData = {
    "$id": "1",
    "Data": [
        {
            "$id": "2",
            "Id": "cea03048-a6e5-4c6c-a403-b4ba37df90d1",
            "Name": "super@admin.publiweb.ch",
            "FirstName": "super",
            "LastName": "admin.publiweb.ch",
            "UserName": "super@admin.publiweb.ch",
            "IsActive": true,
            "LastModifiedDate": "2016-01-03T16:08:40.583"
        }
    ],
    "StateGenericSearch": {
        "$id": "3",
        "ConditionalFilters": [],
        "Fields": [
            {
                "$id": "4",
                "ColumnName": "FirstName",
                "DisplayResourceId": "FirstName",
                "FieldData": [
                    {
                        "$id": "5",
                        "LabelResourceId": "FirstName"
                    }
                ],
                "IsDefault": true,
                "Type": 1
            }
        ],
        "Filters": [
            {
                "$id": "6",
                "ColumnName": "IsActive",
                "Display": "Status",
                "DisplayResourceId": "Status",
                "FilterData": [
                    {
                        "$id": "7",
                        "IsActive": true,
                        "Label": "True",
                        "Parameters": [
                            "true"
                        ],
                        "SubClassType": "PubliWeb.Shell.Settings.GenericSearch.FilterDataDynamic"
                    }
                ]
            },
            {
                "$id": "8",
                "ColumnName": "OrganisationFunction",
                "Display": "Organisation Function",
                "DisplayResourceId": "OrganisationFunction"
            },
            {
                "$id": "9",
                "ColumnName": "GroupName",
                "Display": "User Group",
                "DisplayResourceId": "UserGroup",
                "FilterData": [
                    {
                        "$id": "10",
                        "Label": "Drive Administrator",
                        "Parameters": [
                            "Drive Administrator"
                        ],
                        "SubClassType": "PubliWeb.Shell.Settings.GenericSearch.FilterDataDynamic"
                    },
                    {
                        "$id": "11",
                        "Label": "Drive User",
                        "Parameters": [
                            "Drive User"
                        ],
                        "SubClassType": "PubliWeb.Shell.Settings.GenericSearch.FilterDataDynamic"
                    },
                    {
                        "$id": "12",
                        "Label": "group-one-updated",
                        "Parameters": [
                            "group-one-updated"
                        ],
                        "SubClassType": "PubliWeb.Shell.Settings.GenericSearch.FilterDataDynamic"
                    },
                    {
                        "$id": "13",
                        "IsActive": true,
                        "IsSelected": true,
                        "Label": "Ruf Super",
                        "Parameters": [
                            "Ruf Super"
                        ],
                        "SubClassType": "PubliWeb.Shell.Settings.GenericSearch.FilterDataDynamic"
                    }
                ]
            }
        ]
    },
    "Total": 1
};

var savedSearch = [{ "$id": "1", "UserId": "cea03048-a6e5-4c6c-a403-b4ba37df90d1", "CategoryId": "5f5feada-0c8d-4109-bab8-09ce497a0001", "CategoryName": "Recently Used", "Id": 7, "Title": "Benutzergruppe: Ruf Super; ", "StateGenericSearchId": "UamUser", "GridSettingId": null, "IsPinned": null, "SharingOption": null }, { "$id": "2", "UserId": "cea03048-a6e5-4c6c-a403-b4ba37df90d1", "CategoryId": "5f5feada-0c8d-4109-bab8-09ce497a0001", "CategoryName": "Recently Used", "Id": 8, "Title": "Status: True; ", "StateGenericSearchId": "UamUser", "GridSettingId": null, "IsPinned": null, "SharingOption": null }, { "$id": "3", "UserId": "cea03048-a6e5-4c6c-a403-b4ba37df90d1", "CategoryId": "d0259c0c-193c-1c5c-30af-0d2b84ef76b2", "CategoryName": "Uam search", "Id": 9, "Title": "UAM Search: Status", "StateGenericSearchId": "UamUser", "GridSettingId": null, "IsPinned": null, "SharingOption": null }];

$.ajax = function (param) {
    //_mockAjaxOptions = param;
    //call success handler
    if (param.complete)
        param.complete(gridData, "textStatus", "jqXHR");
    if (param.success)
        param.success(gridData);
    console.log('mock ajax called');
};
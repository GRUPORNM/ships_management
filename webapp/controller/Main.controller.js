sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    function (BaseController, JSONModel, MessageBox) {
        "use strict";

        return BaseController.extend("shipsmanagement.controller.Main", {
            onInit: function () {
                var oViewModel = new JSONModel({
                    Shipeditable: false,
                    busy: false,
                    delay: 0,
                    oStandard: "nr_ordem_cliente,tknum,carrier,isencaoisp,regimealfandega,dataprevistacarregamento",
                    oSmartTableView: "",
                    variantInput: "Standard"
                });
                sessionStorage.setItem("goToLaunchpad", "X");
                this.setModel(oViewModel, "Main");

                this.getRouter().attachRouteMatched(this.getUserAuthentication, this);
                document.addEventListener('keydown', this.onShortcuts.bind(this));
            },

            onShortcuts: function (oEvent) {
                if (sessionStorage.getItem("shortcuts") === 'true') {
                    var that = this;
                    if (oEvent.which === 118) {
                        var oTable = sap.ui.getCore().byId("ShipmentsTable").getTable(),
                            sElectedItem = oTable.getSelectedItem();

                        if (sElectedItem) {
                            sElectedItem.firePress();
                        }
                        oTable.removeSelections();
                    } else if (oEvent.which === 114) {
                        oEvent.preventDefault();
                        that.onNavBack();
                    } else if (oEvent.which === 116) {
                        oEvent.preventDefault();
                        that.onCreateShipment();
                    }
                }
            },

            onPressShipmentDetail: function (oEvent) {
                sessionStorage.setItem("goToLaunchpad", "");
                var oSource = oEvent.getSource(),
                    sPath = oSource.getBindingContext().getPath();

                this.onNavigation(sPath, "shipsdetail", "/xTQAxSHIPS_MANAGEMENT_DD");
            },

            onAfterRendering: function () {
                sessionStorage.setItem("goToLaunchpad", "X");

                if (sessionStorage.getItem("selectedTheme").indexOf("dark") !== -1) {
                    this.byId("variantInput").removeStyleClass("variantMode");
                    this.byId("variantInput").addStyleClass("variantModeBlack");
                    jQuery(".sapUiBlockLayer, .sapUiLocalBusyIndicator").css("background-color", "rgba(28,34,40,0.99)");
                }
                else {
                    this.byId("variantInput").removeStyleClass("variantModeBlack");
                    this.byId("variantInput").addStyleClass("variantMode");
                    jQuery(".sapUiBlockLayer, .sapUiLocalBusyIndicator").css("background-color", "rgba(255, 255, 255, 0.99)");
                }
            },

            onCreateShipment: function () {
                sessionStorage.setItem("goToLaunchpad", "");
                this.onRemoveSelection();
                this.onNavigation("", "createshipment", "");
            },

            onBeforeRendering: function () {
                this.onStartVariants();
            },

            onRemoveSelection: function () {
                var oTable = sap.ui.getCore().byId("ShipmentsTable").getTable();
                oTable.removeSelections();
            },

            onStartVariants: function () {
                var that = this,
                    oModel = this.getModel("vModel");

                oModel.read("/xTQAxUSR_VARIANTS_DD", {
                    success: function (oData) {
                        var oResults = oData.results;
                        oResults.forEach(element => {
                            if (element.v_default) {
                                that.getModel("Main").setProperty("/variantInput", element.v_name)
                                that.getModel("Main").setProperty("/selectedVariant", element.variant_id);

                                if (element.variant_id != "Main") {
                                    var visibleInFilterBar = JSON.parse(atob(element.fbar_settings));
                                    that.onUpdateFilterBar(visibleInFilterBar);

                                    var allFieldsInVariant = JSON.parse(atob(element.stable_settings));
                                    var allNames = allFieldsInVariant.map(function (obj) {
                                        return obj.name;
                                    }).join(',');

                                    if (allNames.endsWith(',')) {
                                        allNames = allNames.substring(0, allNames.length - 1);
                                    }
                                    that.getModel("Main").setProperty("/oSmartTableView", allNames);
                                    that.onBuildSmartTable();
                                }
                                else {
                                    that.getModel("Main").setProperty("/oSmartTableView", that.getModel("Main").getProperty("/oStandard"));
                                    that.onBuildSmartTable();
                                }
                            }
                        });
                    },
                    error: function (oError) {

                    }
                });
            },

            onBuildSmartTable: function () {
                var oOldSmartTable = sap.ui.getCore().byId("ShipmentsTable");
                if (oOldSmartTable) {
                    oOldSmartTable.destroy();
                }

                var oDestroyedSmartTable = sap.ui.getCore().byId("ShipmentsTable");
                if (!oDestroyedSmartTable) {
                    var oView = this.getView(),
                        oModel = this.getModel("Main");

                    var oOverflowToolbar = new sap.m.OverflowToolbar({
                        design: "Transparent",
                    });

                    var oToolbarSpacer = new sap.m.ToolbarSpacer();

                    var oCreateButton = new sap.m.Button({
                        text: "{i18n>createShipment}",
                        press: this.onCreateShipment.bind(this)
                    });

                    var oDeleteButton = new sap.m.Button({
                        id: "deleteButton",
                        text: "{i18n>deleteLoad}",
                        enabled: "{Main>/Shipeditable}",
                        press: this.onDeleteShipment.bind(this)
                    });

                    oOverflowToolbar.addContent(oToolbarSpacer);
                    oOverflowToolbar.addContent(oCreateButton);
                    oOverflowToolbar.addContent(oDeleteButton);

                    var oSmartTable = new sap.ui.comp.smarttable.SmartTable({
                        id: "ShipmentsTable",
                        entitySet: "xTQAxSHIPS_MANAGEMENT_DD",
                        smartFilterId: "smartFilterBarGroups",
                        tableType: "ResponsiveTable",
                        header: "{i18n>ShipmentsHeaderTitle}",
                        showRowCount: true,
                        customToolbar: oOverflowToolbar,
                        enableAutoBinding: true,
                        initialise: function () {
                            this.onSTinitialise.bind(this);
                            var oTable = oSmartTable.getTable();
                            oTable.setMode("SingleSelectLeft");
                            oTable.attachSelectionChange(this.onChangeSelectionShipment.bind(this));

                            oTable.attachUpdateFinished(function () {
                                var oItems = oTable.getItems();

                                if (oItems.length > 0) {

                                    oItems.forEach(oItem => {
                                        if (oItem instanceof sap.m.ColumnListItem) {
                                            oItem.setType("Navigation");
                                            oItem.attachPress(this.onPressShipmentDetail.bind(this));
                                        }
                                    });
                                }

                            }.bind(this));

                        }.bind(this),
                        beforeRebindTable: this.onBeforeRebindTable.bind(this),
                        initiallyVisibleFields: oModel.getProperty("/oSmartTableView")
                    }).addStyleClass("sapUiSmallMarginTop");

                    var oAggregation = oView.byId("page");
                    oAggregation.setContent(oSmartTable);

                    var oToolbar = new sap.m.OverflowToolbar({
                    });
                    oSmartTable.setCustomToolbar(oToolbar);
                }
            },

            onRouteMatched: function () {
                this.getUserAuthentication();
            },

            onFBarInitialise: function (oEvent) {
                var filterGroupItems = this.byId("smartFilterBarGroups").getFilterGroupItems(),
                    activeFiltersArray = [];

                filterGroupItems.forEach(function (item) {
                    if (item.mProperties.visibleInFilterBar) {
                        var filterInfo = {
                            name: item.mProperties.name,
                            visibleInFilterBar: item.mProperties.visibleInFilterBar
                        };
                        activeFiltersArray.push(filterInfo);
                    }
                });
                this.getModel("Main").setProperty("/vStandard", activeFiltersArray);
            },

            onSTinitialise: function (oEvent) {
                var that = this,
                    oSmartTable = oEvent.getSource(),
                    oInnerTable = oSmartTable.getTable(),
                    aColumnData = [],
                    aColumns = oInnerTable.getColumns();

                aColumns.forEach(function (oColumn) {
                    var lastIndex = oColumn.sId.lastIndexOf('-');

                    if (lastIndex !== -1) {
                        var oName = oColumn.sId.substring(lastIndex + 1);
                    }
                    aColumnData.push({
                        name: oName
                    });
                });

                that.getModel("Main").setProperty("/vSmartTableStandard", aColumnData);
            },

            onBeforeRebindTable: function (oEvent) {
                var that = this,
                    oSmartTable = oEvent.getSource(),
                    oInnerTable = oSmartTable.getTable(),
                    aNewColumnData = [],
                    aColumns = oInnerTable.getColumns();

                aColumns.forEach(function (oColumn) {
                    var lastIndex = oColumn.sId.lastIndexOf('-');

                    if (lastIndex !== -1) {
                        var oName = oColumn.sId.substring(lastIndex + 1);
                    }
                    if (oColumn.getVisible())
                        aNewColumnData.push({
                            name: oName
                        });
                });

                var isDifferent = this.checkArrayDifference(this.getModel("Main").getProperty("/oSmartTableView"), aNewColumnData);
                if (isDifferent) {
                    var oInput = this.byId("variantInput"),
                        activeFiltersJSON = JSON.stringify(aNewColumnData),
                        activeFiltersBtoa = btoa(activeFiltersJSON);

                    this.getModel("Main").setProperty("/SmartTableBtoa", activeFiltersBtoa);
                }
            },

            checkArrayDifference: function (a, b) {
                if (a.length !== b.length) {
                    return false;
                }

                var sortedA = a.slice().sort(),
                    sortedB = b.slice().sort();

                for (var i = 0; i < sortedA.length; i++) {
                    if (sortedA[i] !== sortedB[i]) {
                        return false;
                    }
                }

                return true;
            },

            onUpdateFilterBar: function (fbSettings) {
                var filterGroupItems = this.byId("smartFilterBarGroups").getFilterGroupItems();

                this.byId("smartFilterBarGroups").clear();

                filterGroupItems.forEach(oItem => {
                    oItem.setVisibleInFilterBar(false);
                });

                fbSettings.forEach(function (savedFilter) {
                    filterGroupItems.forEach(function (filterItem) {
                        if (savedFilter.name === filterItem.getName()) {
                            filterItem.setVisibleInFilterBar(true);

                            var control = filterItem.getControl();
                            var aFilters = savedFilter.aFilters;

                            if (aFilters && aFilters.length > 0) {
                                var filter = aFilters[0];
                                if (control instanceof sap.m.Input || control instanceof sap.m.MultiInput) {
                                    control.setValue("*" + filter.oValue1 + "*");
                                }
                                else if (control instanceof sap.m.Select || control instanceof sap.m.ComboBox) {
                                    control.setSelectedKey(filter.oValue1);
                                }
                                else if (control instanceof sap.m.CheckBox) {
                                    control.setSelected(filter.oValue1 === "true" || filter.oValue1 === true);
                                }
                            }
                        }
                    });
                });

            },

            onShowVariantList: function (oEvent) {
                var that = this,
                    oModel = this.getModel("vModel");

                if (!this._oPopover) {
                    var oList = new sap.m.List();
                    oList.setModel(oModel);
                    oList.bindItems({
                        path: "/xTQAxUSR_VARIANTS_DD",
                        template: new sap.m.StandardListItem({
                            title: "{v_name}"
                        })
                    });

                    oList.setMode(sap.m.ListMode.SingleSelectMaster);

                    oList.attachUpdateFinished(function () {
                        this.getItems().forEach(function (item) {
                            item.removeStyleClass("sapMSelectListItemBaseSelected");
                        });
                        this.getItems().forEach(function (item) {

                            var oBindingContext = item.getBindingContext();
                            var variant_id = oBindingContext.getProperty("variant_id");
                            var selectedV = that.getModel("Main").getProperty("/selectedVariant");
                            if (!selectedV) {
                                if (variant_id === "Main") {
                                    item.addStyleClass("sapMSelectListItemBaseSelected");
                                }
                            }
                            else {
                                if (variant_id === selectedV) {
                                    item.addStyleClass("sapMSelectListItemBaseSelected");
                                    that.byId("variantInput").setValue(oBindingContext.getProperty("v_name"));
                                }
                            }
                        });
                    });

                    oList.attachSelectionChange(function (oEvent) {
                        this.getItems().forEach(function (item) {
                            item.removeStyleClass("sapMSelectListItemBaseSelected");
                        });

                        var oListItem = oEvent.getParameter("listItem");
                        oListItem.addStyleClass("sapMSelectListItemBaseSelected");

                        var oBindingContext = oListItem.getBindingContext(),
                            selectedVariant = oBindingContext.getProperty("variant_id");

                        that.getModel("Main").setProperty("/selectedVariant", selectedVariant);
                        that.byId("variantInput").setValue(oBindingContext.getProperty("v_name"));

                        if (selectedVariant != "Main") {
                            var oObject = that.getModel("vModel").getObject(oBindingContext.sPath),
                                filterBarAtob = atob(oObject.fbar_settings),
                                filterBarArray = JSON.parse(filterBarAtob);
                            that.onUpdateFilterBar(filterBarArray);

                            var allFieldsInVariant = JSON.parse(atob(oObject.stable_settings));
                            var allNames = allFieldsInVariant.map(function (obj) {
                                return obj.name;
                            }).join(',');

                            // Remove a última vírgula, se necessário
                            if (allNames.endsWith(',')) {
                                allNames = allNames.substring(0, allNames.length - 1);
                            }

                            that.getModel("Main").setProperty("/oSmartTableView", allNames);
                            that.onBuildSmartTable();
                        }
                        else {
                            that.onUpdateFilterBar(that.getModel("Main").getProperty("/vStandard"));
                            that.getModel("Main").setProperty("/oSmartTableView", that.getModel("Main").getProperty("/oStandard"));
                            that.onBuildSmartTable();
                        }
                        that._oPopover.close();
                    });


                    this._oPopover = new sap.m.ResponsivePopover({
                        contentWidth: "25%",
                        title: this.getView().getModel("i18n").getResourceBundle().getText("MyViews"),
                        placement: "Bottom",
                        beginButton: new sap.m.Button({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("SaveAs"),
                            type: "Emphasized",
                            press: function () {
                                that.onBeforeSaveVariant();
                                this._oPopover.close();
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("Manage"),
                            press: function () {
                                that.onManageViews();
                                this._oPopover.close();
                            }.bind(this)
                        }),
                        content: [oList]
                    });
                }

                this._oPopover.openBy(oEvent.getSource());
            },

            onManageViews: function () {
                if (!this._oManageDialog) {
                    var oModel = this.getModel("vModel");
                    var oSearchBar = new sap.m.SearchField({
                        width: "100%",
                        placeholder: this.getView().getModel("i18n").getResourceBundle().getText("Search"),
                        liveChange: function (oEvent) {

                            var sQuery = oEvent.oSource.getValue();
                            var oFilter = new sap.ui.model.Filter("v_name", sap.ui.model.FilterOperator.Contains, sQuery);
                            oTable.getBinding("items").filter([oFilter]);
                        }
                    });

                    var oTable = new sap.m.Table({
                        columns: [
                            new sap.m.Column({ header: new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("VariantName") }) }),
                            new sap.m.Column({ header: new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("Default") }) }),
                            new sap.m.Column({ header: new sap.m.Label({ text: this.getView().getModel("i18n").getResourceBundle().getText("CreatedAt") }) }),
                            new sap.m.Column({ header: new sap.m.Label({ text: "" }) })
                        ]
                    });
                    oTable.setModel(oModel);

                    oTable.bindItems({
                        path: "/xTQAxUSR_VARIANTS_DD",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{v_name}" }),
                                new sap.m.CheckBox({
                                    enabled: {
                                        path: 'variant_id',
                                        formatter: function (value) {
                                            if (value == "Main")
                                                return false;
                                        }
                                    },
                                    selected: "{v_default}",
                                    select: function (oEvent) {
                                        var oCheckBox = oEvent.getSource(),
                                            oContext = oCheckBox.getBindingContext(),
                                            selectedState = oCheckBox.getSelected(),
                                            oEntry = {};

                                        oEntry.v_default = selectedState;

                                        oModel.update(oContext.sPath, oEntry, {
                                            success: function (oCreatedData) {
                                                oModel.refresh(true);
                                            },
                                            error: function (oError) {

                                            }
                                        });
                                    }
                                }),
                                new sap.m.Text({
                                    text: {
                                        path: "created_at",
                                        type: new sap.ui.model.type.Date({
                                            pattern: "dd-MM-yyyy"
                                        })
                                    }
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://decline",
                                    visible: {
                                        path: 'v_name',
                                        formatter: function (variantName) {
                                            if (variantName == "Standard") {
                                                return false;
                                            }
                                        }
                                    },
                                    press: function (oEvent) {
                                        var oCheckBox = oEvent.getSource();
                                        var oContext = oCheckBox.getBindingContext();

                                        oModel.remove(oContext.sPath, {
                                            success: function (oCreatedData) {
                                            },
                                            error: function (oError) {
                                            }
                                        });
                                    }
                                })
                            ]
                        })
                    });

                    this._oManageDialog = new sap.m.Dialog({
                        title: this.getView().getModel("i18n").getResourceBundle().getText("Manageviews"),
                        content: [oSearchBar, oTable],
                        beginButton: new sap.m.Button({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("Close"),
                            press: function () {
                                this._oManageDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this._oManageDialog.open();
            },

            onBeforeSaveVariant: function () {
                var that = this;
                var oVariantName = new sap.m.Input({
                    id: "inVariantName"
                });

                var oCheckBox = new sap.m.CheckBox({
                    text: this.getView().getModel("i18n").getResourceBundle().getText("SetDefault")
                });

                var oDialog = new sap.m.Dialog({
                    title: this.getView().getModel("i18n").getResourceBundle().getText("SaveView"),
                    content: [
                        new sap.ui.layout.form.SimpleForm({
                            editable: true,
                            layout: "ResponsiveGridLayout",
                            content: [
                                new sap.m.Label({
                                    text: this.getView().getModel("i18n").getResourceBundle().getText("View")
                                }),
                                oVariantName,
                                oCheckBox
                            ]
                        })
                    ],
                    buttons: [
                        new sap.m.Button({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("Save"),
                            type: "Emphasized",
                            press: function () {
                                that.onSaveVariant(oVariantName.getValue(), oCheckBox.getSelected());
                                oDialog.destroy();
                            }
                        }),
                        new sap.m.Button({
                            text: this.getView().getModel("i18n").getResourceBundle().getText("Close"),
                            press: function () {
                                oDialog.close();
                                oDialog.destroy();
                            }
                        })
                    ]
                });

                oDialog.open();
            },

            onSaveVariant: function (VariantName, vDefault) {
                var that = this,
                    oModel = this.getModel("vModel"),
                    oEntry = {},
                    oFilterBarContext = [],
                    oFilterBar = this.byId("smartFilterBarGroups"),
                    filterGroupItems = oFilterBar.getFilterGroupItems(),
                    activeFiltersArray = [];

                filterGroupItems.forEach(function (item) {
                    if (item.mProperties.visibleInFilterBar) {
                        var filterInfo = {
                            name: item.mProperties.name,
                            visibleInFilterBar: item.mProperties.visibleInFilterBar
                        };
                        activeFiltersArray.push(filterInfo);
                    }
                });

                var activeFiltersJSON = JSON.stringify(activeFiltersArray),
                    activeFiltersBtoa = btoa(activeFiltersJSON);

                this.getModel("Main").setProperty("/fbarBtoa", activeFiltersBtoa);
                var oFilterAvailable = JSON.parse(atob(this.getModel("Main").getProperty("/fbarBtoa")));

                oFilterBar.getFilters().forEach(element => {
                    var aFilters = element.aFilters,
                        oMatchingFilter = oFilterAvailable.find(fs => fs.name === aFilters[0]?.sPath);

                    if (oMatchingFilter) {
                        oMatchingFilter.aFilters = aFilters.length > 0 ? aFilters : " ";

                    }
                });

                oEntry.v_name = VariantName;

                if (this.getModel("Main").getProperty("/fbarBtoa"))
                    oEntry.fbar_settings = btoa(JSON.stringify(oFilterAvailable));
                else
                    oEntry.fbar_settings = btoa(JSON.stringify(this.getModel("Main").getProperty("/vStandard")));
                if (this.getModel("Main").getProperty("/SmartTableBtoa")) {
                    oEntry.stable_settings = this.getModel("Main").getProperty("/SmartTableBtoa");
                }
                else {
                    var oTable = sap.ui.getCore().byId("ShipmentsTable").getTable(),
                        aColumnData = [],
                        aColumns = oTable.getColumns();

                    aColumns.forEach(function (oColumn) {
                        var lastIndex = oColumn.sId.lastIndexOf('-');

                        if (lastIndex !== -1) {
                            var oName = oColumn.sId.substring(lastIndex + 1);
                        }
                        if (oColumn.getVisible())
                            aColumnData.push({
                                name: oName
                            });
                    });

                    oEntry.stable_settings = btoa(JSON.stringify(aColumnData));
                }
                oEntry.app_link = 'SHIPS_MANAGE';
                oEntry.v_default = vDefault;

                oModel.create("/xTQAxUSR_VARIANTS_DD", oEntry, {
                    success: function (oCreatedData) {
                        that.getModel("Main").setProperty("/selectedVariant", oCreatedData.variant_id);
                    },
                    error: function (oError) {

                    }
                });
            },

            onFilterChange: function (oEvent) {
                var filterGroupItems = oEvent.oSource.getFilterGroupItems(),
                    activeFiltersArray = [];

                filterGroupItems.forEach(function (item) {
                    if (item.mProperties.visibleInFilterBar) {
                        var filterInfo = {
                            name: item.mProperties.name,
                            visibleInFilterBar: item.mProperties.visibleInFilterBar
                        };
                        activeFiltersArray.push(filterInfo);
                    }
                });

                var activeFiltersJSON = JSON.stringify(activeFiltersArray),
                    activeFiltersBtoa = btoa(activeFiltersJSON);
                this.getModel("Main").setProperty("/fbarBtoa", activeFiltersBtoa);

            },

            onChangeSelectionShipment: function (oEvent) {
                this.getModel("Main").setProperty("/Shipeditable", true);
            },

            onDeleteShipment: function () {
                var that = this;
                MessageBox.warning(this.getResourceBundle().getText("deleteshipment"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            that.onDeleteShip();
                        } else {
                            return false;
                        }
                    }
                });
            },

            onDeleteShip: function () {
                var oShipTable = sap.ui.getCore().byId("ShipmentsTable"),
                    oTable = oShipTable.getTable(),
                    sPath = oTable.getSelectedItem().getBindingContextPath(),
                    oModel = this.getModelTQA(),
                    that = this;

                oModel.remove(sPath, {
                    success: function (oData) {
                        that.getModel().refresh(true);
                        that.getModel("Main").setProperty("/Shipeditable", false);
                    },
                    error: function (oError) {
                        var sError = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.alert(sError, {
                            icon: "ERROR",
                            onClose: null,
                            styleClass: '',
                            initialFocus: null,
                            textDirection: sap.ui.core.TextDirection.Inherit
                        });
                    }
                });
            },
        });
    });
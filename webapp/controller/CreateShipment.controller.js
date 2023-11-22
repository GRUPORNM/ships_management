sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageBox"
],
    function (BaseController, JSONModel, formatter, MessageBox) {
        "use strict";

        var oHeader = {
            items: []
        }

        return BaseController.extend("shipsmanagement.controller.CreateShipment", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    delay: 0,
                    busy: true,
                    min_date: new Date(new Date().setFullYear(new Date().getFullYear() - 67)),
                }),

                    oLoadData = new JSONModel({
                        items: []
                    }),

                    oDestinationData = new JSONModel({
                        items: []
                    }),

                    oShipHeader = new JSONModel({
                        items: []
                    }),

                    oCompartimento = new JSONModel({
                        items: []
                    });

                this.setModel(oViewModel, "CreateShipment");
                this.setModel(oLoadData, "LoadData");
                this.setModel(oShipHeader, "HeaderData");
                this.setModel(oDestinationData, "DestinationData");
                this.setModel(oCompartimento, "CompartimentoData");
                this.getOwnerComponent().getRouter().attachRouteMatched(this.onObjectMatched, this);
                document.addEventListener('keydown', this.onShortCutExecuteUpdate.bind(this));
            },

            onShortCutExecuteUpdate: function (oEvent) {
                if (sessionStorage.getItem("shortcuts") === 'true') {
                    var that = this;
                    var oEditable = this.byId("SaveHeaderShipment").getVisible();
                    if (oEvent.which === 119) {
                        if (oEditable) {
                            that.onCreateShipment();
                        } else {
                            sap.m.MessageBox.warning("Não foi possível executar a função!");
                        }
                    }
                }
            },

            onAfterRendering: function () {
                var that = this;
                sessionStorage.setItem("goToLaunchpad", "");
                window.addEventListener("message", function (event) {
                    var data = event.data;
                    if (data.action == "goToMainPage") {
                        that.onNavBackCreate();
                    }
                });
            },

            onObjectMatched: function (oEvent) {
                this.onBindView("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId);
            },

            onBindView: function (sObjectPath, bForceRefresh) {
                this.getView().bindElement({
                    path: sObjectPath,
                    change: this.onBindingChange.bind(this),
                    events: {
                        dataRequested: function () {
                            this.getModel("appView").setProperty("/busy", true);
                        }.bind(this),
                        dataReceived: function () {
                            this.getModel("appView").setProperty("/busy", false);
                        }.bind(this)
                    }
                });

                if (bForceRefresh || !this.getView().getModel().getProperty("/" + sObjectPath)) {
                    this.getView().getModel().refresh();
                    this.byId("cod_instalacao").setProperty("enabled", false);
                }
            },

            onNavBackCreate: function (oEvent) {
                sessionStorage.setItem("goToLaunchpad", "X");
                var aContainers = [];
                aContainers.push("GeneralInfo");
                if (oEvent.getSource().getParent().getBindingContext()) {
                    this.onManageContainerFieldsState("GeneralInfo", false);

                    this.onNavigation("", "main", "");
                } else {
                    var oModelDataCleared = this.onClearModelData(),
                        oContainerDataCleared = this.onClearContainersData(aContainers);

                    this.onManageContainerFieldsState("GeneralInfo", false);
                    if (oModelDataCleared && oContainerDataCleared) {
                        this.onSaveShipment();
                        this.onNavigation("", "main", "");
                    }
                }
            },

            onOpenShipmentDialog: function (oAction) {
                var aDialogFields = [],
                    oAccountCode = {
                        oLabelText: this.getResourceBundle().getText("account_code"),
                        oId: "AccountCode",
                        oName: "AccountCode",
                        oRequired: true,
                        oValue: "",
                        oType: "Number",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oCommercialCod = {
                        oLabelText: this.getResourceBundle().getText("commercial_prod"),
                        oId: "CommercialCod",
                        oName: "CommercialCod",
                        oRequired: true,
                        oValue: "",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oQuantity = {
                        oLabelText: this.getResourceBundle().getText("product_quantity"),
                        oId: "Quantity",
                        oName: "Quantity",
                        oRequired: true,
                        oValue: "",
                        oType: "Number",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oUnit = {
                        oLabelText: this.getResourceBundle().getText("unit"),
                        oItems: "/xTQAxSHIPS_UNITS_VH",
                        oKey: "{domvalue_l}",
                        oText: "{domvalue_l}",
                        oId: "unit_vh",
                        oName: "unit_vh",
                        oRequired: true,
                        oEnabled: true,
                        oSelectedKey: "",
                        oForceSelection: false,
                        liveChange: true,
                        oControl: sap.m.Select
                    },
                    oDialogInfo = {
                        oId: "LoadDialog",
                        oLayout: "ResponsiveGridLayout",
                        oTitle: this.getResourceBundle().getText("DestinationDialog")
                    },
                    aDialogButtons = [],
                    oCancelButton = {
                        oId: "CancelDialog",
                        oText: this.getResourceBundle().getText("closeDialog"),
                        oType: "Default",
                        oEvent: this.onCloseDialog.bind(this)
                    },
                    oConfirmButton = {
                        oId: "AddLoad",
                        oText: this.getResourceBundle().getText("addLoad"),
                        oType: "Emphasized",
                        oEvent: this.onAddLoad.bind(this)
                    },
                    oEditButton = {
                        oId: "UpdateLoad",
                        oText: this.getResourceBundle().getText("updateLoad"),
                        oType: "Emphasized",
                        oEvent: this.onUpdateLoad.bind(this)
                    };

                switch (oAction) {
                    case 'C':
                        oAccountCode.oValue = "";
                        oCommercialCod.oValue = "";
                        oQuantity.oValue = "";
                        oUnit.oSelectedKey = "";

                        aDialogButtons.push(oCancelButton, oConfirmButton);

                        break;

                    case 'U':
                        var oTable = this.byId("ShipsLoads"),
                            sPath = oTable.getSelectedContextPaths()[0],
                            oObject = this.getModel("LoadData").getData().items[sPath.replace("/items/", "")];

                        oAccountCode.oValue = oObject.Codconta;
                        oCommercialCod.oValue = oObject.Codprodcomercial;
                        oQuantity.oValue = oObject.Quantprodcomercial;
                        oUnit.oSelectedKey = oObject.Unidademedida;

                        aDialogButtons.push(oCancelButton, oEditButton);

                        break;
                }

                aDialogFields.push(oAccountCode, oCommercialCod, oQuantity, oUnit);

                this.buildDialogs(oDialogInfo, aDialogFields, aDialogButtons);
            },

            onOpenDestinationFragment: function (oAction) {
                var oSelect = this.byId("selectCompartimento"),
                    oCodCompatimento = this.byId("CodCompartimento"),
                    oName = this.byId("NameDestination"),
                    oLocation = this.byId("Location"),
                    oNif = this.byId("DestinationNif"),
                    oCPostal = this.byId("PostalCode");
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "shipsmanagement.view.Destination"
                    });
                }
                switch (oAction) {
                    case 'C':

                        this.pDialog.then(function (oDialog) {
                            oDialog.open();
                        });
                        break;

                    case 'U':
                        var oTable = this.byId("ShipsDestination"),
                            sPath = oTable.getSelectedContextPaths()[0],
                            oObject = this.getModel("DestinationData").getData().items[sPath.replace("/items/", "")];

                        this.byId("AddDestination").setProperty("visible", false);
                        this.byId("EditShipmentDestination").setProperty("visible", true);
                        this.byId("selectCompartimento").setProperty("visible", false);
                        this.byId("CodCompartimento").setProperty("visible", true);

                        oCodCompatimento.setValue(oObject.Codcompartimento);
                        oName.setValue(oObject.Nome);
                        oLocation.setValue(oObject.Localidade);
                        oNif.setValue(oObject.Nif);
                        oCPostal.setValue(oObject.Cpostal);

                        this.pDialog.then(function (oDialog) {
                            oDialog.open();
                        });
                        break;
                }
            },

            onCloseFragment: function () {
                this.onAfterFragment();
                this.byId("DestinationDialog").close();
            },

            onOpenDestinationDialog: function (oAction) {
                var aDialogFields = [],
                    oCodCompartimento = {
                        oLabelText: this.getResourceBundle().getText("codcompartimento"),
                        oId: "Codcompartimento",
                        oName: "Codcompartimento",
                        oRequired: true,
                        oControl: sap.m.Select
                    },
                    oName = {
                        oLabelText: this.getResourceBundle().getText("name"),
                        oId: "NameDestination",
                        oName: "NameDestination",
                        oRequired: true,
                        oValue: "",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oLocation = {
                        oLabelText: this.getResourceBundle().getText("location"),
                        oId: "Location",
                        oName: "Location",
                        oRequired: true,
                        oValue: "",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oNif = {
                        oLabelText: this.getResourceBundle().getText("nif"),
                        oId: "DestinationNif",
                        oName: "DestinationNif",
                        oRequired: true,
                        oValue: "",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oPostal = {
                        oLabelText: this.getResourceBundle().getText("postalcode"),
                        oId: "PostalCode",
                        oName: "PostalCode",
                        oRequired: true,
                        oValue: "",
                        oSelectedKey: "",
                        oEnabled: true,
                        oControl: sap.m.Input,
                        oForceSelection: false
                    },
                    oDialogInfo = {
                        oId: "DestinationDialog",
                        oLayout: "ResponsiveGridLayout",
                        oTitle: this.getResourceBundle().getText("DestinationDialog")
                    },
                    aDialogButtons = [],
                    oCancelButton = {
                        oId: "CancelDestination",
                        oText: this.getResourceBundle().getText("closeDialog"),
                        oType: "Default",
                        oEvent: this.onCloseDialogDestination.bind(this)
                    },
                    oConfirmButton = {
                        oId: "AddDestination",
                        oText: this.getResourceBundle().getText("addLoad"),
                        oType: "Emphasized",
                        oEvent: this.onAddDestination.bind(this)
                    },
                    oEditButton = {
                        oId: "UpdateDestination",
                        oText: this.getResourceBundle().getText("updateLoad"),
                        oType: "Emphasized",
                        oEvent: this.onUpdateDestination.bind(this)
                    };

                switch (oAction) {
                    case 'C':
                        oName.oValue = "";
                        oLocation.oValue = "";
                        oNif.oValue = "";
                        oPostal.oValue = "";

                        aDialogButtons.push(oCancelButton, oConfirmButton);

                        break;

                    case 'U':
                        var oTable = this.byId("ShipsDestination"),
                            sPath = oTable.getSelectedContextPaths()[0],
                            oObject = this.getModel("DestinationData").getData().items[sPath.replace("/items/", "")];

                        oName.oValue = oObject.Name;
                        oLocation.oValue = oObject.Location;
                        oNif.oValue = oObject.Nif;
                        oPostal.oValue = oObject.PostalCode;

                        aDialogButtons.push(oCancelButton, oEditButton);

                        break;
                }

                aDialogFields.push(oCodCompartimento, oName, oLocation, oNif, oPostal);

                this.buildDialogs(oDialogInfo, aDialogFields, aDialogButtons);
            },

            onSelectionChange: function (oEvent) {
                var oSource = oEvent.getSource(),
                    aSelectedPaths = oSource.getSelectedContextPaths(),
                    oTable = oEvent.mParameters.id;

                this.onEnabledTableButtons(oTable, aSelectedPaths.length);
            },

            onEnabledTableButtons: function (oTable, aSelectedPaths) {
                if (oTable == "container-shipsmanagement---CreateShipment--ShipsDestination") {
                    if (aSelectedPaths > 0) {
                        this.byId("EditShipmentDestination").setProperty("enabled", true);
                        this.byId("DeleteShipmentDestination").setProperty("enabled", true);
                    } else {
                        this.byId("EditShipmentDestination").setProperty("enabled", false);
                        this.byId("DeleteShipmentDestination").setProperty("enabled", false);
                    }
                } else {
                    if (aSelectedPaths > 0) {
                        this.byId("EditShipmentLoad").setProperty("enabled", true);
                        this.byId("DeleteShipmentLoad").setProperty("enabled", true);
                    } else {
                        this.byId("EditShipmentLoad").setProperty("enabled", false);
                        this.byId("DeleteShipmentLoad").setProperty("enabled", false);
                    }
                }
            },

            onSaveHeader: function () {
                var oModel = this.getView().getModel("HeaderData");
                var aControl = [],
                    aContainers = [];

                aControl.push(sap.m.Input, sap.m.DatePicker);
                aContainers.push("GeneralInfo");
                oModel.setProperty("/items", []);
                oHeader.oData = [];

                var oHeaderFieldsChecked = this.checkEmptyFields(aControl, aContainers, "");
                if (oHeaderFieldsChecked) {
                    var oEntry = {
                        Codinstalacao: this.byId("cod_instalacao").getValue(),
                        Tipocarregamento: this.byId("tipo_carregamento").getSelectedKey(),
                        Regimealfandegario: this.byId("regimealfadega").getSelectedKey(),
                        Isencaoisp: this.byId("isencaoisp").getSelectedKey(),
                        Dataprevistacarregamento: this.byId("dataprevistacarregamento").getDateValue(),
                        Matricula: this.byId("unidadetransporte").getValue(),
                    };
                    oHeader.items.push(oEntry);
                    oModel.setData(oHeader);
                    this.onSaveLoad();
                } else {

                }
            },

            onSaveLoad: function () {
                var aButtons = [],
                    oSaveHeader = {
                        id: "SaveHeaderShipment",
                        visible: false
                    },
                    oAddShipment = {
                        id: "AddShipmentLoad",
                        visible: true
                    },
                    oEditShipment = {
                        id: "EditShipmentLoad",
                        visible: true
                    },
                    oEditDestination = {
                        id: "EditShipmentDestination",
                        visible: true
                    },
                    oAddShipmentDestination = {
                        id: "AddShipmentDestination",
                        visible: true
                    },
                    oDeleteShipmentLoad = {
                        id: "DeleteShipmentLoad",
                        visible: true
                    },
                    oDeleteShipmentDestination = {
                        id: "DeleteShipmentDestination",
                        visible: true
                    },
                    onEditHeader = {
                        id: "EditHeaderShipment",
                        visible: true
                    },
                    oCancelHeader = {
                        id: "CancelHeaderShipment",
                        visible: false
                    };

                aButtons.push(oSaveHeader, oAddShipment, oEditShipment, oEditDestination, oAddShipmentDestination, oDeleteShipmentLoad, oDeleteShipmentDestination, onEditHeader, oCancelHeader);

                this.onManageButtonsState(aButtons);

                this.onManageContainerFieldsState("GeneralInfo", false);
            },

            // Open Message Box
            onOpenMessageBox: function (oAction) {
                var oMessage = {
                    oTitle: "",
                    oText: ""
                }

                switch (oAction) {
                    case "DD":
                        oMessage.oTitle = this.getResourceBundle().getText("alertMessageTitle");
                        oMessage.oText = this.getResourceBundle().getText("deleteRowFromDriverDocumentation");
                        break;
                    case "DS":
                        oMessage.oTitle = this.getResourceBundle().getText("alertMessageTitle");
                        oMessage.oText = this.getResourceBundle().getText("deleteRowFromDriverDocumentation");
                        break;
                }
                this.showAlertMessage(oMessage, oAction);
            },

            onCreateShipment: function () {
                var aControl = [],
                    aContainers = [],
                    matricula;

                aControl.push(sap.m.Input, sap.m.DatePicker);
                aContainers.push("GeneralInfo");

                var oHeaderFieldsChecked = this.checkEmptyFields(aControl, aContainers, ""),
                    oItemsChecked = this.onCheckTableData(),
                    oURLParams = new URLSearchParams(window.location.search),
                    oToken = oURLParams.get('token');

                if (oHeaderFieldsChecked && oItemsChecked) {
                    var sPath = "/ShipmentsHeader",
                        oEntry = {
                            Codinstalacao: "1152",
                            Codcliente: "0000000000000000",
                            Tipooperacao: "N",
                            Dataprevistacarregamento: this.byId("dataprevistacarregamento").getDateValue(),
                            Tipocarregamento: this.byId("tipo_carregamento").getSelectedKey(),
                            Regimealfandegario: this.byId("regimealfadega").getSelectedKey(),
                            Isencaoisp: this.byId("isencaoisp").getSelectedKey(),
                            Nacionalidademotorista: "PT",
                            Cartaconducaomotorista: "0000000000000000",
                            Matricula: "",
                            Toloads: [
                                {

                                }
                            ],
                            Todestinations: [
                                {

                                }
                            ]
                        };

                    if (this.byId("unidadetransporte").getValue()) {
                        oEntry.Matricula = this.byId("unidadetransporte").getValue();
                    }

                    oEntry.Toloads = this.getModel("LoadData").oData.items;
                    oEntry.Todestinations = this.getModel("DestinationData").oData.items;

                    for (var i = 0; i < oEntry.Toloads.length; i++) {
                        var load = oEntry.Toloads[i];
                        var destination = oEntry.Todestinations[i];
                        var codcompartimento = load.Codcompartimento;

                        while (codcompartimento.length < 16) {
                            codcompartimento = "0" + codcompartimento;
                        }

                        load.Codcompartimento = codcompartimento;
                        destination.Codcompartimento = codcompartimento
                    }

                    this.onCreate(sPath, oEntry, oToken);
                    this.onSaveShipment();
                }
            },

            onPressHeaderEdit: function () {
                var aButtons = [],
                    oConfirmButton = {
                        id: "SaveHeaderShipment",
                        visible: true
                    },
                    oEditButton = {
                        id: "EditHeaderShipment",
                        visible: false
                    },
                    oCancelButton = {
                        id: "CancelHeaderShipment",
                        visible: true
                    };

                aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                // Manage header buttons state
                this.onManageButtonsState(aButtons);

                // Get container fields and set them enabled 
                this.onManageContainerFieldsState("GeneralInfo", true);
            },

            onPressCancelShipmentHeader: function () {
                var oDriver = this.getModel("HeaderData").oData.items[0];

                // Validate if any field was edited
                var sEdited = this.onValidateEditedFieldsHeader("GeneralInfo", oDriver);

                if (sEdited) {
                    // Show message box 
                    var that = this;

                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editShipHeaderDataText"), {
                        title: this.getResourceBundle().getText("editShipHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                var oChecked = that.onSetContainerFieldsValues("GeneralInfo");

                                if (oChecked) {
                                    that.onManageContainerFieldsState("GeneralInfo", false);

                                    // Disable all header buttons
                                    var aButtons = [],
                                        oConfirmButton = {
                                            id: "SaveHeaderShipment",
                                            visible: false
                                        },
                                        oEditButton = {
                                            id: "EditHeaderShipment",
                                            visible: true
                                        },
                                        oCancelButton = {
                                            id: "CancelHeaderShipment",
                                            visible: false
                                        };

                                    aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                                    // Manage header buttons state
                                    that.onManageButtonsState(aButtons);
                                }
                            }
                        }
                    });
                } else {
                    // Disable all container fields
                    this.onManageContainerFieldsState("GeneralInfo", false);

                    // Disable all header buttons
                    var aButtons = [],
                        oConfirmButton = {
                            id: "SaveHeaderShipment",
                            visible: false
                        },
                        oEditButton = {
                            id: "EditHeaderShipment",
                            visible: true
                        },
                        oCancelButton = {
                            id: "CancelHeaderShipment",
                            visible: false
                        };

                    aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                    // Manage header buttons state
                    this.onManageButtonsState(aButtons);
                }

            },

            onSaveShipment: function () {
                var aButtons = [],
                    oSaveHeader = {
                        id: "SaveHeaderShipment",
                        visible: true
                    },
                    onEditHeader = {
                        id: "EditHeaderShipment",
                        visible: false
                    },
                    oCancelHeader = {
                        id: "CancelHeaderShipment",
                        visible: false
                    },
                    oAddShipment = {
                        id: "AddShipmentLoad",
                        visible: false
                    },
                    oEditShipment = {
                        id: "EditShipmentLoad",
                        visible: false
                    },
                    oEditDestination = {
                        id: "EditShipmentDestination",
                        visible: false
                    },
                    oAddShipmentDestination = {
                        id: "AddShipmentDestination",
                        visible: false
                    },
                    oDeleteShipmentLoad = {
                        id: "DeleteShipmentLoad",
                        visible: false
                    },
                    oDeleteShipmentDestination = {
                        id: "DeleteShipmentDestination",
                        visible: false
                    };

                aButtons.push(oSaveHeader, onEditHeader, oCancelHeader, oAddShipment, oEditShipment, oEditDestination, oAddShipmentDestination, oDeleteShipmentDestination, oDeleteShipmentLoad);

                this.onManageButtonsState(aButtons);

                this.onManageContainerFieldsState("GeneralInfo", true);
            },
        });
    });

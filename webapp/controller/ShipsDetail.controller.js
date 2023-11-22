sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageBox"
],
    function (BaseController, JSONModel, formatter, MessageBox) {
        "use strict";

        var aContainerFields = [
            {
                id: "cod_instalacao",
                control: "sap.m.Text",
                value: "cod_instalacao",
                name: "cod_instalacao"
            },
            {
                id: "type_carregamento",
                control: "sap.m.Select",
                path: "/xTQAxLOAD_TYPE_VH",
                key: "{domvalue_l}",
                text: "{loadtype}",
                value: "{tipo_carregamento}",
                selectedKey: "{type_carregamento}",
                name: "type_carregamento"
            },
            {
                id: "regime_alfandegario",
                control: "sap.m.Select",
                path: "/xTQAxCUSTOM_PROCEDURE_VH",
                key: "{domvalue_l}",
                text: "{regime_alfandegario_d}",
                value: "{regimealfandega}",
                selectedKey: "{regime_alfandegario}",
                name: "regime_alfandegario"
            },
            {
                id: "isencao_isp",
                control: "sap.m.Select",
                path: "/xTQAxEXEMPTION_ISP_VH",
                key: "{domvalue_l}",
                text: "{exemption_isp}",
                value: "{isencaoisp}",
                selectedKey: "{isencao_isp}",
                name: "isencao_isp"
            },
            {
                id: "dataprevistacarregamento",
                control: "sap.m.DatePicker",
                value: "{dataprevistacarregamento}",
                formatter: "true",
                name: "dataprevistacarregamento"
            },
            {
                id: "matricula",
                control: "sap.m.Text",
                value: "{matricula}",
                name: "matricula"
            },
            {
                id: "drivername",
                control: "sap.m.Text",
                value: "{drivername}",
                selectedKey: "{motorista}",
                path: "/xTQAxDRIVERS_VH",
                key: "{usrid}",
                text: "{name}",
                name: "drivername"
            }
        ];

        var aContainerFieldLabels = [
            {
                id: "cod_instalacao",
                labelText: "plant"
            },
            {
                id: "type_carregamento",
                labelText: "loadtype"
            },
            {
                id: "regime_alfandegario",
                labelText: "customsprocedure"
            },
            {
                id: "isencao_isp",
                labelText: "ispexemption"
            },
            {
                id: "dataprevistacarregamento",
                labelText: "plannedload"
            },
            {
                id: "matricula",
                labelText: "matricula"
            },
            {
                id: "drivername",
                labelText: "driver"
            }
        ]

        return BaseController.extend("shipsmanagement.controller.ShipsDetail", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    editable: false,
                    delay: 0,
                    busy: true,
                    lanes: [],
                }),

                    oCompartimento = new JSONModel({
                        items: []
                    });

                this.setModel(oViewModel, "ShipsDetail");
                this.setModel(oCompartimento, "CompartimentoData");
                // this.getOwnerComponent().getRouter().attachRouteMatched(this.onObjectMatchedDetail, this);

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("shipsdetail").attachPatternMatched(this.onPatternMatched, this);

                document.addEventListener('keydown', this.onShortCutExecuteUpdate.bind(this));

                var oView = this.getView();
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment(oView.getId(), "shipsmanagement.view.Edit", this);
                    oView.addDependent(this._oDialog);
                }
            },

            onLadesLoad: function (sObjectPath) {
                var oModel = this.getModel();

                oModel.read(sObjectPath, {
                    success: function (oData, response) {
                        var dateProperties = ['dtdis', 'dareg', 'dalbg', 'dalen', 'dtabf', 'datbg', 'daten'];

                        var formattedDates = {};

                        dateProperties.forEach(function (prop) {
                            var dateValue = oData[prop];

                            formattedDates[prop] = "";

                            if (dateValue instanceof Date) {
                                formattedDates[prop] = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(dateValue);
                            }
                        });

                        if (oData) {
                            var aLanes = [
                                {
                                    "id": "0",
                                    "icon": "sap-icon://accelerated",
                                    "label": this.getResourceBundle().getText("planning") + formattedDates.dtdis,
                                    "position": 0,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 10
                                        }
                                    ]
                                },
                                {
                                    "id": "1",
                                    "icon": "sap-icon://order-status",
                                    "label": this.getResourceBundle().getText("registration") + formattedDates.dareg,
                                    "position": 1,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 20
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "icon": "sap-icon://sap-box",
                                    "label": this.getResourceBundle().getText("startloading") + formattedDates.dalbg,
                                    "position": 2,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 35
                                        }
                                    ]
                                },
                                {
                                    "id": "3",
                                    "icon": "sap-icon://sap-box",
                                    "label": this.getResourceBundle().getText("endloading") + formattedDates.dalen,
                                    "position": 3,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 45
                                        }
                                    ]
                                },
                                {
                                    "id": "4",
                                    "icon": "sap-icon://monitor-payments",
                                    "label": this.getResourceBundle().getText("procedure") + formattedDates.dtabf,
                                    "position": 4,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 55
                                        }
                                    ]
                                },
                                {
                                    "id": "5",
                                    "icon": "sap-icon://shipping-status",
                                    "label": this.getResourceBundle().getText("starttransportation") + formattedDates.datbg,
                                    "position": 5,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 65
                                        }
                                    ]
                                },
                                {
                                    "id": "6",
                                    "icon": "sap-icon://shipping-status",
                                    "label": this.getResourceBundle().getText("endtransportation") + formattedDates.daten,
                                    "position": 6,
                                    "state": [
                                        {
                                            "state": "",
                                            "value": 75
                                        }
                                    ]
                                },
                            ];
                            var oSttrg = oData.sttrg;
                            if (oSttrg < 0) {
                                aLanes.forEach(oLane => {
                                    oLane.state[0].state = "Critical";
                                });
                            }
                            else if (oSttrg == '7') {
                                aLanes.forEach(oLane => {
                                    oLane.state[0].state = "Positive";
                                });
                            }
                            else if (oSttrg != '7') {
                                for (let i = 0; i <= oSttrg; i++) {
                                    aLanes[i].state[0].state = "Positive";
                                }

                                for (let l = oSttrg; l <= aLanes.length - 1; l++) {
                                    aLanes[l].state[0].state = "Critical";
                                }
                            } else {
                                aLanes.forEach(oLane => {
                                    oLane.state[0].state = "Neutral";
                                });
                            }

                            var oViewModel = this.getModel("ShipsDetail");

                            oViewModel.setProperty("/lanes", aLanes);

                            oViewModel.updateBindings();
                        }
                    }.bind(this)
                });
            },

            onAfterRendering: function () {
                var that = this;
                sessionStorage.setItem("goToLaunchpad", "");
                window.addEventListener("message", function (event) {
                    var data = event.data;
                    if (data.action == "goToMainPage") {
                        that.onNavBackDetail();
                    }
                });
            },

            onPatternMatched: function (oEvent) {
                this.onBindViewDetail("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId, true);
            },

            onBindViewDetail: function (sObjectPath, bForceRefresh) {
                var that = this;
                that.onLadesLoad(sObjectPath);

                this.getView().bindElement({
                    path: sObjectPath,
                    change: this.onBindingChange.bind(this),
                    events: {
                        dataRequested: function () {
                            this.getModel("appView").setProperty("/busy", true);
                        }.bind(this),
                        dataReceived: function () {
                            this.getModel("appView").setProperty("/busy", false);
                            this.onBuildGeneralDataSimpleForm(1);
                        }.bind(this)
                    }
                });

                if (bForceRefresh) {
                    this.getView().getModel().refresh();
                }
            },

            onVerifyLanes: function () {
                var lanes = this.getModel("ShipsDetail").getProperty("/lanes"),
                    foundPositive = false,
                    canEdit = 1;

                for (var i = 2; i < lanes.length; i++) {
                    if (lanes[i].state[0].state === 'Positive') {
                        foundPositive = true;
                        canEdit = 0;
                        break;
                    }
                }
                return canEdit;
            },

            onBuildGeneralDataSimpleForm: function (oAction) {
                var oSimpleForm = this.byId("GeneralInfo");

                oSimpleForm.destroyContent();

                var oToolbar = new sap.m.Toolbar({ ariaLabelledBy: "Title2" });

                oToolbar.addContent(new sap.m.ToolbarSpacer());

                var oConfirmButton = new sap.m.Button({
                    id: "ConfirmButton",
                    text: this.getResourceBundle().getText("confirmEditDriverHeader"),
                    type: sap.m.ButtonType.Emphasized,
                    press: this.onPressConfirmShipment.bind(this)
                });

                var oCancelButton = new sap.m.Button({
                    id: "CancelButton",
                    text: this.getResourceBundle().getText("cancel"),
                    press: this.onPressCancelShipment.bind(this)
                });

                var oBtChange = new sap.m.Button({
                    id: "btChange",
                    text: this.getResourceBundle().getText("editLoad"),
                    press: this.onPermToChange.bind(this)
                });
                var lanes = this.onVerifyLanes();

                if (oAction == 1) {
                    if (lanes == 1) {
                        oConfirmButton.setVisible(false);
                        oCancelButton.setVisible(false);
                        oBtChange.setVisible(true);
                    } else {
                        oConfirmButton.setVisible(false);
                        oCancelButton.setVisible(false);
                        oBtChange.setVisible(false);
                    }
                } else {
                    oConfirmButton.setVisible(true);
                    oCancelButton.setVisible(true);
                    oBtChange.setVisible(false);
                }

                oToolbar.addContent(oConfirmButton);
                oToolbar.addContent(oCancelButton);
                oToolbar.addContent(oBtChange);

                oSimpleForm.addContent(oToolbar);

                aContainerFields.forEach(oField => {
                    switch (oAction) {
                        case 1:
                            oSimpleForm.addContent(new sap.m.Label({
                                text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                            }));

                            if (oField.formatter) {
                                oSimpleForm.addContent(
                                    new sap.m.Text({
                                        id: oField.id,
                                        text: {
                                            path: oField.value.replace("{", "").replace("}", ""),
                                            type: 'sap.ui.model.type.DateTime',
                                            formatOptions: {
                                                style: 'short',
                                                strictParsing: true,
                                                pattern: "dd.MM.yyyy, HH:mm",
                                            }
                                        }
                                    })
                                );
                            } else {
                                if (oField.value == "cod_instalacao") {
                                    oSimpleForm.addContent(
                                        new sap.m.Text({
                                            id: oField.id,
                                            text: this.getResourceBundle().getText("cod_instalacao")
                                        })
                                    );
                                } else {
                                    oSimpleForm.addContent(
                                        new sap.m.Text({
                                            id: oField.id,
                                            text: oField.value
                                        })
                                    );
                                }
                            }

                            break;
                        case 2:
                            switch (oField.control) {
                                case "sap.m.Text":
                                    oSimpleForm.addContent(new sap.m.Label({
                                        text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                                    }));
                                    if (oField.id === "cod_instalacao") {
                                        oSimpleForm.addContent(
                                            new sap.m.Input({
                                                id: oField.id,
                                                name: oField.name,
                                                value: this.getResourceBundle().getText("cod_instalacao"),
                                                enabled: false,
                                            })
                                        );
                                    } else if (oField.id === "drivername") {
                                        oSimpleForm.addContent(
                                            new sap.m.Input({
                                                id: oField.id,
                                                name: oField.name,
                                                selectedKey: oField.selectedKey,
                                                showSuggestion: true,
                                                showValueHelp: true,
                                                valueHelpRequest: this.onValueHelpRequest.bind(this),
                                                suggestionItems: {
                                                    path: oField.path,
                                                    template: new sap.ui.core.Item({
                                                        key: oField.key,
                                                        text: oField.text
                                                    })
                                                }
                                            })
                                        );
                                    } else if (oField.id === "matricula") {
                                        oSimpleForm.addContent(
                                            new sap.m.Input({
                                                id: oField.id,
                                                name: oField.name,
                                                value: oField.value
                                            })
                                        );
                                    } else {
                                        oSimpleForm.addContent(
                                            new sap.m.Input({
                                                id: oField.id,
                                                name: oField.name,
                                                value: oField.value,
                                                required: true
                                            })
                                        );
                                    }
                                    break;

                                case "sap.m.DatePicker":
                                    oSimpleForm.addContent(new sap.m.Label({
                                        text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                                    }));
                                    oSimpleForm.addContent(
                                        new sap.m.DateTimePicker({
                                            id: oField.id,
                                            name: oField.name,
                                            showTimezone: true,
                                            showCurrentTimeButton: true,
                                            required: true,
                                            value: {
                                                path: oField.value.replace("{", "").replace("}", ""),
                                                type: 'sap.ui.model.type.DateTime',
                                                formatOptions: {
                                                    style: 'short',
                                                    strictParsing: true,
                                                    pattern: "dd.MM.yyyy, HH:mm"
                                                },
                                                valueFormat: "yyyy-MM-ddPTHH:mm:ssZ"
                                            },
                                        })
                                    );
                                    break;

                                case "sap.m.Select":
                                    oSimpleForm.addContent(new sap.m.Label({
                                        text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                                    }));
                                    this.oSelect = new sap.m.Select({
                                        id: oField.id,
                                        name: oField.name,
                                        required: true,
                                        items: {
                                            path: oField.path,
                                            template: new sap.ui.core.ListItem({
                                                key: oField.key,
                                                text: oField.text
                                            }),
                                        },
                                        selectedKey: oField.selectedKey
                                    });


                                    this.oSelect.setModel(this.getModel());

                                    oSimpleForm.addContent(this.oSelect);
                                    break;
                            }
                            break;
                    }

                });
            },

            onValueHelpRequest: function () {
                if (!this.oDefaultDialog) {
                    this.oDefaultDialog = new sap.m.SelectDialog({
                        id: "driversVh",
                        title: this.getResourceBundle().getText("driver"),
                        multiSelect: false,
                        rememberSelections: true,
                        selectionChange: this.onChangeValueHelp.bind(this),
                        search: this.onSearchValueHelp.bind(this),
                        items: {
                            path: "/xTQAxDRIVERS_VH",
                            template: new sap.m.StandardListItem({
                                title: "{name}",
                                description: "{usrid}"
                            })
                        },
                    });

                    this.getView().addDependent(this.oDefaultDialog);
                    this.oDefaultDialog.open();
                } else {
                    this.oDefaultDialog.destroy();

                    this.oDefaultDialog = new sap.m.SelectDialog({
                        id: "driversVh",
                        title: this.getResourceBundle().getText("driver"),
                        multiSelect: false,
                        rememberSelections: true,
                        selectionChange: this.onChangeValueHelp.bind(this),
                        search: this.onSearchValueHelp.bind(this),
                        items: {
                            path: "/xTQAxDRIVERS_VH",
                            template: new sap.m.StandardListItem({
                                title: "{name}",
                                description: "{usrid}"
                            })
                        },
                    });

                    this.getView().addDependent(this.oDefaultDialog);
                    this.oDefaultDialog.open();
                }
            },

            onSearchValueHelp: function (oEntityProperties) {
                var sValue = oEntityProperties.getParameter("value");
                var oFilter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sValue);
                var oBinding = oEntityProperties.getSource().getBinding("items");

                oBinding.filter([oFilter]);
            },

            onChangeValueHelp: function (oEntityProperties) {
                var oSelectedItem = oEntityProperties.mParameters.listItem.mProperties;
                if (oSelectedItem) {
                    var sSelectedKey = oSelectedItem.description;

                    var oInput = sap.ui.getCore().byId("drivername");
                    if (oInput) {
                        oInput.setSelectedKey(sSelectedKey);
                    }
                }
            },

            onShortCutExecuteUpdate: function (oEvent) {
                if (sessionStorage.getItem("shortcuts") === 'true') {
                    var that = this;
                    var oEditable = sap.ui.getCore().byId("ConfirmButton").getVisible();
                    if (oEvent.which === 119) {
                        if (oEditable) {
                            that.onPressConfirmShipment();
                        } else {
                            sap.m.MessageBox.warning(this.getResourceBundle().getText("nopossible"));
                        }
                    } else if (oEvent.which === 117) {
                        that.onPermToChange();
                    } else if (oEvent.which === 114) {
                        oEvent.preventDefault();
                        this.byId("container-shipsmanagement---ShipsDetail--requestDetailPage").fireNavButtonPress();
                    }
                }
            },

            onPressEditShipHeaderButton: function () {
                var aButtons = [],
                    oConfirmButton = {
                        id: "ConfirmButton",
                        visible: true
                    },
                    oEditButton = {
                        id: "EditButton",
                        visible: false
                    },
                    oCancelButton = {
                        id: "CancelButton",
                        visible: true
                    };

                aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                // Manage header buttons state
                this.onManageButtonsState(aButtons);

                // Get container fields and set them enabled 
                this.onManageContainerFieldsState("GeneralInfo", true);
            },

            onPressCancelShipHeaderButton: function () {
                var oDriver = this.getModel().getObject(this.getView().getBindingContext().getPath());

                // Validate if any field was edited
                var sEdited = this.onValidateEditedFields("GeneralInfo", oDriver);

                if (sEdited) {
                    // Show message box 
                    var that = this;

                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editShipHeaderDataText"), {
                        title: this.getResourceBundle().getText("editShipHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onBuildGeneralDataSimpleForm(1);
                            }
                        }
                    });
                } else {
                    // Disable all container fields
                    this.onManageContainerFieldsState("GeneralInfo", false);

                    // Disable all header buttons
                    var aButtons = [],
                        oConfirmButton = {
                            id: "ConfirmButton",
                            visible: false
                        },
                        oEditButton = {
                            id: "EditButton",
                            visible: true
                        },
                        oCancelButton = {
                            id: "CancelButton",
                            visible: false
                        };

                    aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                    // Manage header buttons state
                    this.onManageButtonsState(aButtons);
                }

            },

            onPermToChange: function () {
                var lanes = this.getModel("ShipsDetail").getProperty("/lanes"),
                    oTable = this.byId("ShipsLoads"),
                    foundPositive = false,
                    canEdit = true;

                for (var i = 2; i < lanes.length; i++) {
                    if (lanes[i].state[0].state === 'Positive') {
                        foundPositive = true;
                        canEdit = false;
                        break;
                    }
                }

                if (canEdit) {
                    this.onManageVisibleButton(true);
                    this.onBuildGeneralDataSimpleForm(2);
                } else {
                    sap.m.MessageBox.warning(this.getResourceBundle().getText("lane"));
                }
            },

            onOpenEditFragent: function (oAction) {
                this.openEditDialog(oAction);
            },

            openEditDialog: function (oAction) {
                var oView = this.getView();
                var oName = this.byId("NameDestination");
                var oLocation = this.byId("Location");
                var oNif = this.byId("DestinationNif");
                var oCPostal = this.byId("PostalCode");
                var oCodCompartimento = this.byId("CodCompartimento");

                var oAccount = this.byId("AccountCode");
                var oCommercialCod = this.byId("CommercialCod");
                var oQuantity = this.byId("Quantity");
                var oUnit = this.byId("unit_vh");
                var oCodCompartimentoDestination = this.byId("CodCompartimentoDestination");

                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment(oView.getId(), "shipsmanagement.view.Edit", this);
                    oView.addDependent(this._oDialog);
                }
                switch (oAction) {
                    case 'C':
                        this._oDialog.open();
                        break;

                    case 'U':
                        var oTableDestination = this.byId("ShipsDestination");
                        var oSelectedItemDestination = oTableDestination.getSelectedItem();

                        var oTableLoads = this.byId("ShipsLoads");
                        var oSelectedItemLoads = oTableLoads.getSelectedItem();

                        if (oSelectedItemDestination) {
                            var oCellsDestination = oSelectedItemDestination.getCells();
                            var oCodcompartimento = oCellsDestination[0].getText();

                            oCodCompartimento.setValue(oCellsDestination[0].getText());
                            oName.setValue(oCellsDestination[1].getText());
                            oLocation.setValue(oCellsDestination[2].getText());
                            oNif.setValue(oCellsDestination[3].getText());
                            oCPostal.setValue(oCellsDestination[4].getText());

                            var aItemsLoads = oTableLoads.getItems();
                            for (var i = 0; i < aItemsLoads.length; i++) {
                                var oItem = aItemsLoads[i];
                                var oCellsLoads = oItem.getCells();
                                if (oCellsLoads[0].getText() === oCodcompartimento) {
                                    var match = oCellsLoads[3].getText().match(/^(\d+(\.\d+)?)\s*(\w+)$/);

                                    var quantity = match[1];
                                    var unit = match[3];

                                    oCodCompartimentoDestination.setValue(oCellsLoads[0].getText());
                                    oAccount.setValue(oCellsLoads[1].getText());
                                    oCommercialCod.setValue(oCellsLoads[2].getText());
                                    oQuantity.setValue(quantity);
                                    oUnit.setSelectedKey(unit);
                                    break;
                                }
                            }
                        } else {
                            var oCellsLoad = oSelectedItemLoads.getCells();
                            var oCodcompartimento = oCellsLoad[0].getText();
                            var match = oCellsLoad[3].getText().match(/^(\d+(\.\d+)?)\s*(\w+)$/);

                            var quantity = match[1];
                            var unit = match[3];

                            oCodCompartimentoDestination.setValue(oCellsLoad[0].getText());
                            oAccount.setValue(oCellsLoad[1].getText());
                            oCommercialCod.setValue(oCellsLoad[2].getText());
                            oQuantity.setValue(quantity);
                            oUnit.setSelectedKey(unit);

                            var aItemsDestinations = oTableDestination.getItems();
                            for (var i = 0; i < aItemsDestinations.length; i++) {
                                var oItem = aItemsDestinations[i];
                                var oCellsDestinations = oItem.getCells();
                                if (oCellsDestinations[0].getText() === oCodcompartimento) {

                                    oCodCompartimento.setValue(oCellsDestinations[0].getText());
                                    oName.setValue(oCellsDestinations[1].getText());
                                    oLocation.setValue(oCellsDestinations[2].getText());
                                    oNif.setValue(oCellsDestinations[3].getText());
                                    oCPostal.setValue(oCellsDestinations[4].getText());
                                    break;
                                }
                            }
                        }

                        this.byId("AddDestination").setProperty("visible", false);
                        this.byId("UpdateDestination").setProperty("visible", true);

                        this._oDialog.open();
                        break;
                }
            },

            onCloseFragment: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("EditDialog", "shipsmanagement.view.Edit", this);
                    this.getView().addDependent(this._oDialog);
                }

                this._oDialog.close();
            },

            onSelectionChange: function (oEvent) {
                var oSource = oEvent.getSource(),
                    aSelectedPaths = oSource.getSelectedContextPaths(),
                    oTable = oEvent.mParameters.id;

                this.onEnabledTableButtons(oTable, aSelectedPaths.length);
            },

            onAfterClose: function () {
                if (this._oDialog) {
                    this._oDialog.destroy();
                    this._oDialog = null;
                }
            },

            onEnabledTableButtons: function (oTable, aSelectedPaths) {
                if (oTable == "container-shipsmanagement---ShipsDetail--ShipsDestination") {
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

            onPressCancelShipment: function () {
                var oShipment = this.getModel().getObject(this.getView().getBindingContext().getPath());

                var sEdited = this.onValidateEditedFieldsHeader("GeneralInfo", oShipment);

                if (sEdited) {
                    // Show message box 
                    var that = this;

                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editDriverHeaderDataText"), {
                        title: this.getResourceBundle().getText("editDriverHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onCancelShip();
                                that.onManageEnabledButtons();
                                that.onBuildGeneralDataSimpleForm(1);
                            }
                        }
                    });
                } else {
                    this.onManageEnabledButtons();
                    this.onCancelShip();
                    this.onBuildGeneralDataSimpleForm(1);
                }

            },

            onPressConfirmShipment: function () {
                var oShipment = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFields("GeneralInfo", oShipment);

                if (sEdited) {
                    var aControls = [sap.m.Input, sap.m.Select, sap.m.DatePicker],
                        aContainers = ["GeneralInfo"],
                        oMainControl = "";
                    // Validate empty fields
                    var oChecked = this.checkEmptyFields(aControls, aContainers, oMainControl);

                    if (oChecked) {
                        // Update entity
                        var sPath = this.getView().getBindingContext().getPath(),
                            oShipment = this.getModel().getObject(sPath),
                            oURLParams = new URLSearchParams(window.location.search),
                            oToken = oURLParams.get('token'),
                            oEntry = {
                                cod_instalacao: "0000000000001152",
                                tipo_carregamento: this.aFields.find(({ id }) => id === 'type_carregamento').value,
                                regime_alfandegario: this.aFields.find(({ id }) => id === 'regime_alfandegario').value,
                                isencao_isp: this.aFields.find(({ id }) => id === 'isencao_isp').value,
                                dataprevistacarregamento: sap.ui.getCore().byId("dataprevistacarregamento").getDateValue(),
                                matricula: "",
                                motorista: sap.ui.getCore().byId("drivername").getSelectedKey(),
                            };

                        if (this.aFields.find(({ id }) => id === 'matricula').value) {
                            oEntry.matricula = this.aFields.find(({ id }) => id === 'matricula').value;
                        }

                        this.onBuildGeneralDataSimpleForm(1);

                        this.onUpdate(sPath, oEntry, oToken);
                    }
                } else {

                    // Show alert message box
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("noDataEditedDriverHeaderText"), {
                        title: this.getResourceBundle().getText("noDataEditedDriverHeaderTitle"),
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK
                    });
                }
            },

            onNavBackDetail: function () {
                sessionStorage.setItem("goToLaunchpad", "X");
                var lanes = this.onVerifyLanes();

                if (lanes) {
                    var oShipment = this.getModel().getObject(this.getView().getBindingContext().getPath());

                    var sEdited = this.onValidateEditedFieldsHeader("GeneralInfo", oShipment);

                    if (sEdited) {
                        // Show message box 
                        var that = this;

                        new sap.m.MessageBox.warning(this.getResourceBundle().getText("editDriverHeaderDataText"), {
                            title: this.getResourceBundle().getText("editDriverHeaderDataTitle"),
                            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                            emphasizedAction: sap.m.MessageBox.Action.OK,
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.OK) {
                                    sap.ui.getCore().byId("ConfirmButton").setProperty("visible", false);
                                    sap.ui.getCore().byId("CancelButton").setProperty("visible", false);
                                    sap.ui.getCore().byId("btChange").setProperty("visible", true);
                                    that.onCancelShip();
                                    that.onNavigation("", "main", "");
                                    that.onManageEnabledButtons();
                                }
                            }
                        });
                    } else {
                        this.onManageEnabledButtons();
                        this.onNavigation("", "main", "");
                        this.onCancelShip();
                    }
                } else {
                    this.byId("ShipsLoads").removeSelections();
                    this.byId("ShipsDestination").removeSelections();
                    this.onNavigation("", "main", "");
                }
            },

            onCancelDriverCreation: function () {
                var oMessage = {
                    oTitle: this.getResourceBundle().getText("alertMessageTitle"),
                    oText: this.getResourceBundle().getText("cancelDriverCreationText")
                }

                this.showAlertMessage(oMessage, 'R');
            },

            // Open Message Box
            onOpenMessageBox: function (oAction) {
                var oMessage = {
                    oTitle: "",
                    oText: ""
                }

                switch (oAction) {
                    case "DS":
                        oMessage.oTitle = this.getResourceBundle().getText("alertMessageTitle");
                        oMessage.oText = this.getResourceBundle().getText("deleteRowFromDriverDocumentation");
                        break;
                }

                this.showAlertMessage(oMessage, oAction);
            },

            onDeleteLoad: function () {
                var oTableLoads = this.byId("ShipsLoads"),
                    oTableDestinations = this.byId("ShipsDestination"),
                    oObjectLoad = oTableLoads.getSelectedContextPaths()[0],
                    oObjectDestination = oTableDestinations.getSelectedContextPaths()[0];
                if (oObjectLoad) {
                    this.onDelete(oObjectLoad, new URLSearchParams(window.location.search).get('token'));
                } else if (oObjectDestination) {
                    this.onDelete(oObjectDestination, new URLSearchParams(window.location.search).get('token'));
                }
                this.byId("ShipsDestination").getBinding("items").refresh();
                this.byId("ShipsLoads").getBinding("items").refresh();

                if (oTableLoads.getItems().length == 1) {
                    this.onManageEnabledButtons();
                    oTableLoads.removeSelections();
                    oTableDestinations.removeSelections();
                } else {
                    this.byId("EditShipmentLoad").setProperty("enabled", false);
                    this.byId("DeleteShipmentLoad").setProperty("enabled", false);
                    this.byId("EditShipmentDestination").setProperty("enabled", false);
                    this.byId("DeleteShipmentDestination").setProperty("enabled", false);
                    oTableLoads.removeSelections();
                    oTableDestinations.removeSelections();
                }
            },

            onCancelShip: function () {
                var aButtons = [],
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

                aButtons.push(oAddShipment, oEditShipment, oEditDestination, oAddShipmentDestination, oDeleteShipmentDestination, oDeleteShipmentLoad);
                this.byId("ShipsLoads").removeSelections();
                this.byId("ShipsDestination").removeSelections();
                this.onManageButtonsState(aButtons);
            },

            onManageVisibleButton: function (status) {
                var aButtons = [],
                    oAddShipment = {
                        id: "AddShipmentLoad",
                        visible: status
                    },
                    oEditShipment = {
                        id: "EditShipmentLoad",
                        visible: status
                    },
                    oEditDestination = {
                        id: "EditShipmentDestination",
                        visible: status
                    },
                    oAddShipmentDestination = {
                        id: "AddShipmentDestination",
                        visible: status
                    },
                    oDeleteShipmentLoad = {
                        id: "DeleteShipmentLoad",
                        visible: status
                    },
                    oDeleteShipmentDestination = {
                        id: "DeleteShipmentDestination",
                        visible: status
                    };

                aButtons.push(oAddShipment, oEditShipment, oEditDestination, oAddShipmentDestination, oDeleteShipmentDestination, oDeleteShipmentLoad);

                this.onManageButtonsState(aButtons);
            },

            onManageEnabledButtons: function () {
                var aButtons = [],
                    aButtonsVisible = [],
                    oAddShipment = {
                        id: "AddShipmentLoad",
                        enabled: true
                    },
                    oEditShipment = {
                        id: "EditShipmentLoad",
                        enabled: false
                    },
                    oEditDestination = {
                        id: "EditShipmentDestination",
                        enabled: false
                    },
                    oAddShipmentDestination = {
                        id: "AddShipmentDestination",
                        enabled: true
                    },
                    oDeleteShipmentLoad = {
                        id: "DeleteShipmentLoad",
                        enabled: false
                    },
                    oDeleteShipmentDestination = {
                        id: "DeleteShipmentDestination",
                        enabled: false
                    },
                    oEditShipmentV = {
                        id: "EditShipmentLoad",
                        visible: false
                    },
                    oEditDestinationV = {
                        id: "EditShipmentDestination",
                        visible: false
                    },
                    oDeleteShipmentLoadV = {
                        id: "DeleteShipmentLoad",
                        visible: false
                    },
                    oDeleteShipmentDestinationV = {
                        id: "DeleteShipmentDestination",
                        visible: false
                    };

                aButtons.push(oAddShipment, oEditShipment, oEditDestination, oAddShipmentDestination, oDeleteShipmentDestination, oDeleteShipmentLoad);
                aButtonsVisible.push(oEditShipmentV, oEditDestinationV, oDeleteShipmentLoadV, oDeleteShipmentDestinationV);

                // this.onManageButtonsState(aButtonsVisible);
                this.onManageButtonsEnable(aButtons);
            },

        });
    });

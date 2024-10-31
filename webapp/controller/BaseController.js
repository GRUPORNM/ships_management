sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    var oData = {
        items: []
    }

    var oDestination = {
        items: []
    }

    var oCompartimentoCod = {
        items: []
    }

    var TQAModel;

    return Controller.extend("shipsmanagement.controller.BaseController", {
        getModelTQA: function () {
            return TQAModel;
        },

        setModelTQA: function (token) {
            var userLanguage = sessionStorage.getItem("oLangu");
            if (!userLanguage) {
                userLanguage = "EN";
            }
            var serviceUrlWithLanguage = this.getModel().sServiceUrl + (this.getModel().sServiceUrl.includes("?") ? "&" : "?") + "sap-language=" + userLanguage;

            TQAModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: serviceUrlWithLanguage,
                annotationURI: "/zsrv_iwfnd/Annotations(TechnicalName='%2FTQA%2FOD_SHIP_MANAGEMENT_ANNO_MDL',Version='0001')/$value/",
                headers: {
                    "authorization": token,
                    "applicationName": "SHIPS_MANAGE"
                }
            });

            var vModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: "/sap/opu/odata/TQA/OD_VARIANTS_MANAGEMENT_SRV",
                headers: {
                    "authorization": token,
                    "applicationName": "SHIPS_MANAGE"
                }
            });
            this.setModel(vModel, "vModel");
            this.setModel(TQAModel);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavigation: function (sPath, oRoute, oEntityName) {
            if (sPath) {
                this.getRouter().navTo(oRoute, {
                    objectId: sPath.replace(oEntityName, "")
                }, false, true);
            } else {
                this.getRouter().navTo(oRoute, {}, false, true);
            }
        },

        onNavBack: function () {
            sessionStorage.setItem("goToLaunchpad", "X");
            this.onNavigation("", "main", "");
        },

        onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");

                return;
            }
        },

        onValidateEditedFields: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {
                if (oField instanceof sap.m.Input) {
                    if (oField.getValue() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.DatePicker) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: 'MM/dd/yy' });

                    if (oField.getValue() != oDateFormat.format(oObject[oField.getName()])) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }

            });

            if (oEdited) {
                return true;
            } else {
                return false;
            }
        },

        onValidateEditedFieldsHeader: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {
                if (oField instanceof sap.m.Input) {
                    if (oField.getName() != "cod_instalacao") {
                        if (oField.getName() != "matricula") {
                            if (oField.getValue() != oObject[oField.getName()]) {

                                oEdited = true;
                            }
                        }
                    }
                }
                else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }

            });

            if (oEdited) {
                return true;
            } else {
                return false;
            }
        },

        onManageButtonsState: function (aButtons) {
            if (aButtons.length > 0) {

                aButtons.forEach(oButton => {
                    this.byId(oButton.id).setVisible(oButton.visible);
                });
            }
        },

        onManageButtonsEnable: function (aButtons) {
            if (aButtons.length > 0) {

                aButtons.forEach(oButton => {
                    this.byId(oButton.id).setEnabled(oButton.enabled);
                });
            }
        },

        onManageContainerFieldsState: function (oContainer, sState) {
            this.byId(oContainer).getContent().forEach(oField => {
                if (oField instanceof sap.m.Input || oField instanceof sap.m.Select || oField instanceof sap.m.DatePicker) {
                    oField.setEnabled(sState);
                    oField.setValueState("None")
                } else if (oField instanceof sap.m.Text) {
                    oField.setValueState("None")
                }
            });
        },

        onSetContainerFieldsValues: function (oContainer) {
            var sPath = this.getView().getBindingContext().getPath(),
                oObject = this.getModel().getObject(sPath);

            if (sPath) {
                this.byId(oContainer).getContent().forEach(oField => {

                    if (oField instanceof sap.m.Input) {
                        oField.setValue(oObject[oField.getName()]);
                    }
                    else if (oField instanceof sap.m.Select) {
                        oField.setSelectedKey(oObject[oField.getName()]);
                    }
                    else if (oField instanceof sap.m.DatePicker) {
                        oField.setDateValue(oObject[oField.getName()]);
                    }
                });

                return true;
            } else {
                return false;
            }
        },

        onClearModelData: function () {
            try {
                var oShipHeader = new sap.ui.model.json.JSONModel({
                    items: []
                });
                var oDestinationData = new sap.ui.model.json.JSONModel({
                    items: []
                });
                var oLoadData = new sap.ui.model.json.JSONModel({
                    items: []
                });
                var oCompartimento = new sap.ui.model.json.JSONModel({
                    items: []
                });
                var oCompartimentoDeleted = new sap.ui.model.json.JSONModel({
                    items: []
                });
                this.setModel(oShipHeader, "HeaderData");
                this.setModel(oLoadData, "LoadData");
                this.setModel(oDestinationData, "DestinationData");
                this.setModel(oCompartimento, "CompartimentoData");
                this.setModel(oCompartimentoDeleted, "DeletedCompartimentoData");

                oData.items = [];
                this.aFields = [];

                return true;
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onClearContainersData: function (aContainers) {
            try {
                aContainers.forEach(oContainer => {
                    var oForm = this.byId(oContainer);

                    oForm.getContent().forEach(oElement => {
                        if (oElement instanceof sap.m.Input || oElement instanceof sap.m.DatePicker) {
                            oElement.setValue(null);
                            oElement.setValueState("None");
                            oElement.setValueStateText(null);
                        }
                    });
                });

                this.byId("cod_instalacao").setValue(this.getResourceBundle().getText("cod_instalacao"));
                return true;
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        getFields: function (aControl, aContainers, oMainControl) {
            this.aFields = [];
            aContainers.forEach(oContainer => {

                for (let i = 0; i < aControl.length; i++) {

                    if (oMainControl == "Dialog") {
                        var aContainerFields = sap.ui.getCore().byId(oContainer).getContent().filter(function (oControl) {
                            return oControl instanceof aControl[i];
                        });

                        aContainerFields.forEach(oContainerField => {
                            var oField = {
                                id: "",
                                value: ""
                            };

                            oField.id = oContainerField.getName();

                            try {
                                oField.value = oContainerField.getValue();
                            } catch (error) {
                                oField.value = oContainerField.getSelectedKey();
                            }

                            this.aFields.push(oField);
                        });
                    } else {
                        var aContainerFields = this.byId(oContainer).getContent().filter(function (oControl) {
                            return oControl instanceof aControl[i];
                        });

                        aContainerFields.forEach(oContainerField => {
                            var oField = {
                                id: "",
                                value: ""
                            };

                            oField.id = oContainerField.getName();

                            try {
                                oField.value = oContainerField.getValue();
                            } catch (error) {
                                oField.value = oContainerField.getSelectedKey();
                            }

                            this.aFields.push(oField);
                        });
                    }

                }

            });

            return this.aFields;
        },

        checkEmptyFields: function (aControl, aContainers, oMainControl) {
            this.getFields(aControl, aContainers, oMainControl);
            this.checked = true;

            if (this.aFields.length > 0) {

                this.aFields.forEach(oField => {
                    if (oMainControl == "Dialog") {
                        var oControl = sap.ui.getCore().byId(oField.id);
                    } else {
                        var oControl = this.byId(oField.id);
                    }

                    if (oControl) {
                        if (oControl.getProperty("enabled")) {
                            try {
                                if (oControl.sId.includes("usr_email")) {
                                    var oEmailChecked = this.onValidateEmail();

                                    if (!oEmailChecked) {
                                        this.checked = false;
                                    }
                                } else {
                                    if (oControl.getValue() == "") {
                                        oControl.setValueState("Error");
                                        this.checked = false;
                                    } else {
                                        oControl.setValueState("None");
                                    }
                                }
                            } catch (error) {
                                if (oControl.getSelectedKey() != "") {
                                    oControl.setValueState("None");
                                } else {
                                    oControl.setValueState("Error");
                                    this.checked = false;
                                }
                            }
                        }
                    }
                });

                if (this.checked) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        checkEmptyFieldsDestination: function (oAction) {
            this.checked = true;
            var campos = [];

            if (oAction == "U") {
                campos = [
                    "NameDestination",
                    "Location",
                    "DestinationNif",
                    "PostalCode"
                ];
            } else {
                campos = [
                    "selectCompartimento",
                    "NameDestination",
                    "Location",
                    "DestinationNif",
                    "PostalCode"
                ];
            }

            for (var i = 0; i < campos.length; i++) {
                var campo = this.byId(campos[i]);
                if (campo instanceof sap.m.Select) {
                    if (!campo.getSelectedItem()) {
                        campo.setValueState("Error");
                        this.checked = false;
                    }
                } else {
                    if (!campo.getValue()) {
                        campo.setValueState("Error");
                        this.checked = false;
                    } else {
                        campo.setValueState("None");
                    }
                }
            }
            if (this.checked) {
                return true;
            } else {
                return false;
            }
        },

        onCheckTableData: function () {
            var oModelLoad = this.getView().getModel("LoadData"),
                oModelDestination = this.getView().getModel("DestinationData"),
                oLoadData = oModelLoad.oData.items,
                oDestinationData = oModelDestination.oData.items;

            if (oLoadData.length != 0) {
                if (oDestinationData.length != oLoadData.length) {
                    var oMessage = {
                        oTitle: this.getResourceBundle().getText("alertMessageTitle"),
                        oText: this.getResourceBundle().getText("cannotCreate")
                    }

                    this.showAlertMessage(oMessage, 'C');
                } else {
                    return true;
                }
            } else {
                var oMessage = {
                    oTitle: this.getResourceBundle().getText("alertMessageTitle"),
                    oText: this.getResourceBundle().getText("cannotCreate")
                }

                this.showAlertMessage(oMessage, 'C');
            }
        },

        buildDialogs: function (oDialogInfo, aDialogFields, aDialogButtons) {
            try {
                this.oDialog = new sap.m.Dialog({
                    title: oDialogInfo.oTitle,
                    id: oDialogInfo.oId,
                    afterClose: this.onAfterClose.bind(this)
                });

                if (aDialogFields.length > 0) {

                    this.oDialog.addContent(this.oGrid = new sap.ui.layout.Grid({
                        defaultSpan: "L12 M12 S12",
                        width: "auto"
                    }));

                    this.oGrid.addContent(this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
                        id: oDialogInfo.oId + "SimpleForm",
                        minWidth: 1024,
                        layout: oDialogInfo.oLayout,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        emptySpanL: 4,
                        emptySpanM: 4,
                        columnsL: 2,
                        columnsM: 2,
                        maxContainerCols: 2,
                        editable: false
                    }));

                    aDialogFields.forEach(oField => {
                        switch (oField.oControl) {

                            case sap.m.Input:
                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText, required: oField.oRequired })
                                )

                                this.oInput = new sap.m.Input({
                                    id: oField.oId,
                                    name: oField.oName,
                                    type: oField.oType,
                                    enabled: oField.oEnabled
                                });

                                if (oField.oSelectedKey != "") {
                                    this.oInput.setSelectedKey(oField.oSelectedKey);
                                } else if (oField.oValue != "") {
                                    this.oInput.setValue(oField.oValue);
                                }

                                this.oSimpleForm.addContent(this.oInput);
                                break;

                            case sap.m.Select:
                                if (oField.oItems != "") {
                                    this.oSimpleForm.addContent(
                                        new sap.m.Label({ text: oField.oLabelText, required: oField.oRequired })
                                    );

                                    this.oSelect = new sap.m.Select({
                                        id: oField.oId,
                                        name: oField.oName,
                                        enabled: oField.oEnabled,
                                        forceSelection: oField.oForceSelection,
                                    });

                                    this.oSelect.setModel(this.getModel());

                                    if (oField.oId == "Codcompartimento") {
                                        this.oSelect.bindAggregation("items", {
                                            path: "CompartimentoData>/items",
                                            template: new sap.ui.core.Item({
                                                key: "{CompartimentoData>key}",
                                                text: "{CompartimentoData>text}"
                                            })
                                        });
                                    } else {
                                        this.oSelect.bindAggregation("items", {
                                            path: oField.oItems,
                                            template: new sap.ui.core.Item({
                                                key: oField.oKey,
                                                text: oField.oText
                                            })
                                        });
                                    }

                                    if (oField.oSelectedKey != "") {
                                        this.oSelect.setSelectedKey(oField.oSelectedKey);
                                    }

                                    this.oSimpleForm.addContent(this.oSelect);
                                }

                                break;

                            case sap.m.DatePicker:

                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText })
                                );

                                this.oDatePicker = new sap.m.DatePicker({
                                    id: oField.oId,
                                    name: oField.oName,
                                    value: oField.oValue,
                                    valueFormat: oField.oValueFormat,
                                    required: oField.oRequired,
                                    enabled: oField.oEnabled,
                                    displayFormat: oField.oDisplayFormat,
                                    minDate: oField.oMinDate
                                })


                                if (oField.oValue1 != "") {
                                    this.oDatePicker.setDateValue(new Date(oField.oValue1));
                                }

                                this.oSimpleForm.addContent(this.oDatePicker);
                                break;

                            case sap.ui.unified.FileUploader:

                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText }),
                                );

                                this.oFileUploader = new sap.ui.unified.FileUploader({
                                    id: oField.oId,
                                    name: oField.oName,
                                    enabled: oField.oEnabled,

                                    width: "100%",
                                    tooltip: oField.oTooltip
                                })

                                if (oField.oValue != "") {
                                    this.oFileUploader.setValue(oField.oValue);
                                }

                                this.oSimpleForm.addContent(this.oFileUploader);

                                break;

                        }
                    });

                    if (aDialogButtons.length > 0) {
                        aDialogButtons.forEach(oButton => {
                            this.oDialog.addButton(
                                new sap.m.Button({
                                    id: oButton.oId,
                                    text: oButton.oText,
                                    type: oButton.oType,
                                    press: oButton.oEvent
                                })
                            );
                        });
                    }

                }

                this.oDialog.open();

            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }

        },

        onAddLoad: async function () {
            var codcompartimento,
                that = this;

            try {
                var aControl = [],
                    aContainers = [],
                    oModelCompartimento = this.getView().getModel("CompartimentoData"),
                    oModelDeletedCompartimento = this.getView().getModel("DeletedCompartimentoData"),
                    oModel = this.getView().getModel("LoadData"),
                    oTableModelItems = this.getView().getModel("LoadData").oData.items;

                if (oModelDeletedCompartimento.oData.items.length != 0) {
                    codcompartimento = oModelDeletedCompartimento.oData.items[0].Codcompartimento;
                } else {
                    if (oTableModelItems.length != "0") {
                        for (let i = 0; i < oTableModelItems.length; i++) {
                            codcompartimento = (parseInt(oTableModelItems[i].Codcompartimento) + 1).toString();
                        }
                    } else {
                        codcompartimento = "1";
                    }
                }

                aControl.push(sap.m.Select, sap.m.Input);
                aContainers.push(this.oSimpleForm.getId());

                const checked = this.checkEmptyFields(aControl, aContainers, "Dialog");

                if (checked) {
                    var aCompartimento = {
                        Key: codcompartimento,
                        Codcompartimento: codcompartimento,
                    }
                    var aRow = {
                        Codcompartimento: codcompartimento,
                        Codprodcomercial: this.aFields.find(({ id }) => id === 'CommercialCod').value,
                        Quantprodcomercial: this.aFields.find(({ id }) => id === 'Quantity').value,
                        Unidademedida: this.aFields.find(({ id }) => id === 'unit_vh').value
                    }

                    oData.items.push(aRow);

                    if (oModelDeletedCompartimento.oData.items.length == 0) {
                        oCompartimentoCod.items.push(aCompartimento);
                        oModelCompartimento.setData(oCompartimentoCod);
                    } else {
                        var indexToRemove = oModelDeletedCompartimento.oData.items.findIndex(function (item) {
                            return item.Codcompartimento === codcompartimento;
                        });

                        oModelDeletedCompartimento.oData.items.splice(indexToRemove, 1);
                        oModelDeletedCompartimento.refresh(true);
                    }

                    oModel.setData(oData);
                    oModel.refresh(true);

                    that.byId("EditShipmentLoad").setProperty("visible", true);

                    this.onCloseDialog();
                }

            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onAddDestination: function () {
            try {
                var aControl = [],
                    aContainers = [],
                    oModel = this.getView().getModel("DestinationData");

                aControl.push(sap.m.Input);
                aContainers.push(this.oSimpleForm.getId());

                const checked = this.checkEmptyFieldsDestination();
                if (checked) {
                    var aRow = {
                        Codcompartimento: this.byId("selectCompartimento").getSelectedKey(),
                        Nome: this.byId("NameDestination").getValue(),
                        Localidade: this.byId("Location").getValue(),
                        Nif: this.byId("DestinationNif").getValue(),
                        Cpostal: this.byId("PostalCode").getValue()
                    }

                    oDestination.items.push(aRow);
                    oModel.setData(oDestination);
                    oModel.refresh(true);

                    this.onDeleteCodCompartimento(aRow.Codcompartimento);
                    this.onAfterFragment();
                    this.onCloseFragment();
                }

            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onDeleteCodCompartimento: function (sCodCompartimentoToDelete) {
            var oModel = this.getView().getModel("CompartimentoData"),
                aItems = oModel.getProperty("/items"),
                nIndexToDelete = -1;

            for (var i = 0; i < aItems.length; i++) {
                if (aItems[i].Codcompartimento === sCodCompartimentoToDelete) {
                    nIndexToDelete = i;
                    break;
                }
            }

            if (nIndexToDelete !== -1) {
                aItems.splice(nIndexToDelete, 1);
            }

            oModel.refresh(true);
        },

        onAfterFragment: function () {
            var oSelect = this.byId("selectCompartimento"),
                oName = this.byId("NameDestination"),
                oLocation = this.byId("Location"),
                oNif = this.byId("DestinationNif"),
                oCPostal = this.byId("PostalCode");

            oSelect.setSelectedKey("");
            oName.setValue("");
            oLocation.setValue("");
            oNif.setValue("");
            oCPostal.setValue("");
        },

        onAfterEditFragment: function () {
            this.byId("NameDestination").setValue("");
            this.byId("Location").setValue("");
            this.byId("DestinationNif").setValue("");
            this.byId("PostalCode").setValue("");
            this.byId("AccountCode").setValue("");
            this.byId("CommercialCod").setSelectedKey("");
            this.byId("Quantity").setValue("");
            this.byId("unit_vh").setSelectedKey("");
        },

        onUpdateDestination: async function (oEvent) {
            var aControl = [],
                aContainers = [],
                oModel = this.getView().getModel("DestinationData"),
                oTable = "",
                oObject = "",
                sPath = "";

            if (oModel) {
                oTable = this.byId("ShipsDestination");
                sPath = oTable.getSelectedContextPaths()[0];
                oObject = oModel.getProperty(sPath);
            } else {
                oTable = this.byId("UserDocumentationTable");
                sPath = oTable.getSelectedContextPaths()[0];
                oObject = this.getModel().getObject(sPath);
            }

            aControl.push(sap.m.Input);
            aContainers.push(this.oSimpleForm.getId());

            const checked = this.checkEmptyFieldsDestination("U");

            if (checked) {
                try {
                    if (oModel) {
                        oObject.Nome = this.byId("NameDestination").getValue();
                        oObject.Localidade = this.byId("Location").getValue();
                        oObject.Nif = this.byId("DestinationNif").getValue();
                        oObject.Cpostal = this.byId("PostalCode").getValue();

                        oModel.refresh(true);

                        this.onCloseFragment();
                    } else {
                        var oEntry = {};

                        oEntry.Nome = this.byId("NameDestination").getValue();
                        oEntry.Localidade = this.byId("Location").getValue();
                        oEntry.Nif = this.byId("DestinationNif").getValue();
                        oEntry.Cpostal = this.byId("PostalCode").getValue();

                        if (sPath) {
                            this.onCloseFragment();
                            this.onUpdate(sPath, oEntry);
                        }
                    }
                } catch (error) {
                    var oMessage = {
                        oText: error.message,
                        oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                    }
                    this.showErrorMessage(oMessage);
                }
            }
        },

        onUpdateHeader: async function (oEvent) {
            var aControl = [],
                aContainers = [],
                oModel = this.getView().getModel("HeaderData"),
                oTable = "",
                oObject = "",
                sPath = "";

            aControl.push(sap.m.Input, sap.m.DatePicker);
            aContainers.push(this.oSimpleForm.getId());

            const checked = this.checkEmptyFields(aControl, aContainers, "Dialog");

            if (checked) {
                try {
                    if (oModel) {
                        oObject.Codinstalacao = sap.ui.getCore().byId("cod_instalacao").getValue();
                        oObject.Tipocarregamento = sap.ui.getCore().byId("tipo_carregamento").getSelectedKey();
                        oObject.Regimealfandegario = sap.ui.getCore().byId("regimealfadega").getSelectedKey();
                        oObject.Isencaoisp = sap.ui.getCore().byId("isencaoisp").getSelectedKey();
                        oObject.Dataprevistacarregamento = sap.ui.getCore().byId("dataprevistacarregamento").getDateValue();
                        oObject.Matricula = sap.ui.getCore().byId("matricula").getValue();

                        oModel.refresh(true);

                        this.onCloseDialog();
                    } else {
                        var oEntry = {};

                        oObject.Codinstalacao = sap.ui.getCore().byId("cod_instalacao").getValue();
                        oObject.Tipocarregamento = sap.ui.getCore().byId("tipo_carregamento").getSelectedKey();
                        oObject.Regimealfandegario = sap.ui.getCore().byId("regimealfadega").getSelectedKey();
                        oObject.Isencaoisp = sap.ui.getCore().byId("isencaoisp").getSelectedKey();
                        oObject.Dataprevistacarregamento = sap.ui.getCore().byId("dataprevistacarregamento").getDateValue();
                        oObject.Matricula = sap.ui.getCore().byId("matricula").getValue();

                        if (sPath) {
                            this.onCloseDialog1();
                            // this.onUpdate(sPath, oEntry);
                        }
                    }
                } catch (error) {
                    var oMessage = {
                        oText: error.message,
                        oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                    }

                    this.showErrorMessage(oMessage);
                }
            }
        },

        onUpdateLoad: async function (oEvent) {
            var aControl = [],
                aContainers = [],
                oModel = this.getView().getModel("LoadData"),
                oTable = "",
                oObject = "",
                sPath = "";

            if (oModel) {
                oTable = this.byId("ShipsLoads");
                sPath = oTable.getSelectedContextPaths()[0];
                oObject = oModel.getProperty(sPath);
            } else {
                oTable = this.byId("ShipsLoads");
                sPath = oTable.getSelectedContextPaths()[0];
                oObject = this.getModel().getObject(sPath);
            }

            aControl.push(sap.m.Input);
            aContainers.push(this.oSimpleForm.getId());

            const checked = this.checkEmptyFields(aControl, aContainers, "Dialog");

            if (checked) {
                try {
                    if (oModel) {
                        // oObject.Codconta = sap.ui.getCore().byId("AccountCode").getValue();
                        oObject.Codprodcomercial = sap.ui.getCore().byId("CommercialCod").getSelectedKey();
                        oObject.Quantprodcomercial = sap.ui.getCore().byId("Quantity").getValue();
                        oObject.Unidademedida = sap.ui.getCore().byId("unit_vh").getSelectedKey();

                        oModel.refresh(true);
                        this.byId("ShipsLoads").removeSelections();

                        this.onCloseDialog();
                    } else {
                        var oEntry = {};

                        // oEntry.Codconta = sap.ui.getCore().byId("AccountCode").getValue();
                        oEntry.Codprodcomercial = sap.ui.getCore().byId("CommercialCod").getSelectedKey();
                        oEntry.Quantprodcomercial = sap.ui.getCore().byId("Quantity").getValue();
                        oEntry.Unidademedida = sap.ui.getCore().byId("unit_vh").getSelectedKey();

                        if (sPath) {
                            this.onCloseDialog1();
                            this.onUpdate(sPath, oEntry);
                        }
                    }
                } catch (error) {
                    var oMessage = {
                        oText: error.message,
                        oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                    }
                    this.showErrorMessage(oMessage);
                }
            }
        },

        onCloseDialog: function () {
            this.byId("ShipsLoads").removeSelections();
            this.onEnabledTableButtons(this.byId("ShipsLoads").getSelectedContextPaths().length);

            this.oDialog.close();
        },

        onCloseDialogDestination: function () {
            this.byId("ShipsDestination").removeSelections();
            this.onEnabledTableButtons(this.byId("ShipsDestination").getSelectedContextPaths().length);

            this.oDialog.close();
        },

        onCloseDialog1: function () {
            this.byId("UserDocumentationTable").removeSelections();
            this.byId("EditUserDocumentationRow").setEnabled(false);

            this.oDialog.close();
        },

        onAfterClose: function () {
            if (this.oDialog) {
                this.oDialog.destroy();
                this.oDialog = null;
            }
        },

        onAfterCloseCreate: function () {
            if (this.oDialog) {
                this.oDialog.destroy();
                this.oDialog = null;
            }
        },

        showAlertMessageCreate: function (oMessage, pAction) {
            var that = this;
            new sap.m.MessageBox.warning(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        switch (pAction) {
                            case 'DS':
                                that.onDeleteLoads();
                                break;
                            case 'DD':
                                that.onDeleteDestination();
                                break;
                        }

                    } else {

                    }
                }
            });
        },

        showAlertMessage: function (oMessage, pAction) {
            var that = this;

            new sap.m.MessageBox.warning(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        switch (pAction) {
                            case 'DS':
                                that.onDeleteLoad();
                                break;
                        }
                    } else {

                    }
                }
            });
        },

        onDeleteDestination: function () {
            var oTable = this.byId("ShipsDestination"),
                oModel = this.getView().getModel("DestinationData"),
                oModelCompartimento = this.getView().getModel("CompartimentoData"),
                oSelectedContextPath = oTable.getSelectedContextPaths()[0].replace("/items/", ""),
                lastCodcompartimento = oDestination.items[oSelectedContextPath].Codcompartimento;

            oDestination.items.splice(oSelectedContextPath, 1);

            oTable.removeSelections();

            var aSelectedContextPaths = oTable.getSelectedContextPaths().length;
            this.onEnabledTableButtons("container-shipsmanagement---CreateShipment--ShipsDestination", aSelectedContextPaths);

            oModel.refresh(true);

            if (lastCodcompartimento !== undefined) {
                var aCompartimento = {
                    Key: lastCodcompartimento,
                    Codcompartimento: lastCodcompartimento,
                };

                oModelCompartimento.oData.items.push(aCompartimento);
                oModelCompartimento.refresh(true);
            }
        },

        onDeleteLoads: function () {
            var oTable = this.byId("ShipsLoads"),
                oModel = this.getView().getModel("LoadData"),
                oModelCompartimento = this.getView().getModel("DeletedCompartimentoData"),
                oSelectedContextPath = oTable.getSelectedContextPaths()[0].replace("/items/", ""),
                lastCodcompartimento = oData.items[oSelectedContextPath].Codcompartimento;

            oData.items.splice(oSelectedContextPath, 1);

            oTable.removeSelections();

            var aSelectedContextPaths = oTable.getSelectedContextPaths().length;
            this.onEnabledTableButtons("container-shipsmanagement---CreateShipment--ShipsLoads", aSelectedContextPaths);

            oModel.refresh(true);

            if (lastCodcompartimento !== undefined) {
                var aCompartimento = {
                    Key: lastCodcompartimento,
                    Codcompartimento: lastCodcompartimento,
                };

                oModelCompartimento.oData.items.push(aCompartimento);
                oModelCompartimento.refresh(true);
            }
        },

        showErrorMessage: function (oMessage) {
            new sap.m.MessageBox.error(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK
            });
        },

        onCreate: function (sPath, oEntry, oToken) {
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        that = this;

                    oModel.create(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            var oDataModel = that.getModel("HeaderData"),
                                oDataModelLoad = that.getModel("LoadData"),
                                oDataModelDestination = that.getModel("DestinationData");

                            if (oDataModel && oDataModelLoad && oDataModelDestination) {
                                var aContainers = [];
                                aContainers.push("GeneralInfo")

                                var oModelDataCleared = that.onClearModelData(),
                                    oContainersDataCleared = that.onClearContainersData(aContainers);

                                if (oModelDataCleared && oContainersDataCleared) {
                                    that.onNavigation("", "main", "");
                                }
                            } else {

                            }
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

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onUpdate: function (sPath, oEntry, oToken) {
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView");

                    oModel.update(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {

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

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onDelete: function (sPath, oToken) {
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView");

                    oModel.remove(sPath, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {

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

                    oModel.attachRequestSent(function () {
                        oAppViewModel.setProperty("/busy", true);
                    });
                    oModel.attachRequestCompleted(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                    oModel.attachRequestFailed(function () {
                        oAppViewModel.setProperty("/busy", false);
                    });
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        getUserAuthentication: function (type) {
            var that = this,
                urlParams = new URLSearchParams(window.location.search),
                token = urlParams.get('token');

            if (token != null) {
                var headers = new Headers();
                headers.append("X-authorization", token);

                var requestOptions = {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                };

                fetch("/sap/opu/odata/TQA/AUTHENTICATOR_SRV/USER_AUTHENTICATION", requestOptions)
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error("Ocorreu um erro ao ler a entidade.");
                        }
                        return response.text();
                    })
                    .then(function (xml) {
                        var parser = new DOMParser(),
                            xmlDoc = parser.parseFromString(xml, "text/xml"),
                            successResponseElement = xmlDoc.getElementsByTagName("d:SuccessResponse")[0],
                            response = successResponseElement.textContent;

                        if (response != 'X') {
                            that.getRouter().navTo("NotFound");
                        }
                        else {
                            that.getModel("appView").setProperty("/token", token);
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } else {
                that.getRouter().navTo("NotFound");
                return;
            }
        },

        onUpdateLoadAndDestination: function (oAction) {
            try {
                var oShipment = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sPath = "/ShipmentsUpdateHeaders",
                    oCodCompartimento;

                if (this.byId("ShipsLoads").getSelectedContextPaths().length > 0) {
                    oCodCompartimento = this.getModel().getObject(this.byId("ShipsLoads").getSelectedContextPaths()[0]).codcompartimento;
                } else if (this.byId("ShipsDestination").getSelectedContextPaths().length > 0) {
                    oCodCompartimento = this.getModel().getObject(this.byId("ShipsDestination").getSelectedContextPaths()[0]).codcompartimento;
                }
                if (oAction == "A") {
                    sPath = "/ShipmentsAddODHeaders";
                    var aTableItems = this.byId("ShipsLoads").getItems();

                    if (aTableItems.length > 0) {
                        var lastItem = aTableItems[aTableItems.length - 1],
                            oCodCompartimento = lastItem.getBindingContext().getProperty("codcompartimento");

                        if (oCodCompartimento !== undefined && oCodCompartimento !== null) {
                            oCodCompartimento = (parseInt(oCodCompartimento, 10) + 10).toString().padStart(16, '0');
                        } else {
                            oCodCompartimento = "0000000000000010";
                        }
                    } else {
                        oCodCompartimento = "0000000000000010";
                    }
                }

                var oEntry = {
                    LoadOrder: oShipment.load_order,
                    Codcompartimento: oCodCompartimento,
                    Todestinations: [
                        {
                            LoadOrder: oShipment.load_order,
                            Nome: this.byId("NameDestination").getValue(),
                            Nif: this.byId("DestinationNif").getValue(),
                            Cpostal: this.byId("PostalCode").getValue(),
                            Localidade: this.byId("Location").getValue(),
                            Matricula: "0000000000000000",
                            Codcompartimento: oCodCompartimento,
                            Quantidadeprevista: "0000000000.00"
                        }
                    ],
                    Toloads: [
                        {
                            LoadOrder: oShipment.load_order,
                            Codcompartimento: oCodCompartimento,
                            Matricula: "0000000000000000",
                            Codprodcomercial: this.byId("CommercialCod").getSelectedKey(),
                            Quantprodcomercial: this.byId("Quantity").getValue(),
                            Unidademedida: this.byId("unit_vh").getSelectedKey(),
                        }
                    ]
                }

                this.onCloseFragment();
                this.onCreate(sPath, oEntry, new URLSearchParams(window.location.search).get('token'));

                this.byId("ShipsLoads").removeSelections();
                this.byId("ShipsDestination").removeSelections();
                this.byId("ShipsDestination").getBinding("items").refresh();
                this.byId("ShipsLoads").getBinding("items").refresh();

                this.onManageEnabledButtons();
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }
                this.showErrorMessage(oMessage);
            }
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
    });
});
sap.ui.define([], function () {
    "use strict";

    return {
        dateFormat: function (oDate) {
            debugger;
            if (oDate != null) {
                var oDate = (oDate instanceof Date) ? oDate : new Date(oDate);
                var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy HH:mm:ss" });

                return dateFormat.format(oDate);
            }
        },

        dateShort: function (oDate) {

            if (oDate != null) {

                var oDate = (oDate instanceof Date) ? oDate : new Date(oDate);

                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });

                return dateFormat.format(oDate);

            }

        },

        codcompartimento: function (oCodcompartimento) {
            if (typeof oCodcompartimento === 'string') {
                oCodcompartimento = oCodcompartimento.replace(/^0+/, '');
            }
            return oCodcompartimento;
        }

    };
});
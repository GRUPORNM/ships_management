/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ships_management/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

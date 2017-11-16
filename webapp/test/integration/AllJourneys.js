/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;


sap.ui.require([
	"sap/ui/test/Opa5",
	"WarrantyClaim_MockUp/test/integration/pages/Common",
	"WarrantyClaim_MockUp/test/integration/pages/WarrantyObjectPage"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "WarrantyClaim_MockUp.view.",
		autoWait: true
	});

	sap.ui.require([
		"WarrantyClaim_MockUp/test/integration/WarrantyClaimJourney"
	], function () {
		QUnit.start();
	});
});
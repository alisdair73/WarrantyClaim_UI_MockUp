sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(UIComponent, Device, models, JSONModel, WarrantyClaim) {
	"use strict";

	return UIComponent.extend("WarrantyClaim_MockUp.Component", {

		metadata: {
			manifest: "json"
		},

		/*
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//set the validation model
			this.setModel(models.createUIValidationModel(),"UIValidation");
			
			//set the initial Warranty Model
			this.setModel(WarrantyClaim.createWarrantyClaimModel(),"WarrantyClaim");
			                 
			this.getRouter().initialize();
		}
	});

});
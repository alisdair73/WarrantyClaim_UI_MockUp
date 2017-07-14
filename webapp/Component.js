sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim",
	"WarrantyClaim_MockUp/controller/ErrorHandler"
], function(UIComponent, Device, models, JSONModel, WarrantyClaim,ErrorHandler) {
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
			
		//	this._oErrorHandler = new ErrorHandler(this);
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//set the validation model
			this.setModel(models.createUIValidationModel(),"UIValidation");
			
			//set the initial Warranty Model
			this.setModel(WarrantyClaim.createWarrantyClaimModel(),"WarrantyClaim");
			                     
			// call the base component's init function and create the App view
			//UIComponent.prototype.init.apply(this, arguments);
				
			this.getRouter().initialize();
		}
	});

});
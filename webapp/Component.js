sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("WarrantyClaim_MockUp.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//set the initial Warranty Model
			//this.setModel(models.createNewWarrantyClaimModel(),"WarrantyClaim");
			
			this.getRouter().initialize();
			
			// Determine the Warranty Claim Number
//			var claimNumber = "";
			if (this.getComponentData() &&
				this.getComponentData().startupParameters.WarrantyClaim &&
				this.getComponentData().startupParameters.WarrantyClaim[0]) {
				
				//Get the Claim from the backend
/*				claimNumber = this.getComponentData().startupParameters.WarrantyClaim[0];
				this.getRouter().navTo("warrantyMaintain", {"warrantyClaimNumber" : claimNumber}, true);*/
			}
			
/*			this.getModel().read(
				"/WarrantyClaimSet('" + claimNumber + "')", {
					context: null,
					success: function(oData) {
						this.setModel(new JSONModel(oData),"WarrantyClaim");
					}.bind(this),
						error: function() {}.bind(this)
				}
			);*/
		}
	});

});
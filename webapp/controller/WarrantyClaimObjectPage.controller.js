sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		"WarrantyClaim_MockUp/controller/BaseController",
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter'
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.setModel(oViewModel, "WarrantClaimObjectPageView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
			//var oViewModel = this.getModel("detailView");
			//If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			//oViewModel.setProperty("/busy", false);

			var claimNumber = "";
			if (this.getOwnerComponent().getComponentData() &&
				this.getOwnerComponent().getComponentData().startupParameters.WarrantyClaim &&
				this.getOwnerComponent().getComponentData().startupParameters.WarrantyClaim[0]) {
				
				//Get the Claim from the backend
				claimNumber = this.getComponentData().startupParameters.WarrantyClaim[0];
			}
			claimNumber = '100000000567';
			this.getView().bindElement({
				path: "/WarrantyClaimSet('" + claimNumber + "')",
/*				parameters: {
					expand: "BusinessRoles,ProcessRoles,Privileges"
				}, */
				events: {
				//	change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});	
		},
		
		onAfterRendering: function(oEvent) {
			
			var oWarrantyClaimModel = this.getOwnerComponent().getModel();
			if (oWarrantyClaimModel.getProperty("/ClaimNumber") === "NEW CLAIM"){
				this.openClaimSelectDialog( );	
			}
		},

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		
		openClaimSelectDialog: function() {
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.ClaimTypeSelection", this);
			}
			
			var modulePath = jQuery.sap.getModulePath("WarrantyClaim_MockUp");
			var oClaimTypeModel = new JSONModel(modulePath + "/model/ClaimTypes.json");
		
            this._oDialog.setModel(oClaimTypeModel,"ClaimTypes");
			this._oDialog.open();
		},
 
		handleListSelect: function(oEvent){
			
			var claimType = oEvent.getParameter("listItem").getBindingContext("ClaimTypes").getObject().Text;
			var warrantyClaimModel = this.getOwnerComponent().getModel();
			warrantyClaimModel.setProperty("/ClaimType",claimType);
			warrantyClaimModel.setProperty("/SubmittedOn", new Date());
			this._oDialog.close();
		},

		handleClose: function(oEvent){
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
        		target: { semanticObject : "#"}
            });
			
			this._oDialog.close();
		},
		
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var oViewModel = this.getModel("WarrantClaimObjectPageView");
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
		}
	});
});
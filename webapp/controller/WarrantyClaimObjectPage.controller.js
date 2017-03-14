sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		"WarrantyClaim_MockUp/controller/BaseController",
		'sap/ui/model/json/JSONModel',
        "WarrantyClaim_MockUp/model/WarrantyClaim"		
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			var oViewModel = new JSONModel({
				busy: false,
				delay: 30
			});
			this.setModel(oViewModel, "WarrantClaimObjectPageView");
			this.getRouter().getRoute("createWarranty").attachPatternMatched(this._onCreateWarrantyMatched, this);
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
			//var oViewModel = this.getModel("detailView");
			//If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			//oViewModel.setProperty("/busy", false);
		},

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		
		openClaimSelectDialog: function() {
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.ClaimTypeSelection", this);
				this.getView().addDependent(this._oDialog);
			}
			this._oDialog.open();
		},
 
		handleListSelect: function(oEvent){
			
			var claimType = oEvent.getParameter("listItem").getBindingContext().getObject().Code;
			var claimTypeDescription = oEvent.getParameter("listItem").getBindingContext().getObject().Description;
			
			this.getModel("WarrantClaimObjectPageView").setProperty("/claimTypeText", claimTypeDescription);
			this.getModel("WarrantClaimObjectPageView").setProperty("/claimState", "None");
			this.getModel("WarrantClaimObjectPageView").setProperty("/claimStateText", "New Claim");
			this.getModel("WarrantClaimObjectPageView").setProperty("/claimStateIcon", "sap-icon://write-new-document");
		
//			jQuery.sap.require("sap.ui.core.format.DateFormat");
//			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "dd/MM/yyyy"});
		
			var oContext = this.getModel().createEntry("/WarrantyClaimSet",
				{ "properties": 
					{	"ClaimType":claimType,
//						"SubmittedOn": oDateFormat.format(new Date()),
					 	"SubmittedOn": new Date(),
						"TotalCostOfClaim" : "0"
					}
				} 
			);	
			this.getView().setBindingContext(oContext);
			var oViewModel = this.getModel("WarrantClaimObjectPageView");
			oViewModel.setProperty("/busy", false);
			this._oDialog.close();
		},

		handleClose: function(oEvent){
			
			this.navigateToLaunchpad();
			this._oDialog.close();
		},
		
		onSave: function(){
			this.getModel("WarrantClaimObjectPageView").setProperty("/busy", true);
			
			var warrantyClaimModel = this.getOwnerComponent().getModel();

			warrantyClaimModel.create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), {
					"success": this._onSaveSuccess.bind(this), 
					"error": this._onSaveError.bind(this),
					async: true
				}
			);
		},
		
		_onSaveSuccess: function(result){
			this.getModel("WarrantClaimObjectPageView").setProperty("/busy", false);
		},
		
		_onSaveError: function(error){
			this.getModel("WarrantClaimObjectPageView").setProperty("/busy", false);
			
		},
		
		onCancel: function(){
			this.navigateToLaunchpad();
		},
		
		_onCreateWarrantyMatched: function(oEvent) {
			/* 
			 * Manage the case where routing is not used but Warranty Claim number is passed	
			 * in the Startup Parameters  
			 */
			var claimNumber = "";
			if (this.getOwnerComponent().getComponentData() &&
				this.getOwnerComponent().getComponentData().startupParameters.WarrantyClaim &&
				this.getOwnerComponent().getComponentData().startupParameters.WarrantyClaim[0]) {
				
				//Get the Claim from the backend
				claimNumber = this.getOwnerComponent().getComponentData().startupParameters.WarrantyClaim[0];
			}

			claimNumber = '2016110067';
			
			this.getModel().metadataLoaded().then(function() {
				var entityPath = "";
				if (claimNumber){
					entityPath = "/WarrantyClaimSet('" + claimNumber + "')";
					this._bindView(entityPath);
				}else{
					this.openClaimSelectDialog( );
				}
			}.bind(this));				
			
		},
		
		_bindView: function(entityPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("WarrantClaimObjectPageView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: entityPath,
				parameters: {
					expand: "WarrantyClaimItems"
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		
		_onBindingChange: function(oData) {
			//Check if there is any data first
			WarrantyClaim.updateWarrantyClaimFromOdata(oData);
		},		
		
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var oViewModel = this.getModel("WarrantClaimObjectPageView");
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
		}
	});
});
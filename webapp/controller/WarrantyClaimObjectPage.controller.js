sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		"WarrantyClaim_MockUp/controller/BaseController",
		'sap/ui/model/json/JSONModel',
        "WarrantyClaim_MockUp/model/WarrantyClaim",
        "sap/ui/model/Filter"
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim, Filter) {
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
			//Need to determine the Sales Organisations being used and filter Claim Types
			this.getOwnerComponent().getModel().read(
				"/DealerSalesAreaSet", {
					context: null,
					success: function(oData) {
							//this._busyDialog.close();
							if (!oData.results.length) {
								//this._showNoDealershipDialog();
							} else {
								if (! this._claimTypeSelection) {
									this._claimTypeSelection = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.ClaimTypeSelection", this);
									this.getView().setModel(new JSONModel(this._buildSalesOrgList(oData)),"SalesAreas");
									this.getView().addDependent(this._claimTypeSelection);
								}
								this._claimTypeSelection.open();
								this._filterClaimType(this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation"));
							}
						}.bind(this),
						error: function() {
							//this._busyDialog.close();
							//this._showNoDealershipDialog();
						}.bind(this)
					}
				);
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
			this._claimTypeSelection.close();
		},

		handleClose: function(oEvent){
			
			this.navigateToLaunchpad();
			this._claimTypeSelection.close();
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
		
		viewMyDealerships: function() {
			var crossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			// View the Sales Order Factsheet
			crossAppNavigator.toExternal({
				target: {
					semanticObject: "Dealer",
					action: "setDealership"
				}
			});
		},
		
		companyCodeSelected:function(event){
			this._filterClaimType(event.getParameter("selectedItem").getBindingContext("SalesAreas").getObject().SalesOrg);
		},
		
		_buildSalesOrgList: function(oSalesAreas){
			var distinctCompanyCodes = [];
			var salesOrganisations = [];
			
			for (var i = 0; i < oSalesAreas.results.length; i++) {
				var salesArea = oSalesAreas.results[i];
				if (distinctCompanyCodes.indexOf(salesArea.CompCode) === -1){
					salesOrganisations.push({
						"CompanyCode":salesArea.CompCode,
						"CompanyCodeName": salesArea.CompCodeDescr,
						"SalesOrg":salesArea.SalesOrg
					});
					distinctCompanyCodes.push(salesArea.CompCode);
				}
			}
			//
			this.getView().getModel("WarrantyClaim").setProperty("/CompanyCode",salesOrganisations[0].CompanyCode);
			this.getView().getModel("WarrantyClaim").setProperty("/SalesOrganisation",salesOrganisations[0].SalesOrg);
			return salesOrganisations;
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
			
			this.getModel().metadataLoaded().then(function() {
			
				// check that the user has an active Dealership assigned if not 
				// we don't allow them to continue
				this.getOwnerComponent().getModel().read(
					"/DealershipSet?$filter=active eq true", {
						context: null,
						success: function(oData) {
							//this._busyDialog.close();
							if (!oData.results.length) {
								this._showNoDealershipDialog();
							} else {
								this._openWarrantyMaintenance();
							}
						}.bind(this),
						error: function() {
							//this._busyDialog.close();
							this._showNoDealershipDialog();
						}.bind(this)
					}
				);
			}.bind(this));
		},
		
		_openWarrantyMaintenance: function(){
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
			
			//Testing
			//claimNumber = '2016110067';				
				
			var entityPath = "";
			if (claimNumber){
				entityPath = "/WarrantyClaimSet('" + claimNumber + "')";
				this._bindView(entityPath);
			}else{
				this.openClaimSelectDialog( );
			}
		},
		
		_showNoDealershipDialog: function() {

			// Create the success dialog if it isn't already
			if (!this._noDealershipDialog) {
				this._noDealershipDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.NoDealershipAssignedDialog", this);
				this.getView().addDependent(this._noDealershipDialog);
			}

			// Show the success dialog
			this._noDealershipDialog.open();
		},			
		
		_bindView: function(entityPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("WarrantClaimObjectPageView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			//oViewModel.setProperty("/busy", false);

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
		
		_filterClaimType: function(salesOrganisation){

			var filters = [];

			filters.push(new Filter(
				"SalesOrg",
				sap.ui.model.FilterOperator.EQ, 
				salesOrganisation
			));
			
			sap.ui.getCore().byId("claimTypeList").getBinding("items").filter(filters);	
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
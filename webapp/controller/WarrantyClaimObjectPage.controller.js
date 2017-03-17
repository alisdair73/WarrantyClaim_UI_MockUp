sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		"WarrantyClaim_MockUp/controller/BaseController",
		'sap/ui/model/json/JSONModel',
        "WarrantyClaim_MockUp/model/WarrantyClaim",
        "sap/ui/model/Filter",
        "sap/ui/core/format/NumberFormat"
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim, Filter, NumberFormat) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			var oViewModel = new JSONModel({
				"busy": false,
				"delay": 0,
				"readOnly": false,
				"warrantyUI": {
					"dealerName":"",
					"dealerDescription":""
				}
			});
			this.setModel(oViewModel, "ViewHelper");
			this.getRouter().getRoute("createWarranty").attachPatternMatched(this._onCreateWarrantyMatched, this);
			
			//???
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
		
		handleListSelect: function(oEvent){
			
			var claimType = oEvent.getParameter("listItem").getBindingContext().getObject().Code;
			var claimTypeDescription = oEvent.getParameter("listItem").getBindingContext().getObject().Description;
			
			this.getModel("WarrantyClaim").setProperty("/ClaimType",claimType);
			this.getModel("ViewHelper").setProperty("/claimTypeText", claimTypeDescription);
			
		
//			jQuery.sap.require("sap.ui.core.format.DateFormat");
//			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "dd/MM/yyyy"});
		
/*			var oContext = this.getModel().createEntry("/WarrantyClaimSet",
				{ "properties": 
					{	"ClaimType":claimType,
//						"SubmittedOn": oDateFormat.format(new Date()),
					 	"SubmittedOn": new Date(),
						"TotalCostOfClaim" : "0"
					}
				} 
			);	
			this.getView().setBindingContext(oContext);*/
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			this._claimTypeSelection.close();
		},

		handleClose: function(oEvent){
			
			this.navigateToLaunchpad();
			this._claimTypeSelection.close();
		},
		
		onSave: function(){
			this.getModel("ViewHelper").setProperty("/busy", true);
			
			var warrantyClaimModel = this.getOwnerComponent().getModel();

			warrantyClaimModel.create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), {
					"success": this._onSaveSuccess.bind(this), 
					"error": this._onSaveError.bind(this),
					async: true
				}
			);
		},
		
		onSubmit: function(){
			this._executeAction("Submit");
		},
		
		onValidate: function(){
			this._executeAction("Validate");
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
			// Set the default as the first entry in the list
			this.getView().getModel("WarrantyClaim").setProperty("/CompanyCode",salesOrganisations[0].CompanyCode);
			this.getView().getModel("WarrantyClaim").setProperty("/SalesOrganisation",salesOrganisations[0].SalesOrg);
			return salesOrganisations;
		},
		
		_openClaimTypeSelectDialog: function() {
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
		
		_executeAction: function(actionName){
			
			this.getModel("ViewHelper").setProperty("/busy", true);
			this.getOwnerComponent().getModel().callFunction(
				"/ExecuteAction",
				{ 
					"method": "POST", 
					"urlParameters" :	{	
											"ActionName": actionName, 
											"ClaimNumber": this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber") 
										},
					"success": function(oData, response) { 
									this.getModel("ViewHelper").setProperty("/busy", false);
					},
					"error": function(oError){
									this.getModel("ViewHelper").setProperty("/busy", false); 
					}
				}
			); 
		},
		
		_onSaveSuccess: function(result){
			
			var message = "";
			
			if(this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber")){
			  	message = "Warranty Claim number " + result.ClaimNumber + " was updated.";
			} else {
				message = "Warranty Claim number " + result.ClaimNumber + " was created.";
			}
			
			MessageToast.show(message);
			
			//THIS NEEDS WORK ****
			this.getView().getModel("WarrantyClaim").setProperty("/ClaimNumber",result.ClaimNumber);
			this.getView().getModel("WarrantyClaim").setProperty("/OVTotal",parseFloat(result.OVTotal));
			this.getView().getModel("WarrantyClaim").setProperty("/OCTotal",parseFloat(result.OCTotal));
			this.getView().getModel("WarrantyClaim").setProperty("/ICTotal",parseFloat(result.ICTotal));
			this.getView().getModel("WarrantyClaim").setProperty("/IVTotal",parseFloat(result.IVTotal));
			this.getView().getModel("WarrantyClaim").setProperty("/TotalCostOfClaim",result.TotalCostOfClaim);
			this.getView().getModel("WarrantyClaim").setProperty("/StatusDescription",result.StatusDescription);
			this.getView().getModel("WarrantyClaim").setProperty("/StatusIcon",result.StatusIcon);
			this.getView().getModel("WarrantyClaim").setProperty("/CanEdit",result.CanEdit);
			this.getView().getModel("WarrantyClaim").setProperty("/VersionIdentifier",result.VersionIdentifier);
			
			var parts = [];
			var labour = [];
			var sublet = [];
			
			for (var i = 0; i < result.WarrantyClaimItems.results.length; i++) {
				var warrantyClaimItem = result.WarrantyClaimItems.results[i];
				switch(warrantyClaimItem.ItemType) {
    				case "MAT":
    					parts.push(warrantyClaimItem);
				        break;
				    case "FR":
				   		labour.push(warrantyClaimItem);
				   	  break;
				   	case "SUBL":
				   		sublet.push(warrantyClaimItem);
			    	 break;
				}
			} 			
			
			this.getView().getModel("WarrantyClaim").setProperty("/Parts",parts);
			this.getView().getModel("WarrantyClaim").setProperty("/Labour",labour);
			this.getView().getModel("WarrantyClaim").setProperty("/Sublet",sublet);
			//  ******
			
			this.getModel("ViewHelper").setProperty("/busy", false);
		},
		
		_onSaveError: function(error){
			this.getModel("ViewHelper").setProperty("/busy", false);
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
							if (!oData.results.length) {
								this._showNoDealershipDialog();
							} else {
								var dealerDescription = oData.results[0].dealerName + ", " + oData.results[0].description;
								this.getModel("ViewHelper").setProperty("/warrantyUI/dealerDescription", dealerDescription);
								this._openWarrantyMaintenance();
							}
						}.bind(this),
						error: function() {
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
			claimNumber = '100000000621';
				
			var entityPath = "";
			if (claimNumber){
				entityPath = "/WarrantyClaimSet('" + claimNumber + "')";
				this._bindView(entityPath);
			}else{
				this._openClaimTypeSelectDialog( );
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
			var oViewModel = this.getModel("ViewHelper");

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
			var oViewModel = this.getModel("ViewHelper");
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
		}
	});
});
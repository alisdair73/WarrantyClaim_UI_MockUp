sap.ui.define([
		"jquery.sap.global",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"WarrantyClaim_MockUp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
        "WarrantyClaim_MockUp/model/WarrantyClaim",
        "sap/ui/model/Filter",
        "sap/ui/core/format/NumberFormat",
        "sap/m/MessageStrip",
        "sap/m/MessageBox"
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim, Filter, 
					NumberFormat, MessageStrip, MessageBox) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			var oViewModel = new JSONModel({
				"busy": false,
				"delay": 0,
				"readOnly": false,
				"warrantyUI": {
					"dealerNumber":"",
					"dealerName":"",
					"dealerDescription":"",
					"symptomCodeDescription":"",
					"defectCodeDescription":"",
					"subletCodeDescription":""
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
		
		handleClaimTypeListSelect: function(oEvent){
			
			var claimType = oEvent.getParameter("listItem").getBindingContext().getObject().Code;
			var claimTypeDescription = oEvent.getParameter("listItem").getBindingContext().getObject().Description;
			var claimTypeGroup = oEvent.getParameter("listItem").getBindingContext().getObject().Group;
			
			this.getModel("WarrantyClaim").setProperty("/ClaimType",claimType);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeDescription", claimTypeDescription);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeGroup", claimTypeGroup);
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			this._claimTypeSelection.close();
		},

		handleClose: function(oEvent){
			
			this.navigateToLaunchpad();
			this._claimTypeSelection.close();
		},
		
		onDraft: function(){
			this._doWarrantyAction("SaveWarranty");
		},
		
		onSubmit: function(){
			this._doWarrantyAction("SubmitWarranty");
		},
		
		onValidate: function(){
			this._doWarrantyAction("ValidateWarranty");
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
		
		_doWarrantyAction: function(actionName){
			this.getModel("ViewHelper").setProperty("/busy", true);
			this._clearHeaderMessages();
			
			var warrantyClaimModel = this.getOwnerComponent().getModel();

			warrantyClaimModel.create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), 
				{
					"success": function(result) {
						
						var successMessage = "";
						
						switch(actionName){
							case "SaveWarranty":
								if(this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber")){
			  						successMessage = "Warranty Claim number " + result.ClaimNumber + " was updated.";
								} else {
									successMessage = "Warranty Claim number " + result.ClaimNumber + " was created.";
								}
								break;
								
							case "ValidateWarranty":
								successMessage = "Warranty Claim was successfully validated.";
								break;
								
							case "SubmitWarranty":
								successMessage = "Warranty Claim number " + result.ClaimNumber + " was submitted.";
								break;
						}
						
						this.getModel("ViewHelper").setProperty("/busy", false);
						MessageToast.show(successMessage);
						WarrantyClaim.updateWarrantyClaimFromJSONModel(result);
					}.bind(this), 
					
					"error": this._onActionError.bind(this),
					"headers" : { "warrantyaction": actionName },
					async: true
				}
			);
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
		
/*		_executeAction: function(actionName){
			
			this.getModel("ViewHelper").setProperty("/busy", true);
			
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			
			
			//Batch up "Create" and Function Call so function can be applied to current data
			//In case of Validate, data is not saved. For Submit, if data is valid then
			//the claim is saved...
			
			var warrantyClaimModel = this.getOwnerComponent().getModel();
			
			
			warrantyClaimModel.create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), {
					"success": this._onSaveSuccess.bind(this), 
					"error": this._onSaveError.bind(this),
					"groupId":"Action",
					"changeSetId":"Change1",
					async: true
					
				}
			);
			
			warrantyClaimModel.callFunction(
				"/ExecuteAction",
				{ 
					"method": "POST", 
					"groupId":"Action",
					"changeSetId":"Change1",
					"urlParameters" :	
						{	
							"ActionName": actionName, 
							"ClaimNumber": this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber") 
						},
					"success": function(oData, response) { 
									this.getModel("ViewHelper").setProperty("/busy", false);
									
									
									
					}.bind(this),
					"error": function(oError){
						
						switch (oError.statusCode){
							case '500':
								MessageBox.error("An Error has occurred while processing this claim.\n" +
										"Please contact the Honda Help Desk on <###>."
								);
								break;
							case '400':
								break;
						}

						this.getModel("ViewHelper").setProperty("/busy", false); 
					}.bind(this)
					
				}
			); 
			
			warrantyClaimModel.submitChanges({"groupID": "Action"});
			
		}, */
		
		_onActionSuccess: function(result){
			
			var message = "";
			
			if(this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber")){
			  	message = "Warranty Claim number " + result.ClaimNumber + " was updated.";
			} else {
				message = "Warranty Claim number " + result.ClaimNumber + " was created.";
			}
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			MessageToast.show(message);
			WarrantyClaim.updateWarrantyClaimFromJSONModel(result);
		},
		
		_onActionError: function(error){
			
			switch(error.statusCode){
				case "400":
					var errorDetail = JSON.parse(error.responseText);
					this._addMessagesToHeader(errorDetail.error.innererror.errordetails);
					break;
			}
			
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
								this.getModel("ViewHelper").setProperty("/warrantyUI/dealerNumber", oData.results[0].dealer);
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
			//claimNumber = '2016110370';
				
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
		},
		
		_clearHeaderMessages: function(){
			this.getView().byId("messageArea").destroyContent();
		},
		
		_addMessagesToHeader: function(messages){
		
			var messageArea = this.getView().byId("messageArea");
			messageArea.destroyContent();
			
			for (var i = 0; i < messages.length; i++) {
				var messageStrip = new MessageStrip("msgStrip" + i, {
					text: messages[i].message,
					showCloseButton: false,
					showIcon: true,
					type: "Error"
				});
				messageArea.addContent(messageStrip);
			}
			var objectLayout = this.getView().byId("WarrantyClaimLayout");
			objectLayout.scrollToSection(this.getView().byId("vehicleDetails_sub1").getId(), 0, -200);
		}
	});
});
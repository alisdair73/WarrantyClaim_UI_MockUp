sap.ui.define([
		"jquery.sap.global",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"WarrantyClaim_MockUp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
        "WarrantyClaim_MockUp/model/WarrantyClaim",
        "sap/ui/model/Filter",
        "sap/ui/core/format/NumberFormat",
        "sap/m/MessageStrip"
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim, Filter, 
					NumberFormat, MessageStrip) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			this.getView().setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			var oViewModel = new JSONModel({
				"busy": false,
				"delay": 0,
				"readOnly": false,
				"Validate":"yes",
				"warrantyUI": {
					"dealerNumber":"",
					"dealerName":"",
					"dealerDescription":"",
					"subletCodeDescription":"",
					"symptomCodeL1": "",
					"symptomCodeL2": "",
					"defectCodeL1": "",
					"internalRecallNumber":"",
					"serialNumberIsMandatory": false
				}
			});
			this.setModel(oViewModel, "ViewHelper");
			
/*			sap.ui.getCore().setModel(new JSONModel({"hasUIValidationError": false}),"UIValidation");
			this.getView().setModel(sap.ui.getCore().getModel("UIValidation"),"UIValidation");*/
			
			this.getRouter().getRoute("createWarranty").attachPatternMatched(this._onCreateWarrantyMatched, this);

			//Is this needed???
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
			var objectType = oEvent.getParameter("listItem").getBindingContext().getObject().ObjectType;
			
			var statusDescription = oEvent.getParameter("listItem").getBindingContext().getObject().InitialStatusDescription;
			var statusIcon = oEvent.getParameter("listItem").getBindingContext().getObject().InitialStatusIcon;
			
			this.getModel("WarrantyClaim").setProperty("/ClaimType",claimType);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeDescription", claimTypeDescription);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeGroup", claimTypeGroup);
			this.getModel("WarrantyClaim").setProperty("/ObjectType", objectType);
			
			this.getModel("WarrantyClaim").setProperty("/StatusDescription",statusDescription);
			this.getModel("WarrantyClaim").setProperty("/StatusIcon",statusIcon);
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			this._claimTypeSelection.close();
		},

		handleClose: function(){
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
		
		onCancel: function(){
			this.navigateToLaunchpad();
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
		
		openMessages: function(event){
			
			if (!this._messagePopover)  {
				this._messagePopover = sap.ui.xmlfragment( "WarrantyClaim_MockUp.view.Messages" );
				this.getView().addDependent(this._messagePopover );
			}
			this._messagePopover.openBy(event.getSource());
		},
		
		companyCodeSelected:function(event){
			var salesOrganisation = event.getParameter("selectedItem").getBindingContext("SalesAreas").getObject().SalesOrg;
			this.getView().getModel("WarrantyClaim").setProperty("/SalesOrganisation",salesOrganisation);
			this._filterClaimType(salesOrganisation);
		},
		
		_doWarrantyAction: function(actionName){
			this.getModel("ViewHelper").setProperty("/busy", true);
			this._clearHeaderMessages();
			
			this.getOwnerComponent().getModel().create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), 
				{
					context: null,
					"success": this._onActionSuccess.bind(this),
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
				if (distinctCompanyCodes.indexOf(salesArea.CompanyCode) === -1){
					salesOrganisations.push({
						"CompanyCode":salesArea.CompanyCode,
						"CompanyCodeName": salesArea.CompanyCodeName,
						"SalesOrg":salesArea.SalesOrg
					});
					distinctCompanyCodes.push(salesArea.CompanyCode);
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
				"/ClaimTypeSet", {
					context: null,
					filters: [new Filter("IsAuthorisationType",sap.ui.model.FilterOperator.EQ, false)],
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
						}.bind(this)
					}
				);
		},
		
		_onActionSuccess: function(responseData,response){
			
			var leadingMessage = JSON.parse(response.headers['sap-message']);
			MessageToast.show(leadingMessage.message);
			
			this._addMessagesToHeader(leadingMessage.details);
			WarrantyClaim.updateWarrantyClaimFromJSONModel(responseData);
			
			this.getModel("ViewHelper").setProperty("/busy", false);
		},
		
		_onActionError: function(error){
			
			switch(error.statusCode){
				case "400":
					var errorDetail = JSON.parse(error.responseText);
					this._addMessagesToHeader(errorDetail.error.innererror.errordetails);
					
					//REMOVE THE DUPLICATED LEAD MESSAGE - "SY/530"
					var registeredMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(
		  				function(registeredMessage){
							return registeredMessage.code === 'SY/530';
						}
					);
		    		
		    		if(registeredMessages.length > 0){
		    			sap.ui.getCore().getMessageManager().removeMessages(registeredMessages[0]);
		    		}  
					//////////////
					break;
			}
			
			this.getModel("ViewHelper").setProperty("/busy", false);
		},
		
		_onCreateWarrantyMatched: function() {
			
			this.getModel().metadataLoaded().then(function() {
			
				// check that the user has an active Dealership assigned if not 
				// we don't allow them to continue
				this.getOwnerComponent().getModel().read(
					"/DealershipSet", {
						context: null,
						filters: [new Filter("active",sap.ui.model.FilterOperator.EQ, true)],
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
				this.getOwnerComponent().getComponentData().startupParameters.DealerWarrantyClaim &&
				this.getOwnerComponent().getComponentData().startupParameters.DealerWarrantyClaim[0]) {
				
				//Get the Claim from the backend
				claimNumber = this.getOwnerComponent().getComponentData().startupParameters.DealerWarrantyClaim[0];
			}
			
			//Testing
			//claimNumber = "1100000066";
			//claimNumber = "100000000567"; //MOCK Record
			
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
					expand: "WarrantyClaimItems,Attachments"
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
			
			//Notify any subscribers to Sales Organisation Changes
			sap.ui.getCore().getEventBus().publish("SalesOrg","Changed",{"SalesOrg":salesOrganisation});
		},
		
		_onBindingChange: function(oData) {
			//Check if there is any data first
			WarrantyClaim.updateWarrantyClaimFromOdata(oData);
			
			var claimTypeGroup = this.getModel("WarrantyClaim").getProperty("/ClaimTypeGroup");
			var customerConcernSection = this.getView().byId("customerConcern");
			if(claimTypeGroup === 'RECALL'){
				customerConcernSection.setVisible(false);
			}
			
			this.readCatalog("ZSYM1","SymptomCodes");
			this.readCatalog("ZDEF1","DefectCodes");
			
			//Alert Subscribers that a Warranty has been loaded
			sap.ui.getCore().getEventBus().publish("WarrantyClaim","Loaded");
			
			//Notify any subscribers to Sales Organisation Changes
			sap.ui.getCore().getEventBus().publish("SalesOrg","Changed",
				{"SalesOrg":this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")}
			);
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
		
		_translateMessageTypes: function(messageType){
			
			switch(messageType){
				case "error":
					return sap.ui.core.MessageType.Error;
				case "info":
					return sap.ui.core.MessageType.Information;
				case "warning":
					return sap.ui.core.MessageType.Warning;
				default:
					return sap.ui.core.MessageType.Success;
			}
		},
		
		_addMessagesToHeader: function(messages){
		
			var messageArea = this.getView().byId("messageArea");
			messageArea.destroyContent();
			
			for (var i = 0; i < messages.length; i++) {
				var messageStrip = new MessageStrip("msgStrip" + i, {
					text: messages[i].message,
					showCloseButton: false,
					showIcon: true,
					type: this._translateMessageTypes(messages[i].severity)
				});
				messageArea.addContent(messageStrip);
			}
			var objectLayout = this.getView().byId("WarrantyClaimLayout");
			objectLayout.scrollToSection(this.getView().byId("vehicleDetails_sub1").getId(), 0, -200);
		}
	});
});
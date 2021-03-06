sap.ui.define([
		"jquery.sap.global",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment",
		"WarrantyClaim_MockUp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
        "WarrantyClaim_MockUp/model/WarrantyClaim",
        "sap/ui/model/Filter",
        "sap/ui/core/format/NumberFormat",
        "sap/m/MessageBox",
        "WarrantyClaim_MockUp/model/models"
	], function( jQuery, MessageToast, Fragment, BaseController, JSONModel, WarrantyClaim, Filter, 
					NumberFormat, MessageBox, Models) {
	"use strict";
 
 	return BaseController.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {

			sap.ui.getCore().getMessageManager().removeAllMessages();
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
					"symptomCodeL1": { "value":"", "ruleResult":{"valid": true, "errorTextID":"mandatoryField"}},
					"symptomCodeL2": { "value":"", "ruleResult":{"valid": true, "errorTextID":"mandatoryField"}},
					"defectCodeL1":  { "value":"", "ruleResult":{"valid": true, "errorTextID":"mandatoryField"}},
					"internalRecallNumber":"",
					"hasBeenValidated": false,
					//"attachmentMode":"maintain", //NEW APPROACH
					"docTypes":["AVI","DAT","DOC","DOCX","DPF","DTC","GIF","JPEG","JPG","M4V","MOV","MP4","PDF","PNG","PPT","PPTX","XLS","XLSX"]
				}
			});
			this.setModel(oViewModel, "ViewHelper");
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
			var objectType = oEvent.getParameter("listItem").getBindingContext().getObject().ClaimObjectType;
			
			var status = oEvent.getParameter("listItem").getBindingContext().getObject().InitialStatus;
			var statusDescription = oEvent.getParameter("listItem").getBindingContext().getObject().InitialStatusDescription;
			var statusIcon = oEvent.getParameter("listItem").getBindingContext().getObject().InitialStatusIcon;
			
			this.getModel("WarrantyClaim").setProperty("/ClaimType",claimType);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeDescription", claimTypeDescription);
			this.getModel("WarrantyClaim").setProperty("/ClaimTypeGroup", claimTypeGroup);
			this.getModel("WarrantyClaim").setProperty("/ObjectType", objectType);
			
			this.getModel("WarrantyClaim").setProperty("/ProcessingStatus",status);
			this.getModel("WarrantyClaim").setProperty("/StatusDescription",statusDescription);
			this.getModel("WarrantyClaim").setProperty("/StatusIcon",statusIcon);
			
			this.getModel("ViewHelper").setProperty("/busy", false);
			
			//Provide a Default LON for SERN (not in Parts case)
			if(objectType === "SERN" && claimTypeGroup !== "PARTS"){
				var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
				var newLONItem = Models.defaultMPELabourItem();   
				labourItems.push(newLONItem.getProperty("/"));
				this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
			}
			
			//Let the App Know that a Sales Org was selected
			sap.ui.getCore().getEventBus().publish("SalesOrg","Changed",
				{"SalesOrg":this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")}
			);
			
			this._claimTypeSelection.close();
		},

		handleClose: function(){
			this.navigateToLaunchpad();
			this._claimTypeSelection.close();
		},
		
		onNewClaim: function(){
			
			this.navigateToApp("#DealerWarrantyClaim-create");
			
/*			if (this.getOwnerComponent().getComponentData() &&
				this.getOwnerComponent().getComponentData().startupParameters.DealerWarrantyClaim){
				
				this.navigateToApp("#DealerWarrantyClaim-create");
			} else {
				
				this.setModel(WarrantyClaim.createWarrantyClaimModel(),"WarrantyClaim");
				
				this.getModel("ViewHelper").setProperty("/readOnly", false);
				sap.ui.getCore().getMessageManager().removeAllMessages();
				this._claimTypeSelection.destroy(true);
				this._claimTypeSelection = null;
				this._onCreateWarrantyMatched();
			}*/
		},
		
		onPrintTag: function(){
			var claimNumber = this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber");
			sap.m.URLHelper.redirect("/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/DocumentSet(DocumentNumber='" +
            	+ claimNumber + "',DocumentType='ZPTA',LogResult=false)/$value", true);
		},
		
		onDuplicateClaim: function(){
			//Reset the Status based on the Claim Type
			var claimType = this.getView().getModel("WarrantyClaim").getProperty("/ClaimType");
			
			this.getOwnerComponent().getModel().read(
				"/ClaimTypeSet", {
					context: null,
					filters: [new Filter("Code",sap.ui.model.FilterOperator.EQ, claimType)],
					success: function(oData) {
						if (oData.results.length && oData.results.length > 0) {

							this.getModel("ViewHelper").setProperty("/readOnly", false);
							
							this.getView().getModel("WarrantyClaim").setProperty("/ClaimNumber","");
							this.getView().getModel("WarrantyClaim").setProperty("/SubmittedOn",null);
							this.getView().getModel("WarrantyClaim").setProperty("/CurrentVersionNumber","0001");
							this.getView().getModel("WarrantyClaim").setProperty("/CurrentVersionCategory","IC");
							this.getView().getModel("WarrantyClaim").setProperty("/CanEdit",true);
							this.getView().getModel("WarrantyClaim").setProperty("/VersionIdentifier",null);
							
							this.getModel("WarrantyClaim").setProperty("/ProcessingStatus",oData.results[0].InitialStatus);
							this.getModel("WarrantyClaim").setProperty("/StatusDescription",oData.results[0].InitialStatusDescription);

							sap.ui.getCore().getMessageManager().removeAllMessages();
							
							MessageBox.success("Claim Duplicated.");
							
						} else {
							this._showWarrantyClaimErrorMessage();
						}
					}.bind(this),
					error: this._showWarrantyClaimErrorMessage
				}
			);
			
		},
		
		onDraft: function(){
			this._doWarrantyAction("SaveWarranty");
		},
		
		onSubmit: function(){
			if(this._canExecuteAction()){
				this._doWarrantyAction("SubmitWarranty");
			}
		},
		
		onValidate: function(){
			
			if(this._canExecuteAction()){
				this._doWarrantyAction("ValidateWarranty");
			}
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
			
			if(event){
				this._messagePopover.openBy(event.getSource());
			} else {
				this._messagePopover.openBy(this.getView().byId("messagePopup"));
			}
		},
		
		openMessagesDialog: function(){
			
			if (!this._messagePopoverDialog)  {
				this._messagePopoverDialog = sap.ui.xmlfragment( "WarrantyClaim_MockUp.view.MessagesDialog" );
				this.getView().addDependent(this._messagePopoverDialog );
			}
			this._messagePopoverDialog.open();
		},
		
		companyCodeSelected:function(event){
			var salesOrganisation = event.getParameter("selectedItem").getBindingContext("SalesAreas").getObject().SalesOrg;
			this.getView().getModel("WarrantyClaim").setProperty("/SalesOrganisation",salesOrganisation);
			this._filterClaimType(salesOrganisation);
		},
		
		_doWarrantyAction: function(actionName){
			
			this.getModel("ViewHelper").setProperty("/busy", true);
			
			this.getOwnerComponent().getModel().create("/WarrantyClaimSet",
				WarrantyClaim.convertToODataForUpdate(), 
				{
					context: null,
					"success": function(responseData,response){
						this._onActionSuccess(actionName, responseData, response);
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
							if (oData.results.length && oData.results.length > 0) {
								if (! this._claimTypeSelection) {
									this._claimTypeSelection = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.ClaimTypeSelection", this);
									this.getView().setModel(new JSONModel(this._buildSalesOrgList(oData)),"SalesAreas");
									this.getView().addDependent(this._claimTypeSelection);
								}
								this._claimTypeSelection.open();
								this._filterClaimType(this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation"));
							} else {
								this._showWarrantyClaimErrorMessage();
							}
						}.bind(this),
						
					error: this._showWarrantyClaimErrorMessage
				}
			);
		},
		
		_showWarrantyClaimErrorMessage: function(){
			MessageBox.error(
				"An error occurred while loading Warranty Claim Types for your Dealership.\nPlease try again later.",
				{
					id : "errorMessageBox",
					actions : [MessageBox.Action.CLOSE],
					onClose : function () {
						this.navigateToLaunchpad();
					}.bind(this)
				}	
			);
		},
		
		_onActionSuccess: function(actionName, responseData, response){
			
			var leadingMessage = JSON.parse(response.headers['sap-message']);
			var isValid = false;
			
			var errorMessages = leadingMessage.details.filter(function(message){
				return message.severity === "error";
			});
			
			if(errorMessages.length > 0){
				
				MessageBox.error(
					leadingMessage.message,
					{
						actions : [MessageBox.Action.CLOSE],
						onClose: function(){ this.openMessages(); }.bind(this)
					}	
				);
				
			} else {
			
				isValid = true;

				var warningMessages = leadingMessage.details.filter(function(message){
					return message.severity === "warning";
				});
				
				if(warningMessages.length > 0 && actionName !== "SubmitWarranty"){
					
					MessageBox.warning(
						leadingMessage.message + "\n" + "Please review the Warning messages before submitting claim.",
						{
							actions : [MessageBox.Action.CLOSE],
							onClose: function(){ this.openMessages(); }.bind(this)
						}	
					);
					
				} else {
					MessageBox.success(
						leadingMessage.message 
							+ ( actionName === "SubmitWarranty" ? "" : "\nPlease observe any additional notes provided." ),
						{
							actions : [MessageBox.Action.CLOSE],
							onClose: function(){
								if(actionName === "SubmitWarranty"){
									this.navigateToApp("#DealerWarrantyClaim-create?DealerWarrantyClaim=" + 
										this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber","")
									);
								}
							}.bind(this)
						}	
					);
				}
			}
			
			WarrantyClaim.updateWarrantyClaimFromJSONModel(responseData, actionName === "ValidateWarranty");
			this.getModel("ViewHelper").setProperty("/busy", false);
			
			if(actionName === "ValidateWarranty"){
				this.getModel("ViewHelper").setProperty("/warrantyUI/hasBeenValidated", isValid);
			} 
			//else {
			//	sap.ui.getCore().getEventBus().publish("WarrantyClaim","Saved");		
			//}
		},
		
		_onActionError: function(error){
			
			switch(error.statusCode){
				case "400":

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

			MessageBox.error(
				"An error occurred while processing the Warranty Claim.",
				{
					id : "errorMessageBox",
					actions : [MessageBox.Action.CLOSE]
				}	
			);
			
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
			//claimNumber = "1110000384"; //BATTERY CLAIM TEST
			//claimNumber = "1110000978";
			
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
			//sap.ui.getCore().getEventBus().publish("SalesOrg","Changed",{"SalesOrg":salesOrganisation});
		},
		
		_onBindingChange: function(oData) {
			
			//Check if there is any data first
			var model = oData.getSource().getModel();
			var path = oData.getSource().getPath() + "/";
            var messages = model.getMessagesByPath(path);
		
			if(messages && messages.length > 0){
				//There was an Error with the oData response
				if(messages[0]){
					MessageBox.error(
						messages[0].message,
					{
						id : "errorMessageBox",
						
						actions : [MessageBox.Action.CLOSE],
						onClose : function () {
							this.navigateToLaunchpad();
						}.bind(this)
					}
				);
				}
				return;
			}
			
			//Process the retrieved Warranty
			WarrantyClaim.updateWarrantyClaimFromOdata(oData);
			
			//mMessages...
			var claimTypeGroup = this.getModel("WarrantyClaim").getProperty("/ClaimTypeGroup");
			var customerConcernSection = this.getView().byId("customerConcern");
			
			if(claimTypeGroup === 'RECALL'){
				customerConcernSection.setVisible(false);
			}
			
			this.readDefectCatalog();
			this.readSymptomCatalog();
			
			//Set the Attachment Control Mode
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/attachmentMode","maintain");
			
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
		
		_canExecuteAction: function(){
			
			//Run all UI Validation Rules
			sap.ui.getCore().getMessageManager().removeAllMessages();
			WarrantyClaim.validateAll();
			sap.ui.getCore().getEventBus().publish("WarrantyClaim","Validate");
			
			//If there are any Frontend Issues - then don't call Action...
			if(WarrantyClaim.hasFrontendValidationError()){
				MessageBox.error(
					"Please correct the data validation errors.",
					{
						id : "errorMessageBox",
						actions : [MessageBox.Action.CLOSE]
					}
				);
				return false;
			} else {
				return true;
			}	

		}
	});
});
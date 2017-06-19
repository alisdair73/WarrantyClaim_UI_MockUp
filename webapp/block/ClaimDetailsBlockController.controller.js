sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController,Filter, Models, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
//		valueStateFormatter: valueStateFormatter,
		
		addMCPN: function(){
			
			// Create the dialog if it isn't already
			if (!this._partsDialog) {
				this._partsDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partsDialog);
			}

			// Display the popup dialog for adding parts
			this._partsDialog.open();
		},
		
		onValueHelpSearch: function(event) {
			
			var searchValue = event.getParameter("value");
			var filters = [];
			filters.push(new Filter([
				new Filter("materialNo", sap.ui.model.FilterOperator.Contains, searchValue),
				new Filter("description", sap.ui.model.FilterOperator.Contains, searchValue)
			], false));
			
			event.getSource().getBinding("items").filter(filters);
		},
		
		onPartSuggest: function(event){
			
			var partSearch = event.getParameter("suggestValue");
			var filters = [];
			if (partSearch) {
				filters.push(
					new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, partSearch));
			}
			event.getSource().getBinding("suggestionRows").filter(filters);
		},
		
		onPartSelected: function(event){

			var dataObject = null;
			if (event.getId() === "suggestionItemSelected"){
				dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			} else {
				dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			}

			var warrantyItem = null;
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// add the new part - If the MCPN is already defined, overwrite this
			warrantyItem = Models.createNewWarrantyItem("MAT");
			warrantyItem.setProperty("/PartNumber", dataObject.materialNo);
			warrantyItem.setProperty("/Description", dataObject.description);
			warrantyItem.setProperty("/IsMCPN",true);
			
			if (warrantyItems[0]){
				warrantyItem.setProperty("/Quantity", warrantyItems[0].Quantity);
				warrantyItems[0] = warrantyItem.getProperty("/");
			} else {
				warrantyItems.push(warrantyItem.getProperty("/"));
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
		},
		
		onFailureMeasureChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateFailureMeasure(), "FailureMeasure");
		},
		
		onRepairOrderNumberChanged: function(){
		this.logValidationMessage( WarrantyClaim.validateRepairOrderNumber(), "RepairOrderNumber");
		},

		onDateOfRepairChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateDateOfRepair(), "DateOfRepair");
		},	

		onTechnicianChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateTechnician(), "Technician");
		},

		onServiceAdvisorChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateServiceAdvisor(), "ServiceAdvisor");	
		},

		onOldSerialNumberChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateOldSerialNumber(), "OldSerialNumber");	
		},

		onNewSerialNumberChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateNewSerialNumber(), "NewSerialNumber");
		},

		onPartsInstallDateChanged: function(){
			this.logValidationMessage( WarrantyClaim.validatePartsInstallDate(), "PartsInstallDate");	
		},  

		onPartsInstallKmChanged: function(){
			this.logValidationMessage( WarrantyClaim.validatePartsInstallKm(), "PartsInstallKm");	
		},
		
		onOriginalInvoiceNumberChanged: function(){
			this.logValidationMessage( WarrantyClaim.validateOriginalInvoiceNumber(), "OriginalInvoiceNumber");
		}
	});
});
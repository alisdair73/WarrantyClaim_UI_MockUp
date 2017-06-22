sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController,Filter, Models, JSONModel, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("MCPN","Changed",this._updateMCPN.bind(this),this);
			this.getView().setModel(new JSONModel({"MCPN":"","Description":"","Quantity": "0", "QuantityEnabled":false}) , "MCPNHelper");
		},
		
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
			
			this.getModel("MCPNHelper").setProperty("/MCPN",dataObject.materialNo);
			this.getModel("MCPNHelper").setProperty("/Description",dataObject.description);
			
			this.onMCPNChanged(); //Update the Parts Table
		},
		
		onMCPNChanged: function(){
			
			var warrantyItem = Models.createNewWarrantyItem("MAT");
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// Update/Add the MCPN
			if(this.getModel("MCPNHelper").getProperty("/MCPN") !== ""){
				
				warrantyItem.setProperty("/PartNumber", this.getModel("MCPNHelper").getProperty("/MCPN"));
				warrantyItem.setProperty("/Description", this.getModel("MCPNHelper").getProperty("/Description"));
				warrantyItem.setProperty("/PartRequested", "S");
				warrantyItem.setProperty("/Quantity", this.getModel("MCPNHelper").getProperty("/Quantity"));
				warrantyItem.setProperty("/IsMCPN",true);
				
				if (warrantyItems[0]){
					if(warrantyItems[0].IsMCPN){
						warrantyItems[0] = warrantyItem.getProperty("/");
					} else {
						warrantyItems.splice(0,0,warrantyItem.getProperty("/"));
					}
				} else {
					warrantyItems.push(warrantyItem.getProperty("/"));
				}
			
				this.getModel("MCPNHelper").setProperty("/QuantityEnabled", true); //Can only enter a Qty once an MCPN is entered
				
			} else {
				
				if (warrantyItems[0]){
					if(warrantyItems[0].IsMCPN){
						//Delete this from the List
						warrantyItems.splice(0,1);
					}
				}
		
				this.getModel("MCPNHelper").setProperty("/QuantityEnabled", false); //Can only enter a Qty once an MCPN is entered
				
				this.getModel("MCPNHelper").setProperty("/Description","");
				this.getModel("MCPNHelper").setProperty("/Quantity","0");				
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
		},
		
		onFailureMeasureChanged: function(){
			WarrantyClaim.validateFailureMeasure();
			this.logValidationMessage("FailureMeasure");
		},
		
		onRepairOrderNumberChanged: function(){
			WarrantyClaim.validateRepairOrderNumber();
			this.logValidationMessage("RepairOrderNumber");
		},

		onDateOfRepairChanged: function(){
			WarrantyClaim.validateDateOfRepair();
			this.logValidationMessage("DateOfRepair");
		},	

		onTechnicianChanged: function(){
			WarrantyClaim.validateTechnician();
			this.logValidationMessage("Technician");
		},

		onServiceAdvisorChanged: function(){
			WarrantyClaim.validateServiceAdvisor();
			this.logValidationMessage("ServiceAdvisor");	
		},

		onOldSerialNumberChanged: function(){
			WarrantyClaim.validateOldSerialNumber();
			this.logValidationMessage("OldSerialNumber");	
		},

		onNewSerialNumberChanged: function(){
			WarrantyClaim.validateNewSerialNumber();
			this.logValidationMessage("NewSerialNumber");
		},

		onPartsInstallDateChanged: function(){
			WarrantyClaim.validatePartsInstallDate();
			this.logValidationMessage("PartsInstallDate");	
		},  

		onPartsInstallKmChanged: function(){
			WarrantyClaim.validatePartsInstallKm();
			this.logValidationMessage("PartsInstallKm");	
		},
		
		onOriginalInvoiceNumberChanged: function(){
			WarrantyClaim.validateOriginalInvoiceNumber();
			this.logValidationMessage("OriginalInvoiceNumber");
		},
		
		_updateMCPN: function(channel, event, message){
			this.getView().getModel("MCPNHelper").setProperty("/MCPN",message.MCPN);
			this.getView().getModel("MCPNHelper").setProperty("/Description",message.Description);
			this.getView().getModel("MCPNHelper").setProperty("/Quantity",message.Quantity);
			this.getModel("MCPNHelper").setProperty("/QuantityEnabled", true);
		}
	});
});
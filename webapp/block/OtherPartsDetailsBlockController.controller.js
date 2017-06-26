sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(Controller, Filter, Models, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		onInit: function(){
			
			this.getView().setModel(
				new JSONModel({"MCPN":"","Description":"","Quantity": "0"}),
				"MCPNHelper"
			);
			
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._applyPartTableFilter.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Loaded",this._updateMCPN.bind(this),this);
		},
				
		addMCPN: function(){
			this._MCPNRequest = true;
			this._openPartSelectionDialog();
		},
				
		addPart: function(event){
			this._MCPNRequest = false;
			this._openPartSelectionDialog();
		},
			
		onMCPNChanged: function(){
			
			this._MCPNRequest = true;
			
			var warrantyItem = Models.createNewWarrantyItem("MAT");
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// Update/Add the MCPN
			if(this.getView().getModel("MCPNHelper").getProperty("/MCPN") !== ""){
				
				warrantyItem.setProperty("/PartNumber", this.getView().getModel("MCPNHelper").getProperty("/MCPN"));
				warrantyItem.setProperty("/Description", this.getView().getModel("MCPNHelper").getProperty("/Description"));
				warrantyItem.setProperty("/PartRequested", "S");
				warrantyItem.setProperty("/Quantity", this.getView().getModel("MCPNHelper").getProperty("/Quantity"));
				warrantyItem.setProperty("/IsMCPN",true);
				
				//Are we adding or Modifying the MCP?
				warrantyItems.forEach(function(candidateMCP){
					if(candidateMCP.IsMCPN){
						candidateMCP = warrantyItem.getProperty("/");
					}
				});
				
				//Need to add if not found...
				
				if (warrantyItems[0]){
					if(warrantyItems[0].IsMCPN){
						warrantyItems[0] = warrantyItem.getProperty("/");
					} else {
						warrantyItems.splice(0,0,warrantyItem.getProperty("/"));
					}
				} else {
					warrantyItems.push(warrantyItem.getProperty("/"));
				}
				
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
			
			//Make sure the MCPN is hidden in the List
			this._applyMCPNFilter();			
			
		},
			
		deletePart: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);

			this._applyPartTableFilter();
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
				this._MCPNRequest = true;
				dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			} else {
				dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			}
			
			if(this._MCPNRequest){
				this.getView().getModel("MCPNHelper").setProperty("/MCPN",dataObject.materialNo);
				this.getView().getModel("MCPNHelper").setProperty("/Description",dataObject.description);
				this.onMCPNChanged(); //Update the Parts Table
			} else {
				
				var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

				// add the new part
				var warrantyItem = Models.createNewWarrantyItem("MAT");
				warrantyItem.setProperty("/PartNumber", dataObject.materialNo);
				warrantyItem.setProperty("/Description", dataObject.description);
				warrantyItem.setProperty("/PartRequested", "S");
				warrantyItems.push(warrantyItem.getProperty("/"));
	
				// update the model
				this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);	
			}
		},
		
		_openPartSelectionDialog: function(){
			// Create the dialog if it isn't already
			if (!this._partsDialog) {
				this._partsDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partsDialog);
			}

			// Display the popup dialog for adding parts
			this._partsDialog.open();
		},
		
		_applyPartTableFilter: function(){
			
			var filters = [];

			filters.push(
				new Filter(
					"Deleted",
					sap.ui.model.FilterOperator.EQ, 
					false
			));
			this.getView().byId("partsTable").getBinding("items").filter(filters);
		},
		
		_applyMCPNFilter: function(){
			
			var filters = [];
			filters.push(new Filter("IsMCPN",sap.ui.model.FilterOperator.EQ, false));
			this.getView().byId("partsTable").getBinding("items").filter(filters);
		},
		
		_updateMCPN: function(){
			
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part){
				
				if(part.IsMCPN){
					this.getView().getModel("MCPNHelper").setProperty("/MCPN",part.PartNumber);
					this.getView().getModel("MCPNHelper").setProperty("/Description",part.Quantity);	
					this.getView().getModel("MCPNHelper").setProperty("/Description",part.Description);
				}
			}.bind(this));
			
			//Make sure the MCPN is hidden in the List
			this._applyMCPNFilter();
		}
	});

});
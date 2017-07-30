sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(Controller, Filter, Models, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		onInit: function(){
			
/*			this.byId("MCPN").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				//return oItem.getText().match(new RegExp(sTerm, "i"));
				return true;
			}); */
			
			this.getView().setModel(
				new JSONModel({
					"MCPN":"",
					"Description":"",
					"Quantity": "0",
					"PartRequested": ""
				}),
				"MCPNHelper"
			);
			
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._updateMCPN.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("PWA","Selected",this._updateMCPN.bind(this),this);
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
			
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			var indexOfMCPN = warrantyItems.findIndex(function(item){
				return item.IsMCPN;
			});
				
			// Update/Add the MCPN
			if(this.getView().getModel("MCPNHelper").getProperty("/MCPN") !== ""){
				
				//Are we adding or Modifying the MCPN
				if(warrantyItems[indexOfMCPN]){
					warrantyItems[indexOfMCPN].PartNumber = this.getView().getModel("MCPNHelper").getProperty("/MCPN");
					warrantyItems[indexOfMCPN].Description = this.getView().getModel("MCPNHelper").getProperty("/Description");
					warrantyItems[indexOfMCPN].Quantity = this.getView().getModel("MCPNHelper").getProperty("/Quantity");
				} else {
					var warrantyItem = Models.createNewWarrantyItem("MAT");
					warrantyItem.setProperty("/PartNumber", this.getView().getModel("MCPNHelper").getProperty("/MCPN"));
					warrantyItem.setProperty("/Description", this.getView().getModel("MCPNHelper").getProperty("/Description"));
					warrantyItem.setProperty("/PartRequested", this.getView().getModel("MCPNHelper").getProperty("/PartRequested"));
					warrantyItem.setProperty("/Quantity", this.getView().getModel("MCPNHelper").getProperty("/Quantity"));
					warrantyItem.setProperty("/IsMCPN",true);
					warrantyItems.push(warrantyItem.getProperty("/"));
				}
			} else {
				this.getView().getModel("MCPNHelper").setProperty("/Description","");
				this.getView().getModel("MCPNHelper").setProperty("/Quantity",0);

				if(warrantyItems[indexOfMCPN]){
					warrantyItems[indexOfMCPN].PartNumber = "";
					warrantyItems[indexOfMCPN].Description = "";
					warrantyItems[indexOfMCPN].Quantity = 0;
				}
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
			
			//Make sure the MCPN is hidden in the List
			this._applyPartTableFilter();
			//this._applyMCPNFilter();			
			
		},
			
		deletePart: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);

			this._applyPartTableFilter();
		},		
		
		onValueHelpSearch: function(event) {
			
			var searchString = event.getParameter("value");
			var filters = [];
			filters.push(new Filter([
				new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, searchString),
				new Filter("description", sap.ui.model.FilterOperator.Contains, searchString)
			], false));
			event.getSource().getBinding("items").filter(filters);
		},
		
		onPartSuggest: function(event){
			
			var searchString = event.getParameter("suggestValue");
			var filters = [];
			if (searchString) {
				filters.push(new Filter([
					new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, searchString),
					new Filter("description", sap.ui.model.FilterOperator.Contains, searchString)
				], false));
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
				this.getView().getModel("MCPNHelper").setProperty("/PartRequested", "S");
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
			filters.push(new Filter("Deleted",sap.ui.model.FilterOperator.EQ, false));
			filters.push(new Filter("IsMCPN",sap.ui.model.FilterOperator.EQ, false));
			this.getView().byId("partsTable").getBinding("items").filter(filters);
		},

		_updateMCPN: function(){
			
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part){
				
				if(part.IsMCPN){
					this.getView().getModel("MCPNHelper").setProperty("/MCPN",part.PartNumber);
					this.getView().getModel("MCPNHelper").setProperty("/Quantity",part.Quantity);	
					this.getView().getModel("MCPNHelper").setProperty("/Description",part.Description);
					this.getView().getModel("MCPNHelper").setProperty("/PartRequested",part.PartRequested);
				}
			}.bind(this));
			
			//Make sure the MCPN is hidden in the List
			this._applyPartTableFilter();
			//this._applyMCPNFilter();
		}
	});

});
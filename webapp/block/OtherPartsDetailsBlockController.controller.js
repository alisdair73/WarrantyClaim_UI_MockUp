sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, Filter, Models, JSONModel, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		onInit: function(){
			
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._updateMCPN.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("PWA","Selected",this._updateMCPN.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Loaded",this._updateMCPN.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("Validation","Refresh",this._refreshValidationMessages.bind(this),this);
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
			if(this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value") !== ""){
				
				//Are we adding or Modifying the MCPN
				if(warrantyItems[indexOfMCPN]){
					warrantyItems[indexOfMCPN].PartNumber = this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value");
					warrantyItems[indexOfMCPN].Description = this.getView().getModel("WarrantyClaim").getProperty("/Description");
					warrantyItems[indexOfMCPN].Quantity = this.getView().getModel("WarrantyClaim").getProperty("/Quantity");
				} else {
					var warrantyItem = Models.createNewWarrantyItem("MAT");
					warrantyItem.setProperty("/PartNumber", this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value"));
					warrantyItem.setProperty("/Description", this.getView().getModel("WarrantyClaim").getProperty("/Description"));
					warrantyItem.setProperty("/PartRequested", this.getView().getModel("WarrantyClaim").getProperty("/PartRequested"));
					warrantyItem.setProperty("/Quantity", this.getView().getModel("WarrantyClaim").getProperty("/Quantity"));
					warrantyItem.setProperty("/IsMCPN",true);
					warrantyItems.push(warrantyItem.getProperty("/"));
				}
			} else {
				this.getView().getModel("WarrantyClaim").setProperty("/Description","");
				this.getView().getModel("WarrantyClaim").setProperty("/Quantity",0);

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
			
			WarrantyClaim.validateMainCausalPartNumber();
			this.logValidationMessage("MCPN");
			
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
				this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",dataObject.materialNo);
				this.getView().getModel("WarrantyClaim").setProperty("/Description",dataObject.description);
				this.getView().getModel("WarrantyClaim").setProperty("/PartRequested", "S");
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
					this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",part.PartNumber);
					this.getView().getModel("WarrantyClaim").setProperty("/Quantity",part.Quantity);	
					this.getView().getModel("WarrantyClaim").setProperty("/Description",part.Description);
					this.getView().getModel("WarrantyClaim").setProperty("/PartRequested",part.PartRequested);
				}
			}.bind(this));
			
			//Make sure the MCPN is hidden in the List
			this._applyPartTableFilter();
		},
		
		_refreshValidationMessages: function(){
			this.logValidationMessage("MCPN");
		}
	});

});
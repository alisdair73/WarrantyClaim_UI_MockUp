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
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Loaded",this._updateMCPN.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._updateMCPN.bind(this),this);
		},
		
		////////////////////////////////
		//MCPN Handlers	
		////////////////////////////////
		onMCPNValueHelpRequest: function(){
			this._MCPNRequest = true;
			this._openPartValueHelpDialog();
		},
				
		onMCPNSuggestionSelected: function(event){
			this._updateMCPNFromSelection(event.getParameter("selectedRow").getBindingContext().getObject());
		},
		
		onMCPNChanged: function(){

			this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",
				this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value").replace(/[^a-zA-Z0-9]/g, "")
			);

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
					warrantyItems[indexOfMCPN].PartRequested = this.getView().getModel("WarrantyClaim").getProperty("/PartRequested");

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
		
		_updateMCPNFromSelection: function(dataObject){
			
			this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",dataObject.materialNo);
			this.getView().getModel("WarrantyClaim").setProperty("/Description",dataObject.description);
			this.getView().getModel("WarrantyClaim").setProperty("/PartRequested", "S");
			this.onMCPNChanged(); //Update the Parts Table
		},
		
		////////////////////////////////
		//Other Parts Handlers	
		////////////////////////////////
		onOtherPartValueHelpRequest: function(event){
			this._MCPNRequest = false;
			this._OtherPartPath = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this._openPartValueHelpDialog();
		},
			
		onOtherPartSuggestionSelected: function(event){
			this._updateOtherPartFromSelection(
				event.getParameter("selectedRow").getBindingContext().getObject(),
				event.getSource().getBindingContext("WarrantyClaim").getPath()
			);
		},
		
		onAddOtherPart: function(event){
			
			//Create a blank Other Part row
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// add the new part
			var warrantyItem = Models.createNewWarrantyItem("MAT");
			warrantyItem.setProperty("/PartRequested", "S");
			warrantyItems.push(warrantyItem.getProperty("/"));
	
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);				
		},
		
		onOtherPartDeletePart: function(event) {

			// Get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);
			this._applyPartTableFilter();
		},	
		
		_updateOtherPartFromSelection: function(dataObject, path){
			var warrantyItem = this.getView().getModel("WarrantyClaim").getProperty(path);

			//Update the Part
			warrantyItem.PartNumber = dataObject.materialNo;
			warrantyItem.Description = dataObject.description;

			// update the model
			this.getView().getModel("WarrantyClaim").setProperty(path, warrantyItem);
		},
		
		////////////////////////////////
		//Shared Handlers
		////////////////////////////////
		onValueHelpPartSearch: function(event) {
			event.getSource().getBinding("items").filter(this._partSearchFilter(event.getParameter("value")));
		},
		
		onPartSuggest: function(event){
			event.getSource().getBinding("suggestionRows").filter(this._partSearchFilter(event.getParameter("suggestValue")));
		},
		
		_partSearchFilter: function(searchString){
			
			var filters = [];
			if (searchString) {
				var partsFilterString = searchString.replace(/[^a-zA-Z0-9]/g, "");
				filters.push(new Filter([
					new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, partsFilterString),
					new Filter("description", sap.ui.model.FilterOperator.Contains, searchString)
				], false));
			}
			return filters;
		},
			
		onValueHelpPartSelected: function(event){
			var dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			if(this._MCPNRequest){
				this._updateMCPNFromSelection(dataObject);
			} else {
				this._updateOtherPartFromSelection(dataObject, this._OtherPartPath);	
			}
		},
		
		_openPartValueHelpDialog: function(){
			
			// Create the dialog if it isn't already
			if (!this._partValueHelpDialog) {
				this._partValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partValueHelpDialog);
			}

			// Display the popup dialog for adding parts
			this._partValueHelpDialog.open();
		},
		
		_applyPartTableFilter: function(){
			//Hide the Deleted rows, and the MCP
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
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models"
], function(Controller, Filter, Models) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._applyPartTableFilter.bind(this),this);
		},
				
		addItem: function(){
			
			// Create the dialog if it isn't already
			if (!this._partsDialog) {
				this._partsDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partsDialog);
			}

			// Display the popup dialog for adding parts
			this._partsDialog.open();
		},
		
		deletePart: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);

			this._applyPartTableFilter();
		},		
		
		onPartQuantityChanged: function(event){
			var bindingPath = event.getSource().getBindingContext("WarrantyClaim").getPath();
			
			//Update the MCPN Field too
			if(this.getView().getModel("WarrantyClaim").getProperty(bindingPath + "/IsMCPN") === true){
				
				sap.ui.getCore().getEventBus().publish("MCPN","Changed",
					{
						"MCPN": this.getView().getModel("WarrantyClaim").getProperty(bindingPath + "/PartNumber"), 
						"Description": this.getView().getModel("WarrantyClaim").getProperty(bindingPath + "/Description"), 
						"Quantity": this.getView().getModel("WarrantyClaim").getProperty(bindingPath + "/Quantity")
					}
				);
			}			
			
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
		
		onPartSelected: function(event){

			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			var part = event.getParameter("selectedItem").getBindingContext().getObject();

			// add the new part
			var warrantyItem = Models.createNewWarrantyItem("MAT");
			warrantyItem.setProperty("/PartNumber", part.materialNo);
			warrantyItem.setProperty("/Description", part.description);
			warrantyItem.setProperty("/PartRequested", "S");
			warrantyItem.setProperty("/IsMCPN", warrantyItems.length === 0 ? true : false);
			warrantyItems.push(warrantyItem.getProperty("/"));

			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
			
			//Update the MCPN Field too
			if(warrantyItem.getProperty("/IsMCPN")){
				sap.ui.getCore().getEventBus().publish("MCPN","Changed",{"MCPN":part.materialNo, "Description":part.description, "Quantity":"0"});
			}
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
		}
	});

});
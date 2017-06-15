sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models"
], function(Controller, Filter, Models) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		addItem: function(){
			
			// Create the dialog if it isn't already
			if (!this._partsDialog) {
				this._partsDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partsDialog);
			}

			// Display the popup dialog for adding parts
			this._partsDialog.open();
		},
		
		deleteItem: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);

           	var filters = [];

			filters.push(new Filter(
				"Deleted",
				sap.ui.model.FilterOperator.EQ, 
				false
			));
			this.getView().byId("partsTable").getBinding("items").filter(filters);
			
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

			var selectedContexts = event.getParameter("selectedContexts");
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			for (var i = 0; i < selectedContexts.length; i++) {
				var item = selectedContexts[i].getModel().getProperty(selectedContexts[i].getPath());
				
				// add the new part
				var warrantyItem = Models.createNewWarrantyItem("MAT");
				warrantyItem.setProperty("/PartNumber", item.materialNo);
				warrantyItem.setProperty("/Description", item.description);
				warrantyItem.setProperty("/PartRequested", "S");
				warrantyItem.setProperty("/IsMCPN", warrantyItems.length === 0 ? true : false);
				
				warrantyItems.push(warrantyItem.getProperty("/"));
			}

			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
		}
	});

});
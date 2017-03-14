sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter"
], function(Controller, Filter) {
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

			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();

            var itemIndex = path.split("/")[2];

			// delete the line using the path to work out the index
			warrantyItems.splice(itemIndex, 1);
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);

		},		
		onValueHelpSearch: function(event) {
			
			var searchValue = event.getParameter("value");
			var filters = [];
			filters.push(new Filter(
				"PartNumber",
				sap.ui.model.FilterOperator.Contains, searchValue
			));
			filters.push(new Filter(
				"Description",
				sap.ui.model.FilterOperator.Contains, searchValue
			));
			event.getSource().getBinding("items").filter(filters);
		},
		
		onPartSelected: function(event){

			var selectedContexts = event.getParameter("selectedContexts");
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// add the parts that were selected (to the top) and update the model
			// we default the requestedDeliveryDate to today
			for (var i = 0; i < selectedContexts.length; i++) {
				var item = selectedContexts[i].getModel().getProperty(selectedContexts[i].getPath());
				// add the new part
				warrantyItems.push({
					"PartNumber": item.PartNumber, 
	                "Description" : item.Description,
	                "PartRequested": ""
				});
			}

			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
		}
	});

});
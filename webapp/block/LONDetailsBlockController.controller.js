sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models"
], function(Controller, Filter, Models) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.LONDetailsBlockController", {
		
		onCheckLON: function(){
			
			// Create the dialog if it isn't already
			if (!this._LONDialog) {
				this._LONDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.LabourOperationNumberSelection", this);
				this.getView().addDependent(this._LONDialog);
			}

			//Set the VIN to Filter the LON List
			var filters = [];
			filters.push(
				new Filter(
					"VIN",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/VIN")
			));
			sap.ui.getCore().byId("LONCatalog").getBinding("items").filter(filters);
 			
			// Display the popup dialog for adding parts
			this._LONDialog.open();
		},
		
		onCancelCheckLON: function(){
			this._LONDialog.close();
		},
		
		onAddLON: function(){
			
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
			for(var i=0; i<sap.ui.getCore().byId("LONCatalog").getSelectedItems().length; i++){
				
				var bindingPath = sap.ui.getCore().byId("LONCatalog").getSelectedItems()[i].getBindingContext().getPath();
				var selectedLON = sap.ui.getCore().byId("LONCatalog").getModel().getProperty(bindingPath);
				
				var newLONItem = Models.createNewWarrantyItem("FR");   
				newLONItem.ItemKey = selectedLON.LONCode;
				newLONItem.Description = selectedLON.Description;
				newLONItem.Quantity = selectedLON.Hours;
				labourItems.push(newLONItem);
			}
			this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
			this._LONDialog.close();
		}
	});

});
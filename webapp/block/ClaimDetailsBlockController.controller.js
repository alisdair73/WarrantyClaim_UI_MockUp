sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"WarrantyClaim_MockUp/model/valueStateFormatter",
	"WarrantyClaim_MockUp/model/validationRules"
	
], function(BaseController,Filter, Models, valueStateFormatter, Rule) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		valueStateFormatter: valueStateFormatter,
		
		onInit: function(){
			//sap.ui.getCore().getEventBus().subscribe("RecallNumber","Changed",this._recallNumberChanged.bind(this),this);
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
		}
		
/*    	_recallNumberChanged: function(channel, event, data){
    		
    		var oldSerialNumber = this.getView().getModel("WarrantyClaim").getProperty("/OldSerialNumber");
    		var newSerialNumber = this.getView().getModel("WarrantyClaim").getProperty("/NewSerialNumber");
    	
    		this.getView().byId("OldSerialNumber").setValueState(
    			Rule.validateSerialNumbersArePopulated(oldSerialNumber, "OldSerialNumber", this.getView()) ? "None" : "Error"
    		);
    		this.getView().byId("NewSerialNumber").setValueState(
    			Rule.validateSerialNumbersArePopulated(newSerialNumber, "NewSerialNumber", this.getView()) ? "None" : "Error"
    		);
    	}*/
	});
});
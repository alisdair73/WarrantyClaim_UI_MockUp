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
			sap.ui.getCore().getEventBus().subscribe("RecallNumber","Changed",this._recallNumberChanged.bind(this),this);
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
			var warrantyItem = null;
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			
			var item = selectedContexts[0].getModel().getProperty(selectedContexts[0].getPath());
				
			// add the new part - If the MCPN is already defined, overwrite this
			warrantyItem = Models.createNewWarrantyItem("MAT");
			warrantyItem.setProperty("/PartNumber", item.PartNumber);
			warrantyItem.setProperty("/Description", item.Description);
			warrantyItem.setProperty("/IsMCPN",true);
			
			if (warrantyItems[0]){
				warrantyItem.setProperty("/Quantity", warrantyItems[0].Quantity);
				warrantyItems[0] = warrantyItem.getProperty("/");
			} else {
				warrantyItems.push(warrantyItem.getProperty("/"));
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
		},
		
    	_recallNumberChanged: function(channel, event, data){
    		
    		var oldSerialNumber = this.getView().getModel("WarrantyClaim").getProperty("/OldSerialNumber");
    		var newSerialNumber = this.getView().getModel("WarrantyClaim").getProperty("/NewSerialNumber");
    	
    		this.getView().byId("OldSerialNumber").setValueState(
    			Rule.validateSerialNumbersArePopulated(oldSerialNumber, "OldSerialNumber", this.getView()) ? "None" : "Error"
    		);
    		this.getView().byId("NewSerialNumber").setValueState(
    			Rule.validateSerialNumbersArePopulated(newSerialNumber, "NewSerialNumber", this.getView()) ? "None" : "Error"
    		);
    	}
	});
});
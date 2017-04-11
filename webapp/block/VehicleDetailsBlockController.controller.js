sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"sap/ui/model/json/JSONModel"
], function(Controller, Filter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

		onPWAValueHelpRequest: function(event){
			if (!this._PWAValueHelpDialog) {
				this._PWAValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PriorWorkApprovalSelection", this);
				this.getView().addDependent(this._PWAValueHelpDialog);
			}

 			var filters = [];
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));
			sap.ui.getCore().byId("PWASelectionList").getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._PWAValueHelpDialog.open();
		},

        onPWASelectionSearch: function(){
        },
        
		onPWASelection: function(event){
			
			var PWANumber = event.getParameter("selectedItem").getBindingContext().getObject().PWANumber;
			this.getView().getModel("WarrantyClaim").setProperty("/AuthorisationNumber",PWANumber);
		},
		
		onPWASelectionClose: function(){
			this._PWAValueHelpDialog.close();
		},
		
		onRecallValueHelpRequest: function(event){
			if (!this._RecallValueHelpDialog) {
				this._RecallValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.RecallSelection", this);
				this.getView().addDependent(this._RecallValueHelpDialog);
			}

 			var filters = [];
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));
			sap.ui.getCore().byId("RecallSelectionList").getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._RecallValueHelpDialog.open();
		},
		
        onRecallSelectionSearch: function(){
        },
        
		onRecallSelection: function(event){
			
			var recallNumber = event.getParameter("selectedItem").getBindingContext().getObject().InternalRecallNumber;
			var serialIsMandatory = event.getParameter("selectedItem").getBindingContext().getObject().SerialNumberIsMandatory;
			this.getView().getModel("WarrantyClaim").setProperty("/RecallNumber",recallNumber);
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",serialIsMandatory);
		},
		
		onRecallSelectionClose: function(){
			this._RecallValueHelpDialog.close();
		},
		
    	onRecallSelected: function(event){
    		var isMandatory = event.getParameter("selectedItem").getBindingContext().getObject().SerialNumberIsMandatory;
    		this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",isMandatory);
    	}
	});

});
sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"sap/ui/model/json/JSONModel"
], function(Controller, Filter, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

    	loadPWAList: function(event){
 
 			var filters = [];
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));
						
 			event.getSource().getBinding("items").filter(filters);
			event.getSource().getBinding("items").resume();
			
			event.getSource().bindElement({
				path: "/PriorWorkApprovalSet",
				events: {
					dataRequested: function() {
						this.getView().byId("PWANumber").setBusy(true);
					}.bind(this),
					dataReceived: function() {
						this.getView().byId("PWANumber").setBusy(false);
					}.bind(this)
				}
			});
			
    	},
    	
    	onRecallSelected: function(event){
    		var isMandatory = event.getParameter("selectedItem").getBindingContext().getObject().SerialNumberIsMandatory;
    		this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",isMandatory);
    	}
	});

});
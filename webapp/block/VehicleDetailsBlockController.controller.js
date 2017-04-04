sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"sap/ui/model/json/JSONModel"
], function(Controller, Filter, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Ready",this._filterPWAList.bind(this),this);
		},

    	_filterPWAList: function(event){
 
			var filters = [];
/*			filters.push(
				new Filter(
					"Dealer",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("ViewHelper").getProperty("/warrantyUI/dealerNumber")
			));
			*/
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));

			this.getView().byId("PWANumber").getBinding("items").filter(filters);
//			event.getSource().getBinding("items").filter(filters);
//			event.getSource().getBinding("items").resume();
			
      }
	});

});
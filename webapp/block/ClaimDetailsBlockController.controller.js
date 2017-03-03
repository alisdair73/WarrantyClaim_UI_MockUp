sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		onInit: function(){
			
			var oMILModel = new JSONModel({
				DTCVisible: false
			});
			
			this.getView().setModel(oMILModel, "MIL");
		},
		
		onAfterRendering: function(oEvent) {
			var mil_on = this.getView().getModel().getProperty("MilIndicator");
		},
		
		
		onMILSelected: function(event){
			var oMILModel = this.getView().getModel("MIL");
			oMILModel.setProperty("/DTCVisible", event.getParameter("selected"));
		}
	});
});
	
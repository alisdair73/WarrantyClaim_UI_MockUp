sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		onInit: function(){
/*			var oMILModel = new JSONModel({
				DTCVisible: false
			});
			this.getView().setModel(oMILModel, "MIL");*/
		},
		
		onAfterRendering: function(oEvent) {
			var mil_on = this.getView().getModel().getProperty("MilIndicator");
		},
		
		onMILSelected: function(event){
//			var oMILModel = this.getView().getModel("MIL");
//			oMILModel.setProperty("/DTCVisible", event.getParameter("selected"));
		}
	});
});
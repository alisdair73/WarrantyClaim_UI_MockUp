sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createNewWarrantyClaimModel: function(){
			
			return new JSONModel({
				"ClaimNumber": "NEW CLAIM",
				"ClaimType": "",
				"SubmittedOn": "",
				"TotalCostOfClaim":0
			});
			
		},
		
		createNewWarrantyItem: function(itemType){
			return new JSONModel({
				"ItemType":itemType,
				"PartNumber":"",
	            "Invoice":"",
	            "BusinessName":"",
	            "Description":"",
	            "Quantity": 0
			});
		}
	
	};

});
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
		
		createNewWarrantyItem: function(itemType){
			return new JSONModel({
				"ClaimNumber":"",
				"ItemType":itemType,
				"ItemNo":"",
				"PartNumber":"",
				"ItemKey":"",
	            "Quantity": "0",
	            "PartRequested":"",
	            "Description":"",
	            "Invoice":"",
	            "BusinessName":"",
	            "Deleted":false,
	            "isMCPN": false,
	            "ItemIdentifier":null
			});
		}
	
	};

});
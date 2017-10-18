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

		createUIValidationModel: function(){
			return new JSONModel({"hasUIValidationError": false});
		},

		createNewWarrantyItem: function(itemType){
			return new JSONModel({
				"ClaimNumber":"",
				"ItemType":itemType,
				"ItemNo":"",
				"PartNumber":"",
				"ItemKey":"",
	            "Quantity": { "value":"0", "ruleResult":{"valid": true, "errorTextID":""}},
	            "PartRequested":"",
	            "Description":"",
	            "Invoice":"",
	            "BusinessName":"",
	            "Deleted":false,
	            "IsMCPN": false,
	            "IsSubletFixed": false,
	            "IsLONCatalogItem": false,
	            "ItemIdentifier":null
			});
		}
	
	};

});
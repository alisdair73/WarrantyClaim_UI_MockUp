sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {
		oDataModel: null,
		warrantyClaim: {},
		warrantyClaimOriginal: {},
		
		createWarrantyClaimModel: function(oData) {
			this.warrantyClaim = {
				"ClaimNumber": "",
				"ClaimType": "",
				"WarrantyClaimItems": [],
				"changed": false
			};
			
			this.oDataModel = new JSONModel(this.warrantyClaim);
			this.oDataModel.setDefaultBindingMode("TwoWay");
			return this.oDataModel;
		},
		
		updateWarrantyClaimFromOdata: function(oServerOData) {
			var oSource = oServerOData.getSource ? oServerOData.getSource() : oServerOData;
			var oODataModel = oSource.getModel();
			var sPath = oSource.getPath();
			var oWarrantyClaim = oODataModel.getObject(sPath);
			
			this.warrantyClaim.ClaimNumber = oWarrantyClaim.ClaimNumber;
			this.warrantyClaim.ClaimType = oWarrantyClaim.ClaimType;
			
			var oWarrantyClaimItems = oODataModel.getObject(sPath + "/WarrantyClaimItems");
			for (var i = 0; i < oWarrantyClaimItems.length; i++) {
				var oWarrantyClaimItem = oODataModel.getObject("/" + oWarrantyClaimItems[i]);
				this.warrantyClaim.WarrantyClaimItems.push(oWarrantyClaimItem);
			}

			this.resetChanges();
		},
		
		resetChanges: function() {
			this.warrantyClaimOriginal = jQuery.extend(true, {}, this.warrantyClaim);
			this.warrantyClaimOriginal.changed = false;
			this.oDataModel.setData(this.warrantyClaim);			
		}
	};
});
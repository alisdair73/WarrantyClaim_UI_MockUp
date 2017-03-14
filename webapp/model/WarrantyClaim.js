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
				"Parts": [],
				"Labour": [],
				"Sublet":[],
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
				switch(oWarrantyClaimItem.ItemType) {
    				case "MAT":
    					this.warrantyClaim.Parts.push(oWarrantyClaimItem);
				        break;
				    case "FR":
				    	this.warrantyClaim.Labour.push(oWarrantyClaimItem);
				        break;
				    case "SUBL":
				    	this.warrantyClaim.Sublet.push(oWarrantyClaimItem);
				        break;
				}
			}

			this.resetChanges();
		},
		
		convertToODataForUpdate: function() {
			var warrantyClaim = {
				"ClaimNumber": "",
				"ClaimType": "",
				"WarrantyClaimItems" : []
			};
			warrantyClaim.ClaimNumber = this.warrantyClaim.ClaimNumber;
			warrantyClaim.ClaimType = this.warrantyClaim.ClaimType;
			
			for (var i = 0; i < this.warrantyClaim.Parts.length; i++) {
				warrantyClaim.WarrantyClaimItems.push(this.warrantyClaim.Parts[i]);
			}

			for (var i = 0; i < this.warrantyClaim.Labour.length; i++) {
				warrantyClaim.WarrantyClaimItems.push(this.warrantyClaim.Labour[i]);
			}
			
			for (var i = 0; i < this.warrantyClaim.Sublet.length; i++) {
				warrantyClaim.WarrantyClaimItems.push(this.warrantyClaim.Sublet[i]);
			}
			return warrantyClaim;
		},
		
		resetChanges: function() {
			this.warrantyClaimOriginal = jQuery.extend(true, {}, this.warrantyClaim);
			this.warrantyClaimOriginal.changed = false;
			this.oDataModel.setData(this.warrantyClaim);			
		}
	};
});
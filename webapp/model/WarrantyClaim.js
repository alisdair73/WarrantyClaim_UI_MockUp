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
				"DealerContact": "",
				"EngineNumber": "",
				"AuthorisationNumber": "",
				"VIN": "",
				"RecallNumber": "",
				"RepairOrderNumber": "",
				"DateOfRepair": null,
				"DateOfFailure": null,
				"FailureMeasure": "",
				"MilIndicator": false,
				"DTC1": "",
				"DTC2": "",
				"DTC3": "",
				"Technician": "",
				"ServiceAdvisor": "",
				"DealerComments":"",
				"DefectCode":"",
				"CustomerConcern":"",
				"SymptomCode":"",
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
			this.warrantyClaim.DealerContact = oWarrantyClaim.DealerContact;
			this.warrantyClaim.EngineNumber = oWarrantyClaim.EngineNumber;
			this.warrantyClaim.AuthorisationNumber = oWarrantyClaim.AuthorisationNumber;
			this.warrantyClaim.VIN = oWarrantyClaim.VIN;
			this.warrantyClaim.RecallNumber = oWarrantyClaim.RecallNumber;
			this.warrantyClaim.RepairOrderNumber = oWarrantyClaim.RepairOrderNumber;
			this.warrantyClaim.DateOfRepair = oWarrantyClaim.DateOfRepair;
			this.warrantyClaim.DateOfFailure = oWarrantyClaim.DateOfFailure;
			this.warrantyClaim.FailureMeasure = oWarrantyClaim.FailureMeasure;
			this.warrantyClaim.MilIndicator = oWarrantyClaim.MilIndicator;
			this.warrantyClaim.DTC1 = oWarrantyClaim.DTC1;
			this.warrantyClaim.DTC2 = oWarrantyClaim.DTC2;
			this.warrantyClaim.DTC3 = oWarrantyClaim.DTC3;
			this.warrantyClaim.Technician = oWarrantyClaim.Technician;
			this.warrantyClaim.ServiceAdvisor = oWarrantyClaim.ServiceAdvisor;
			this.warrantyClaim.DealerComments = oWarrantyClaim.DealerComments;
			this.warrantyClaim.DefectCode = oWarrantyClaim.DefectCode;
			this.warrantyClaim.CustomerConcern = oWarrantyClaim.CustomerConcern;
			this.warrantyClaim.SymptomCode = oWarrantyClaim.SymptomCode;
			
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
			warrantyClaim.DealerContact = this.warrantyClaim.DealerContact;
			warrantyClaim.EngineNumber = this.warrantyClaim.EngineNumber;
			warrantyClaim.AuthorisationNumber = this.warrantyClaim.AuthorisationNumber;
			warrantyClaim.VIN = this.warrantyClaim.VIN;
			warrantyClaim.RecallNumber = this.warrantyClaim.RecallNumber;
			warrantyClaim.RepairOrderNumber = this.warrantyClaim.RepairOrderNumber;
			warrantyClaim.DateOfRepair = this.warrantyClaim.DateOfRepair;
			warrantyClaim.DateOfFailure = this.warrantyClaim.DateOfFailure;
			warrantyClaim.FailureMeasure = this.warrantyClaim.FailureMeasure;
			warrantyClaim.MilIndicator = this.warrantyClaim.MilIndicator;
			warrantyClaim.DTC1 = this.warrantyClaim.DTC1;
			warrantyClaim.DTC2 = this.warrantyClaim.DTC2;
			warrantyClaim.DTC3 = this.warrantyClaim.DTC3;
			warrantyClaim.Technician = this.warrantyClaim.Technician;
			warrantyClaim.ServiceAdvisor = this.warrantyClaim.ServiceAdvisor;
			warrantyClaim.DealerComments = this.warrantyClaim.DealerComments;
			warrantyClaim.DefectCode = this.warrantyClaim.DefectCode;
			warrantyClaim.CustomerConcern = this.warrantyClaim.CustomerConcern;
			warrantyClaim.SymptomCode = this.warrantyClaim.SymptomCode;
			
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
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(JSONModel,NumberFormat) {
	"use strict";

	return {
		oDataModel: null,
		warrantyClaim: {},
		warrantyClaimOriginal: {},
		
		createWarrantyClaimModel: function(oData) {
			this.warrantyClaim = {
				"ClaimNumber": "",
				"ClaimType": "",
				"Dealer":"",
				"DealerContact": "",
				"EngineNumber": "",
				"AuthorisationNumber": "",
				"VIN": "",
				"RecallNumber": "",
				"RepairOrderNumber": "",
				"TotalCostOfClaim":"0",
				"ClaimCurrency":"",
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
				"CurrentVersionNumber":"0001",
				"CurrentVersionCategory":"IC",
				"OCTotal":"0",
				"OVTotal":"0",
				"ICTotal":"0",
				"IVTotal":"0",
				"StatusDescription":"New Claim",
				"StatusIcon":"sap-icon://write-new-document",
				"CanEdit":true,
				"VersionIdentifier":null,
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
			
			var formatOptions = {
				minFractionDigits: 2,
				maxFractionDigits: 2
			};
			var costFormat = NumberFormat.getFloatInstance(formatOptions);

			this.warrantyClaim.ClaimNumber = oWarrantyClaim.ClaimNumber;
			this.warrantyClaim.ClaimType = oWarrantyClaim.ClaimType;
			this.warrantyClaim.DealerContact = oWarrantyClaim.DealerContact;
			this.warrantyClaim.EngineNumber = oWarrantyClaim.EngineNumber;
			this.warrantyClaim.AuthorisationNumber = oWarrantyClaim.AuthorisationNumber;
			this.warrantyClaim.VIN = oWarrantyClaim.VIN;
			this.warrantyClaim.RecallNumber = oWarrantyClaim.RecallNumber;
			this.warrantyClaim.RepairOrderNumber = oWarrantyClaim.RepairOrderNumber;
			this.warrantyClaim.TotalCostOfClaim = costFormat.format(oWarrantyClaim.TotalCostOfClaim);
			this.warrantyClaim.ClaimCurrency = oWarrantyClaim.ClaimCurrency;
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
			this.warrantyClaim.CurrentVersionNumber = oWarrantyClaim.CurrentVersionNumber;
			this.warrantyClaim.CurrentVersionCategory = oWarrantyClaim.CurrentVersionCategory;
			this.warrantyClaim.OCTotal = parseFloat(oWarrantyClaim.OCTotal);
			this.warrantyClaim.OVTotal = parseFloat(oWarrantyClaim.OVTotal);
			this.warrantyClaim.ICTotal = parseFloat(oWarrantyClaim.ICTotal);
			this.warrantyClaim.IVTotal = parseFloat(oWarrantyClaim.IVTotal);
			this.warrantyClaim.StatusDescription = oWarrantyClaim.StatusDescription;
			this.warrantyClaim.StatusIcon = oWarrantyClaim.StatusIcon;
			this.warrantyClaim.CanEdit = oWarrantyClaim.CanEdit;
			
			var oWarrantyClaimItems = oODataModel.getObject(sPath + "/WarrantyClaimItems");
			if (oWarrantyClaimItems){
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
			}
			
			this.resetChanges();
		},
		
		convertToODataForUpdate: function() {
			var warrantyClaim = {
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
			warrantyClaim.VersionIdentifier = this.warrantyClaim.VersionIdentifier;
			
			for (var i = 0; i < this.warrantyClaim.Parts.length; i++) {
				this.warrantyClaim.Parts[i].Quantity = this.warrantyClaim.Parts[i].Quantity.toString();
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
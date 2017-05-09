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
				"ObjectType":"",
				"ClaimTypeDescription": "",
				"ClaimTypeGroup": "",
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
				"OldSerialNumber":"",
				"NewSerialNumber":"",
				"PartsInstallDate": null,
				"PartsInstallKm": "0",
				"PartsInstalledByDealer": false,
				"OriginalInvoiceNumber":"",
				"DealerComments":"",
				"DefectCode":"",
				"CustomerConcern":"",
				"SymptomCode":"",
				"CurrentVersionNumber":"",
				"CurrentVersionCategory":"",
				"TotalMaterial":"0",
				"TotalExternalServices":"0",
				"TotalLabour":"0",
				"TotalHandling":"0",
				"TotalGST":"0",
				"StatusDescription":"",
				"StatusIcon":"",
				"CanEdit":true,
				"VersionIdentifier":null,
				"Parts": [],
				"Labour": [],
				"Sublet":[],
				"Attachments": [],
				"changed": false
			};
			
			this.oDataModel = new JSONModel(this.warrantyClaim);
			this.oDataModel.setDefaultBindingMode("TwoWay");
			return this.oDataModel;
		},
		
		updateWarrantyClaimFromJSONModel: function(jsonModel){
		
/*			var formatOptions = {
				minFractionDigits: 2,
				maxFractionDigits: 2
			};
			var costFormat = NumberFormat.getFloatInstance(formatOptions);*/
			
			this.warrantyClaim.ClaimNumber = jsonModel.ClaimNumber;
			this.warrantyClaim.ClaimCurrency = jsonModel.ClaimCurrency;
			this.warrantyClaim.TotalMaterial = jsonModel.TotalMaterial;
			this.warrantyClaim.TotalExternalServices = jsonModel.TotalExternalServices;
			this.warrantyClaim.TotalLabour = jsonModel.TotalLabour;
			this.warrantyClaim.TotalHandling = jsonModel.TotalHandling;
			this.warrantyClaim.TotalGST = jsonModel.TotalGST;
			this.warrantyClaim.TotalCostOfClaim = jsonModel.TotalCostOfClaim;
			
//			this.warrantyClaim.TotalCostOfClaim = costFormat.format(jsonModel.TotalCostOfClaim);
			
			this.warrantyClaim.StatusDescription = jsonModel.StatusDescription;
			this.warrantyClaim.StatusIcon = jsonModel.StatusIcon;
			this.warrantyClaim.CanEdit = jsonModel.CanEdit;
			this.warrantyClaim.VersionIdentifier = jsonModel.VersionIdentifier;
			this.warrantyClaim.CurrentVersionNumber = jsonModel.CurrentVersionNumber;
			this.warrantyClaim.CurrentVersionCategory = jsonModel.CurrentVersionCategory;
			
			this.warrantyClaim.Parts = [];
			this.warrantyClaim.Labour = [];
			this.warrantyClaim.Sublet = [];

            if(jsonModel.WarrantyClaimItems){
				for (var i = 0; i < jsonModel.WarrantyClaimItems.results.length; i++) {
					var warrantyClaimItem = jsonModel.WarrantyClaimItems.results[i];
					switch(warrantyClaimItem.ItemType) {
    					case "MAT":
    						if(this.warrantyClaim.Parts.length === 0){
    							warrantyClaimItem.IsMCPN = true;
    						}
    						this.warrantyClaim.Parts.push(warrantyClaimItem);
				        	break;
				    	case "FR":
				   			this.warrantyClaim.Labour.push(warrantyClaimItem);
				   			break;
				   		case "SUBL":
				   			this.warrantyClaim.Sublet.push(warrantyClaimItem);
			    			break;
					}
				}
            }
            
            this.resetChanges();
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
			this.warrantyClaim.ClaimTypeDescription = oWarrantyClaim.ClaimTypeDescription;
			this.warrantyClaim.ClaimTypeGroup = oWarrantyClaim.ClaimTypeGroup;
			this.warrantyClaim.DealerContact = oWarrantyClaim.DealerContact;
			this.warrantyClaim.EngineNumber = oWarrantyClaim.EngineNumber;
			this.warrantyClaim.AuthorisationNumber = oWarrantyClaim.AuthorisationNumber;
			this.warrantyClaim.VIN = oWarrantyClaim.VIN;
			this.warrantyClaim.RecallNumber = oWarrantyClaim.RecallNumber;
			this.warrantyClaim.RepairOrderNumber = oWarrantyClaim.RepairOrderNumber;
			this.warrantyClaim.TotalCostOfClaim = costFormat.format(oWarrantyClaim.TotalCostOfClaim);
			this.warrantyClaim.ClaimCurrency = oWarrantyClaim.ClaimCurrency;
			this.warrantyClaim.SubmittedOn = oWarrantyClaim.SubmittedOn;
			this.warrantyClaim.DateOfRepair = oWarrantyClaim.DateOfRepair;
			this.warrantyClaim.DateOfFailure = oWarrantyClaim.DateOfFailure;
			this.warrantyClaim.FailureMeasure = oWarrantyClaim.FailureMeasure;
			this.warrantyClaim.MilIndicator = oWarrantyClaim.MilIndicator;
			this.warrantyClaim.DTC1 = oWarrantyClaim.DTC1;
			this.warrantyClaim.DTC2 = oWarrantyClaim.DTC2;
			this.warrantyClaim.DTC3 = oWarrantyClaim.DTC3;
			this.warrantyClaim.Technician = oWarrantyClaim.Technician;
			this.warrantyClaim.ServiceAdvisor = oWarrantyClaim.ServiceAdvisor;
			this.warrantyClaim.OldSerialNumber = oWarrantyClaim.OldSerialNumber;
			this.warrantyClaim.NewSerialNumber = oWarrantyClaim.NewSerialNumber;
			this.warrantyClaim.PartsInstallDate = oWarrantyClaim.PartsInstallDate;
			this.warrantyClaim.PartsInstallKm = oWarrantyClaim.PartsInstallKm;
			this.warrantyClaim.PartsInstalledByDealer = oWarrantyClaim.PartsInstalledByDealer;
			this.warrantyClaim.OriginalInvoiceNumber = oWarrantyClaim.OriginalInvoiceNumber;
			this.warrantyClaim.DealerComments = oWarrantyClaim.DealerComments;
			this.warrantyClaim.DefectCode = oWarrantyClaim.DefectCode;
			this.warrantyClaim.CustomerConcern = oWarrantyClaim.CustomerConcern;
			this.warrantyClaim.SymptomCode = oWarrantyClaim.SymptomCode;
			this.warrantyClaim.AssessmentComments = oWarrantyClaim.AssessmentComments;
			this.warrantyClaim.AssessmentResults = oWarrantyClaim.AssessmentResults;
			this.warrantyClaim.CurrentVersionNumber = oWarrantyClaim.CurrentVersionNumber;
			this.warrantyClaim.CurrentVersionCategory = oWarrantyClaim.CurrentVersionCategory;
			this.warrantyClaim.TotalMaterial = oWarrantyClaim.TotalMaterial;
			this.warrantyClaim.TotalExternalServices = oWarrantyClaim.TotalExternalServices;
			this.warrantyClaim.TotalLabour = oWarrantyClaim.TotalLabour;
			this.warrantyClaim.TotalHandling = oWarrantyClaim.TotalHandling;
			this.warrantyClaim.TotalGST = oWarrantyClaim.TotalGST;
			this.warrantyClaim.StatusDescription = oWarrantyClaim.StatusDescription;
			this.warrantyClaim.StatusIcon = oWarrantyClaim.StatusIcon;
			this.warrantyClaim.CanEdit = oWarrantyClaim.CanEdit;
			this.warrantyClaim.VersionIdentifier = oWarrantyClaim.VersionIdentifier;
			
			var oWarrantyClaimItems = oODataModel.getObject(sPath + "/WarrantyClaimItems");
			if (oWarrantyClaimItems){
				for (var i = 0; i < oWarrantyClaimItems.length; i++) {
					var oWarrantyClaimItem = oODataModel.getObject("/" + oWarrantyClaimItems[i]);
					switch(oWarrantyClaimItem.ItemType) {
    					case "MAT":
    						oWarrantyClaimItem.IsMCPN = false;
    						if(this.warrantyClaim.Parts.length === 0){
    							oWarrantyClaimItem.IsMCPN = true;
    						}
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
			
			var oAttachments = oODataModel.getObject(sPath + "/Attachments");
			if (oAttachments){
				for (i = 0; i < oAttachments.length; i++) {
					var oAttachment = oODataModel.getObject("/" + oAttachments[i]);
					oAttachment.URL = "/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/WarrantyClaimSet('" + this.warrantyClaim.ClaimNumber + "')/Attachments('" + oAttachment.DocumentID + "')/$value";
					this.warrantyClaim.Attachments.push(oAttachment);
				}
			}
			
			this.resetChanges();
		},
		
		convertToODataForUpdate: function() {
			var warrantyClaim = {
				"WarrantyClaimItems" : [],
				"Attachments":[]
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
			warrantyClaim.FailureMeasure = this.warrantyClaim.FailureMeasure.toString();
			warrantyClaim.MilIndicator = this.warrantyClaim.MilIndicator;
			warrantyClaim.DTC1 = this.warrantyClaim.DTC1;
			warrantyClaim.DTC2 = this.warrantyClaim.DTC2;
			warrantyClaim.DTC3 = this.warrantyClaim.DTC3;
			warrantyClaim.Technician = this.warrantyClaim.Technician;
			warrantyClaim.ServiceAdvisor = this.warrantyClaim.ServiceAdvisor;
			warrantyClaim.OldSerialNumber = this.warrantyClaim.OldSerialNumber;
			warrantyClaim.NewSerialNumber = this.warrantyClaim.NewSerialNumber;
			warrantyClaim.PartsInstallDate = this.warrantyClaim.PartsInstallDate;
			warrantyClaim.PartsInstallKm = this.warrantyClaim.PartsInstallKm;
			warrantyClaim.PartsInstalledByDealer = this.warrantyClaim.PartsInstalledByDealer;
			warrantyClaim.OriginalInvoiceNumber = this.warrantyClaim.OriginalInvoiceNumber;
			warrantyClaim.DealerComments = this.warrantyClaim.DealerComments;
			warrantyClaim.DefectCode = this.warrantyClaim.DefectCode;
			warrantyClaim.CustomerConcern = this.warrantyClaim.CustomerConcern;
			warrantyClaim.SymptomCode = this.warrantyClaim.SymptomCode;
			warrantyClaim.VersionIdentifier = this.warrantyClaim.VersionIdentifier;
			warrantyClaim.CurrentVersionNumber = this.warrantyClaim.CurrentVersionNumber;
			warrantyClaim.CurrentVersionCategory = this.warrantyClaim.CurrentVersionCategory;
			
			var warrantyClaimItem = null;
			
			for (var i = 0; i < this.warrantyClaim.Parts.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Parts[i];
				warrantyClaimItem.Quantity = warrantyClaimItem.Quantity.toString();
				warrantyClaim.WarrantyClaimItems.push(warrantyClaimItem);
			}

			for (i = 0; i < this.warrantyClaim.Labour.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Labour[i];
				warrantyClaim.WarrantyClaimItems.push(warrantyClaimItem);
			}
			
			for (i = 0; i < this.warrantyClaim.Sublet.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Sublet[i];
				delete warrantyClaimItem.path;
				warrantyClaim.WarrantyClaimItems.push(warrantyClaimItem);
			}
			
			for (i = 0; i < this.warrantyClaim.Attachments.length; i++) {
				var attachment = this.warrantyClaim.Attachments[i];
				delete attachment.__metadata;
				delete attachment.URL;
				warrantyClaim.Attachments.push(attachment);
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
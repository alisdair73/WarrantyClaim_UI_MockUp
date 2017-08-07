sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/validationRules",
	"sap/ui/core/format/DateFormat"
], function(JSONModel,Rule, DateFormat) {
	"use strict";

	return {
		oDataModel: null,
		warrantyClaim: {},
		warrantyClaimOriginal: {},
		deletedParts: [],
		deletedLON: [],
		deletedSublet: [],
		
		createWarrantyClaimModel: function() {
			this.warrantyClaim = {
				"ClaimNumber": "",
				"PrecedingClaimNumber":"",
				"ClaimType": "",
				"ObjectType":"",
				"ExternalObjectNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"ExternalObjectDescription":"",
				"ExternalObjectModelCode":"",
				"MaterialDivision":"",
				"ClaimTypeDescription": "",
				"ClaimTypeGroup": "",
				"SalesOrganisation":"",
				"SubmittedOn":null,
				"Dealer":"",
				"DealerContact": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"EngineNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"AuthorisationNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"MCPN":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},	//For frontend only - sent to backend via the Parts collection
				"Description":"",		//For frontend only - sent to backend via the Parts collection
				"Quantity": "0",		//For frontend only - sent to backend via the Parts collection
				"PartRequested": "",	//For frontend only - sent to backend via the Parts collection
				"RecallNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"RepairOrderNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"TotalCostOfClaim":"0",
				"ClaimCurrency":"AUD",
				"DateOfRepair": { "value":null, "ruleResult":{"valid": true, "errorTextID":""}},
				"DateOfFailure": { "value":null, "ruleResult":{"valid": true, "errorTextID":""}},
				"FailureMeasure": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"MilIndicator": false,
				"DTC1": "",
				"DTC2": "",
				"DTC3": "",
				"Technician": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"ServiceAdvisor": { "value":"","ruleResult":{"valid": true, "errorTextID":""}},
				"OldSerialNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"NewSerialNumber": { "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"PartsInstallDate": { "value":null, "ruleResult":{"valid": true, "errorTextID":""}},
				"PartsInstallKm": { "value":"0", "ruleResult":{"valid": true, "errorTextID":""}},
				"PartsInstalledByDealer": false,
				"OriginalInvoiceNumber":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"DealerComments":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"DefectCode":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"CustomerConcern":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"SymptomCode":{ "value":"", "ruleResult":{"valid": true, "errorTextID":""}},
				"CurrentVersionNumber":"0001",
				"CurrentVersionCategory":"IC",
				"TotalMaterial":"0",
				"TotalExternalServices":"0",
				"TotalLabour":"0",
				"TotalHandling":"0",
				"TotalGST":"0",
				"StatusDescription":"",
				"StatusIcon":"",
				"CanEdit":true,
				"VersionIdentifier":null,
				"FixedSublet": false,
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
		
		updateWarrantyClaimFromJSONModel: function(jsonModel, validateMode){
		
			this.warrantyClaim.ClaimNumber = jsonModel.ClaimNumber;
			this.warrantyClaim.ClaimCurrency = jsonModel.ClaimCurrency;
			this.warrantyClaim.SubmittedOn = jsonModel.SubmittedOn;
			this.warrantyClaim.TotalMaterial = jsonModel.TotalMaterial;
			this.warrantyClaim.TotalExternalServices = jsonModel.TotalExternalServices;
			this.warrantyClaim.TotalLabour = jsonModel.TotalLabour;
			this.warrantyClaim.TotalHandling = jsonModel.TotalHandling;
			this.warrantyClaim.TotalGST = jsonModel.TotalGST;
			this.warrantyClaim.TotalCostOfClaim = jsonModel.TotalCostOfClaim;
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
            
            if(validateMode){
            	this.warrantyClaim.Labour = this.warrantyClaim.Labour.concat(this.deletedLON);
            	this.deletedLON = [];
                
                this.warrantyClaim.Parts = this.warrantyClaim.Parts.concat(this.deletedParts);
            	this.deletedParts = [];
            	
            	this.warrantyClaim.Sublet = this.warrantyClaim.Sublet.concat(this.deletedSublet);
            	this.deletedSublet = [];
            }
            
            this.resetChanges();
		},
		
		updateWarrantyClaimFromOdata: function(oServerOData) {
			
			var oSource = oServerOData.getSource ? oServerOData.getSource() : oServerOData;
			var oODataModel = oSource.getModel();
			var sPath = oSource.getPath();
			var oWarrantyClaim = oODataModel.getObject(sPath);

			this.warrantyClaim.ClaimNumber = oWarrantyClaim.ClaimNumber;
			this.warrantyClaim.PrecedingClaimNumber = oWarrantyClaim.PrecedingClaimNumber;
			this.warrantyClaim.ClaimType = oWarrantyClaim.ClaimType;
			this.warrantyClaim.ClaimTypeDescription = oWarrantyClaim.ClaimTypeDescription;
			this.warrantyClaim.ObjectType = oWarrantyClaim.ObjectType;
			this.warrantyClaim.ClaimTypeGroup = oWarrantyClaim.ClaimTypeGroup;
			this.warrantyClaim.SalesOrganisation = oWarrantyClaim.SalesOrganisation;
			this.warrantyClaim.DealerContact.value = oWarrantyClaim.DealerContact;
			this.warrantyClaim.EngineNumber.value = oWarrantyClaim.EngineNumber;
			this.warrantyClaim.AuthorisationNumber.value = oWarrantyClaim.AuthorisationNumber;
			this.warrantyClaim.ExternalObjectNumber.value = oWarrantyClaim.ExternalObjectNumber;
			this.warrantyClaim.ExternalObjectDescription = oWarrantyClaim.ExternalObjectDescription;
			this.warrantyClaim.ExternalObjectModelCode = oWarrantyClaim.ExternalObjectModelCode;
			this.warrantyClaim.MaterialDivision = oWarrantyClaim.MaterialDivision;
			this.warrantyClaim.SerialNumber = oWarrantyClaim.SerialNumber;
			this.warrantyClaim.RecallNumber.value = oWarrantyClaim.RecallNumber;
			this.warrantyClaim.RepairOrderNumber.value = oWarrantyClaim.RepairOrderNumber;
			this.warrantyClaim.TotalCostOfClaim = oWarrantyClaim.TotalCostOfClaim;
			this.warrantyClaim.ClaimCurrency = oWarrantyClaim.ClaimCurrency;
			this.warrantyClaim.SubmittedOn = oWarrantyClaim.SubmittedOn;
			this.warrantyClaim.DateOfRepair.value = oWarrantyClaim.DateOfRepair;
			this.warrantyClaim.DateOfFailure.value = oWarrantyClaim.DateOfFailure;
			this.warrantyClaim.FailureMeasure.value = oWarrantyClaim.FailureMeasure;
			this.warrantyClaim.MilIndicator = oWarrantyClaim.MilIndicator;
			this.warrantyClaim.DTC1 = oWarrantyClaim.DTC1;
			this.warrantyClaim.DTC2 = oWarrantyClaim.DTC2;
			this.warrantyClaim.DTC3 = oWarrantyClaim.DTC3;
			this.warrantyClaim.Technician.value = oWarrantyClaim.Technician;
			this.warrantyClaim.ServiceAdvisor.value = oWarrantyClaim.ServiceAdvisor;
			this.warrantyClaim.OldSerialNumber.value = oWarrantyClaim.OldSerialNumber;
			this.warrantyClaim.NewSerialNumber.value = oWarrantyClaim.NewSerialNumber;
			this.warrantyClaim.PartsInstallDate.value = oWarrantyClaim.PartsInstallDate;
			this.warrantyClaim.PartsInstallKm.value = oWarrantyClaim.PartsInstallKm;
			this.warrantyClaim.PartsInstalledByDealer = oWarrantyClaim.PartsInstalledByDealer;
			this.warrantyClaim.OriginalInvoiceNumber.value = oWarrantyClaim.OriginalInvoiceNumber;
			this.warrantyClaim.DealerComments.value = oWarrantyClaim.DealerComments;
			this.warrantyClaim.DefectCode.value = oWarrantyClaim.DefectCode;
			this.warrantyClaim.CustomerConcern.value = oWarrantyClaim.CustomerConcern;
			this.warrantyClaim.SymptomCode.value = oWarrantyClaim.SymptomCode;
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
			this.warrantyClaim.FixedSublet = oWarrantyClaim.FixedSublet;
			
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
			warrantyClaim.ObjectType = this.warrantyClaim.ObjectType;
			warrantyClaim.SalesOrganisation = this.warrantyClaim.SalesOrganisation;
			warrantyClaim.DealerContact = this.warrantyClaim.DealerContact.value;
			warrantyClaim.EngineNumber = this.warrantyClaim.EngineNumber.value;
			warrantyClaim.AuthorisationNumber = this.warrantyClaim.AuthorisationNumber.value;
			warrantyClaim.ExternalObjectNumber = this.warrantyClaim.ExternalObjectNumber.value;
			warrantyClaim.SerialNumber = this.warrantyClaim.SerialNumber;
			warrantyClaim.RecallNumber = this.warrantyClaim.RecallNumber.value;
			warrantyClaim.RepairOrderNumber = this.warrantyClaim.RepairOrderNumber.value;
			warrantyClaim.DateOfRepair = this.warrantyClaim.DateOfRepair.value;
			warrantyClaim.DateOfFailure = this.warrantyClaim.DateOfFailure.value;
			warrantyClaim.FailureMeasure = this.warrantyClaim.FailureMeasure.value.toString();
			warrantyClaim.MilIndicator = this.warrantyClaim.MilIndicator;
			warrantyClaim.DTC1 = this.warrantyClaim.DTC1;
			warrantyClaim.DTC2 = this.warrantyClaim.DTC2;
			warrantyClaim.DTC3 = this.warrantyClaim.DTC3;
			warrantyClaim.Technician = this.warrantyClaim.Technician.value;
			warrantyClaim.ServiceAdvisor = this.warrantyClaim.ServiceAdvisor.value;
			warrantyClaim.OldSerialNumber = this.warrantyClaim.OldSerialNumber.value;
			warrantyClaim.NewSerialNumber = this.warrantyClaim.NewSerialNumber.value;
			warrantyClaim.PartsInstallDate = this.warrantyClaim.PartsInstallDate.value;
			warrantyClaim.PartsInstallKm = this.warrantyClaim.PartsInstallKm.value;
			warrantyClaim.PartsInstalledByDealer = this.warrantyClaim.PartsInstalledByDealer;
			warrantyClaim.OriginalInvoiceNumber = this.warrantyClaim.OriginalInvoiceNumber.value;
			warrantyClaim.DealerComments = this.warrantyClaim.DealerComments.value;
			warrantyClaim.DefectCode = this.warrantyClaim.DefectCode.value;
			warrantyClaim.CustomerConcern = this.warrantyClaim.CustomerConcern.value;
			warrantyClaim.SymptomCode = this.warrantyClaim.SymptomCode.value;
			warrantyClaim.VersionIdentifier = this.warrantyClaim.VersionIdentifier;
			warrantyClaim.CurrentVersionNumber = this.warrantyClaim.CurrentVersionNumber;
			warrantyClaim.CurrentVersionCategory = this.warrantyClaim.CurrentVersionCategory;
			warrantyClaim.FixedSublet = this.warrantyClaim.FixedSublet;
			
			var warrantyClaimItem = null;
			
			this.deletedLON = this.warrantyClaim.Labour.filter(function(LONItem){
					return LONItem.Deleted;
				}
			);
				
			this.deletedParts = this.warrantyClaim.Parts.filter(function(Part){
					return Part.Deleted;
				}
			);
			
			this.deletedSublet = this.warrantyClaim.Sublet.filter(function(SubletItem){
					return SubletItem.Deleted;
				}
			);
				
			for (var i = 0; i < this.warrantyClaim.Parts.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Parts[i];
				warrantyClaimItem.Quantity = warrantyClaimItem.Quantity.toString();
				warrantyClaimItem.Description = "";
				
				//Don't send deleted items that aren't persisted
				if(warrantyClaimItem.Deleted === true && !warrantyClaimItem.ItemIdentifier){
				  continue;
				}
				warrantyClaim.WarrantyClaimItems.push(warrantyClaimItem);
			}

			for (i = 0; i < this.warrantyClaim.Labour.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Labour[i];
				warrantyClaimItem.Quantity = warrantyClaimItem.Quantity.toString();
				warrantyClaimItem.Description = "";
				
				//Don't send deleted items that aren't persisted
				if(warrantyClaimItem.Deleted === true && !warrantyClaimItem.ItemIdentifier){
				  continue;
				}
				warrantyClaim.WarrantyClaimItems.push(warrantyClaimItem);
			}
			
			for (i = 0; i < this.warrantyClaim.Sublet.length; i++) {
				warrantyClaimItem = this.warrantyClaim.Sublet[i];
				delete warrantyClaimItem.path;
				warrantyClaimItem.Quantity = warrantyClaimItem.Quantity.toString();
				warrantyClaimItem.Description = "";
				
				//Don't send deleted items that aren't persisted
				if(warrantyClaimItem.Deleted === true && !warrantyClaimItem.ItemIdentifier){
				  continue;
				}
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
		},

//		
//		Validation Rules
//
		validateExternalObjectNumber:function(){
			this.warrantyClaim.ExternalObjectNumber.ruleResult = 
				Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.ExternalObjectNumber.value); 
		},
		
		validateEngineNumber: function(){
			this.warrantyClaim.EngineNumber.ruleResult = 
				Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.EngineNumber.value);
		},
		
		validateFailureMeasure: function(){
			
			this.warrantyClaim.FailureMeasure.ruleResult = 
			  Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.FailureMeasure.value);
			
			if(this.warrantyClaim.FailureMeasure.ruleResult.valid){ 
				this.warrantyClaim.FailureMeasure.ruleResult = 
					Rule.validateFailureMeasure(this.warrantyClaim.FailureMeasure.value);  
			}
		},
	
		validateDateOfFailure: function(){
		
			//Convert the DateTime to Date
			if (this.warrantyClaim.DateOfFailure.value){
				this.warrantyClaim.DateOfFailure.value = this._convertDateTimeToDateOnly(this.warrantyClaim.DateOfFailure.value);
			
				this.warrantyClaim.DateOfFailure.ruleResult = 
					Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.DateOfFailure.value);
				
				if(this.warrantyClaim.DateOfFailure.ruleResult.valid){ 
					this.warrantyClaim.DateOfFailure.ruleResult = 
						Rule.validateDateIsNotFutureDate(this.warrantyClaim.DateOfFailure.value);
					if(this.warrantyClaim.DateOfFailure.ruleResult.valid){
						this.warrantyClaim.DateOfFailure.ruleResult = 
							Rule.validateFailureDate(this.warrantyClaim.DateOfFailure.value, this.warrantyClaim.DateOfRepair.value);
					}
				}
			} else {
				this.warrantyClaim.DateOfFailure.ruleResult = {"valid": false, "errorTextID":"mandatoryField"};
			}
		},

		validateDateOfRepair: function(){
		
			//Convert the DateTime to Date
			if (this.warrantyClaim.DateOfRepair.value){
				this.warrantyClaim.DateOfRepair.value = this._convertDateTimeToDateOnly(this.warrantyClaim.DateOfRepair.value);
			
				this.warrantyClaim.DateOfRepair.ruleResult = 
					Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.DateOfRepair.value);
				
				if(this.warrantyClaim.DateOfRepair.ruleResult.valid){ 
					this.warrantyClaim.DateOfRepair.ruleResult = 
						Rule.validateDateIsNotFutureDate(this.warrantyClaim.DateOfRepair.value);
					if(this.warrantyClaim.DateOfRepair.ruleResult.valid){
						this.warrantyClaim.DateOfRepair.ruleResult = 
							Rule.validateRepairDate(this.warrantyClaim.DateOfRepair.value, this.warrantyClaim.DateOfFailure.value);  
					}
				} 
			} else {
				this.warrantyClaim.DateOfRepair.ruleResult = {"valid": false, "errorTextID":"mandatoryField"};
			}
		},
			
		validateRepairOrderNumber: function(){
			this.warrantyClaim.RepairOrderNumber.ruleResult = 
				Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.RepairOrderNumber.value);
		},
		
		validateMainCausalPartNumber: function(){
			
			this.warrantyClaim.MCPN.ruleResult = 
				Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.MCPN.value);
		},
		
//			
//          Below rules vary based on Claim Type 			
//
		
		validateDealerContact: function(){
				
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					this.warrantyClaim.DealerContact.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.DealerContact.value);
					break;
			}
		},
		
		validateTechnician: function(){
				
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":	
					if(this.warrantyClaim.ClaimObjectType === "VELO"){ //Fields are hidden for Serial Numbers
						this.warrantyClaim.Technician.ruleResult =  
							Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.Technician.value);
						if(!this.warrantyClaim.Technician.ruleResult.valid){
							this.warrantyClaim.Technician.ruleResult.errorTextID = "invalidTechnician";
						}
					}		
					break;
			}
		},
			
		validateServiceAdvisor: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					if(this.warrantyClaim.ObjectType === "VELO"){ //Fields are hidden for Serial Numbers
						this.warrantyClaim.ServiceAdvisor.ruleResult =
							Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.ServiceAdvisor.value);
						if(!this.warrantyClaim.ServiceAdvisor.ruleResult.valid){
							this.warrantyClaim.ServiceAdvisor.ruleResult.errorTextID = "invalidAdvisor";
						}
					}
					break;
			}
		},
			
		validateCustomerConcern: function(){

			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					this.warrantyClaim.CustomerConcern.ruleResult =
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.CustomerConcern.value);
					break;
			}
		},
			
		validateSymptomCode: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					this.warrantyClaim.SymptomCode.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.SymptomCode.value);
					break;
			}
		},
			
		validateDealerComments: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					this.warrantyClaim.DealerComments.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.DealerComments.value);
					break;
			}
		},
			
		validateDefectCode: function(){

			switch(this.warrantyClaim.ClaimTypeGroup){
				case "NORMAL":
				case "GOODWILL":
				case "PARTS":
					this.warrantyClaim.DefectCode.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.DefectCode.value);
					break;
			}
		},
			
		validateAuthorisationNumber: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "GOODWILL":
					this.warrantyClaim.AuthorisationNumber.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.AuthorisationNumber.value);
					break;
			}
		},
			
		validatePartsInstallDate: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "PARTS":
					this.warrantyClaim.PartsInstallDate.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.PartsInstallDate.value);
					break;
			}
		},
			
		validatePartsInstallKM: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "PARTS":
					this.warrantyClaim.PartsInstallKm.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.PartsInstallKm.value);
					break;
			}
		},
			
		validateOriginalInvoiceNumber: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "PARTS":
					this.warrantyClaim.OriginalInvoiceNumber.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.OriginalInvoiceNumber.value);
					break;
			}
		},
			
		validateRecallNumber: function(){
			
			switch(this.warrantyClaim.ClaimTypeGroup){
				case "RECALL":
					this.warrantyClaim.RecallNumber.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.RecallNumber.value);
					break;
			}
		},
			
		validateOldSerialNumber: function(){
			
    		switch(this.warrantyClaim.ClaimTypeGroup){
				case "RECALL":
					this.warrantyClaim.OldSerialNumber.ruleResult = 
//						Rule.validateSerialNumbersArePopulated(this.warrantyClaim.OldSerialNumber.value);
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.OldSerialNumber.value);
					break;
			}
		},
			
		validateNewSerialNumber: function(){
			
    		switch(this.warrantyClaim.ClaimTypeGroup){
				case "RECALL":
					this.warrantyClaim.NewSerialNumber.ruleResult = 
						Rule.validateRequiredFieldIsPopulated(this.warrantyClaim.NewSerialNumber.value);
					break;
			}
		},
		
		validateAll: function() {

			this.validateExternalObjectNumber();
			this.validateEngineNumber();
			this.validateFailureMeasure();
			this.validateDateOfFailure();
			this.validateDateOfRepair();
			this.validateRepairOrderNumber();
			this.validateDealerContact();
			this.validateTechnician();
			this.validateServiceAdvisor();
			this.validateCustomerConcern();
			this.validateSymptomCode();
			this.validateDealerComments();
			this.validateDefectCode();
			this.validateAuthorisationNumber();
			this.validatePartsInstallDate();
			this.validatePartsInstallKM();
			this.validateOriginalInvoiceNumber();
			this.validateRecallNumber();
			this.validateOldSerialNumber();
			this.validateNewSerialNumber();
			this.validateMainCausalPartNumber();
		},
		
		hasFrontendValidationError: function(){
			
			if(this.warrantyClaim.ExternalObjectNumber.ruleResult.valid &&
				this.warrantyClaim.EngineNumber.ruleResult.valid &&
				this.warrantyClaim.FailureMeasure.ruleResult.valid &&
				this.warrantyClaim.DateOfFailure.ruleResult.valid &&
				this.warrantyClaim.DateOfRepair.ruleResult.valid &&
				this.warrantyClaim.RepairOrderNumber.ruleResult.valid && 
				this.warrantyClaim.DealerContact.ruleResult.valid &&
				this.warrantyClaim.Technician.ruleResult.valid &&
				this.warrantyClaim.ServiceAdvisor.ruleResult.valid &&
				this.warrantyClaim.CustomerConcern.ruleResult.valid &&
				this.warrantyClaim.SymptomCode.ruleResult.valid &&
				this.warrantyClaim.DealerComments.ruleResult.valid && 
				this.warrantyClaim.DefectCode.ruleResult.valid &&
				this.warrantyClaim.AuthorisationNumber.ruleResult.valid &&
				this.warrantyClaim.PartsInstallDate.ruleResult.valid &&
				this.warrantyClaim.PartsInstallKm.ruleResult.valid && 
				this.warrantyClaim.OriginalInvoiceNumber.ruleResult.valid &&
				this.warrantyClaim.RecallNumber.ruleResult.valid &&
				this.warrantyClaim.OldSerialNumber.ruleResult.valid && 
				this.warrantyClaim.NewSerialNumber.ruleResult.valid &&
				this.warrantyClaim.MCPN.ruleResult.valid){
				
				return false;		
			} 
			return true;
		},
		
		_convertDateTimeToDateOnly: function(dateTime) {
			
			var dateTemplate = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-ddTKK:mm:ss"
			});
			var formattedDateTime = dateTemplate.format(dateTime);
			formattedDateTime  = formattedDateTime.split("T");
			var formattedDate = formattedDateTime[0];
			return new Date(formattedDate);
		}
	};
});
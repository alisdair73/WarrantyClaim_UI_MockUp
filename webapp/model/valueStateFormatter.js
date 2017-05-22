sap.ui.define([
	"WarrantyClaim_MockUp/model/validationRules"], function(Rule) {
	"use strict";
	
		return {
			
			failureMeasure: function(failureMeasure){
				if(Rule.validateRequiredFieldIsPopulated(failureMeasure, "FailureMeasure", this.getView())){ 
					return Rule.validateFailureMeasure(failureMeasure, this.getView()) ? "None" : "Error";  
				} else {
					return "Error";
				}
			},
	
			failureDate: function(failureDate){
				if(Rule.validateRequiredFieldIsPopulated(failureDate, "DateOfFailure", this.getView())){ 
					if(Rule.validateDateIsNotFutureDate(failureDate, "DateOfFailure", this.getView())){
						return Rule.validateFailureDate(failureDate, this.getView()) ? "None" : "Error";
					}
				}
				return "Error";
			},
			
			repairDate: function(repairDate){
				if(Rule.validateRequiredFieldIsPopulated(repairDate, "DateOfRepair", this.getView())){ 
					if(Rule.validateDateIsNotFutureDate(repairDate, "DateOfRepair", this.getView())){
						return Rule.validateRepairDate(repairDate, this.getView()) ? "None" : "Error";  
					}
				}
				return "Error";
			},
			
			vin: function(vin){
				return Rule.validateRequiredFieldIsPopulated(vin, "VIN", this.getView()) ? "None" : "Error"; 
			},
			
			engineNumber: function(engineNumber){
				return Rule.validateRequiredFieldIsPopulated(engineNumber, "EngineNumber", this.getView()) ? "None" : "Error"; 
			},
			
			repairOrderNumber: function(repairOrderNumber){
				return Rule.validateRequiredFieldIsPopulated(repairOrderNumber, "RepairOrderNumber", this.getView()) ? "None" : "Error";
			},

//			
//          Below Formatters vary based on Claim Type 			
//

			dealerContact: function(dealerContact, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(dealerContact, "DealerContact", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			technician: function(technician, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":	
						return Rule.validateRequiredFieldIsPopulated(technician, "Technician", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			serviceAdvisor: function(serviceAdvisor, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(serviceAdvisor, "ServiceAdvisor", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			customerConcern: function(customerConcern, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(customerConcern, "CustomerConcern", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			symptomCodeL1: function(symptomCodeL1, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(symptomCodeL1, "symptomCodeL1", 
							this.getView(), "ViewHelper", "/warrantyUI/symptomCodeL1") ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			symptomCodeL2: function(symptomCodeL2, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(symptomCodeL2, "symptomCodeL2", 
							this.getView(), "ViewHelper", "/warrantyUI/symptomCodeL2") ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			symptomCodeL3: function(symptomCodeL3, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(symptomCodeL3, "SymptomCode", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			dealerComments: function(dealerComments, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(dealerComments, "DealerComments", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			defectCodeL1: function(defectCodeL1, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(defectCodeL1, "defectCodeL1", 
							this.getView(), "ViewHelper", "/warrantyUI/defectCodeL1") ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			defectCodeL2: function(defectCodeL2, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(defectCodeL2, "DefectCode", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			pwa: function(pwa, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "GOODWILL":
						return Rule.validateRequiredFieldIsPopulated(pwa, "AuthorisationNumber", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			installDate: function(installDate, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(installDate, "PartsInstallDate", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			installKM: function(installKM, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(installKM, "PartsInstallKM", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			invoiceNumber: function(invoiceNumber, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "PARTS":
						return Rule.validateRequiredFieldIsPopulated(invoiceNumber, "OriginalInvoiceNumber", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			recallNumber: function(recallNumber, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "RECALL":
						return Rule.validateRequiredFieldIsPopulated(recallNumber, "RecallNumber", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			oldSerialNumber: function(oldSerialNumber, claimTypeGroup){
				
	    		switch(claimTypeGroup){
					case "RECALL":
						return Rule.validateSerialNumbersArePopulated(oldSerialNumber, "OldSerialNumber", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			newSerialNumber: function(newSerialNumber, claimTypeGroup){

	    		switch(claimTypeGroup){
					case "RECALL":
						return Rule.validateSerialNumbersArePopulated(newSerialNumber, "NewSerialNumber", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			}
		};
	}
);
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
						return Rule.validateRequiredFieldIsPopulated(dealerContact, "DealerContact", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			technician: function(technician, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
						return Rule.validateRequiredFieldIsPopulated(technician, "Technician", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			serviceAdvisor: function(serviceAdvisor, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
						return Rule.validateRequiredFieldIsPopulated(serviceAdvisor, "ServiceAdvisor", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			customerConcern: function(customerConcern, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
						return Rule.validateRequiredFieldIsPopulated(customerConcern, "CustomerConcern", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			symptomCodeL1: function(symptomCodeL1, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
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
						return Rule.validateRequiredFieldIsPopulated(symptomCodeL3, "SymptomCode", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			dealerComments: function(dealerComments, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
						return Rule.validateRequiredFieldIsPopulated(dealerComments, "DealerComments", this.getView()) ? "None" : "Error";
					default:
						return "None";
				}
			},
			
			defectCodeL1: function(defectCodeL1, claimTypeGroup){
				
				switch(claimTypeGroup){
					case "NORMAL":
					case "GOODWILL":
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
			
		};
	}
);
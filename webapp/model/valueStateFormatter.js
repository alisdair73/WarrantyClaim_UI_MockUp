sap.ui.define([
	"WarrantyClaim_MockUp/model/validationRules"], function(Rule) {
	"use strict";
	
		return {
			
			failureKM: function(failureKM){
				return Rule.validateFailureKM(failureKM, this.getView()) ? "None" : "Error";          
			},
	
			failureDate: function(failureDate){
				return Rule.validateFailureDate(failureDate, this.getView()) ? "None" : "Error";          
			},
			
			repairDate: function(repairDate){
				return Rule.validateRepairDate(repairDate, this.getView()) ? "None" : "Error";          
			}
			
			
		};
	}
);

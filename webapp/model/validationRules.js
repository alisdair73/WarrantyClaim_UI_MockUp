sap.ui.define([], function() {
	"use strict";

	return {

		validateFailureDate: function(failureDate,repairDate) {
			
			var validated = true;
			
			if(failureDate && repairDate){
				
				var dateOfRepair = new Date(repairDate.getFullYear(),repairDate.getMonth(), repairDate.getDate());
				var dateOfFailure = new Date(failureDate.getFullYear(), failureDate.getMonth(), failureDate.getDate());				
				
				if (dateOfFailure.valueOf() >= dateOfRepair.valueOf()){
					validated = false;
				}
			}
			return validated;
		},
		
		validateRepairDate: function(repairDate, failureDate) {
			
			var validated = true;
			
			if(repairDate && failureDate){
				
				var dateOfRepair = new Date(repairDate.getFullYear(), repairDate.getMonth(), repairDate.getDate());
				var dateOfFailure = new Date(failureDate.getFullYear(), failureDate.getMonth(), failureDate.getDate());
				
				if (dateOfRepair.valueOf() < dateOfFailure.valueOf()){
					validated = false;
				}
			}
			return validated;
		},
		
//		Failure KM - Must be between 0 and 1000000
		validateFailureMeasure: function(failureKMValue){

			var validated = true;

			if(failureKMValue && failureKMValue !== ""){
				if (failureKMValue <= 0 || failureKMValue >= 1000000){
					validated = false;
				}
			}
			
			return validated; 
		},
		
		validateDateIsNotFutureDate: function(fieldValue){
			
			var now = new Date();   
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
			var dateToValidate = new Date(fieldValue.getFullYear(), fieldValue.getMonth(), fieldValue.getDate());
			
			var validated = true;

			if(fieldValue){
				
				if(dateToValidate.valueOf() > today.valueOf()){
					validated = false;
				}
			}
			return validated;
		},
		
		validateRequiredFieldIsPopulated: function(fieldValue){
			
			if (fieldValue){
				if (fieldValue !== ""){
                  return true;
				}
			}
			return false;
		},
		
		validateSerialNumbersArePopulated: function(fieldValue){

/*			if(view.getModel("ViewHelper").getProperty("/warrantyUI/serialNumberIsMandatory")){
				if (fieldValue){
					if (fieldValue !== ""){
	                  return true;
					}
				}
				
				_addErrorMessageToMessageManager(
					"UI_" + fieldId,
					view.getModel("WarrantyClaim"),
					view.getModel("i18n").getResourceBundle().getText("recallSerialNumber"),
					"/" + fieldId
				);
				
				return false;
			} else{
				return true;
			}*/
		}
	};

});
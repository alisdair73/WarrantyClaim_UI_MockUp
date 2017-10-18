sap.ui.define([], function() {
	"use strict";

	return {
		
		failureDateIsInRecallValidity: function(failureDate, recallValidFromDate, recallValidToDate){
			
			var validated = true;
			
			var dateOfFailure = new Date(failureDate.getFullYear(),failureDate.getMonth(), failureDate.getDate());
			var dateRecallValidFrom = new Date(recallValidFromDate.getFullYear(),recallValidFromDate.getMonth(), recallValidFromDate.getDate());
			var dateRecallValidTo = new Date(recallValidToDate.getFullYear(),recallValidToDate.getMonth(), recallValidToDate.getDate());
			
			if (dateOfFailure.valueOf() < dateRecallValidFrom.valueOf() || dateOfFailure.valueOf() > dateRecallValidTo.valueOf()){
				validated = false;
			}
			
			return {"valid": validated, "errorTextID":"RecallNotValidForFailureDate"};
			
		},

		validateFailureDate: function(failureDate,repairDate) {
			
			var validated = true;
			
			if(failureDate && repairDate){
				
				var dateOfRepair = new Date(repairDate.getFullYear(),repairDate.getMonth(), repairDate.getDate());
				var dateOfFailure = new Date(failureDate.getFullYear(), failureDate.getMonth(), failureDate.getDate());				
				
				if (dateOfFailure.valueOf() > dateOfRepair.valueOf()){
					validated = false;
				}
			}
			return {"valid": validated, "errorTextID":"DateOfFailure"};
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
			return {"valid": validated, "errorTextID":"DateOfRepair"};
		},
		
//		Failure KM - Must be between 0 and 1000000
		validateFailureMeasure: function(failureKMValue){

			var validated = true;

			if(failureKMValue && failureKMValue !== ""){
				if (failureKMValue <= 0 || failureKMValue >= 1000000){
					validated = false;
				}
			}
			
			return {"valid": validated, "errorTextID":"FailureMeasure_BadRange"};
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
			return {"valid": validated, "errorTextID":"noFutureDates"};
		},
		
		validateRequiredFieldIsPopulated: function(fieldValue){
			
			var validated = false;
			
			if (fieldValue){
				if (fieldValue !== ""){
                  validated = true;
				}
			}
			return {"valid": validated, "errorTextID":"mandatoryField"};
		},

		validateQuantityIsGreaterThanZero: function(quantity){
			
			return {"valid": quantity > 0 ? true:false, "errorTextID":"otherPartQuantity"};
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
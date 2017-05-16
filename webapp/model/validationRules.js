sap.ui.define([
		"sap/ui/core/message/Message",
		"WarrantyClaim_MockUp/model/WarrantyClaim"
	], function(Message, WarrantyClaim) {
	"use strict";
	
//  Private Functions
	var	_doesMessageExistInMessageManager = function (messageID){
			var registeredMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(
  				function(registeredMessage){
					return registeredMessage.id === messageID;
				}
			);
    		
    		if(registeredMessages.length > 0){
    			return registeredMessages[0];
    		}  
	};	
	
	var	_removeErrorMessageFromMessageManager = function(messageID){
			
			var message = _doesMessageExistInMessageManager(messageID);
			if(message){
				sap.ui.getCore().getMessageManager().removeMessages(message);
			}
	};
		
	var	_addErrorMessageToMessageManager = function(messageID, messageProcessor, messageText, messageTarget){
			
			if( !_doesMessageExistInMessageManager(messageID)){
			
				var message = new Message({
					"id": messageID,
	            	"message": messageText,
	                "type": 'Error',
	                "target": messageTarget,
	                "processor": messageProcessor
	        	});
      			sap.ui.getCore().getMessageManager().addMessages(message);
			}
	};

	return {

		validateFailureDate: function(failureDate,view) {
			
			var validated = true;
			_removeErrorMessageFromMessageManager("DateOfFailure");
			
			if(failureDate && WarrantyClaim.warrantyClaim.DateOfRepair){
				
				var dateOfRepair = new Date(WarrantyClaim.warrantyClaim.DateOfRepair.getFullYear(), 
					WarrantyClaim.warrantyClaim.DateOfRepair.getMonth(), WarrantyClaim.warrantyClaim.DateOfRepair.getDate());
				var dateOfFailure = new Date(failureDate.getFullYear(), failureDate.getMonth(), failureDate.getDate());				
				
				if (dateOfFailure.valueOf() >= dateOfRepair.valueOf()){
					_addErrorMessageToMessageManager(
						"DateOfFailure",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("DateOfFailure"),
						"/DateOfFailure"
					);
					validated = false;
				}
			}
			return validated;
		},
		
		validateRepairDate: function(repairDate,view) {
			
			var validated = true;
			_removeErrorMessageFromMessageManager("DateOfRepair");
			
			if(repairDate && WarrantyClaim.warrantyClaim.DateOfFailure){
				
				var dateOfRepair = new Date(repairDate.getFullYear(), repairDate.getMonth(), repairDate.getDate());
				var dateOfFailure = new Date(WarrantyClaim.warrantyClaim.DateOfFailure.getFullYear(), 
					WarrantyClaim.warrantyClaim.DateOfFailure.getMonth(), WarrantyClaim.warrantyClaim.DateOfFailure.getDate());
				
				if (dateOfRepair.valueOf() <= dateOfFailure.valueOf()){
					_addErrorMessageToMessageManager(
						"DateOfRepair",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("DateOfRepair"),
						"/DateOfRepair"
					);
					validated = false;
				}
			}
			return validated;
		},
		
//		Failure KM - Must be between 0 and 1000000
		validateFailureMeasure: function(failureKMValue, view){

			var validated = true;
			_removeErrorMessageFromMessageManager("FailureMeasure");

			if(failureKMValue && failureKMValue !== ""){
				if (failureKMValue <= 0 || failureKMValue >= 1000000){
					
					_addErrorMessageToMessageManager(
						"FailureMeasure",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("FailureMeasure_BadRange"),
						"/FailureMeasure"
					);
					validated = false;
				}
			}
			
			return validated; 
		},
		
		validateDateIsNotFutureDate: function(fieldValue, fieldId, view){
			
			var now = new Date();   
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
			var dateToValidate = new Date(fieldValue.getFullYear(), fieldValue.getMonth(), fieldValue.getDate());
			
			var validated = true;
			_removeErrorMessageFromMessageManager(fieldId);
			
			if(fieldValue){
				
				if(dateToValidate.valueOf() > today.valueOf()){
					_addErrorMessageToMessageManager(
						fieldId,
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("noFutureDates",[view.byId(fieldId + "_label").getText()]),
						"/" + fieldId
					);
					validated = false;
				}
			}
			return validated;
		},
		
		validateRequiredFieldIsPopulated: function(fieldValue, fieldId, view, processor, target){
			
			_removeErrorMessageFromMessageManager(fieldId);
			
			if (fieldValue){
				if (fieldValue !== ""){
                  return true;
				}
			}
			
			var messageProcessor = processor ? view.getModel(processor) : view.getModel("WarrantyClaim"); 
			var messageTarget = target ? target : "/" + fieldId; 
			
			_addErrorMessageToMessageManager(
				fieldId,
				messageProcessor,
				view.getModel("i18n").getResourceBundle().getText("mandatoryField",[view.byId(fieldId + "_label").getText()]),
				messageTarget
			);
			
			return false;
		}
	};

});
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
			_removeErrorMessageFromMessageManager("failureDate");
			
			if(failureDate && WarrantyClaim.warrantyClaim.DateOfRepair){
				if (failureDate.valueOf() > WarrantyClaim.warrantyClaim.DateOfRepair.valueOf()){
					_addErrorMessageToMessageManager(
						"failureDate",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("failureDate"),
						"/DateOfFailure"
					);
					validated = false;
				}
			}
			return validated;
		},
		
		validateRepairDate: function(repairDate,view) {
			
			var validated = true;
			_removeErrorMessageFromMessageManager("repairDate");
			
			if(repairDate && WarrantyClaim.warrantyClaim.DateOfFailure){
				if (repairDate.valueOf() <= WarrantyClaim.warrantyClaim.DateOfFailure.valueOf()){
					_addErrorMessageToMessageManager(
						"repairDate",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("repairDate"),
						"/DateOfRepair"
					);
					validated = false;
				}
			}
			return validated;
		},
		
//		Failure KM - Must be between 0 and 1000000
		validateFailureKM: function(failureKMValue, view){

			var validated = true;
			_removeErrorMessageFromMessageManager("failureKM");

			if(failureKMValue && failureKMValue !== ""){
				if (failureKMValue <= 0 || failureKMValue >= 1000000){
					
					_addErrorMessageToMessageManager(
						"failureKM",
						view.getModel("WarrantyClaim"),
						view.getModel("i18n").getResourceBundle().getText("failureKM"),
						"/FailureMeasure"
					);
					validated = false;
				}
			}
			
			return validated; 
		}
	};

});
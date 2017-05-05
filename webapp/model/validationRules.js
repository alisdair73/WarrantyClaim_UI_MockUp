sap.ui.define(["sap/ui/core/message/Message"], function(Message) {
	"use strict";
	
	return {

		validateFailureDate: function(failureDate,repairDate) {
			
			var newMessage = new Message({id: "repairDateError"});
			if(failureDate && repairDate){
				if (failureDate.valueOf() > repairDate.valueOf()){
					
					newMessage.message = "Failure Date cannot be after the Repair Date";
                	newMessage.type = "Error";
               		newMessage.target = "/DateOfFailure";
                	newMessage.processor = this.getView().getModel("WarrantyClaim");
//            		sap.ui.getCore().getMessageManager().addMessages(newMessage);
            		
					return "Error";
				} else {
//					sap.ui.getCore().getMessageManager().removeMessages(newMessage);
					return "None";
				}
			} else {
			//	sap.ui.getCore().getMessageManager().removeMessages(newMessage);
				return "None";
			}
		},
		
		validateFailureKM: function(failureKM){
			if(failureKM){
				if(failureKM > 0 && failureKM < 1000000){
					return "None";
				} else {
					
					var newMessage = new Message({
            			message: "Failure KM must be between 0 and 1000000",
 //               		description: "Description",
 //             		additionalText: "Add Text",
                		type: "Error",
 //               		target: "/FailureMeasure",
                		processor: this.getView().getModel("WarrantyClaim")
        			});
            		sap.ui.getCore().getMessageManager().addMessages(newMessage);
					
					return "Error";
				}
			} else {
				return "None";
			}
		},
		
		_addErrorMessage: function(){
			var newMessage = new Message({
            	message: "My generated error message",
                description: "Description",
 //               additionalText: "Add Text",
                type: 'Error',
                target: "/FailureMeasure",
                processor: this.getView().getModel("WarrantyClaim")
        	});
            		sap.ui.getCore().getMessageManager().addMessages(newMessage);
		}
	};

});
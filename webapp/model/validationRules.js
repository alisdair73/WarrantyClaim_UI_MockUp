sap.ui.define([], function() {
	"use strict";

	return {

		validateFailureDate: function(failureDate,repairDate) {
			
			if(failureDate && repairDate){
				
				if (failureDate.valueOf() > repairDate.valueOf()){
					return "Error";
				} else {
					return "None";
				}
			} else {
				return "None";
			}
		}
	};

});
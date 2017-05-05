(function(){
sap.ui.define([
	"sap/ui/model/type/Date",
	"sap/ui/model/ValidateException",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
	], function(DateType,Exception,WarrantyClaim) {
	"use strict";
	
	return DateType.extend("type.FailureDate", {
		
		formatValue: function(sValue,sInternalType){
			return DateType.prototype.formatValue.apply(this, arguments);
		},
		
		parseValue: function(sValue, sInternalType){
			return DateType.prototype.parseValue.apply(this, arguments);
		},
		
		validateValue: function(sValue){
			
			var repairDate =  WarrantyClaim.warrantyClaim.DateOfRepair;
			if (repairDate){
				if (sValue.valueOf() > repairDate.valueOf()){
					throw new Exception("Failure Date cannot be after the Repair Date");
				}
			}
		}
	});
});
})();
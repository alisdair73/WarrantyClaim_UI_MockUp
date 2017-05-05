(function(){
sap.ui.define([
	"sap/ui/model/type/Integer",
	"sap/ui/model/ValidateException"
	], function(IntegerType,Exception) {
	"use strict";
	
	return IntegerType.extend("type.FailureDistance", {
		
		formatValue: function(sValue,sInternalType){
			if(sValue !== ""){
				return IntegerType.prototype.formatValue.apply(this, arguments);
			}
		},
		
		parseValue: function(sValue, sInternalType){
			if(sValue !== ""){
				return IntegerType.prototype.parseValue.apply(this, arguments);
			}
		},
		
		validateValue: function(sValue){
			if(!isNaN(sValue)){
				if(sValue > 0 && sValue < 1000000){
//					OK
				} else {
					throw new Exception("Failure Distance must be between 0 and 1,000,000 KM");
				}
			}
		}
	});
});
})();

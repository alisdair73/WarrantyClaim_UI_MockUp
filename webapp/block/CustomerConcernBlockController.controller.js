sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(Controller, JSONModel, theToaster) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.CustomerConcernBlockController", {

    showSymptomsSelector: function(){
    	
		if (! this._oSymptomsSelector) {
			this._oSymptomsSelector = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SymptomCodeSelector", this);
		}
		var modulePath = jQuery.sap.getModulePath("WarrantyClaim_MockUp");
		var oSymptomCodesModel = new JSONModel(modulePath + "/model/SymptomCodes.json");
		
        this._oSymptomsSelector.setModel(oSymptomCodesModel,"SymptomCodes");
		this._oSymptomsSelector.open();    	
    },
    
    symptomCodeSelected: function(evt){
    	
    	if(evt.getParameter("cellControl").getBindingContext("SymptomCodes")){
    		theToaster.show("You have chosen " + 
				evt.getParameter("cellControl").getBindingContext("SymptomCodes").getObject().Name +
				"(" + evt.getParameter("cellControl").getBindingContext("SymptomCodes").getObject().Code + ")" );	
    	}
    	
		this._oSymptomsSelector.close();
    }
    
	});

});
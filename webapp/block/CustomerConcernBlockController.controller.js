sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.CustomerConcernBlockController", {

		onInit: function(){
		},


    showSymptomsSelector: function(){
    	
		if (! this._oSymptomsSelector) {
			this._oSymptomsSelector = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SymptomCodeSelector", this);
			
			//Load the Symptom Catalog from the backend
			this.getView().getModel().read(
				"/JSONFeedCollection('ZSYM1')/$value",
				{
					success: function(JSONData){
						var oSymptomCodesModel = new JSONModel(JSON.parse(JSONData));
						
						this._oSymptomsSelector.setModel(oSymptomCodesModel,"SymptomCodes");
					}.bind(this),
					error: function(error){
						
					}
				}
			);			
		} 
		
		this._oSymptomsSelector.open(); 
		
/*		var modulePath = jQuery.sap.getModulePath("WarrantyClaim_MockUp");
		var oSymptomCodesModel = new JSONModel(modulePath + "/model/SymptomCodes.json");*/
    }
    
 /*   symptomCodeSelected: function(evt){
    	
    	if(evt.getParameter("cellControl").getBindingContext("SymptomCodes")){
    		theToaster.show("You have chosen " + 
				evt.getParameter("cellControl").getBindingContext("SymptomCodes").getObject().Name +
				"(" + evt.getParameter("cellControl").getBindingContext("SymptomCodes").getObject().Code + ")" );	
    	}
    	
		this._oSymptomsSelector.close();
    }*/
    
	});

});
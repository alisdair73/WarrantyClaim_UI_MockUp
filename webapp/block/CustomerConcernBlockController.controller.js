sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.CustomerConcernBlockController", {

    showSymptomsSelector: function(){
    	
    	
		if (! this._symptomSelector) {
			this._symptomSelector = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SymptomCodeSelector", this);
			this.getView().addDependent(this._symptomSelector);
			this.getModel("ViewHelper").setProperty("/busy", true);
			this.readCatalog("ZSYM1","SymptomCodes");
		} 
		this._symptomSelector.open(); 
    },
    
    handleCancel: function(){
    	this._symptomSelector.close(); 
    },
    
    symptomCodeSelected: function(evt){
    	
    	var path = evt.getParameter("listItem").getBindingContext("SymptomCodes").getPath();
    	var symptom = this.getView().getModel("SymptomCodes").getProperty(path);
    	this.getModel("WarrantyClaim").setProperty("/SymptomCode",symptom.code);
    	this.getModel("ViewHelper").setProperty("/warrantyUI/SymptomCodeDescription", symptom.text);

		this._symptomSelector.close();
    }
    
	});

});
sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, JSONModel, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.CustomerConcernBlockController", {
		
		onInit: function(){
			
			this.setModel(new JSONModel({
				"SymptomsL2":[],
				"SymptomsL3":[]
			}) , "SymptomCodesHelper");
			
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","LoadCatalogForMaterialDivision",this._loadSymptomCatalog,this);
			sap.ui.getCore().getEventBus().subscribe("SymptomCodes","CatalogLoaded",this._symptomCatalogLoaded,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","LoadCatalogForMaterialDivision",this._loadSymptomCatalog,this);
			sap.ui.getCore().getEventBus().unsubscribe("SymptomCodes","CatalogLoaded",this._symptomCatalogLoaded,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onSymptomCodeSelectedL1: function(oEvent){
			this._updateL2Symptoms(oEvent.getParameter("selectedItem").mProperties.key);
			
			this.getModel("WarrantyClaim").setProperty("/SymptomCode/value","");
			WarrantyClaim.validateSymptomCode();
			this.logValidationMessage("SymptomCode");
			
			this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL2","");
		},
		
		onSymptomCodeSelectedL2: function(oEvent){
			this._updateL3Symptoms(oEvent.getParameter("selectedItem").mProperties.key);
			
			this.getModel("WarrantyClaim").setProperty("/SymptomCode/value","");
			WarrantyClaim.validateSymptomCode();
			this.logValidationMessage("SymptomCode");
			
		},
		
		onCustomerConcernChanged: function() {
			WarrantyClaim.validateCustomerConcern();
			this.logValidationMessage("CustomerConcern");
		},
		
		onSymptomCodeChanged: function(){
			WarrantyClaim.validateSymptomCode();
			this.logValidationMessage("SymptomCode");
		},
		
		_loadSymptomCatalog: function(sChannelId, sEventId, oData){
			this.readSymptomCatalog();
		},
		
		_symptomCatalogLoaded: function(sChannelId, sEventId, oData){

			//A Catalog has been loaded - Set relevant collections
			if(this.getModel("WarrantyClaim").getProperty("/SymptomCode/value")){
				var symptomCodeLevels = this.getModel("WarrantyClaim").getProperty("/SymptomCode/value").split("-");
				this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL1",symptomCodeLevels[0]);
				this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL2",symptomCodeLevels[0] + '-' + symptomCodeLevels[1]);
				this._updateL2Symptoms(this.getModel("ViewHelper").getProperty("/warrantyUI/symptomCodeL1"));
				this._updateL3Symptoms(this.getModel("ViewHelper").getProperty("/warrantyUI/symptomCodeL2"));
			}
		},

		_updateL2Symptoms: function(level1Code){
			
			var symptomCatalog = this.getModel("SymptomCodes").getData();

			for(var i=0; i< symptomCatalog.length; i++){
			  if (symptomCatalog[i].code === level1Code){
			    this.getModel("SymptomCodesHelper").setProperty("/SymptomsL2",symptomCatalog[i].nodes);
			    this.getModel("SymptomCodesHelper").setProperty("/SymptomsL3",[]);
			    return;
			  }
			}
		},
		
		_updateL3Symptoms: function(level2Code){
			
			var symptomCatalog = this.getModel("SymptomCodesHelper").getProperty("/SymptomsL2");

			for(var i=0; i< symptomCatalog.length; i++){
			  if (symptomCatalog[i].code === level2Code){
			    this.getModel("SymptomCodesHelper").setProperty("/SymptomsL3",symptomCatalog[i].nodes);
			    return;
			  }
			}
		},
		
    	_refreshValidationMessages: function(){
			this.logValidationMessage("SymptomCode");
			this.logValidationMessage("CustomerConcern");
    	}
	});

});
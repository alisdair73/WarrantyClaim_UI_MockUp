sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.CustomerConcernBlockController", {
		
		onInit: function(){
			
			this.setModel(new JSONModel({
				"SymptomsL2":[],
				"SymptomsL3":[]
			}) , "SymptomCodesHelper");
			
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("ZSYM1","CatalogLoaded",this._symptomCatalogLoaded.bind(this),this);
		},
		
		readSymptomCatalog: function(){
			this.readCatalog("ZSYM1","SymptomCodes");
		},
		
		onSymptomCodeSelectedL1: function(oEvent){
			this._updateL2Symptoms(oEvent.getParameter("selectedItem").mProperties.key);
			this.getModel("WarrantyClaim").setProperty("/SymptomCode","");
			this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL2","");
		},
		
		onSymptomCodeSelectedL2: function(oEvent){
			this._updateL3Symptoms(oEvent.getParameter("selectedItem").mProperties.key);
			this.getModel("WarrantyClaim").setProperty("/SymptomCode","");
		},
		
		_symptomCatalogLoaded: function(sChannelId, sEventId, oData){
			if(this.getModel("WarrantyClaim").getProperty("/SymptomCode")){
				var symptomCodeLevels = this.getModel("WarrantyClaim").getProperty("/SymptomCode").split("-");
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
		}
	});

});
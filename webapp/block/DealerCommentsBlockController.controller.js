sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.DealerCommentsBlockController", {

		onInit: function(){
			
			this.setModel(new JSONModel({
				"DefectsL2":[]
			}) , "DefectCodesHelper");
			
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("ZDEF1","CatalogLoaded",this._defectCatalogLoaded.bind(this),this);
		},
		
		readDefectCatalog: function(){
			this.readCatalog("ZDEF1","DefectCodes",2);
		},
		
		onDefectCodeSelectedL1: function(oEvent){
			this._updateL2Defects(oEvent.getParameter("selectedItem").mProperties.key);
			this.getModel("WarrantyClaim").setProperty("/DefectCode","");
		},		
		
		_defectCatalogLoaded: function(sChannelId, sEventId, oData){
			if(this.getModel("WarrantyClaim").getProperty("/DefectCode")){
				var defectCodeLevels = this.getModel("WarrantyClaim").getProperty("/DefectCode").split("-");
				this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1",defectCodeLevels[0]);
				this._updateL2Defects(this.getModel("ViewHelper").getProperty("/warrantyUI/defectCodeL1"));
			}
		},
		
		_updateL2Defects: function(level1Code){
			
			var defectCatalog = this.getModel("DefectCodes").getData();

			for(var i=0; i< defectCatalog.length; i++){
			  if (defectCatalog[i].code === level1Code){
			    this.getModel("DefectCodesHelper").setProperty("/DefectsL2",defectCatalog[i].nodes);
			    return;
			  }
			}			
		}
	});

});
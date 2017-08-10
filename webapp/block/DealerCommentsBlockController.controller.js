sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, JSONModel, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.DealerCommentsBlockController", {


		onInit: function(){
			
			this.setModel(new JSONModel({
				"DefectsL2":[]
			}) , "DefectCodesHelper");
			
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","LoadCatalogForMaterialDivision",this._loadDefectCatalog,this);
			sap.ui.getCore().getEventBus().subscribe("DefectCodes","CatalogLoaded",this._defectCatalogLoaded,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","LoadCatalogForMaterialDivision",this._loadDefectCatalog,this);
			sap.ui.getCore().getEventBus().unsubscribe("DefectCodes","CatalogLoaded",this._defectCatalogLoaded,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onDefectCodeSelectedL1: function(oEvent){
			this._updateL2Defects(oEvent.getParameter("selectedItem").mProperties.key);
			this.getModel("WarrantyClaim").setProperty("/DefectCode/value","");
			WarrantyClaim.validateDefectCode();
			this.logValidationMessage("DefectCode");
		},		
		
		onDefectCodeChanged: function(){
			WarrantyClaim.validateDefectCode();
			this.logValidationMessage("DefectCode");
		},
		
		onDealerCommentsChanged: function(){
			WarrantyClaim.validateDealerComments();
			this.logValidationMessage("DealerComments");
		},
		
		_loadDefectCatalog: function(sChannelId, sEventId, oData){
			this.readDefectCatalog();
		},
		
		_defectCatalogLoaded: function(sChannelId, sEventId, oData){
			if(this.getModel("WarrantyClaim").getProperty("/DefectCode/value")){
				var defectCodeLevels = this.getModel("WarrantyClaim").getProperty("/DefectCode/value").split("-");
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
		},
		
    	_refreshValidationMessages: function(){
			this.logValidationMessage("DefectCode");
			this.logValidationMessage("DealerComments");
    	}
	});

});
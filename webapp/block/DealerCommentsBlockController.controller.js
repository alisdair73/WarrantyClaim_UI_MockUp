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
			if(oEvent.getParameter("selectedItem")){
				this._updateL2Defects(oEvent.getParameter("selectedItem").mProperties.key);
				this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1/ruleResult/valid",true);
			} else {
				this.getModel("DefectCodesHelper").setProperty("/DefectsL2",[]);
				this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1/ruleResult/valid",false);
			}
			
			this.getModel("WarrantyClaim").setProperty("/DefectCode/value","");
			WarrantyClaim.validateDefectCode();
			this.logValidationMessage("DefectCode");
				
			this.logValidationMessage("defectCodeL1","ViewHelper","/warrantyUI/defectCodeL1");
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
				this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1/value",defectCodeLevels[0]);
				this._updateL2Defects(this.getModel("ViewHelper").getProperty("/warrantyUI/defectCodeL1/value"));
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
    		
    		if (this.getModel("ViewHelper").getProperty("/warrantyUI/defectCodeL1/value") === ""){
    			this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1/ruleResult/valid",false);
    		}
    		
    		this.logValidationMessage("defectCodeL1","ViewHelper","/warrantyUI/defectCodeL1");
			this.logValidationMessage("DefectCode");
			this.logValidationMessage("DealerComments");
    	}
	});

});
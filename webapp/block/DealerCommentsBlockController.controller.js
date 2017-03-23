sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.DealerCommentsBlockController", {

    showDefectSelector: function(){
    	
		if (! this._defectSelector) {
			this._defectSelector = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.DefectCodeSelector", this);
			this.getView().addDependent(this._defectSelector);
			this.readCatalog("ZDEF1","DefectCodes");
		} 
		this._defectSelector.open(); 
    },
    
    handleCancel: function(){
    	this._defectSelector.close(); 
    },
    
    defectCodeSelected: function(evt){
    	
    	var path = evt.getParameter("listItem").getBindingContext("DefectCodes").getPath();
    	var defect = this.getView().getModel("DefectCodes").getProperty(path);
    	this.getModel("WarrantyClaim").setProperty("/DefectCode",defect.code);
    	this.getModel("ViewHelper").setProperty("/warrantyUI/DefectCodeDescription", defect.text);

		this._defectSelector.close();
    }
    
	});

});
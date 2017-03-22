sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function( jQuery, Controller, JSONModel) {
	"use strict";
 
 	return Controller.extend("WarrantyClaim_MockUp.controller.SymptomCodeSelector", {
 		
 		onInit : function (evt) {
			 var modulePath = jQuery.sap.getModulePath("WarrantyClaim_MockUp");
			 var oSymptomCodesModel = new JSONModel(modulePath + "/model/SymptomCodes.json");
            this.getView().setModel(oSymptomCodesModel,"SymptomCodes");
		}
		
 	});
});
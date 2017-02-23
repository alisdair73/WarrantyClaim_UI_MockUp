sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter'
	], function( jQuery, MessageToast, Fragment, Controller, JSONModel, Filter) {
	"use strict";
 
 	return Controller.extend("WarrantyClaim_MockUp.controller.WarrantyClaimObjectPage", {
		
		onInit: function() {
			this.openClaimSelectDialog( );
		},
		
		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		
		openClaimSelectDialog: function() {
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.CopyOfClaimTypeSelection", this);
			}
			
			var modulePath = jQuery.sap.getModulePath("WarrantyClaim_MockUp");
			var oClaimTypeModel = new JSONModel(modulePath + "/model/ClaimTypes.json");
		
            this._oDialog.setModel(oClaimTypeModel,"ClaimTypes");
			this._oDialog.open();
		},
 
		handleListSelect: function(oEvent){
			
			MessageToast.show("You have chosen " + 
				oEvent.getParameter("listItem").getBindingContext("ClaimTypes").getObject().Text +
				"(" + oEvent.getParameter("listItem").getBindingContext("ClaimTypes").getObject().Code + ")" );
			this._oDialog.close();
		},

		handleClose: function(oEvent) {
			
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
        		target: { semanticObject : "#"}
            });
			
			this._oDialog.close();
		}
	});
});
sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController,Filter, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		onFailureMeasureChanged: function(){
			WarrantyClaim.validateFailureMeasure();
			this.logValidationMessage("FailureMeasure");
		},
		
		onRepairOrderNumberChanged: function(){
			WarrantyClaim.validateRepairOrderNumber();
			this.logValidationMessage("RepairOrderNumber");
		},

		onDateOfRepairChanged: function(){
			WarrantyClaim.validateDateOfRepair();
			this.logValidationMessage("DateOfRepair");
		},	

		onTechnicianChanged: function(){
			WarrantyClaim.validateTechnician();
			this.logValidationMessage("Technician");
		},

		onServiceAdvisorChanged: function(){
			WarrantyClaim.validateServiceAdvisor();
			this.logValidationMessage("ServiceAdvisor");	
		},

		onOldSerialNumberChanged: function(){
			WarrantyClaim.validateOldSerialNumber();
			this.logValidationMessage("OldSerialNumber");	
		},

		onNewSerialNumberChanged: function(){
			WarrantyClaim.validateNewSerialNumber();
			this.logValidationMessage("NewSerialNumber");
		},

		onPartsInstallDateChanged: function(){
			WarrantyClaim.validatePartsInstallDate();
			this.logValidationMessage("PartsInstallDate");	
		},  

		onPartsInstallKmChanged: function(){
			WarrantyClaim.validatePartsInstallKm();
			this.logValidationMessage("PartsInstallKm");	
		},
		
		onOriginalInvoiceNumberChanged: function(){
			WarrantyClaim.validateOriginalInvoiceNumber();
			this.logValidationMessage("OriginalInvoiceNumber");
		}
		
	});
});
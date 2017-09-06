sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/WarrantyClaim",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/core/format/NumberFormat"
], function(BaseController,Filter, WarrantyClaim, Models, NumberFormatter) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.ClaimDetailsBlockController", {
		
		onInit: function(){
			
			this._measureFormatter = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 0,
				groupingEnabled: false
			});
			
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onFailureMeasureChanged: function(){
			
			this.getView().getModel("WarrantyClaim").setProperty("/FailureMeasure/value",
				this._measureFormatter.format(this.getView().getModel("WarrantyClaim").getProperty("/FailureMeasure/value"))
			);

			WarrantyClaim.validateFailureMeasure();
			this.logValidationMessage("FailureMeasure");
		},
		
		onRepairOrderNumberChanged: function(){
			WarrantyClaim.validateRepairOrderNumber();
			this.logValidationMessage("RepairOrderNumber");
		},

		onDateOfFailureChanged: function(){
			WarrantyClaim.validateDateOfFailure();
			this.logValidationMessage("DateOfFailure");
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
		},
		
		onInstalledByDealer:function(){
			
			if(this.getView().getModel("WarrantyClaim").getProperty("/ObjectType") === "SERN"){
				
				var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
				
				if(this.getView().getModel("WarrantyClaim").getProperty("/PartsInstalledByDealer")){
					var newLONItem = Models.createNewWarrantyItem("FR");   
					newLONItem.setProperty("/ItemKey","100001");
					newLONItem.setProperty("/Description","Labour Hours");
					newLONItem.setProperty("/Quantity",0);
					labourItems.push(newLONItem.getProperty("/"));
					this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
				} else {
					//Clear the LON
					labourItems.forEach(function(item){
						item.Deleted = true;
					});
					sap.ui.getCore().getEventBus().publish("WarrantyClaim","LONModified");
				}
			}
		},
		

			
		
		 _refreshValidationMessages: function(){
			this.logValidationMessage("FailureMeasure");
			this.logValidationMessage("RepairOrderNumber");
			this.logValidationMessage("DateOfRepair");
			this.logValidationMessage("DateOfFailure");
			this.logValidationMessage("Technician");
			this.logValidationMessage("ServiceAdvisor");	
			this.logValidationMessage("OldSerialNumber");	
			this.logValidationMessage("NewSerialNumber");
			this.logValidationMessage("PartsInstallDate");	
			this.logValidationMessage("PartsInstallKm");	
			this.logValidationMessage("OriginalInvoiceNumber");  
    	}
		
	});
});
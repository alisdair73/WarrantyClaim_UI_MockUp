sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"WarrantyClaim_MockUp/model/models"
], function(Controller, Filter, Models) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("SalesOrg","Changed",this._salesOrgChanged.bind(this),this);
			
			
			sap.ui.getCore().getMessageManager().registerObject(
				this.getView().byId("recallNumber"), true
			);
		},
		
		onPWAValueHelpRequest: function(event){
			if (!this._PWAValueHelpDialog) {
				this._PWAValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PriorWorkApprovalSelection", this);
				this.getView().addDependent(this._PWAValueHelpDialog);
			}

 			var filters = [];
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));
			sap.ui.getCore().byId("PWASelectionList").getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._PWAValueHelpDialog.open();
		},

        onPWASelectionSearch: function(event){
        	var searchValue = event.getParameter("value");
			var filters = [];
			filters.push(new Filter("PWANumber",sap.ui.model.FilterOperator.Contains, searchValue));
			filters.push(new Filter("VIN",sap.ui.model.FilterOperator.Contains, searchValue));
			filters.push(new Filter("EngineNumber",sap.ui.model.FilterOperator.Contains, searchValue));
			event.getSource().getBinding("items").filter(filters);
        },
        
		onPWASelection: function(event){
			
			var dataObject = null;
			if (event.getId() === "suggestionItemSelected"){
				dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			} else {
				dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			}
			
			this.getView().getModel("WarrantyClaim").setProperty("/AuthorisationNumber",dataObject.PWANumber);
			this.getView().getModel("WarrantyClaim").setProperty("/VIN",dataObject.VIN);
			this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber",dataObject.EngineNumber);
			
			if (dataObject.MCPN){
				
				var parts = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

				if(parts.length === 0){
					var warrantyItem = Models.createNewWarrantyItem("MAT");
					warrantyItem.setProperty("/PartNumber", dataObject.MCPN);
					warrantyItem.setProperty("/Description", dataObject.MCPNDescription);
					warrantyItem.setProperty("/Quantity", 1); //???
					warrantyItem.setProperty("/isMCPN", true);
					parts.push(warrantyItem.getProperty("/"));
					this.getView().getModel("WarrantyClaim").setProperty("/Parts",parts);
					
				} else {
					this.getView().getModel("WarrantyClaim").setProperty("/Parts/0/PartNumber",dataObject.MCPN);
					this.getView().getModel("WarrantyClaim").setProperty("/Parts/0/Description",dataObject.MCPNDescription);
					this.getView().getModel("WarrantyClaim").setProperty("/Parts/0/Quantity",1); //???
				}
			}
		},
		
		onPWASelectionClose: function(){
			this._PWAValueHelpDialog.close();
		},
		
		onRecallValueHelpRequest: function(event){
			if (!this._RecallValueHelpDialog) {
				this._RecallValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.RecallSelection", this);
				this.getView().addDependent(this._RecallValueHelpDialog);
			}

 			var filters = [];
			filters.push(
				new Filter(
					"SalesOrg",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")
			));
			sap.ui.getCore().byId("RecallSelectionList").getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._RecallValueHelpDialog.open();
		},
		
        onRecallSelectionSearch: function(event){
        	var searchValue = event.getParameter("value");
			var filters = [];
			filters.push(new Filter("ExternalRecallNumber",sap.ui.model.FilterOperator.Contains, searchValue));
			filters.push(new Filter("RecallInformation",sap.ui.model.FilterOperator.Contains, searchValue));
			event.getSource().getBinding("items").filter(filters);  
        },
        
		onRecallSelection: function(event){
			
			var dataObject = null;
			if (event.getId() === "suggestionItemSelected"){
				dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			} else {
				dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			}

			this.getView().getModel("WarrantyClaim").setProperty("/RecallNumber",dataObject.ExternalRecallNumber);
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",dataObject.SerialNumberIsMandatory);
		},
		
		onRecallSelectionClose: function(){
			this._RecallValueHelpDialog.close();
		},
		
		onDealerVINSelection: function(event){
			var dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber",dataObject.EngineNumber);
		},
		
    	_salesOrgChanged: function(channel, event, data){
    		
    		var filters = [];
			filters.push(new Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, data.SalesOrg));
    		this.getView().byId("PWANumber").getBinding("suggestionRows").filter(filters);
    		this.getView().byId("recallNumber").getBinding("suggestionRows").filter(filters);
    	}
	});

});
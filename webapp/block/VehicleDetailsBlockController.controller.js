sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"WarrantyClaim_MockUp/model/models",
"WarrantyClaim_MockUp/model/valueStateFormatter"
], function(Controller, Filter, Models, valueStateFormatter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

    	valueStateFormatter: valueStateFormatter,

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("SalesOrg","Changed",this._salesOrgChanged.bind(this),this);
		},
		
		onVINChanged: function(event){
        	//Add the VIN to the PWA Filter
    		this.getView().byId("PWANumber").getBinding("suggestionRows").filter(this._getFilter());
			this.getView().byId("recallNumber").getBinding("suggestionRows").filter(this._getFilter());
		},
		
		onPWAValueHelpRequest: function(event){
			if (!this._PWAValueHelpDialog) {
				this._PWAValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PriorWorkApprovalSelection", this);
				this.getView().addDependent(this._PWAValueHelpDialog);
			}
			sap.ui.getCore().byId("PWASelectionList").getBinding("items").filter(this._getFilter());
			
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
					warrantyItem.setProperty("/IsMCPN", true);
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
		
		onRecallSuggest: function(event){
			
			var recallSearch = event.getParameter("suggestValue");
			var filters = this._getFilter();
			if (recallSearch) {
				filters.push(new Filter("ExternalRecallNumber", sap.ui.model.FilterOperator.StartsWith, recallSearch));
			}
			event.getSource().getBinding("suggestionRows").filter(filters);
		},
		
		onRecallValueHelpRequest: function(event){
			if (!this._RecallValueHelpDialog) {
				this._RecallValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.RecallSelection", this);
				this.getView().addDependent(this._RecallValueHelpDialog);
			}
			sap.ui.getCore().byId("RecallSelectionList").getBinding("items").filter(this._getFilter());
			
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
//			var dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
//			this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber",dataObject.EngineNumber);
		},
		
    	_salesOrgChanged: function(channel, event, data){
    		
    		this.getView().byId("PWANumber").getBinding("suggestionRows").filter(this._getFilter());
    		this.getView().byId("recallNumber").getBinding("suggestionRows").filter(this._getFilter());
    	},
    	
    	_getFilter: function(){
    		
    	    //Apply VIN and Sales Organisation to PWA/Recall collections
        	var filters = [];
			filters.push(new Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")));
		
			if(this.getView().getModel("WarrantyClaim").getProperty("/VIN") !== ""){
    			filters.push(new Filter("VIN", sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/VIN")));
			}
			return filters;
    	}
	});

});
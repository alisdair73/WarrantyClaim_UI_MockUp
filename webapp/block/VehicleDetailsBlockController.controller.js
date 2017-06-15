sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/ui/model/Filter",
"WarrantyClaim_MockUp/model/models",
"WarrantyClaim_MockUp/model/valueStateFormatter",
"sap/ui/model/json/JSONModel",
"WarrantyClaim_MockUp/model/RecallProductGroup",
"sap/m/MessageToast"
], function(Controller, Filter, Models, valueStateFormatter,JSONModel, Recall, MessageToast) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

    	valueStateFormatter: valueStateFormatter,

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("SalesOrg","Changed",this._salesOrgChanged.bind(this),this);
		},
		
		onVINChanged: function(event){
        	//Add the VIN to the PWA Filter
    		this.getView().byId("AuthorisationNumber").getBinding("suggestionRows").filter(this._getFilter());
			this.getView().byId("RecallNumber").getBinding("suggestionRows").filter(this._getFilter());
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
			filters.push(new Filter("AuthorisationNumber",sap.ui.model.FilterOperator.Contains, searchValue));
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
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/internalRecallNumber",dataObject.InternalRecallNumber);
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",dataObject.SerialNumberIsMandatory);
//			sap.ui.getCore().getEventBus().publish("RecallNumber","Changed",{"IsMandatory":dataObject.SerialNumberIsMandatory});
			
			//Load the details of the Recall
			var vin = this.getView().getModel("WarrantyClaim").getProperty("/VIN");
			var internalRecallNumber = this.getView().getModel("ViewHelper").getProperty("/warrantyUI/internalRecallNumber");
			
			this.getView().getModel().read(
				"/RecallItemSet", {
					context: null,
					filters: [
						new Filter("InternalRecallNumber",sap.ui.model.FilterOperator.EQ, internalRecallNumber),
						new Filter("VIN",sap.ui.model.FilterOperator.EQ, vin)
					],
					success: this._handleRecallItems.bind(this),
					error: function() {
					  //No Parts???
					}.bind(this)
				}
			);
		},
		
		onRecallProductGroupCancel: function(){
			this._recallDialog.close();
		},
		
		onTransferMaterials  : function(){
			
			var recallGroup = this.getView().getModel("RecallGroup");
			
			//Need to remove all items from the tables - this requires the setting of the deletion flag, rather
			//than clearing the array - as once saved, the backend will need to clean these up..
			
			
			var recallItems = [];
			var subletItems = [];
			var labourItems = [];
			
			var labourItem = Models.createNewWarrantyItem("FR");
			if(recallGroup.getProperty("/inspect/selected")){
				//Inspect
				labourItem.setProperty("/ItemKey", recallGroup.getProperty("/inspect/LON"));
				labourItem.setProperty("/Description", recallGroup.getProperty("/inspect/displayText"));
				labourItem.setProperty("/Quantity", recallGroup.getProperty("/inspect/quantity"));
			} else {
				//Replace/Repair
				labourItem.setProperty("/ItemKey", recallGroup.getProperty("/replace/LON"));
				labourItem.setProperty("/Description", recallGroup.getProperty("/replace/displayText"));
				labourItem.setProperty("/Quantity", recallGroup.getProperty("/replace/quantity"));
			}
			labourItems.push(labourItem.getProperty("/"));
			this.getView().getModel("WarrantyClaim").setProperty("/Labour", labourItems);
			
			if(recallGroup.getProperty("/inspect/selected")){
				this.getView().getModel("WarrantyClaim").setProperty("/Parts", []); //Clear Parts
				this.getView().getModel("WarrantyClaim").setProperty("/Sublet", []); //Clear Sublet??
				this._recallDialog.close();
				return; //Only Inspection to be performed...
			}
				
			//Add the Sublet Items
			recallGroup.getProperty("/subletItems").forEach(function(subletItem){
				var sublet = Models.createNewWarrantyItem("SUBL");
				sublet.setProperty("/ItemKey", subletItem.subletCode);
				sublet.setProperty("/Quantity", subletItem.quantity);
				subletItems.push(sublet.getProperty("/"));
			});
			this.getView().getModel("WarrantyClaim").setProperty("/Sublet", subletItems);
			
			//Add the MCPN
			var MCPN = Models.createNewWarrantyItem("MAT");
			MCPN.setProperty("/PartNumber", recallGroup.getProperty("/MCP/materialNumber"));
			MCPN.setProperty("/Description", recallGroup.getProperty("/MCP/materialDescription"));
			MCPN.setProperty("/Quantity",recallGroup.getProperty("/MCP/quantity"));
			MCPN.setProperty("/IsMCPN", true);
			recallItems.push(MCPN.getProperty("/"));
			
			//Replace/Repair Selected by Dealer - Transfer Parts/Labour/Sublet
			var selectedGroupIndex = this.getView().getModel("RecallGroup").getProperty("/selectedGroup").findIndex(function(groupSelected){
				return groupSelected;
			});
			
			var materialsToTransfer = this.getView().getModel("RecallItems").getProperty("/");
			materialsToTransfer.forEach(function(materialToTransfer){
			
				// add the new part
				var recallItem = Models.createNewWarrantyItem("MAT");
				recallItem.setProperty("/PartNumber", materialToTransfer.materialNumber);
				recallItem.setProperty("/Description", materialToTransfer.materialDescription);
				
				var selectedGroup = materialToTransfer.groups[selectedGroupIndex];
				
				if(selectedGroup.isRadioButton || selectedGroup.isStepInput){
					if(selectedGroup.isRadioButton){
						if(selectedGroup.radioButton.selected){
							recallItem.setProperty("/Quantity", 1);
						} else {
							return;
						}
					} else {
						recallItem.setProperty("/Quantity", selectedGroup.stepInput.quantity);
					}
					recallItem.setProperty("/IsMCPN", false);
					recallItems.push(recallItem.getProperty("/"));
				}
			});

			this.getView().getModel("WarrantyClaim").setProperty("/Parts", recallItems);
			MessageToast.show("Recall Items have been transferred to the Warranty.");
			
			if (this._recallDialog && this._recallDialog.isOpen()){
				this._recallDialog.close();
			}
		},		
		
		onRecallSelectionClose: function(){
			this._RecallValueHelpDialog.close();
		},
		
		onDealerVINSelection: function(event){
//			var dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
//			this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber",dataObject.EngineNumber);
		},
		
		toUpperCase: function(event){
    		var value = event.getParameter('newValue');     
    		this.getView().getModel("WarrantyClaim").setProperty("/VIN",value.toUpperCase());
		},
		
    	_salesOrgChanged: function(channel, event, data){
    		
    		this.getView().byId("AuthorisationNumber").getBinding("suggestionRows").filter(this._getFilter());
    		this.getView().byId("RecallNumber").getBinding("suggestionRows").filter(this._getFilter());
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
    	},
    	
    	_handleRecallItems: function(recallItems){
    		
    		var recall = new Recall(this);
			var recallModels = recall.buildRecallItemsModel(recallItems.results); 
			
			this.getView().setModel(new JSONModel(recallModels.RecallGroup), "RecallGroup");
			this.getView().setModel(new JSONModel(recallModels.RecallItems), "RecallItems");
			
			if (recallModels.RecallGroup.maxGroups > 1){
//          	Need to open Group Selection Popup
    			if (!this._recallDialog) {
					this._recallDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.fragment.RecallProductGroupSelector", this);
					this.getView().addDependent(this._recallDialog);
				}
				this._recallDialog.open();
			} else {
				//Only one option - automatically transfer data
				this.onTransferMaterials();
			}
    	}
	});

});
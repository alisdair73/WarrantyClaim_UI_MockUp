sap.ui.define([
//"sap/ui/core/mvc/Controller",
"WarrantyClaim_MockUp/controller/BaseController",
"sap/ui/model/Filter",
"WarrantyClaim_MockUp/model/models",
"sap/ui/model/json/JSONModel",
"WarrantyClaim_MockUp/model/RecallProductGroup",
"sap/m/MessageBox",
"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, Filter, Models, JSONModel, Recall, MessageBox, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlockController", {

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("SalesOrg","Changed",this._salesOrgChanged,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("SalesOrg","Changed",this._salesOrgChanged,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onExternalObjectNumberChanged: function(){

			var externalNumber = this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value");
			if(externalNumber === ""){
				this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectDescription","");
				this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectModelCode","");
				this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber/value","");
				this.getView().getModel("WarrantyClaim").setProperty("/MaterialDivision","");
				this._resetCatalogFields();
			} else {

				this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectNumber/value",
					this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value").toUpperCase()
				);
			}
			
			WarrantyClaim.validateExternalObjectNumber();
			this.logValidationMessage("ExternalObjectNumber");
		},
		
		onExternalObjectNumberVELOSelected: function(event){

			var dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectDescription",dataObject.Description);
			
			this.getView().byId("AuthorisationNumber").getBinding("suggestionRows").filter(this._getFilter());
			
			if(this.getView().getModel("WarrantyClaim").getProperty("/ClaimTypeGroup") === "RECALL"){
				this.getView().byId("RecallNumber").getBinding("suggestionRows").filter(this._getFilter());
			}
		},
		
		onExternalObjectNumberSERNSelected: function(event){
			
			var currentMaterialDivision = this.getView().getModel("WarrantyClaim").getProperty("/MaterialDivision");
			
			var dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectDescription",dataObject.Equipment_Text);
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectModelCode",dataObject.ModelCode);
			this.getView().getModel("WarrantyClaim").setProperty("/MaterialDivision",dataObject.MaterialDivision);
			
			if(currentMaterialDivision !== dataObject.MaterialDivision){
				this._resetCatalogFields();
			}
			
			this.getView().byId("AuthorisationNumber").getBinding("suggestionRows").filter(this._getFilter());
			this.getView().byId("RecallNumber").getBinding("suggestionRows").filter(this._getFilter());
		},
		
		_resetCatalogFields: function(){
			//Need to update the Catalogs - Reset Data
			this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL1","");
			this.getModel("ViewHelper").setProperty("/warrantyUI/symptomCodeL2","");
			this.getModel("WarrantyClaim").setProperty("/SymptomCode/value","");
			
			this.getModel("ViewHelper").setProperty("/warrantyUI/defectCodeL1","");
			this.getModel("WarrantyClaim").setProperty("/DefectCode/value","");
			
			sap.ui.getCore().getEventBus().publish("WarrantyClaim","LoadCatalogForMaterialDivision");
		},
		
		onExternalObjectNumberSuggest: function(event){
			event.getSource().getBinding("suggestionRows").filter(this._applyExternalObjectNumberFilter(event.getParameter("suggestValue")));
		},		
		
		_applyExternalObjectNumberFilter: function(filterString){
			
			var filters = [];
			if (filterString) {
						
				var filterName = this.getView().getModel("WarrantyClaim").getProperty("/ObjectType") === "VELO" ? "VIN" : "SerialNumber";
				filters.push(new Filter(filterName, sap.ui.model.FilterOperator.StartsWith, filterString));
			}
			return filters;
		},
		
		onEngineNumberChanged: function(){
			WarrantyClaim.validateEngineNumber();
			this.logValidationMessage("EngineNumber");
		},
		
		onDealerContactChanged: function(){
			WarrantyClaim.validateDealerContact();
			this.logValidationMessage("DealerContact");
		},
		
		onAuthorisationNumberChanged: function(){
			WarrantyClaim.validateAuthorisationNumber();
			this.logValidationMessage("AuthorisationNumber");
		},
		
		onRecallNumberChanged: function(){
			
			if(this.getView().getModel("WarrantyClaim").getProperty("/RecallNumber/value") === ""){

				var recallItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
				var subletItems = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");
				var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
				
				this._setDeletedFlagForAllItems(recallItems);
				this._setDeletedFlagForAllItems(subletItems);
				this._setDeletedFlagForAllItems(labourItems);
				
				this.getView().getModel("WarrantyClaim").setProperty("/Parts",recallItems);
				this.getView().getModel("WarrantyClaim").setProperty("/Sublet",subletItems);
				this.getView().getModel("WarrantyClaim").setProperty("/Labour".labourItems);
				
				sap.ui.getCore().getEventBus().publish("Recall","Transferred");
			}
			
			WarrantyClaim.validateRecallNumber();
			this.logValidationMessage("RecallNumber");
		},
		
		onPWASelection: function(event){
			
			var dataObject = null;
			if (event.getId() === "suggestionItemSelected"){
				dataObject = event.getParameter("selectedRow").getBindingContext().getObject();
			} else {
				dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			}
			
			this.getView().getModel("WarrantyClaim").setProperty("/AuthorisationNumber/value",dataObject.PWANumber);
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectNumber/value",dataObject.ExternalObjectNumber);
			this.getView().getModel("WarrantyClaim").setProperty("/EngineNumber/value",dataObject.EngineNumber);
			this.getView().getModel("WarrantyClaim").setProperty("/DateOfFailure/value",dataObject.DateOfFailure);
			this.getView().getModel("WarrantyClaim").setProperty("/FailureMeasure/value",dataObject.FailureMeasure);
			this.getView().getModel("WarrantyClaim").setProperty("/CustomerConcern/value",dataObject.CustomerConcern);	
			
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectDescription",dataObject.ExternalObjectDescription);
			this.getView().getModel("WarrantyClaim").setProperty("/ExternalObjectModelCode",dataObject.ExternalObjectModelCode);
			this.getView().getModel("WarrantyClaim").setProperty("/MaterialDivision",dataObject.MaterialDivision);
			
			WarrantyClaim.validateExternalObjectNumber();
			this.logValidationMessage("ExternalObjectNumber");
			this._resetCatalogFields();
			
			// Update/Add the MCPN
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			var indexOfMCPN = warrantyItems.findIndex(function(item){
				return item.IsMCPN;
			});
			
			//Are we adding or Modifying the MCPN
			if(warrantyItems[indexOfMCPN]){
				warrantyItems[indexOfMCPN].PartNumber = dataObject.MCPN;
				warrantyItems[indexOfMCPN].Description = dataObject.MCPNDescription;
				warrantyItems[indexOfMCPN].Quantity = 0;
			} else {
				var warrantyItem = Models.createNewWarrantyItem("MAT");
				warrantyItem.setProperty("/PartNumber", dataObject.MCPN);
				warrantyItem.setProperty("/Description", dataObject.MCPNDescription);
				warrantyItem.setProperty("/Quantity", 0);
				warrantyItem.setProperty("/IsMCPN",true);
				warrantyItems.push(warrantyItem.getProperty("/"));
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
			
			//Let interested controller know
			sap.ui.getCore().getEventBus().publish("PWA","Selected");
		},

		onPWASuggest: function(event){
			
			var PWASearch = event.getParameter("suggestValue");
			var filters = this._getFilter();
			
			filters.push(new Filter("PWATypeGroup", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/ClaimTypeGroup")
			));
			
			if (PWASearch) {
				filters.push(new Filter("PWANumber", sap.ui.model.FilterOperator.StartsWith, PWASearch));
			}
			event.getSource().getBinding("suggestionRows").filter(filters);
			
		},
		
		onRecallSuggest: function(event){
			
			var recallSearch = event.getParameter("suggestValue");
			var filters = this._getFilter();
			if (recallSearch) {
				filters.push(new Filter("ExternalRecallNumber", sap.ui.model.FilterOperator.StartsWith, recallSearch));
			}
			event.getSource().getBinding("suggestionRows").filter(filters);
		},
		
		onPWAValueHelpRequest: function(event){
			if (!this._PWAValueHelpDialog) {
				this._PWAValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PriorWorkApprovalSelection", this);
				this.getView().addDependent(this._PWAValueHelpDialog);
			}
			
			var filters = this._getFilter();
			filters.push(new Filter("PWATypeGroup", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/ClaimTypeGroup")
			));
			sap.ui.getCore().byId("PWASelectionList").getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._PWAValueHelpDialog.open();
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
		
        onPWASelectionSearch: function(event){
        	var searchValue = event.getParameter("value");
			var filters = [];
			filters.push(new Filter("PWANumber",sap.ui.model.FilterOperator.Contains, searchValue));
			event.getSource().getBinding("items").filter(filters);
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

			// this.getView().getModel("WarrantyClaim").setProperty("/RecallNumber/value",dataObject.ExternalRecallNumber);
			// this.getView().getModel("WarrantyClaim").setProperty("/RecallValidFrom",dataObject.ValidFrom);
			// this.getView().getModel("WarrantyClaim").setProperty("/RecallValidTo",dataObject.ValidTo);
			// this.getView().getModel("ViewHelper").setProperty("/warrantyUI/internalRecallNumber",dataObject.InternalRecallNumber);
			// this.getView().getModel("ViewHelper").setProperty("/warrantyUI/serialNumberIsMandatory",dataObject.SerialNumberIsMandatory);
			
			this._selectedRecall = dataObject; //Make available for later
			
			// WarrantyClaim.validateRecallNumber();
			// this.logValidationMessage("RecallNumber");
			
			//Load the details of the Recall
			//var externalObjectNumber = this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value");
			//var internalRecallNumber = this.getView().getModel("ViewHelper").getProperty("/warrantyUI/internalRecallNumber");
			
			var externalObjectNumber = this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value");
				
			this.getView().getModel().read(
				"/RecallItemSet", {
					context: null,
					filters: [
						new Filter("InternalRecallNumber",sap.ui.model.FilterOperator.EQ, this._selectedRecall.InternalRecallNumber),
						new Filter("ExternalObjectNumber",sap.ui.model.FilterOperator.EQ, externalObjectNumber)
					],
					success: this._handleRecallItems.bind(this),
					error: function() {
					  //No Parts???
					}
				}
			);
		},
		
		onRecallProductGroupCancel: function(){
			this._recallDialog.close();
			this._recallDialog.destroy(true);
			this._recallDialog = null;
			this._selectedRecall = null;
		},
		
		onTransferMaterials  : function(){
			
			var recallGroup = this.getView().getModel("RecallGroup");
			var recallItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			var subletItems = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
			this._setDeletedFlagForAllItems(recallItems);
			this._setDeletedFlagForAllItems(subletItems);
			this._setDeletedFlagForAllItems(labourItems);
			
			this.getView().getModel("WarrantyClaim").setProperty("/RecallNumber/value",this._selectedRecall.ExternalRecallNumber);
			this.getView().getModel("WarrantyClaim").setProperty("/RecallValidFrom",this._selectedRecall.ValidFrom);
			this.getView().getModel("WarrantyClaim").setProperty("/RecallValidTo",this._selectedRecall.ValidTo);
			this.getView().getModel("WarrantyClaim").setProperty("/SerialNumberIsMandatory",this._selectedRecall.SerialNumberIsMandatory);
			this.getView().getModel("ViewHelper").setProperty("/warrantyUI/internalRecallNumber",this._selectedRecall.InternalRecallNumber);
			
			this._selectedRecall = null;
			
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
				sap.ui.getCore().getEventBus().publish("Recall","Transferred");
				this._recallDialog.close();
				return; //Only Inspection to be performed...
			}
				
			//Add the Sublet Items
			recallGroup.getProperty("/subletItems").forEach(function(subletItem){
				var sublet = Models.createNewWarrantyItem("SUBL");
				sublet.setProperty("/ItemKey", subletItem.subletCode);
				sublet.setProperty("/Quantity", subletItem.quantity);
				sublet.setProperty("/IsSubletFixed",true); //Sublets from Recall cannot be changed
				subletItems.push(sublet.getProperty("/"));
				
				if(subletItem.fixedSublet){
					this.getModel("WarrantyClaim").setProperty("/FixedSublet", true);
				}
			}.bind(this));
			
			this.getView().getModel("WarrantyClaim").setProperty("/Sublet", subletItems);
			
			//Add the MCPN
			var MCPN = Models.createNewWarrantyItem("MAT");
			MCPN.setProperty("/PartNumber", recallGroup.getProperty("/MCP/materialNumber"));
			MCPN.setProperty("/Description", recallGroup.getProperty("/MCP/materialDescription"));
			MCPN.setProperty("/Quantity",recallGroup.getProperty("/MCP/quantity"));
			MCPN.setProperty("/PartRequested", "S");
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
				recallItem.setProperty("/PartRequested", "S");
				
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
			sap.ui.getCore().getEventBus().publish("Recall","Transferred");
			
			MessageBox.success(
				"Recall Items have been transferred to the Warranty.",
				{
					id : "successMessageBox",
					actions : [MessageBox.Action.CLOSE]
				}	
			);
			
			if (this._recallDialog && this._recallDialog.isOpen()){
				this._recallDialog.close();
				this._recallDialog.destroy(true);
				this._recallDialog = null;
			}
			
			//Revalidate
			WarrantyClaim.validateRecallNumber();
			this.logValidationMessage("RecallNumber");
		},		
		
    	_salesOrgChanged: function(channel, event, data){
    		
    		this.getView().byId("AuthorisationNumber").getBinding("suggestionRows").filter(this._getFilter());
    		this.getView().byId("RecallNumber").getBinding("suggestionRows").filter(this._getFilter());
    	},
    	
    	_getFilter: function(){
    		
    	    //Apply External Object, Object Type and Sales Organisation to PWA/Recall collections
        	var filters = [];
        	
        	//REMOVE THIS ONCE RENAMING IS COMPLETE
			filters.push(new Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")));
			
			filters.push(new Filter("ObjectType", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/ObjectType")));
		
			if(this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value") !== ""){
    			filters.push(new Filter("ExternalObjectNumber", sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value")));
			}
			return filters;
    	},
    	
    	_handleRecallItems: function(recallItems){
    		
    		var recall = new Recall();
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
    	},
    	
    	_setDeletedFlagForAllItems: function(items){
    		items.forEach(function(item){
				item.Deleted = true;	
			});
    	},
    	
    	_refreshValidationMessages: function(){
    		this.logValidationMessage("ExternalObjectNumber");
			this.logValidationMessage("EngineNumber");
			this.logValidationMessage("DealerContact");
			this.logValidationMessage("AuthorisationNumber");
			this.logValidationMessage("RecallNumber");
    	}
	});

});
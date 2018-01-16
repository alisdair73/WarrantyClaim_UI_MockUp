sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, Filter, Models, JSONModel, WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.OtherPartsDetailsBlockController", {
		
		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","RecallApplied",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().subscribe("PWA","Selected",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Loaded",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._updateMCPN,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","RecallApplied",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().unsubscribe("PWA","Selected",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Loaded",this._updateMCPN,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Saved",this._updateMCPN,this);
		},
		
		////////////////////////////////
		//MCPN Handlers	
		////////////////////////////////
		onMCPNValueHelpRequest: function(){
			this._MCPNRequest = true;
			this._openPartValueHelpDialog();
		},
				
		onMCPNSuggestionSelected: function(event){
			this._updateMCPNFromSelection(event.getParameter("selectedRow").getBindingContext().getObject());
		},
		
		onMCPNChanged: function(event){

/*			this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",
				this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value").replace(/[^a-zA-Z0-9]/g, "")
			);*/

			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");
			var indexOfMCPN = warrantyItems.findIndex(function(item){
				return item.IsMCPN;
			});
				
			// Update/Add the MCPN
			if(this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value") !== ""){
				
				//Manage the Case when part is typed in directly
				if(event && event.getSource().data("checkSuggestions") && event.getSource().getSuggestionRows()){

			  		var suggestionMatched = false;
			    	event.getSource().getSuggestionRows().forEach(function(suggestion){
			    		
					    var suggestedPart = suggestion.getBindingContext().getObject();
					    if (suggestedPart.materialNo === this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value")){
					    	if(this.getView().getModel("WarrantyClaim").getProperty("/Description") === ""){
					    		this.getView().getModel("WarrantyClaim").setProperty("/Description",suggestedPart.description);
					    	}
					        suggestionMatched = true;
					    }
			    	}.bind(this));
			    	
				    if(!suggestionMatched){
				    	this.getView().getModel("WarrantyClaim").setProperty("/Description","");
				    }
				}
				
				//Default the Parts Requested if Blank
				if(this.getView().getModel("WarrantyClaim").getProperty("/PartRequested") === "" ||
				   this.getView().getModel("WarrantyClaim").getProperty("/Quantity/value") === 0){
					this.getView().getModel("WarrantyClaim").setProperty("/PartRequested", "S");
				}
				
				//Are we adding or Modifying the MCPN
				if(warrantyItems[indexOfMCPN]){
					warrantyItems[indexOfMCPN].PartNumber.value = this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value");
					warrantyItems[indexOfMCPN].Description = this.getView().getModel("WarrantyClaim").getProperty("/Description");
					warrantyItems[indexOfMCPN].Quantity.value = this.getView().getModel("WarrantyClaim").getProperty("/Quantity/value");
					warrantyItems[indexOfMCPN].PartRequested = this.getView().getModel("WarrantyClaim").getProperty("/PartRequested");
					
				} else {
					var warrantyItem = Models.createNewWarrantyItem("MAT");
					warrantyItem.setProperty("/PartNumber/value", this.getView().getModel("WarrantyClaim").getProperty("/MCPN/value"));
					warrantyItem.setProperty("/Description", this.getView().getModel("WarrantyClaim").getProperty("/Description"));
					warrantyItem.setProperty("/PartRequested", this.getView().getModel("WarrantyClaim").getProperty("/PartRequested"));
					warrantyItem.setProperty("/Quantity/value", this.getView().getModel("WarrantyClaim").getProperty("/Quantity/value"));
					warrantyItem.setProperty("/IsMCPN",true);
					warrantyItems.push(warrantyItem.getProperty("/"));
				}
			} else {
				
				this.getView().getModel("WarrantyClaim").setProperty("/Description","");
				this.getView().getModel("WarrantyClaim").setProperty("/Quantity/value",0);
				this.getView().getModel("WarrantyClaim").setProperty("/PartRequested","");

				if(warrantyItems[indexOfMCPN]){
					warrantyItems[indexOfMCPN].PartNumber.value = "";
					warrantyItems[indexOfMCPN].Description = "";
					warrantyItems[indexOfMCPN].Quantity.value = 0;
					warrantyItems[indexOfMCPN].PartRequested = "";
				}
			}
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);
			
			//Make sure the MCPN is hidden in the List
			this._applyPartTableFilter();
			
			//Delete any VIN/MCPN dependent LON codes
			if(this.getView().getModel("WarrantyClaim").getProperty("/ObjectType") === "VELO" ){
				var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");	
    			labourItems.forEach(function(item){
    				if(item.ItemKey.slice(4,6) !== "99"){
    					item.Deleted = true;	
    				}
				});
				this.getView().getModel("WarrantyClaim").setProperty("/Labour", labourItems);
				sap.ui.getCore().getEventBus().publish("WarrantyClaim","LONModified");
			}
			
			WarrantyClaim.validateMainCausalPartNumber();
			WarrantyClaim.validateMainCausalPartNumberQuantity();
			this.logValidationMessage("MCPN");
			this.logValidationMessage("Quantity");
			
		},
		
		_updateMCPNFromSelection: function(dataObject){
			
			this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",dataObject.materialNo);
			this.getView().getModel("WarrantyClaim").setProperty("/Description",dataObject.description);
			this.getView().getModel("WarrantyClaim").setProperty("/PartRequested", "S");
			this.onMCPNChanged(); //Update the Parts Table
		},
		
		////////////////////////////////
		//Other Parts Handlers	
		////////////////////////////////
		onOtherPartValueHelpRequest: function(event){
			this._MCPNRequest = false;
			this._OtherPartPath = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this._openPartValueHelpDialog();
		},
			
		onOtherPartSuggestionSelected: function(event){
			this._updateOtherPartFromSelection(
				event.getParameter("selectedRow").getBindingContext().getObject(),
				event.getSource().getBindingContext("WarrantyClaim").getPath()
			);
		},
		
		onAddOtherPart: function(event){
			
			//Create a blank Other Part row
			var warrantyItems = this.getView().getModel("WarrantyClaim").getProperty("/Parts");

			// add the new part
			var warrantyItem = Models.createNewWarrantyItem("MAT");
			warrantyItem.setProperty("/PartRequested", "S");
			warrantyItems.push(warrantyItem.getProperty("/"));
	
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Parts", warrantyItems);		
			
		},
		
		onOtherPartDeletePart: function(event) {

			// Get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/PartNumber/ruleResult/valid", true);
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Quantity/ruleResult/valid", true);
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);
			this._applyPartTableFilter();
			
			this.logValidationMessage("Quantity" + path,"WarrantyClaim",path + "/Quantity");
			this.logValidationMessage("PartNumber" + path,"WarrantyClaim",path + "/PartNumber");

		},	
		
		onOtherPartPartNumberChanged: function(event){
			
			var oDataPath = event.getSource().getParent().getBindingContext("WarrantyClaim").getPath();
			var part = this.getView().getModel("WarrantyClaim").getProperty(oDataPath);	
				
			if(part.PartNumber.value === ""){
				part.Description = "";
				part.Quantity.value = 0;
			} else {
					
				var suggestionMatched = false;
		    	event.getSource().getSuggestionRows().forEach(function(suggestion){
		    		
				    var suggestedPart = suggestion.getBindingContext().getObject();
				    if (suggestedPart.materialNo === part.PartNumber.value){
				    	if(part.Description === ""){
				    		part.Description = suggestedPart.description;
				    	}
				        suggestionMatched = true;
				    }
		    	});
		    	
			    if(!suggestionMatched){
			    	part.Description = "";
			    }
			}			
				
			WarrantyClaim.validateOtherPartPartNumber(part);
			this.logValidationMessage("PartNumber" + oDataPath,"WarrantyClaim",oDataPath + "/PartNumber");
		},
			
		onOtherPartQuantityChanged: function(event){
				
			var oDataPath = event.getSource().getParent().getBindingContext("WarrantyClaim").getPath();
			var part = this.getView().getModel("WarrantyClaim").getProperty(oDataPath);	
				
			WarrantyClaim.validateOtherPartQuantity(part);
			this.logValidationMessage("Quantity" + oDataPath,"WarrantyClaim",oDataPath + "/Quantity");		
		},
		
		_updateOtherPartFromSelection: function(dataObject, path){
			var warrantyItem = this.getView().getModel("WarrantyClaim").getProperty(path);

			//Update the Part
			warrantyItem.PartNumber.value = dataObject.materialNo;
			warrantyItem.Description = dataObject.description;
			
			// update the model
			this.getView().getModel("WarrantyClaim").setProperty(path, warrantyItem);
			
			//Validate
			WarrantyClaim.validateOtherPartPartNumber(warrantyItem);
			this.logValidationMessage("PartNumber" + path,"WarrantyClaim",path + "/PartNumber");
		},
		
		////////////////////////////////
		//Shared Handlers
		////////////////////////////////
		onValueHelpPartSearch: function(event) {
			event.getSource().getBinding("items").filter(this._partSearchFilter(event.getParameter("value")));
		},
		
		onPartSuggest: function(event){
			event.getSource().getBinding("suggestionRows").filter(this._partSearchFilter(event.getParameter("suggestValue")));
		},
		
		_partSearchFilter: function(searchString){
			
			var filters = [];
			if (searchString) {
				var partsFilterString = searchString.replace(/[^a-zA-Z0-9]/g, "");
				filters.push(new Filter([
					new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, searchString),
					new Filter("materialNo", sap.ui.model.FilterOperator.StartsWith, partsFilterString),
					new Filter("description", sap.ui.model.FilterOperator.Contains, searchString)
				], false));
				filters.push( new Filter("salesOrg",sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")));
			} else {
				filters.push( new Filter("salesOrg",sap.ui.model.FilterOperator.EQ, 
						this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")));
			}
			return filters;
		},
			
		onValueHelpPartSelected: function(event){
			var dataObject = event.getParameter("selectedItem").getBindingContext().getObject();
			if(this._MCPNRequest){
				this._updateMCPNFromSelection(dataObject);
			} else {
				this._updateOtherPartFromSelection(dataObject, this._OtherPartPath);	
			}
		},
		
		_openPartValueHelpDialog: function(){
			
			// Create the dialog if it isn't already
			if (!this._partValueHelpDialog) {
				this._partValueHelpDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.PartValueHelpDialog", this);
				this.getView().addDependent(this._partValueHelpDialog);
			}

			var filters = [];
			filters.push(new Filter("salesOrg",sap.ui.model.FilterOperator.EQ, 
				this.getView().getModel("WarrantyClaim").getProperty("/SalesOrganisation")));

			this._partValueHelpDialog.getBinding("items").filter(filters);
			
			// Display the popup dialog for adding parts
			this._partValueHelpDialog.open();
		},
		
		_applyPartTableFilter: function(){
			//Hide the Deleted rows, and the MCP
			var filters = [];
			filters.push(new Filter("Deleted",sap.ui.model.FilterOperator.EQ, false));
			filters.push(new Filter("IsMCPN",sap.ui.model.FilterOperator.EQ, false));
			this.getView().byId("partsTable").getBinding("items").filter(filters);
		},

		_updateMCPN: function(){
			
			this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value","");
			this.getView().getModel("WarrantyClaim").setProperty("/Quantity/value",0);	
			this.getView().getModel("WarrantyClaim").setProperty("/Description","");
			this.getView().getModel("WarrantyClaim").setProperty("/PartRequested","");
					
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part){
				
				if(part.IsMCPN && part.Deleted === false ){
					this.getView().getModel("WarrantyClaim").setProperty("/MCPN/value",part.PartNumber.value);
					this.getView().getModel("WarrantyClaim").setProperty("/Quantity/value",part.Quantity.value);	
					this.getView().getModel("WarrantyClaim").setProperty("/Description",part.Description);
					this.getView().getModel("WarrantyClaim").setProperty("/PartRequested",part.PartRequested);
				}
			}.bind(this));
			
			//Make sure the MCPN is hidden in the List
			this._applyPartTableFilter();
		},
		
		_refreshValidationMessages: function(){
			this.logValidationMessage("MCPN");
			this.logValidationMessage("Quantity");
			
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part,index){
				
				if(!part.isMCPN && !part.Deleted){
					var oDataPath = "/Parts/" + index;
					this.logValidationMessage("PartNumber" + oDataPath,"WarrantyClaim",oDataPath + "/PartNumber");
					this.logValidationMessage("Quantity" + oDataPath,"WarrantyClaim",oDataPath + "/Quantity");
				}
			}.bind(this));
		}
	});

});
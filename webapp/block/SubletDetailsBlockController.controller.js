sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageBox"
], function(BaseController, Models, JSONModel, Filter, MessageBox) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.SubletDetailsBlockController", {

		onInit: function(){
			
			var subletInvalid = new JSONModel({
				"subletCode": false,
				"quantity": false,
				"businessName": false,
				"invoice": false
			});
			this.setModel(subletInvalid, "subletInvalid");
				
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","RecallApplied",this._applySubletTableFilter,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._applySubletTableFilter,this);
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","RecallApplied",this._applySubletTableFilter,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Saved",this._applySubletTableFilter,this);
		},
		
    	readSubletCatalog: function(){
			this._readCatalog("ZSUBL","SubletCodes",1);
		},
		
    	addSublet: function(){
    		
    		// Create the dialog if it isn't already
			if (!this._subletDialog) {
				this._subletDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SubletSelectionDialog", this);
				this.getView().addDependent(this._subletDialog);
			}

    		//Create a new empty item
            var subletItem = Models.createNewWarrantyItem("SUBL");   
            this.getView().setModel(subletItem, "SubletItem");
            
            //Reset the Validation
            this.getView().getModel("subletInvalid").setProperty("/subletCode",false);
			this.getView().getModel("subletInvalid").setProperty("/quantity",false);
			this.getView().getModel("subletInvalid").setProperty("/businessName",false);
			this.getView().getModel("subletInvalid").setProperty("/invoice",false);
			
			// Display the popup dialog for adding parts
			this._subletDialog.open();
    	},
    	
    	editSublet: function(event){
    					
    		var sublets = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			var itemIndex = path.split("/")[2];
			
			// Deep copy
			var sublet = jQuery.extend(true, {}, sublets[itemIndex]);
			sublet.path = path;
			
            this.getView().setModel(new JSONModel(sublet), "SubletItem");
            
        	if (!this._subletDialog) {
				this._subletDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SubletSelectionDialog", this);
				this.getView().addDependent(this._subletDialog);
			}
			
			//Reset the Validation Rules
			this.getView().getModel("subletInvalid").setProperty("/subletCode",false);
    		this.getView().getModel("subletInvalid").setProperty("/invoice",false);
    		this.getView().getModel("subletInvalid").setProperty("/businessName",false);
    		this.getView().getModel("subletInvalid").setProperty("/quantity",false);
			
			this._subletDialog.open();
    	},
    	
		deleteSublet: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);
			this._applySubletTableFilter();
		},
    	
    	handleOK: function(){
    	
    		var sublet = this.getView().getModel("SubletItem");
    		
    		//Validate the Sublet - all fields are mandatory
    		var SubletCode = sublet.getProperty("/ItemKey");
    		var Quantity = sublet.getProperty("/Quantity/value");
    		var Invoice = sublet.getProperty("/Invoice");
    		var BusinessName = sublet.getProperty("/BusinessName");
    		
    		if(SubletCode === "" || Quantity <= 0 || Invoice === "" || BusinessName === ""){
    			MessageBox.error(
					"All Sublet fields are required. Pre GST Cost must be > $0.",
					{
						id : "errorMessageBox",
						actions : [MessageBox.Action.CLOSE]
					}
				);
				
				this.getView().getModel("subletInvalid").setProperty("/subletCode",SubletCode === "");
				this.getView().getModel("subletInvalid").setProperty("/quantity",Quantity <= 0 );
				this.getView().getModel("subletInvalid").setProperty("/businessName",BusinessName === "");
				this.getView().getModel("subletInvalid").setProperty("/invoice",Invoice === "");
				
    			return;
    		}
    		
			var sublets = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");

            if(sublet.getProperty("/path")){
				var itemIndex = sublet.getProperty("/path").split("/")[2];
				sublets[itemIndex] = sublet.getProperty("/");
            } else {
            	sublets.push(sublet.getProperty("/"));	
            }

			// update the model
			this.getView().getModel("WarrantyClaim").setProperty("/Sublet", sublets);    	
    		this._subletDialog.close();	
    	},
    	
    	handleClose: function(){
    		this._subletDialog.close();
    	},
    	
    	onSubletChanged:function(event){
   
    		switch(event.getSource().sId){
    			case "SubletCode":
    				this.getView().getModel("subletInvalid").setProperty("/subletCode",event.getSource().getValue() === "");
    				break;
    			case "Invoice":
    				this.getView().getModel("subletInvalid").setProperty("/invoice",event.getSource().getValue() === "");
    				break;
    			case "BusinessName":
    				this.getView().getModel("subletInvalid").setProperty("/businessName",event.getSource().getValue() === "");
    				break;
    			case "Quantity":
    				this.getView().getModel("subletInvalid").setProperty("/quantity",event.getSource().getValue() <= 0);
    				break;
    		}
    	},
    	
		_applySubletTableFilter: function(){
			
			var filters = [];

			filters.push(
				new Filter(
					"Deleted",
					sap.ui.model.FilterOperator.EQ, 
					false
			));
			this.getView().byId("SubletTable").getBinding("items").filter(filters);
		}
	});
});
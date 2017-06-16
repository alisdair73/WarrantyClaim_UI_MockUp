sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(BaseController, Models, JSONModel, Filter) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.SubletDetailsBlockController", {

		onInit: function(){
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._applySubletTableFilter.bind(this),this);
		},
		
    	readSubletCatalog: function(){
			this.readCatalog("ZSUBL","SubletCodes",1);
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
            
			// Display the popup dialog for adding parts
			this._subletDialog.open();
    	},
    	
    	editSublet: function(event){
    					
    		var sublets = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			var itemIndex = path.split("/")[2];
			
			var sublet = new JSONModel(sublets[itemIndex]);
			sublet.setProperty("/path",path);
			
            this.getView().setModel(sublet, "SubletItem");
            
        	if (!this._subletDialog) {
				this._subletDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SubletSelectionDialog", this);
				this.getView().addDependent(this._subletDialog);
			}
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
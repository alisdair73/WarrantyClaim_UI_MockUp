sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"WarrantyClaim_MockUp/model/models"
], function(Controller, JSONModel, Models) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.SubletDetailsBlockController", {

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

			var sublets = this.getView().getModel("WarrantyClaim").getProperty("/Sublet");

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();

            var itemIndex = path.split("/")[2];

			// delete the line using the path to work out the index
			sublets.splice(itemIndex, 1);
			this.getView().getModel("WarrantyClaim").setProperty("/Sublet", sublets);

		},	
		
    	subletCodeSelected:function(event){
			var sublet = this.getView().getModel("SubletItem");
			sublet.setProperty("/Description", event.getParameter("selectedItem").getProperty("text"));
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
    	}
    
	});

});
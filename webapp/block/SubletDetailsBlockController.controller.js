sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(BaseController, Models, JSONModel) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.SubletDetailsBlockController", {

/*		showSubletSelector: function(){
			if (! this._subletSelector) {
				this._subletSelector = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.SubletCodeSelector", this);
				this.getView().addDependent(this._subletSelector);
				this.readCatalog("WTY3","SubletCodes");
			} 
			this._subletSelector.open(); 
    	},*/
    
    	readSubletCatalog: function(){
			this.readCatalog("ZSUBL","SubletCodes",1);
		},
		
/*    	handleCancel: function(){
    		this._subletSelector.close(); 
    	},*/
    
/*    	subletCodeSelected: function(evt){
    	
    		var path = evt.getParameter("listItem").getBindingContext("SubletCodes").getPath();
    		var sublet = this.getModel("SubletCodes").getProperty(path);
    		this.getModel("SubletItem").setProperty("/ItemKey",sublet.code);
    		this.getModel("ViewHelper").setProperty("/warrantyUI/SubletCodeDescription", sublet.text);

			this._subletSelector.close();
    	},*/

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
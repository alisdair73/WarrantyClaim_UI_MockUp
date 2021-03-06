sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat",
	"WarrantyClaim_MockUp/model/WarrantyClaim"
], function(BaseController, Filter, Models, JSONModel, MessageToast, MessageBox, NumberFormat,WarrantyClaim) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.LONDetailsBlockController", {
		
		onInit: function(){
			
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","RecallApplied",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","LONModified",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
			
			this.getView().setModel(new JSONModel({"HasLON":false}) , "LONHelper");
			
			this.getView().setModel(new JSONModel({
				"Assembly":"",
				"SubAssembly":"",
				"SubAssemblies":[],
				"OperationType":"",
				"OperationCode":"",
				"OperationCodeDescription":"",
				"OperationCodes":[],
				"RequestedHours":"0",
				"Description":""
			}) , "AdditionalLONHelper");
			
			var LONInvalid = new JSONModel({
				"Assembly": false,
				"SubAssembly": false,
				"OperationType": false,
				"OperationCode": false,
				"RequestedHours": false,
				"Description": false
			});
			this.setModel(LONInvalid, "LONInvalid");
			
			this._hoursFormatter = NumberFormat.getFloatInstance({
				maxFractionDigits: 1,
				groupingEnabled: false,
            	decimalSeparator: '.'
			});			
		},
		
		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","RecallApplied",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","LONModified",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Saved",this._applyLONTableFilter,this);
			sap.ui.getCore().getEventBus().unsubscribe("WarrantyClaim","Validate",this._refreshValidationMessages,this);
		},
		
		onCheckLON: function(){
			
			// Create the dialog if it isn't already
			if (!this._LONDialog) {
				this._LONDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.view.LabourOperationNumberSelection", this);
				this.getView().addDependent(this._LONDialog);
			}

			//Set the VIN to Filter the LON List
			var filters = [];
			filters.push(
				new Filter(
					"VIN",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value")
			));
			
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part){
				if(part.IsMCPN){
					filters.push(
						new Filter("MCPN", sap.ui.model.FilterOperator.EQ, part.PartNumber.value)
					);
				}
			});
			
			// Display the popup dialog for adding parts
			this._LONDialog.open();
			sap.ui.getCore().byId("LONCatalog").removeSelections();
			sap.ui.getCore().byId("LONCatalog").getBinding("items").filter(filters).attachDataReceived(this._hasLON.bind(this));
			
		},
		
		_hasLON: function(filteredData){
			
			this.getView().getModel("LONHelper").setProperty("/HasLON",false);
			
			if(filteredData.getParameter("data") && filteredData.getParameter("data").results.length > 0){
				this.getView().getModel("LONHelper").setProperty("/HasLON",true);
			}
		},
		
		onCancelCheckLON: function(){
			this._LONDialog.close();
		},
		
		onAddLON: function(){
			
			var displayLONRules = false;
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
			if(sap.ui.getCore().byId("LONCatalog").getSelectedItems().length === 0){
				MessageToast.show("Please select a LON code from the list.");
				return;
			}
			
			for(var i=0; i<sap.ui.getCore().byId("LONCatalog").getSelectedItems().length; i++){
				
				var bindingPath = sap.ui.getCore().byId("LONCatalog").getSelectedItems()[i].getBindingContext().getPath();
				var selectedLON = sap.ui.getCore().byId("LONCatalog").getModel().getProperty(bindingPath);
				
				if(this._isOkToAddLON(selectedLON.LONCode,true)){
					var newLONItem = Models.createNewWarrantyItem("FR");   
					newLONItem.setProperty("/ItemKey",selectedLON.LONCode);
					newLONItem.setProperty("/Description",selectedLON.Description);
					newLONItem.setProperty("/Quantity/value",selectedLON.Hours);
					newLONItem.setProperty("/IsLONCatalogItem",true);
					labourItems.push(newLONItem.getProperty("/"));
				} else {
					displayLONRules = true;
				}
			}
			
			this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
			this._LONDialog.close();
			
			if(displayLONRules){
				this._displayLONRules();
			}
		},
		
		_displayLONRules: function(){
			MessageBox.warning(
				"Some LON Codes were not added.\n" +
				"Assigned LON Codes cannot contain duplicates, and a\n" +
				"Claim can only have one 6 digit LON Code from the LON Catalog.\n" +
				"Multiple 6 Digit Additional LON Codes are allowed.",
				{
					id : "LONMessageBox",
					title: "Add LON",
					actions : [MessageBox.Action.CLOSE]
				}	
			);
		},
		
		_isOkToAddLON:function(candidateLONCode, isLONCatalog){
			
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
			//Don't add Duplicates
			var duplicateLON = labourItems.find(function(lon){
				return lon.ItemKey === candidateLONCode && !lon.Deleted;
			});
				
			if(duplicateLON){
				return false;
			} else {
				
				//LON list can contain only 1 Six Digit LON from the main catalog
				//Any 6 Digit LON finishing in 99 (Streight Time) can be ignored
				//as multiple 
				if(candidateLONCode.length > 5 && isLONCatalog) {
					switch(candidateLONCode.length){
						case 6:
							if(candidateLONCode.slice(4,6) !== "99"){
							
								var sixDigitLON = labourItems.find(function(lon){
									return lon.ItemKey.length === 6 && !lon.Deleted && lon.ItemKey.slice(4,6) !== "99";
								});
								
								if(sixDigitLON && sixDigitLON.ItemKey.slice(4,6) !== "99"){
									return false;
								}
							}
							break;
					//Multiple 7 digit LONS are allowed now
/*						case 7:
							var sevenDigitLON = labourItems.find(function(lon){
								return lon.ItemKey.length === 7 && !lon.Deleted;
							});
							if(sevenDigitLON){
								return false;
							}
							break;*/
					}
				}
			}
			return true;
		},
		
		loadAdditionalLONCatalog: function(){

        	var vin = this.getView().getModel("WarrantyClaim").getProperty("/ExternalObjectNumber/value");
        	
        	var mcpn = this.getView().getModel("WarrantyClaim").getProperty("/Parts").filter(function(part){
				return part.IsMCPN;
			});
			
			if(mcpn[0]){
			
				this.getView().getModel().read(
					"/AdditionalLONSet(VIN='" + vin + "',MCPN='" + mcpn[0].PartNumber.value + "')/$value",
					{
						success: function(JSONData){
							var additionalLON = JSON.parse(JSONData);
							this.getView().setModel(new JSONModel(additionalLON.Catalog[0].nodes),"AdditionalLON");
							this.getView().setModel(new JSONModel(additionalLON.Catalog[1].nodes),"OperationTypes");
							this.getView().setModel(new JSONModel(additionalLON.LONCodes.LON_CODES),"OperationCodes");
							this.getView().getModel("ViewHelper").setProperty("/busy", false);
							
						}.bind(this),
						error: function(error){
							this.getView().getModel("ViewHelper").setProperty("/busy", false);
						}
					}
				);
			}
		},
		
		onAssemblySelected: function(oEvent){

			var additionalLON = this.getView().getModel("AdditionalLON").getData();

			for(var i=0; i< additionalLON.length; i++){
			  if (additionalLON[i].code === oEvent.getParameter("selectedItem").mProperties.key){
			  	this.getView().getModel("AdditionalLONHelper").setProperty("/SubAssembly","");
			  	this.getView().getModel("AdditionalLONHelper").setProperty("/OperationCode","");
			  	this.getView().getModel("AdditionalLONHelper").setProperty("/RequestedHours","0");
			  	this.getView().getModel("AdditionalLONHelper").setProperty("/Description","");
			    this.getView().getModel("AdditionalLONHelper").setProperty("/SubAssemblies", additionalLON[i].nodes);
			    this._setOperationCodes();
			    return;
			  }
			}
			
		},
		
		onSubAssemblySelected: function(){
          this._setOperationCodes();
		},		
		
		onOperationTypeSelected: function(){
            this._setOperationCodes();	
		},
		
		onOperationCodeSelected: function(event){
			
			var lonCode = event.getParameter("selectedItem").getBindingContext("AdditionalLONHelper").getObject();
			
			this.getView().getModel("AdditionalLONHelper").setProperty("/RequestedHours",lonCode.HOURS);
			this.getView().getModel("AdditionalLONHelper").setProperty("/OperationCodeDescription",lonCode.DESCRIPTION);
			
		},
		
		_setOperationCodes:function(){
			
			var assembly = this.getView().getModel("AdditionalLONHelper").getProperty("/Assembly");
			var subAssembly = this.getView().getModel("AdditionalLONHelper").getProperty("/SubAssembly");
			var operationType = this.getView().getModel("AdditionalLONHelper").getProperty("/OperationType");
			var validLONCodes = [];
			
			var assemblyCode = "";
			var subAssemblyCode = "";
			var operationTypeCode = "";
			
			if(assembly.split("-")[1]){
				assemblyCode = assembly.split("-")[1];
			}
			
			if(subAssembly.split("-")[2]){
				subAssemblyCode = subAssembly.split("-")[2];
			}
			
			if(operationType.split("-")[1]){
				operationTypeCode = operationType.split("-")[1];
			}
			
			
			if(assemblyCode !== "" && subAssemblyCode !== "" && operationTypeCode !== ""){
			
				var LONPrefix = assemblyCode + subAssemblyCode + operationTypeCode;
				var candidateLONCodes = this.getView().getModel("OperationCodes").getProperty("/");
			
				validLONCodes = candidateLONCodes.filter(function(LONCode){
					return LONCode.LON_CODE.substr(0, 4) === LONPrefix; 
				});
			
				validLONCodes.push({
		    		"LON_CODE": LONPrefix + "99",
        			"DESCRIPTION":"Straight Time",
        			"HOURS": 0
				});
			}
			this.getView().getModel("AdditionalLONHelper").setProperty("/OperationCode","");
			this.getView().getModel("AdditionalLONHelper").setProperty("/Description","");
			this.getView().getModel("AdditionalLONHelper").setProperty("/RequestedHours","0");
			this.getView().getModel("AdditionalLONHelper").setProperty("/OperationCodes",validLONCodes);
		},
		
		onLONChanged:function(event){
			//Ensure MPE entered LON is kept to 1DP
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			
			this.getView().getModel("WarrantyClaim").setProperty( path + "/Quantity/value",
				this._hoursFormatter.format(this.getView().getModel("WarrantyClaim").getProperty(path + "/Quantity/value")) 
			);
			
			var LON = this.getView().getModel("WarrantyClaim").getProperty(path);	
			WarrantyClaim.validateMPELONQuantity(LON);
			this.logValidationMessage("Quantity" + path,"WarrantyClaim",path + "/Quantity");			
		},
		
		onAdditionalLONChanged:function(event){
   
    		switch(event.getSource().sId){
    			case "assembly":
    				this.getView().getModel("LONInvalid").setProperty("/Assembly",event.getSource().getValue() === "");
    				break;
    			case "subAssembly":
    				this.getView().getModel("LONInvalid").setProperty("/SubAssembly",event.getSource().getValue() === "");
    				break;
    			case "operationType":
    				this.getView().getModel("LONInvalid").setProperty("/OperationType",event.getSource().getValue() === "");
    				break;
    			case "operationCode":
    				this.getView().getModel("LONInvalid").setProperty("/OperationCode",event.getSource().getValue() === "");
    				break;
    			case "requestedHours":
    				//LON Hours is 1DP only
    				this.getView().getModel("AdditionalLONHelper").setProperty("/RequestedHours",
						this._hoursFormatter.format(this.getView().getModel("AdditionalLONHelper").getProperty("/RequestedHours")) 
					);
    				
    				this.getView().getModel("LONInvalid").setProperty("/RequestedHours",
    					this.getView().getModel("AdditionalLONHelper").getProperty("/RequestedHours") <= 0);
    				break;
    		}
    	},
    	
		onAddAdditionalLON: function(){
			
			//Do some Field Validation First
			var assembly = this.getView().getModel("AdditionalLONHelper").getProperty("/Assembly");
			var subAssembly = this.getView().getModel("AdditionalLONHelper").getProperty("/SubAssembly");
			var operationType = this.getView().getModel("AdditionalLONHelper").getProperty("/OperationType");
			var operationCode = this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode");
			var requestedHours = this.getView().getModel("AdditionalLONHelper").getProperty("/RequestedHours");
//			var description = this.getView().getModel("AdditionalLONHelper").getProperty("/Description");
			
			if(assembly === "" || subAssembly === "" || operationType === "" || operationCode === "" || requestedHours <= 0 ){
    			MessageBox.error(
					"Please fill all mandatory fields. Requested Hours must be > 0.0.",
					{ actions : [MessageBox.Action.CLOSE] }
				);
				
				this.getView().getModel("LONInvalid").setProperty("/Assembly",assembly === "");
				this.getView().getModel("LONInvalid").setProperty("/SubAssembly",subAssembly === "");
				this.getView().getModel("LONInvalid").setProperty("/OperationType",operationType === "");
				this.getView().getModel("LONInvalid").setProperty("/OperationCode",operationCode === "");
				this.getView().getModel("LONInvalid").setProperty("/RequestedHours",requestedHours <= 0);
		//		this.getView().getModel("LONInvalid").setProperty("/Description",description === "");
				
    			return;
    		}

			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			var newLONItem = Models.createNewWarrantyItem("FR");   
			var newLONCode = this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode");
			
			if(this._isOkToAddLON(newLONCode,false)){
			
				newLONItem.setProperty("/ItemKey",newLONCode);
				newLONItem.setProperty("/Quantity/value",this.getView().getModel("AdditionalLONHelper").getProperty("/RequestedHours"));
				newLONItem.setProperty("/Description",this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCodeDescription"));
				
				if (this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode").substr(4,2) === "99"){
					//If this is a "Straight Time" LON then copy addition description to Dealer Comments section 				
					
					var now = new Date();
	            	var displayDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString(); 	
					
					var additionalLONComments = displayDateTime + ": Additional LON " + 
						this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode") + ", " +
						this.getView().getModel("AdditionalLONHelper").getProperty("/Description");
					
					if(this.getView().getModel("WarrantyClaim").getProperty("/DealerComments/value") !== ""){
						//Add a Line
						additionalLONComments = "\n\n" + additionalLONComments;
					}
					
					this.getView().getModel("WarrantyClaim").setProperty("/DealerComments/value", 
						this.getView().getModel("WarrantyClaim").getProperty("/DealerComments/value") + additionalLONComments);
				}
				
				labourItems.push(newLONItem.getProperty("/"));
				this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
				this._additionalLONDialog.close();
			} else {
				this._displayLONRules();
			}
		},
		
		onAdditionalLON: function(){
			
			//Close the Add LON Dialog
			this._LONDialog.close();
			
			// Create the dialog if it isn't already
			if (!this._additionalLONDialog) {
				this._additionalLONDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.fragment.AdditionalLONSelector", this);
				this.getView().addDependent(this._additionalLONDialog);
			}
			this._additionalLONDialog.open();
		},
		
		onCancelAdditionaLON: function(){
			this._additionalLONDialog.close();
		},
		
		deleteLON: function(event) {

			// get the data for the deleted row
			var path = event.getSource().getBindingContext("WarrantyClaim").getPath();
			this.getView().getModel("WarrantyClaim").setProperty(path + "/Deleted", true);
			this._applyLONTableFilter();
		},
		
		_applyLONTableFilter: function(){
			
			var filters = [];
			filters.push(new Filter("Deleted",sap.ui.model.FilterOperator.EQ,false));
			this.getView().byId("LONTable").getBinding("items").filter(filters);
		},
		
		_refreshValidationMessages: function(){

			this.getView().getModel("WarrantyClaim").getProperty("/Labour").forEach(function(LON,index){
				
				if(!LON.Deleted){
					var oDataPath = "/Labour/" + index;
					this.logValidationMessage("Quantity" + oDataPath,"WarrantyClaim",oDataPath + "/Quantity");
				}
			}.bind(this));
		}		
	});

});
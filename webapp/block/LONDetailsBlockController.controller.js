sap.ui.define([
	"WarrantyClaim_MockUp/controller/BaseController",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(BaseController, Filter, Models, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("WarrantyClaim_MockUp.block.LONDetailsBlockController", {
		
		onInit: function(){
			
			sap.ui.getCore().getEventBus().subscribe("Recall","Transferred",this._applyLONTableFilter.bind(this),this);
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._applyLONTableFilter.bind(this),this);
			
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
					this.getView().getModel("WarrantyClaim").getProperty("/VIN/value")
			));
			
			this.getView().getModel("WarrantyClaim").getProperty("/Parts").forEach(function(part){
				if(part.IsMCPN){
					filters.push(
						new Filter("MCPN", sap.ui.model.FilterOperator.EQ, part.PartNumber)
					);
				}
			});
			
			sap.ui.getCore().byId("LONCatalog").getBinding("items").filter(filters).attachDataReceived(this._hasLON.bind(this));
 			
			// Display the popup dialog for adding parts
			this._LONDialog.open();
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
			
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
			if(sap.ui.getCore().byId("LONCatalog").getSelectedItems().length === 0){
				MessageToast.show("Please select a LON code from the list.");
				return;
			}
			
			for(var i=0; i<sap.ui.getCore().byId("LONCatalog").getSelectedItems().length; i++){
				
				var bindingPath = sap.ui.getCore().byId("LONCatalog").getSelectedItems()[i].getBindingContext().getPath();
				var selectedLON = sap.ui.getCore().byId("LONCatalog").getModel().getProperty(bindingPath);
				
				var newLONItem = Models.createNewWarrantyItem("FR");   
				newLONItem.setProperty("/ItemKey",selectedLON.LONCode);
				newLONItem.setProperty("/Description",selectedLON.Description);
				newLONItem.setProperty("/Quantity",selectedLON.Hours);
				labourItems.push(newLONItem.getProperty("/"));
			}
			
			this.getView().getModel("WarrantyClaim").setProperty("/Labour",labourItems);
			this._LONDialog.close();
		},
		
		loadAdditionalLONCatalog: function(){

        	var vin = this.getView().getModel("WarrantyClaim").getProperty("/VIN/value");
			var mcpn = this.getView().getModel("WarrantyClaim").getProperty("/Parts/0/PartNumber");

			this.getView().getModel().read(
				"/AdditionalLONSet(VIN='" + vin + "',MCPN='" + mcpn + "')/$value",
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
		
		onAddAdditionalLON: function(){
			
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			var newLONItem = Models.createNewWarrantyItem("FR");   
			
			newLONItem.setProperty("/ItemKey",this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode"));
			newLONItem.setProperty("/Quantity",this.getView().getModel("AdditionalLONHelper").getProperty("/RequestedHours"));
			newLONItem.setProperty("/Description",this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCodeDescription"));
			
			if (this.getView().getModel("AdditionalLONHelper").getProperty("/OperationCode").substr(4,2) === "99"){
				//If this is a "Straight Time" LON then copy addition description to Dealer Comments section 				
				
				var now = new Date();
                var displayDateTime = now.getDate() + "/" + now.getMonth()+ "/" + now.getFullYear() + ' ' + now.getHours() + ":" + now.getMinutes();
				
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

			filters.push(
				new Filter(
					"Deleted",
					sap.ui.model.FilterOperator.EQ, 
					false
			));
			this.getView().byId("LONTable").getBinding("items").filter(filters);
		}
	});

});
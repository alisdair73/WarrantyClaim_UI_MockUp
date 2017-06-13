sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(Controller, Filter, Models, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.LONDetailsBlockController", {
		
		onInit: function(){
			
			this.getView().setModel(new JSONModel({
				"Assembly":"",
				"SubAssembly":"",
				"SubAssemblies":[],
				"OperationType":"",
				"OperationCode":"",
				"OperationCodes":[],
				"RequestedHours":0,
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
					this.getView().getModel("WarrantyClaim").getProperty("/VIN")
			));
			filters.push(
				new Filter(
					"MCPN",
					sap.ui.model.FilterOperator.EQ, 
					this.getView().getModel("WarrantyClaim").getProperty("/Parts/0/PartNumber")
			));			
			sap.ui.getCore().byId("LONCatalog").getBinding("items").filter(filters);
 			
			// Display the popup dialog for adding parts
			this._LONDialog.open();
		},
		
		onCancelCheckLON: function(){
			this._LONDialog.close();
		},
		
		onAddLON: function(){
			
			var labourItems = this.getView().getModel("WarrantyClaim").getProperty("/Labour");
			
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

        	var vin = this.getView().getModel("WarrantyClaim").getProperty("/VIN");
			var mcpn = this.getView().getModel("WarrantyClaim").getProperty("/Parts/0/PartNumber");

			this.getView().getModel().read(
				"/AdditionalLONSet(VIN='" + vin + "',MCPN='" + mcpn + "')/$value",
				{
					success: function(JSONData){
						var additionalLON = JSON.parse(JSONData);
						this.getView().setModel(new JSONModel(additionalLON),"AdditionalLON");
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

			for(var i=0; i< additionalLON.LON.ASSEMBLY_SYSTEMS.length; i++){
			  if (additionalLON.LON.ASSEMBLY_SYSTEMS[i].CODE === oEvent.getParameter("selectedItem").mProperties.key){
			  	this.getView().getModel("AdditionalLONHelper").setProperty("/SubAssembly","");
			    this.getView().getModel("AdditionalLONHelper").setProperty("/SubAssemblies",additionalLON.LON.ASSEMBLY_SYSTEMS[i].SUBASSEMBLY_SYSTEMS);
			    return;
			  }
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
		
	});

});
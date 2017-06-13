sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"WarrantyClaim_MockUp/model/models",
	"sap/ui/model/json/JSONModel"
], function(Controller, Filter, Models, JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.LONDetailsBlockController", {
		
		onInit: function(){
			
			this.setModel(new JSONModel({
				"Assembly":"",
				"SubAssembly":"",
				"SubAssemblies":[],
				"OperationType":""
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
			
			this.getView().getModel().read(
				"/AdditionalLONSet('')/$value",
				{
					success: function(JSONData){
						var additionalLON = JSON.parse(JSONData);
						this.getView().setModel(new JSONModel(additionalLON),"AdditionalLON");
						this.getModel("ViewHelper").setProperty("/busy", false);
						
					}.bind(this),
					error: function(error){
						this.getModel("ViewHelper").setProperty("/busy", false);
					}
				}
			);
		},
		
		onAssemblySelected: function(oEvent){
			this._updateL2Symptoms(oEvent.getParameter("selectedItem").mProperties.key);
			
			var additionalLON = this.getModel("AdditionalLON").getData();

/*			for(var i=0; i< symptomCatalog.length; i++){
			  if (symptomCatalog[i].code === level1Code){
			    this.getModel("SymptomCodesHelper").setProperty("/SymptomsL2",symptomCatalog[i].nodes);
			    return;
			  }
			}*/
			
		},
		
		onAdditionalLON: function(){
			
			// Create the dialog if it isn't already
			if (!this._additionalLONDialog) {
				this._additionalLONDialog = sap.ui.xmlfragment("WarrantyClaim_MockUp.fragment.AdditionalLONSelector", this);
				this.getView().addDependent(this._additionalLONDialog);
			}
			this._additionalLONDialog.open();
		}
	});

});
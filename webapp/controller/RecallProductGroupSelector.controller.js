sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter"
], function(Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.controller.RecallProductGroupSelector", {
		
		onInit: function(){
			
			var recallGroupModel = new JSONModel({
				"group1": true,
				"group2": false,
				"group3": false,
				"group4": false
			});
			this.getView().setModel(recallGroupModel, "RecallGroup");
			
/*			var recallItemsModel = new JSONModel({
				
				"MaterialNumber":"",
				"MaterialDescription":""
			});
			this.getView().setModel(recallGroupModel, "RecallItems");*/
			
		},
		
		onBeforeRendering: function(){
			//Load the details of the Recall
			var vin = this.getView().getModel("WarrantyClaim").getProperty("/VIN");
			var internalRecallNumber = this.getView().getModel("ViewHelper").getProperty("/warrantyUI/internalRecallNumber");
			
			this.getView().getModel().read(
				"/RecallItemSet", {
					context: null,
					filters: [
						new Filter("InternalRecallNumber",sap.ui.model.FilterOperator.EQ, internalRecallNumber),
						new Filter("VIN",sap.ui.model.FilterOperator.EQ, vin)
					],
					success: function(oData) {
						this._buildPartsView(oData.results);
					}.bind(this),
					error: function() {
					  //No Parts???
					}.bind(this)
				}
			);
		},
		
		_applyReplacementSelectionRule: function(rule){
			
			var groups = rule.split("-");
	        groups.forEach(function(group){
	          var material_config = group.split(".")	
	        });
			
		},
		
		_buildPartsView: function(recallItems){
			
			//Recall Parts (for all groups)
			var parts = recallItems.filter(
  				function(recallItem){
					return recallItem.ItemType=== 'MAT';
				}
			);
			
			var groupParts = [];
			if(parts.length > 0){
				parts.forEach(function(part){
					
					groupPart = {
						materialNumber = part.PartNumber,
						materialDescription = part.Description
					};	
					
					var groupDefinition = this._applyReplacementSelectionRule(part.ReplacementSelectionRule);
					
					groupParts.push(groupPart);
				});
				
				

			}
			
			
		}
	});
});
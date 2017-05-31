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
			this.getView().setModel(new JSONModel({"groupParts":[]}),"RecallItems");
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
					success: this._buildPartsView.bind(this),
					error: function() {
					  //No Parts???
					}.bind(this)
				}
			);
		},
		
		_applyReplacementSelectionRuleForMaterial: function(rule){
			
			var groups = rule.split("-");
			var tableRow = [];
			var tableCell = {};
			
	        groups.forEach(function(group, index){
	        	
	        	tableCell = {	
					"isRadioButton": false,
					"isStepInput": false,
					"stepInput": {"minValue": 0, "maxValue": 0, "quantity":0},
					"radioButton": {"selected": false, "group":""}
				};
				
	          var materialConfig = group.split(".");
	          var inGroup = materialConfig[0];
	          var subgroup = materialConfig[1];
	          var optional = materialConfig[2];
	          var quantity = materialConfig[3];
	          
	          if(inGroup !== "0"){
	          	if(subgroup === "A"){
	          		//Entry Field
	          		var minValue = 0;
	          		if(optional !== "O"){
	          			minValue = 1;
	          		}
	          		
	          		var maxValue = minValue;
	          		if(quantity.indexOf("*") === -1){
	          			maxValue = quantity;
	          		} else {
	          			maxValue = quantity.substring(0, quantity.indexOf("*"));	          		
	          			minValue = maxValue;
	          		}
	          		//Create the Step Input with Min and Max
	          		tableCell.isStepInput = true;
	          		tableCell.stepInput.minValue = minValue;
	          		tableCell.stepInput.maxValue = maxValue;
	          		
	          	} else {
	          		tableCell.isRadioButton = true;
	          		tableCell.radioButton.group = "G" + index + subgroup;
	          	}
	          }
	          
	          tableRow.push(tableCell);
	        });
			return tableRow;
		},
		
		_buildPartsView: function(recallItems){
			
			var numberOfColumns = 0;
			//Recall Parts (for all groups)
			var parts = recallItems.results.filter(
  				function(recallItem){
					return recallItem.ItemType === 'MAT' && recallItem.ReplacementSelectionRule !== "";
				}
			);
			
			var groupParts = [];
			if(parts.length > 0){
				parts.forEach(function(part){
					
					var groupPart = {
						"materialNumber": part.PartNumber,
						"materialDescription": part.Description,
						"groups":[]
					};	

					groupPart.groups = this._applyReplacementSelectionRuleForMaterial(part.ReplacementSelectionRule);
		  	    	numberOfColumns = Math.max(numberOfColumns, groupPart.groups.length);
					groupParts.push(groupPart);
				}.bind(this));
			}
			
			var recallItemsTable = this.getView().byId("recallItems");
			recallItemsTable.removeAllColumns();
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
                	"header" : new sap.m.Label({
                		text : "Material Number"
            		})
				})
			);
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "cellBorderRight",            		
                	"header" : new sap.m.Label({
                		text : "Description"
            		})
				})
			);
			
			var tableCells = [];
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialNumber}"}));
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialDescription}"}));
				        		
			for(var i=0; i<numberOfColumns; i++){
			
            	recallItemsTable.addColumn(
					new sap.m.Column({
	            		"hAlign": "Center",
	            		"width":"7rem",
	            		"styleClass": "{= ${RecallGroup>/group" + i + "} ? 'cellBorderRight' : 'cellBorderRight notSelected' }",
                		"header" : new sap.m.VBox({
							"items": [
                				new sap.m.Label({text : "Group " + i}),
                				new sap.ui.layout.HorizontalLayout({
	        						"content":[new sap.m.RadioButton({"groupName":"recallGroup", "selected":"{RecallGroup>/group" + i + "}"})]
		        				})
    	            		]})	
					})
				);
				
				tableCells.push(
					new sap.m.VBox({
						"items": [
							new sap.m.Text({"visible":"{= ${RecallItems>groups/" + i + "/isRadioButton} || ${RecallItems>groups/" + i + "/isStepInput} === false}"}),	
							new sap.m.StepInput({
								"min":"{RecallItems>groups/" + i + "/stepInput/minValue}",
								"max":"{RecallItems>groups/" + i + "/stepInput/maxValue}",
								"enabled":"{= ${RecallGroup>/group" + i + "}}",
								"visible":"{= ${RecallItems>groups/" + i + "/isStepInput}}"
							}),
							new sap.ui.layout.HorizontalLayout({
								"visible":"{= ${RecallItems>groups/" + i + "/isRadioButton}}",
	        					"content":[new sap.m.RadioButton({
	        						"groupName":"{RecallItems>groups/" + i + "/radioButton/group}",
	        						"enabled":"{= ${RecallGroup>/group" + i + "}}"
	        					})]
	        				})
						]
					})
			    );
			}
			
			recallItemsTable.bindItems({
				"path":"RecallItems>/groupParts", 
				"template": new sap.m.ColumnListItem({"cells" : tableCells})
			});
			
			this.getView().getModel("RecallItems").setProperty("/groupParts", groupParts);
		}
	});
});
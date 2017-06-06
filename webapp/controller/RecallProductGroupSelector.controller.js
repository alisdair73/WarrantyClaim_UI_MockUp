sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.controller.RecallProductGroupSelector", {
		
		onBeforeRendering: function(){

			var recallItemsTable = this.getView().byId("recallItems");
			recallItemsTable.removeAllColumns();
			this._buildColumnList();
			
			recallItemsTable.bindItems({
				"path":"RecallItems>/", 
				"factory": this._tableCellFactory
			});
		},
		
/*		_applyReplacementSelectionRuleForMaterial: function(rule){
			
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
	          			maxValue = parseInt(quantity);
	          		} else {
	          			maxValue = parseInt(quantity.substring(0, quantity.indexOf("*")));	          		
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
		},*/
		
		_buildColumnList: function(){

			var recallItemsTable = this.getView().byId("recallItems");
			recallItemsTable.removeAllColumns();
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "listHeaderDivider",  
                	"header" : new sap.m.Label({
                		"text" : "Material Number",
                		"design": "Bold"
            		})
				})
			);
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "cellBorderRight listHeaderDivider",            		
                	"header" : new sap.m.Label({
                		"text" : "Description",
                		"design": "Bold"
            		})
				})
			);
			
			var numberOfColumns = this.getView().getModel("RecallGroup").getProperty("/maxGroups");
			for(var i=0; i<numberOfColumns; i++){
			
				var columnItems = [];
				
				if(numberOfColumns === 1){
					columnItems.push(
						new sap.m.Label({"text": "Quantity", "design": "Bold"})
					);
				} else {
					columnItems.push(
						new sap.m.Label({"text": "Group " + (i + 1), "design": "Bold"})
					);
					columnItems.push(
                		new sap.ui.layout.HorizontalLayout({
	        				"content":[new sap.m.RadioButton({"groupName":"recallGroup", "selected":"{RecallGroup>/selectedGroup/" + i + "}"})]
                		})
                	);
				}
			
            	recallItemsTable.addColumn(
					new sap.m.Column({
	            		"hAlign": "Center",
	            		"width":"7rem",
	            		"styleClass": "{= ${RecallGroup>/selectedGroup/" + i + "} ? 'cellBorderRight listHeaderDivider' : 'cellBorderRight notSelected listHeaderDivider' }",
                		"header" : new sap.m.VBox({
							"items": columnItems
		        		})
					})
				);
			} 
		},
		
		_tableCellFactory: function(sId,oContext){
				
			var tableCells = [];
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialNumber}"}));
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialDescription}"}));
			
			oContext.getProperty(oContext.sPath).groups.forEach(function(group, index){

				if(group.isStepInput){
					if(group.stepInput.minValue === group.stepInput.maxValue){
						group.stepInput.quantity = group.stepInput.maxValue;
						tableCells.push(
							new sap.m.Input({
								"value":"{RecallItems>groups/" + index + "/stepInput/quantity}", 
								"enabled":"{= ${RecallGroup>/selectedGroup/" + index + "}}",
								"editable": false,
								"textAlign":"Center"
							})
						);
					} else {
				  		tableCells.push(
							new sap.m.StepInput({
								"min":"{RecallItems>groups/" + index + "/stepInput/minValue}",
								"max":"{RecallItems>groups/" + index + "/stepInput/maxValue}",
								"value":"{RecallItems>groups/" + index + "/stepInput/quantity}",
								"enabled":"{= ${RecallGroup>/selectedGroup/" + index + "}}"
							})
						);
					}
				} else {
					if(group.isRadioButton){
				  		tableCells.push(
							new sap.ui.layout.HorizontalLayout({
			        			"content":[new sap.m.RadioButton({
			        				"groupName":"{RecallItems>groups/" + index + "/radioButton/group}",
			        				"enabled":"{= ${RecallGroup>/selectedGroup/" + index + "}}",
			        				"selected":"{RecallItems>groups/" + index + "/radioButton/selected}"
			        			})]
			        		})
						);
					} else {
						tableCells.push(new sap.m.Text());
					}
				}
			});	
			return new sap.m.ColumnListItem({"cells" : tableCells});
		}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter"
], function(Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.controller.RecallProductGroupSelector", {
		
		onInit: function(){
/*			var recallGroupModel = new JSONModel({
				"inspect":{"selected":false, "displayText":"", "visible":false, "LON":"", "quantity":""},
				"replace":{"selected":false, "displayText":"", "visible":false, "LON":"", "quantity":""},
				"MCP":{"materialNumber":"","materialDescription":"","quantity":0},
				"subletItems":[],
				"selectedGroup": []
			});
			this.getView().setModel(recallGroupModel, "RecallGroup");
			this.getView().setModel(new JSONModel({"groupParts":[]}),"RecallItems");*/
		},
		
		onBeforeRendering: function(){
			//Load the details of the Recall
/*			var vin = this.getView().getModel("WarrantyClaim").getProperty("/VIN");
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
			);*/
			
			
			var recallItemsTable = this.getView().byId("recallItems");
			recallItemsTable.removeAllColumns();
			recallItemsTable.bindItems({
				"path":"RecallItems>/groupParts", 
				"factory": this._tableCellFactory
			});
			
			
			
			
			
			
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
		},
		
		_buildPartsView: function(recallItems){
			
			var numberOfColumns = 0;

//          MCPN
			recallItems.results.forEach(
  				function(recallItem){
					if(recallItem.ItemType === 'MAT' && recallItem.IsMcpn){
						this.getView().getModel("RecallGroup").setProperty("/MCP/materialNumber",recallItem.PartNumber);
						this.getView().getModel("RecallGroup").setProperty("/MCP/materialDescription",recallItem.Description);
						this.getView().getModel("RecallGroup").setProperty("/MCP/quantity",recallItem.Quantity);
					}
				}.bind(this)
			);
			
//			Labour
			recallItems.results.forEach(
  				function(recallItem){
					if(recallItem.ItemType === 'FR'){
						
						switch(recallItem.FRTType){
							case "IN":
								this.getView().getModel("RecallGroup").setProperty("/inspect/displayText",recallItem.ItemKeyDescription);
								this.getView().getModel("RecallGroup").setProperty("/inspect/selected",true);
								this.getView().getModel("RecallGroup").setProperty("/inspect/visible",true);
								this.getView().getModel("RecallGroup").setProperty("/inspect/LON",recallItem.ItemKey);
								this.getView().getModel("RecallGroup").setProperty("/inspect/quantity",recallItem.Quantity);
								break;
								
							case "RP":
							case "RE":
								this.getView().getModel("RecallGroup").setProperty("/replace/displayText",recallItem.ItemKeyDescription);
								this.getView().getModel("RecallGroup").setProperty("/replace/visible",true);
								this.getView().getModel("RecallGroup").setProperty("/replace/LON",recallItem.ItemKey);
								this.getView().getModel("RecallGroup").setProperty("/replace/quantity",recallItem.Quantity);
								break;
						}
					}
				}.bind(this)
			);
			
//			Sublet
			var sublets = [];
			recallItems.results.forEach(
  				function(recallItem){
					if(recallItem.ItemType === 'SUBL'){
						var sublet = {	
							"subletCode": recallItem.ItemKey,
							"quantity": recallItem.Quantity,
							"fixedSublet": recallItem.IsSubletFixed
						};
						sublets.push(sublet);
					}
				}
			);
			this.getView().getModel("RecallGroup").setProperty("/subletItems",sublets);
			
			//Recall Parts (for all groups)
			var parts = recallItems.results.filter(
  				function(recallItem){
					return recallItem.ItemType === 'MAT' && !recallItem.IsMcpn;
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
					
					if(part.ReplacementSelectionRule === ""){
					
						groupPart.groups.push({	
							"isRadioButton": false,
							"isStepInput": true,
							"stepInput": {"minValue": part.Quantity, "maxValue": part.Quantity}
						});
						
					} else {
						groupPart.groups = this._applyReplacementSelectionRuleForMaterial(part.ReplacementSelectionRule);
					}
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
                		"text" : "Material Number",
                		"design": "Bold"
            		})
				})
			);
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "cellBorderRight",            		
                	"header" : new sap.m.Label({
                		"text" : "Description",
                		"design": "Bold"
            		})
				})
			);
			
			var selectedGroups = [];
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
			
			    selectedGroups.push( i === 0 );
			
            	recallItemsTable.addColumn(
					new sap.m.Column({
	            		"hAlign": "Center",
	            		"width":"7rem",
	            		"styleClass": "{= ${RecallGroup>/selectedGroup/" + i + "} ? 'cellBorderRight' : 'cellBorderRight notSelected' }",
                		"header" : new sap.m.VBox({
							"items": columnItems
		        		})
					})
				);
			} 
			this.getView().getModel("RecallGroup").setProperty("/selectedGroup", selectedGroups);
			
			recallItemsTable.bindItems({
				"path":"RecallItems>/groupParts", 
				"factory": this._tableCellFactory
			});
			
			this.getView().getModel("RecallItems").setProperty("/groupParts", groupParts);
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
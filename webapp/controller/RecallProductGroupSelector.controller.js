sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.controller.RecallProductGroupSelector", {
		
		onInit: function () {
			this._radioButtonGroups = [];	
		},

		
		onAfterRendering : function(){
			//Ensure the First Tab is selected on load
			if(this.getView().getModel("Recall").getProperty("/labourTypes")[0]){
				this._showPartsForLabourType(this.getView().getModel("Recall").getProperty("/labourTypes")[0].labourType);	
			}	
		},
		
		onLabourTypeSelected: function(event){
			
			this._showPartsForLabourType(event.getParameter("key"));
		},
		
		_showPartsForLabourType:function(selectedLabourType){
			
			this.getView().getModel("Recall").getProperty("/labourTypes").forEach(function(labourType){
				
				if(labourType.labourType !== selectedLabourType){
					return;
				}
				
				var recallItems = [];
				labourType.MCPN.forEach(function(MCPN){
					recallItems.push({
						"materialNumber":MCPN.materialNumber,
						"materialDescription":MCPN.materialDescription,
						"isMCPN":true,
						"MCPNIcon":"sap-icon://accept",
						"quantity":MCPN.quantity,
						"selectionRule":MCPN.selectionRule,
						"isSelected": [],
						"selectedQuantity":[]
					});
				});
				
				labourType.parts.forEach(function(part){
					recallItems.push({
						"materialNumber": part.materialNumber,
						"materialDescription": part.materialDescription,
						"quantity": part.quantity,
						"isSelected": [],
						"selectedQuantity":[],
						"selectionRule":part.selectionRule,
						"isMCPN":false,
						"MCPNIcon":""
					});
				});

			//	this.getView().setModel(new JSONModel(recallItems),"RecallItems");
				this._radioButtonGroups = [];
				this._buildColumnList(labourType, recallItems);
				
			}.bind(this));
		},
		
		_buildColumnList: function(labourType, RecallItems){

			var recallItemsTable = this.getView().byId("recallItems");
			recallItemsTable.removeAllColumns();
			recallItemsTable.unbindItems();
			
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "listHeaderDivider",  
                	"header" : new sap.m.Text({
                		"text" : "Material",
                		"design": "Bold"
            		})
				})
			);
            recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"10rem",
            		"styleClass": "cellBorderRight listHeaderDivider",            		
                	"header" : new sap.m.Text({
                		"text" : ""
            		})
				})
			);
			
			recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Left",
            		"width":"3rem",
            		"styleClass": "cellBorderRight listHeaderDivider",            		
                	"header" : new sap.m.Text({
                		"text" : "MCPN",
                		"design": "Bold"
            		})
				})
			);
			
			recallItemsTable.addColumn(
				new sap.m.Column({
            		"hAlign": "Center",
            		"width":"4rem",
            		"styleClass": "cellBorderRight listHeaderDivider",            		
                	"header" : new sap.m.Text({
                		"text" : "Quantity",
                		"design": "Bold"
            		})
				})
			);
			
			//Helper Model for the Replacement Method Selection
			//Needs to be done after the table has the columns removed...
			var selectedMethod = [];
			for(var j=0; j<labourType.replacementMethodCount; j++){
				selectedMethod.push( j === 0 );
			}
			
			this.getView().setModel(new JSONModel({
				"selectedMethod":selectedMethod,
				"labourTypeSelectionRule":labourType.selectionRule,
				"labourType":labourType.labourType,
				"labourTypeText":labourType.displayText,
				"labourLONCode":labourType.LONCode,
				"labourQuantity":labourType.quantity,
//				"labourTypeMCPN":labourType.MCPN
				"labourTypeSublet":labourType.sublet
			}),"RecallMethodHelper");
				
			if(labourType.parts.length > 0 || labourType.MCPN.length > 0 ){ //No Parts so No Replacement Methods
				for(var i=0; i<labourType.replacementMethodCount; i++){
				
					var columnItems = [];

					columnItems.push(
						new sap.m.Text({"text": labourType.tabText + "\nMethod " + (i + 1), "design": "Bold", "textAlign":"Center"})
					);
					
					//selectedMethod.push(i === 0);
					columnItems.push(
                		new sap.ui.layout.HorizontalLayout({
	        				"content":[new sap.m.RadioButton({"groupName":"recallGroup", "selected":"{RecallMethodHelper>/selectedMethod/" + i + "}"})]
                		})
                	);
	
	            	recallItemsTable.addColumn(
						new sap.m.Column({
		            		"hAlign": "Center",
		            		"width":"7rem",
		            		"styleClass": "{= ${RecallMethodHelper>/selectedMethod/" + i + "} ? 'cellBorderRight listHeaderDivider' : 'cellBorderRight notSelected listHeaderDivider' }",
	                		"header" : new sap.m.VBox({
								"items": columnItems
			        		})
						})
					);
				} 
				//this.getView().getModel("RecallMethodHelper").setProperty("/selectedMethod",selectedMethod);
			}
			
			this.getView().setModel(new JSONModel(RecallItems),"RecallItems");
			recallItemsTable.bindItems({
				"path":"RecallItems>/", 
				"factory": this._tableCellFactory.bind(this)
			});
			
		},
		
		_tableCellFactory: function(sId,oContext){
				
			var tableCells = [];
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialNumber}"}));
			tableCells.push(new sap.m.Text({"text":"{RecallItems>materialDescription}"}));
			tableCells.push(new sap.ui.core.Icon({"src":"{RecallItems>MCPNIcon}"}));
			tableCells.push(new sap.m.Text({"text":"{RecallItems>quantity}"}));
			
			var labourTypeSelectionRule = this.getView().getModel("RecallMethodHelper").getProperty("/labourTypeSelectionRule");
			var labourTypeMethods = labourTypeSelectionRule.split("-");
			
//			if(!oContext.getProperty(oContext.sPath).isMCPN){
				
				var methods = oContext.getProperty(oContext.sPath).selectionRule.split("-");
				var methodIndex = 0;
				
				methods.forEach(function(method,index){
					
					//Is this method included?
					if(labourTypeMethods[index].substr(0, 1) === "1"){
						if(method.substr(0, 1) === "1"){
						
							var methodOptions = method.split(".");
					        var subgroup = methodOptions[1];
					        var methodIsOptional = methodOptions[2];
					        var methodQuantity = methodOptions[3];	
					        
				          	if(subgroup === "A"){
				          		//Entry Field
				          		var minValue = 0;
				          		if(methodIsOptional !== "O"){
				          			minValue = 1;
				          		}
				          		
				          		var maxValue = minValue;
				          		if(methodQuantity.indexOf("*") === -1){
				          			maxValue = parseInt(methodQuantity);
				          		} else {
				          			maxValue = parseInt(methodQuantity.substring(0, methodQuantity.indexOf("*")));	          		
				          			minValue = maxValue;
				          		}
				          		
				          		oContext.getProperty(oContext.sPath).selectedQuantity.push(maxValue);
				          		oContext.getProperty(oContext.sPath).isSelected[methodIndex] = true;
				          		
								if(minValue === maxValue){
									tableCells.push(
										new sap.m.Input({
											"value":"{RecallItems>selectedQuantity/" + methodIndex + "}", 
											"enabled":"{= ${RecallMethodHelper>/selectedMethod/" + methodIndex + "}}",
											"editable": false,
											"textAlign":"Center"
										})
									);
								} else {
							  		tableCells.push(
										new sap.m.StepInput({
											"min":minValue,
											"max":maxValue,
											"value":"{RecallItems>selectedQuantity/" + methodIndex + "}",
											"editable":"{RecallMethodHelper>/selectedMethod/" + methodIndex + "}",
											"enabled":"{RecallMethodHelper>/selectedMethod/" + methodIndex + "}"
										})
									);
								}
				          		
				          	} else {
				          		
				          		var radioButtonGroup = "G" + methodIndex + subgroup;
				          		if (this._radioButtonGroups.indexOf(radioButtonGroup) === -1){
				          			this._radioButtonGroups.push(radioButtonGroup);
				          			oContext.getProperty(oContext.sPath).isSelected[methodIndex] = true;
				          		} else {
				          			oContext.getProperty(oContext.sPath).isSelected[methodIndex] = false;
				          		}
				          		oContext.getProperty(oContext.sPath).selectedQuantity.push(oContext.getProperty(oContext.sPath).quantity);
				          		
				    			tableCells.push(
									new sap.ui.layout.HorizontalLayout({
					        			"content":[ 
					        				new sap.m.RadioButton({
					        				"groupName":radioButtonGroup,
					        				"enabled":"{RecallMethodHelper>/selectedMethod/" + methodIndex + "}",
					        				"selected":"{RecallItems>isSelected/" + methodIndex + "}"
					        			})
					        			]
					        		})
								);
				          	}
						} else {
							oContext.getProperty(oContext.sPath).isSelected[methodIndex] = false;
							oContext.getProperty(oContext.sPath).selectedQuantity.push(0);
							tableCells.push(new sap.m.Text({"text":""}));
						}
						methodIndex += 1;
					}
				}.bind(this));
//			}

			return new sap.m.ColumnListItem({"cells" : tableCells});
		}
	});
});
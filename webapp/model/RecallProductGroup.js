sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter"
], function(BaseObject, JSONModel, Filter) {
  "use strict";
  
  return BaseObject.extend("WarrantyClaim_MockUp.model.RecallProductGroup", {
    
    	constructor: function() {
    		
    		this._recallGroup = {
				"inspect":{"selected":false, "displayText":"", "visible":false, "LON":"", "quantity":""},
				"replace":{"selected":false, "displayText":"", "visible":false, "LON":"", "quantity":""},
				"MCP":{"materialNumber":"","materialDescription":"","quantity":0},
				"maxGroups":0,
				"subletItems":[],
				"selectedGroup": []
			};
			this._groupParts = [];
    	},
      
		_applyReplacementSelectionRuleForMaterial: function(rule){
			
			var groups = rule.split("-");
			var recallGroups = [];

	        groups.forEach(function(group, index){
	        	
	        	var recallGroup = {	
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
	          		recallGroup.isStepInput = true;
	          		recallGroup.stepInput.minValue = minValue;
	          		recallGroup.stepInput.maxValue = maxValue;
	          		
	          	} else {
	          		recallGroup.isRadioButton = true;
	          		recallGroup.radioButton.group = "G" + index + subgroup;
	          	}
	          }
	          
	          recallGroups.push(recallGroup);
	        }.bind(this));
			return recallGroups;
		},
		
		buildRecallItemsModel: function(recallItems){
			
//          MCPN
			recallItems.forEach(
  				function(recallItem){
					if(recallItem.ItemType === 'MAT' && recallItem.IsMcpn){
						this._recallGroup.MCP.materialNumber = recallItem.PartNumber;
						this._recallGroup.MCP.materialDescription = recallItem.Description;
						this._recallGroup.MCP.quantity = recallItem.Quantity;
					}
				}.bind(this)
			);
			
//			Labour
			recallItems.forEach(
  				function(recallItem, index){
					if(recallItem.ItemType === "FR"){
						
						switch(recallItem.FRTType){
							case "IN":
								this._recallGroup.inspect.displayText = "Inspect: " + recallItem.ItemKeyDescription;
								this._recallGroup.inspect.selected = true;
								this._recallGroup.inspect.visible = true;
								this._recallGroup.inspect.LON = recallItem.ItemKey;
								this._recallGroup.inspect.quantity = recallItem.Quantity;
								break;
								
							case "RP":
							case "RE":
								this._recallGroup.replace.displayText = "Replacement: " + recallItem.ItemKeyDescription;
								this._recallGroup.replace.visible = true;
								this._recallGroup.replace.selected = !this._recallGroup.inspect.selected;
								this._recallGroup.replace.LON = recallItem.ItemKey;
								this._recallGroup.replace.quantity = recallItem.Quantity;
								break;
						}
					}
				}.bind(this)
			);
			
//			Sublet
			recallItems.forEach(
  				function(recallItem){
					if(recallItem.ItemType === 'SUBL'){
						var sublet = {	
							"subletCode": recallItem.ItemKey,
							"quantity": recallItem.Quantity,
							"fixedSublet": recallItem.IsSubletFixed
						};
						this._recallGroup.subletItems.push(sublet);
					}
				}.bind(this)
			);
			
			//Recall Parts (for all groups)
			var parts = recallItems.filter(
  				function(recallItem){
					return recallItem.ItemType === 'MAT' && !recallItem.IsMcpn;
				}
			);
			
			if(parts.length > 0){
				parts.forEach(function(part, index){
					
					var groupPart = {
						"materialNumber": part.PartNumber,
						"materialDescription": part.Description,
						"groups":[]
					};	
					
					if(part.ReplacementSelectionRule === ""){

						groupPart.groups.push({	
							"isRadioButton": false,
							"isStepInput": true,
							"stepInput": {"minValue": part.Quantity, "maxValue": part.Quantity, "quantity":part.Quantity}
						});
						
					} else {
						groupPart.groups = this._applyReplacementSelectionRuleForMaterial(part.ReplacementSelectionRule);
					}
					this._recallGroup.maxGroups = Math.max(this._recallGroup.maxGroups, groupPart.groups.length);
					this._groupParts.push(groupPart);
				}.bind(this));
			}
			
			for(var i=0;i<this._recallGroup.maxGroups;i++){
				this._recallGroup.selectedGroup.push( i === 0 );
			}
		
			return {"RecallGroup": this._recallGroup, "RecallItems":this._groupParts};
		}
    });
});
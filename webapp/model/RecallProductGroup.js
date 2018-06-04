sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
  "use strict";
  
  return BaseObject.extend("WarrantyClaim_MockUp.model.RecallProductGroup", {
    
    	constructor: function() {
			this._recall = {
				"labourTypes":[]
			//	"subletItems":[]
			};
    	},
      
    	buildRecallModel: function(recallItems){
			
			//Will need to work out what to do with multiple FR of the same labour items...
			
			//Build List of Labour Types
			recallItems.forEach(function(recallItem,index){
				if(recallItem.ItemType === "FR"){
					this._recall.labourTypes.push({
						"labourType": recallItem.FRTType + index, //Make sure each TAB is unique
						"displayText": recallItem.ItemKeyDescription,
						"tabIcon":recallItem.FRTIcon,
						"tabText":recallItem.FRTDescription,
						"selected": this._recall.labourTypes.length === 0 ? true:false,
						"LONCode": recallItem.ItemKey,
						"quantity": recallItem.Quantity,
						"replacementMethodCount":0,
						"MCPN":[],
						"selectionRule":recallItem.ReplacementSelectionRule, //The first part of x.x.x.x determines which items are part of this Labour Group
						"sublet":[],
						"parts":[]
					});
				}
			}.bind(this));
			
			//Get the MCPN and Parts for the Labour Type
			this._recall.labourTypes.forEach(function(labourType){
			
				var labourTypeGroups = labourType.selectionRule.split("-");
				var partsKeyList = [];
				var subletKeyList = [];
				var MCPNKeyList = [];
			
				labourTypeGroups.forEach(function(labourTypeGroup, index){
					//Is this group included - eg for IN/RE/RP what Materials/MCPN are to be associated.
					if(labourTypeGroup.substr(0, 1) === "1"){
						//Check for any matching Materials and MCPNs
						recallItems.forEach(function(recallItem){
							
							switch (recallItem.ItemType) {
								case "MAT":
									var partGroups = recallItem.ReplacementSelectionRule.split("-");
									if(partGroups[index].substr(0, 1) === "1"){
										if(recallItem.IsMcpn){
											if (MCPNKeyList.indexOf(recallItem.PartNumber) === -1){
												labourType.MCPN.push({
													"materialNumber": recallItem.PartNumber,
													"materialDescription": recallItem.Description,
												    "quantity": recallItem.Quantity,
												    "selectionRule":recallItem.ReplacementSelectionRule
												});
												MCPNKeyList.push(recallItem.PartNumber);
											}
										} else {
											if (partsKeyList.indexOf(recallItem.PartNumber) === -1){
												labourType.parts.push({
													"materialNumber": recallItem.PartNumber,
													"materialDescription": recallItem.Description,
													"quantity": recallItem.Quantity,
													"selectionRule":recallItem.ReplacementSelectionRule
												});
												partsKeyList.push(recallItem.PartNumber);
											}
										}
									}
									break;
									
								case "SUBL":
									var subletGroups = recallItem.ReplacementSelectionRule.split("-");
									if(subletGroups[index].substr(0, 1) === "1"){
										//This Sublet is included
										if (subletKeyList.indexOf(recallItem.ItemKey) === -1){
											labourType.sublet.push({
												"subletCode": recallItem.ItemKey,
												"quantity": recallItem.Quantity,
												"fixedSublet": recallItem.IsSubletFixed,
												"selectionRule": recallItem.ReplacementSelectionRule,
												"description": recallItem.ItemKeyDescription
											});
											subletKeyList.push(recallItem.ItemKey);
										}
									}
								break;
							}
						});
						
						labourType.replacementMethodCount += 1;
					}
				});
			});
			
			return {"Recall": this._recall};
		}
    });
});
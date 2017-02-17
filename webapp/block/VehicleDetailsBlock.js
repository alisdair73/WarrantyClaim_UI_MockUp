sap.ui.define(["sap/uxap/BlockBase"
], function (BlockBase) {
	"use strict";
 
	var vehicleDetailsBlock = BlockBase.extend("WarrantyClaim_MockUp.block.VehicleDetailsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "WarrantyClaim_MockUp.block.VehicleDetailsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "WarrantyClaim_MockUp.block.VehicleDetailsBlock",
					type: "XML"
				}
			}
		}
	});
 
	return vehicleDetailsBlock;
}, true);
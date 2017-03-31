sap.ui.define(["sap/uxap/BlockBase"
], function (BlockBase) {
	"use strict";
 
	var supportingDocumentsBlock = BlockBase.extend("WarrantyClaim_MockUp.block.SupportingDocumentsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "WarrantyClaim_MockUp.block.SupportingDocumentsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "WarrantyClaim_MockUp.block.SupportingDocumentsBlock",
					type: "XML"
				}
			}
		}
	});
 
	return supportingDocumentsBlock;
}, true);
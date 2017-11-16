sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationLengthEquals',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'WarrantyClaim_MockUp/test/integration/pages/Common',
		'sap/ui/test/actions/Press',
		"sap/ui/test/matchers/Properties",
        "sap/ui/test/matchers/Ancestor"
	],
	function (Opa5,
			  AggregationLengthEquals,
			  PropertyStrictEquals,
			  Common,
			  Press,
			  Properties,
			  Ancestor) {
		"use strict";

		var sViewName = "Worklist",
			sTableId = "table";

		Opa5.createPageObjects({
			onTheWorklistPage: {
				baseClass: Common,
				actions: {
					iPressOnMoreData: function () {
						// Press action hits the "more" trigger on a table
						return this.waitFor({
							id: sTableId,
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "The Table does not have a trigger"
						});
					},
					
					iSelectNormalClaim: function(){
						
						return this.waitFor({
            				id: "claimTypeList",
            				actions: new Press(),
            				success: function(oSelect) {
                				this.waitFor({
                    				controlType: "sap.m.StandardListItem",
                    				matchers: [
                        				new Ancestor(oSelect),
                        				new Properties({ title: "Normal Claim"})
                    				],
                    				actions: new Press(),
                    				errorMessage: "Cannot select Normal Claim"
                				});
            				},
            				errorMessage: "Could not find mySelect"
    					 });				
					}
					
				},
				assertions: {
					theClaimTypeListShouldBePopulated: function () {
						return this.waitFor({
							id: "claimTypeList",
							searchOpenDialogs : true,
							viewName: "WarrantyClaimObjectPage",
							check: function(claimList){
							  return claimList.length !== 0;
							},
							success: function (claimList) {
								Opa5.assert.ok(claimList.length, "Claim Types are available.");
							},
							errorMessage: "No Claim Types were found."
						});
						
					},
					
					//<m:ObjectAttribute title="Claim Type" text="{WarrantyClaim>/ClaimTypeDescription}"/>
/*					return new Opa5().waitFor({
    controlType : "sap.m.ObjectHeader",
    viewName : "Detail",
    matchers : new sap.ui.test.matchers.PropertyStrictEquals({
                                 name : "title",
                                 value: "myTitle"
                           }),
    success : function (aObjectHeaders) {
        Opa5.assert.StrictEqual(aObjectHeaders.length, 1, "was there was only one Object header with this title on the page");
        Opa5.assert.StrictEqual(aObjectHeaders[0].getTitle(), "myTitle", "was on the correct Title");
    }
});*/
					theNewClaimScreenShouldBeShown: function () {
						return this.waitFor({
							id: "claimTypeList",
							viewName: "WarrantyClaimObjectPage",
							check: function(claimList){
							  return claimList.length !== 0;
							},
							success: function (claimList) {
								Opa5.assert.ok(claimList.length, "Claim Types are available.");
							},
							errorMessage: "No Claim Types were found."
						});
						
					}
					
				}
			}
		});
	});
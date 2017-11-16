/*global QUnit*/

sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Warranty");

		opaTest("Should be able to open the Warranty Screen in Create Mode", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iLookAtTheScreen();

			// Assertions
			Then.onTheWorklistPage.theClaimTypeListShouldBePopulated();
		});
		
		opaTest("Can select a Normal Claim", function (Given, When, Then) {
		
			When.onTheWorklistPage.iSelectNormalClaim();
			//Then.
		
		});
	}
);
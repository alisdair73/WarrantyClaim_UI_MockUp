sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";
	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			// create
			var oMockServer = new MockServer({
				rootUri: "/"
			});
			// simulate against the metadata and mock data
			oMockServer.simulate("../localService/ZWTY_WARRANTY_CLAIMS_SRV/metadata.xml", {
				sMockdataBaseUrl: "../localService/ZWTY_WARRANTY_CLAIMS_SRV/mockdata",
				bGenerateMissingMockData: true
			});
			// start
			oMockServer.start();
			jQuery.sap.log.info("Running the app with mock data");
		}
	};
});
sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox"
	], function (UI5Object, MessageBox) {
		"use strict";

		return UI5Object.extend("WarrantyClaim_MockUp.controller.ErrorHandler", {

			constructor : function (oComponent) {
				
				this._oComponent = oComponent;
				this._oModel = oComponent.getModel();
				this._bMessageOpen = false;

				this._oModel.attachMetadataFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					this._showServiceError(oParams.response);
				}, this);

				this._oModel.attachRequestFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					
					//Do not raise a generic error if the response was a Business Exception from GW
					if (oParams.response.statusCode !== "400"){
						this._showServiceError(oParams.response);
					}
				}, this);
			},
			
			_showServiceError : function (sDetails) {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;
				MessageBox.error(
					"An error occurred while processing the Warranty Claim.",
					{
						id : "warrantyClaimErrorMessageBox",
						details : sDetails,
						actions : [MessageBox.Action.CLOSE],
						onClose : function () {
							this._bMessageOpen = false;
							var crossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

							// Navigate back to FLP home
							crossAppNavigator.toExternal({
								target: {
									shellHash: "#"
								}
							});
						}.bind(this)
					}
				);
			}

		});

	}
);
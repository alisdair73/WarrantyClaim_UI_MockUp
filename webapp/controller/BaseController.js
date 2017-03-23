sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/format/DateFormat"
], function(Controller, JSONModel, DateFormat) {
	"use strict";

	return Controller.extend("hnd.otc.ordercreate.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		onChangeDatePicker: function(oEvent) {
			// Format date to remove UTC issue
			var oDatePicker = oEvent.getSource();
			var oNewDate = oDatePicker.getDateValue();
			if (oNewDate) {
				oDatePicker.setDateValue(this.convertDateTimeToDateOnly(oNewDate));
			}
		},
		
		convertDateTimeToDateOnly: function(oDateTime) {
			var oFormatDate = DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-ddTKK:mm:ss"
			});
			var oDate = oFormatDate.format(oDateTime);
			oDate = oDate.split("T");
			var oDateActual = oDate[0];
			return new Date(oDateActual);
		},
		
		/**
		 * navigateToLaunchpad() Navigates back to the Fiori Launchpad 
		 * @public
		 */
		navigateToLaunchpad: function() {
			var crossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			// Navigate back to FLP home
			crossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},
		
		readCatalog: function(catalogCode, catalogModelName){
			this.getView().getModel().read(
				"/JSONFeedCollection('" + catalogCode + "')/$value",
				{
					success: function(JSONData){
						var catalogModel = new JSONModel(JSON.parse(JSONData));
						this.getView().setModel(catalogModel,catalogModelName);
						this.getModel("ViewHelper").setProperty("/busy", false);
					}.bind(this),
					error: function(error){
						this.getModel("ViewHelper").setProperty("/busy", false);
					}
				}
			);
		}
	});
});
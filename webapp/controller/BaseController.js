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
		
		readCatalog: function(catalogCode, catalogModelName, expectedLevels){
			this.getView().getModel().read(
				"/CatalogSet('" + catalogCode + "')/$value",
				{
					success: function(JSONData){
						
						var catalog = JSON.parse(JSONData);
						
						if(expectedLevels > 1){
							//Remove any Level 1 entries with no Level 2 defined
							for(var i=0; i< catalog.length; i++){
								if (!catalog[i].nodes){
									catalog.splice(i,1);
									if( i > 0 ){ i--; }
								} else {
									//Remove any Level 2 Entries with no Level 3
									if( expectedLevels === 3){
										for(var j=0; j< catalog[i].nodes.length; j++){
											if (!catalog[i].nodes[j].nodes){
												catalog[i].nodes.splice(j,1);
												if( j > 0 ){ j--;}
											}
										}
										if (catalog[i].nodes.length === 0){
											catalog.splice(i,1);
											if( i > 0 ){ i--; }
										}
									}
								}
							}
						}
						
						var catalogModel = new JSONModel(catalog);
						this.getView().setModel(catalogModel,catalogModelName);
						this.getModel("ViewHelper").setProperty("/busy", false);
						
						//Event Bus is used to set correct Combo Box binding if Symptom Code is already selected
						sap.ui.getCore().getEventBus().publish(catalogCode,"CatalogLoaded");
						
					}.bind(this),
					error: function(error){
						this.getModel("ViewHelper").setProperty("/busy", false);
					}
				}
			);
		}
	});
});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/message/Message"
], function(Controller, JSONModel, DateFormat, Message) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.controller.BaseController", {
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
		
		readSymptomCatalog: function(event){
			
			var symptomCatalogCode = "";
			
			//Determine Symptopm Catalog
			if(this.getModel("WarrantyClaim").getProperty("/ObjectType") === "VELO"){
				//Vehicle
				symptomCatalogCode = "ZSYM1";
				
			} else {
				switch(this.getModel("WarrantyClaim").getProperty("/MaterialDivision")){
					case "20":
						symptomCatalogCode = "ZSYM2";
						break;
					case "40":
						symptomCatalogCode = "ZSYM3";
						break;
					case "50":
						symptomCatalogCode = "ZSYM4";
						break;
				}
			}
			this._readCatalog(symptomCatalogCode,"SymptomCodes",3);
		},
		
		readDefectCatalog: function(){

			var defectCatalogCode = "";
			
			//Determine Defect Catalog
			if(this.getModel("WarrantyClaim").getProperty("/ObjectType") === "VELO"){
				//Vehicle
				defectCatalogCode = "ZDEF1";
				
			} else {
				switch(this.getModel("WarrantyClaim").getProperty("/MaterialDivision")){
					case "20":
						defectCatalogCode = "ZDEF2";
						break;
					case "40":
						defectCatalogCode = "ZDEF3";
						break;
					case "50":
						defectCatalogCode = "ZDEF4";
						break;
				}
			}
			this._readCatalog(defectCatalogCode,"DefectCodes",2);
		},
		
		_readCatalog: function(catalogCode, catalogModelName, expectedLevels){
			
			if(catalogCode && catalogCode !== ""){
			
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
							
							if(catalog.length === 0){
								catalog = [{"code": "NODATA", "text": "No catalog data found."}];
							}
							
							var catalogModel = new JSONModel(catalog);
							this.getView().setModel(catalogModel,catalogModelName);
							this.getModel("ViewHelper").setProperty("/busy", false);
							
							//Event Bus is used to set correct Combo Box binding if Symptom Code is already selected
							sap.ui.getCore().getEventBus().publish(catalogModelName,"CatalogLoaded");
							
						}.bind(this),
						
						error: function(error){
							this.getModel("ViewHelper").setProperty("/busy", false);
						}
					}
				);

			} else {
				this.getView().setModel(
					new JSONModel([{"code": "NODATA", "text": "No catalog data found."}]), 
					catalogModelName
				);
			}
		},
		
		//Model Name and Target are optional for reference to helper models 
		//that are screen bound.
		logValidationMessage:function(fieldId, modelName, target){
			
			this._removeErrorMessageFromMessageManager("UI_" + fieldId);
			
			var model = this.getView().getModel(modelName ? modelName : "WarrantyClaim");
			var messageTarget = target ? target : "/" + fieldId;
			var field = model.getProperty(messageTarget);
			
			if(!field.ruleResult.valid){
				 
				//Get the Field Name 
				var fieldName = this.getView().getModel("i18n").getResourceBundle().getText(fieldId);
				
				this._addErrorMessageToMessageManager(
					"UI_" + fieldId,
					model,
					this.getView().getModel("i18n").getResourceBundle().getText(
						field.ruleResult.errorTextID,[fieldName]
					),
					messageTarget + "/value"
				);
			}
		},
		
		//Private Methods
    	_updateUIErrorFlag:function(){
    	
/*			var uiMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(
	  			function(uiMessage){
					return uiMessage.id.match("UI");
				}
			); */
//			this.getModel("UIValidation").setProperty("/hasUIValidationError",uiMessages.length > 0);
    	},

		_doesMessageExistInMessageManager: function (messageID){
			var registeredMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData().filter(
  				function(registeredMessage){
					return registeredMessage.id ===  messageID;
				}
			);
    		
    		if(registeredMessages.length > 0){
    			return registeredMessages[0];
    		}  
		},	
	
		_removeErrorMessageFromMessageManager:function(messageID){
			
			var message = this._doesMessageExistInMessageManager(messageID);
			if(message){
				sap.ui.getCore().getMessageManager().removeMessages(message);
			}
			this._updateUIErrorFlag();
		},
		
		_addErrorMessageToMessageManager:function(messageID, messageProcessor, messageText, messageTarget){
			
			if( !this._doesMessageExistInMessageManager(messageID)){
			
				var message = new Message({
					"id": messageID,
	            	"message": messageText,
	                "type": 'Error',
	                "target": messageTarget,
	                "processor": messageProcessor
	        	});
      			sap.ui.getCore().getMessageManager().addMessages(message);
      			this._updateUIErrorFlag();
			}
		}		
	});
});
sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/m/MessageToast",
"sap/m/UploadCollectionParameter"
], function(Controller, MessageToast, UploadCollectionParameter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.SupportingDocumentsBlockController", {
		
		onInit: function () {
			// Sets the text to the label
			this.getView().byId("UploadCollection").addEventDelegate({
				onBeforeRendering : function () {
					this.getView().byId("attachmentTitle").setText(this._getAttachmentTitleText());
				}.bind(this)
			});
		},

		onUploadComplete: function(oEvent) {

			var fileResponse = JSON.parse( oEvent.getParameter("mParameters").responseRaw );
			var PWANumber = this.getView().getModel("PWA").getProperty("/PWANumber");
			var attachments = this.getView().getModel("PWA").getProperty("/Attachments");
		    var attachment = {
		    	"DocumentID": fileResponse.d.DocumentID,
		    	"MimeType": fileResponse.d.MimeType,
		    	"FileName": fileResponse.d.FileName,
		    	"URL": "/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/PriorWorkApprovalSet('" + PWANumber + "')/Attachments('" + fileResponse.d.DocumentID + "')/$value"
		    };
		    attachments.push(attachment);
		    this.getView().getModel("PWA").setProperty("/Attachments", attachments);
		},
		
		onUploadTerminated: function(oEvent) {
		
/*			var sFileName = oEvent.getParameter("fileName");
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();*/
		},
		
		onBeforeUploadStarts: function(oEvent){
			
    		oEvent.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
                name: "slug",
                value: oEvent.getParameter("fileName")
            }));
            
    		oEvent.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
                name: "accept",
                value: "application/json"
            }));			
		},
		
		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name : "x-csrf-token",
				value : this.getView().getModel().getSecurityToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},
 
		onFileDeleted: function(oEvent) {
			
			var attachments = this.getView().getModel("PWA").getProperty("/Attachments");
		    attachments.splice(oEvent.getParameter("item")._iLineNumber,1);
		    this.getView().getModel("PWA").setProperty("/Attachments", attachments);
		},		
		
		onFileSizeExceed : function(oEvent) {
			MessageToast.show("The maximum allowed size for file attachments is 10MB.");
		},

		_getAttachmentTitleText: function(){
			var aItems = this.getView().byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		}
	});

});
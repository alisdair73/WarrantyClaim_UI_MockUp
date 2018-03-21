sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/m/MessageToast",
"sap/ui/model/Filter",
"sap/m/UploadCollectionParameter",
"sap/ui/model/json/JSONModel",
"sap/m/MessageBox"
], function(Controller, MessageToast, Filter, UploadCollectionParameter,JSONModel,MessageBox) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.SupportingDocumentsBlockController", {
		
		onUploadComplete: function(oEvent) {
			
			var fileResponse = JSON.parse( oEvent.getParameter("mParameters").responseRaw );
			var ClaimNumber = this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber");
		    var attachment = {
		    	"DocumentID": fileResponse.d.DocumentID,
		    	"Content":"",
		    	"Deleted": false,
		    	"MimeType": fileResponse.d.MimeType,
		    	"FileName": fileResponse.d.FileName,
		    	"URL": "/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/WarrantyClaimSet('" + ClaimNumber + "')/Attachments('" + fileResponse.d.DocumentID + "')/$value"
		    };

			var attachments = this.getView().getModel("WarrantyClaim").getProperty("/Attachments");
			attachments.push(attachment);
			this.getView().getModel("WarrantyClaim").setProperty("/Attachments", attachments);   
			
			this.getView().getModel("ViewHelper").setProperty("/busy", false);

		},
	
		onBeforeUploadStarts: function(oEvent){
			
			//Set the Busy Indicator to stop additional uploads and other actions
			this.getView().getModel("ViewHelper").setProperty("/busy", true);
    		
    		oEvent.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber") + "|" + oEvent.getParameter("fileName").replace(/[^\x20-\x7E]/g, "")
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
		
			var documentId = oEvent.getParameter("documentId");
			
        	this.getView().getModel().remove(
            	"/AttachmentSet(DocumentId='" + oEvent.getParameter("documentId") + "')", ///$value", 
            	{
            		"headers": {"objectkey": this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber")},
            		"success":function(oData, Response) {
            			this._refreshAfterDelete(documentId);
            		}.bind(this),
            		"error": function(e) {
            			MessageToast.show(JSON.parse(e.response.body).error.message.value, "");
            		}
            	} 
        	);
		},		
		
		onFileSizeExceed : function(oEvent) {
			MessageToast.show("The maximum allowed size for file attachments is 25MB.");
		},

		onFileTypeMismatch: function(event){
			var docTypes = this.getView().getModel("ViewHelper").getProperty("/warrantyUI/docTypes");
			MessageBox.error("The following Doc Types can be uploaded: \n" + docTypes.join());
		},
		
		_refreshAfterDelete: function(documentId){
			MessageToast.show("File deleted");
            			
			//Remove Deleted Attachments from Attachment Collection
            var attachments = this.getView().getModel("WarrantyClaim").getProperty("/Attachments").filter(function(item) { 
				return item.DocumentID !== documentId;
			});
			this.getView().getModel("WarrantyClaim").setProperty("/Attachments",attachments);
		}
	});
});
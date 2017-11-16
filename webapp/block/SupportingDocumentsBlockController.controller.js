sap.ui.define(["sap/ui/core/mvc/Controller",
"sap/m/MessageToast",
"sap/ui/model/Filter",
"sap/m/UploadCollectionParameter"
], function(Controller, MessageToast, Filter, UploadCollectionParameter) {
	"use strict";

	return Controller.extend("WarrantyClaim_MockUp.block.SupportingDocumentsBlockController", {
		
		onInit: function () {
			// Sets the text to the label
/*			this.getView().byId("warrantyAttachmentCollection").addEventDelegate({
				onBeforeRendering : function () {
					this.getView().byId("attachmentTitle").setText(this._getAttachmentTitleText());
				}.bind(this)
			});*/
			
			//Set up Event Listener to Upload Files
			sap.ui.getCore().getEventBus().subscribe("WarrantyClaim","Saved",this._uploadAttachmentCollection,this);
		},

		onExit:function(){
			sap.ui.getCore().getEventBus().unsubscribe("Warranty","Saved",this._uploadAttachmentCollection,this);
		},
		
		onUploadComplete: function(oEvent) {

			var fileResponse = JSON.parse( oEvent.getParameter("mParameters").responseRaw );
			var ClaimNumber = this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber");
			var attachments = this.getView().getModel("WarrantyClaim").getProperty("/Attachments");
		    var attachment = {
		    	"DocumentID": fileResponse.d.DocumentID,
		    	"Content": "",
		    	"Deleted": false,
		    	"MimeType": fileResponse.d.MimeType,
		    	"FileName": fileResponse.d.FileName,
		    	"URL": "/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/WarrantyClaimSet('" + ClaimNumber + "')/Attachments('" + fileResponse.d.DocumentID + "')/$value"
		    };

			var uploadCollection = oEvent.getSource();
		    for (var i = 0; i < uploadCollection.getItems().length; i++) {
			  	if (uploadCollection.getItems()[i].getFileName() === fileResponse.d.FileName) {
			  		uploadCollection.removeItem(uploadCollection.getItems()[i]);
			  		break;
			  	}
			}
			
		    attachments.push(attachment);
		    this.getView().getModel("WarrantyClaim").setProperty("/Attachments", attachments);
		},
		
		onBeforeUploadStarts: function(oEvent){
			
    		oEvent.getParameters().addHeaderParameter(new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getView().getModel("WarrantyClaim").getProperty("/ClaimNumber") + "|" + oEvent.getParameter("fileName")
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
            	"/AttachmentSet(DocumentId='" + oEvent.getParameter("documentId") + "')/$value", 
            	{
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
			MessageToast.show("The maximum allowed size for file attachments is 10MB.");
		},

		_refreshAfterDelete: function(documentId){
			MessageToast.show("File deleted");
            			
			//Remove Deleted Attachments from Attachment Collection
            var attachments = this.getView().getModel("WarrantyClaim").getProperty("/Attachments").filter(function(item) { 
				return item.DocumentID !== documentId;
			});
			this.getView().getModel("WarrantyClaim").setProperty("/Attachments",attachments);
		},
		
/*		_getAttachmentTitleText: function(){
			var aItems = this.getView().byId("warrantyAttachmentCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},*/
		
		_uploadAttachmentCollection: function(){
			//Start the File Upload
			var attachmentCollection = this.getView().byId("warrantyAttachmentCollectionCreate");
			if(attachmentCollection){
				attachmentCollection.upload();
			}
		}
	});

});
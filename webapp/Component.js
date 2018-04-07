sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"StammtischApp/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("StammtischApp.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// set the data model
			this.setModel(models.createDataModel(), "dataModel");

			// create the views based on the url/hash
			this.getRouter().initialize();
		}

	});
});
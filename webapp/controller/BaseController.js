sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	/**
	 * Helper method for getting the component object or main shell view.
	 * @private
	 * @returns {sap.ui.core.UIComponent} the component object or {sap.ui.ux3.Shell} the main shell view
	 */
	function fnGetComponentObj(thisObj) {
		return thisObj.getOwnerComponent() || thisObj.oComponent || thisObj.oMainShellView;
	}

	return Controller.extend("StammtischApp.controller.BaseController", {

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the model by name.
		 * @public
		 * @param {string} sName - the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return fnGetComponentObj(this).getModel(sName);
		}

	});

});
sap.ui.define([
	"StammtischApp/controller/BaseController",
	"sap/ui/unified/DateRange",
	"StammtischApp/util/Formatter",
	"sap/m/Button",
	"sap/m/Dialog"
], function(BaseController, DateRange, Formatter, Button, Dialog) {
	"use strict";

	return BaseController.extend("StammtischApp.controller.Calendar", {

		Formatter: Formatter,

		onInit: function() {
			var oDataModel = this.getModel("dataModel");
			var sUrl = "http://localhost:10010/getAppointments";
			jQuery.ajax({
				async: false,
				url: sUrl,
				method: "GET",
				dataType: "json",
				success: function(response) {
					oDataModel.setData(response);
				}
			});
		},

		handleAppointmentSelect: function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment");

			if (oAppointment) {
				this._handleSingleAppointment(oAppointment);
			} else {
				//this._handleGroupAppointments(oEvent);
			}
		},

		_handleSingleAppointment: function(oAppointment) {
			var oFrag = sap.ui.core.Fragment,
				oAppBC,
				oDateTimePickerStart,
				oDateTimePickerEnd,
				oInfoInput,
				oOKButton;

			if (!this._oDetailsPopover) {
				this._oDetailsPopover = sap.ui.xmlfragment("myPopoverFrag", "StammtischApp.fragment.AppointmentDetailsDialog", this);
				this.getView().addDependent(this._oDetailsPopover);
			}

			// the binding context is needed, because later when the OK button is clicked, the information must be updated
			oAppBC = oAppointment.getBindingContext();

			this._oDetailsPopover.setBindingContext(oAppBC);

			oDateTimePickerStart = oFrag.byId("myPopoverFrag", "startDate");
			oDateTimePickerEnd = oFrag.byId("myPopoverFrag", "endDate");
			oInfoInput = oFrag.byId("myPopoverFrag", "moreInfo");
			oOKButton = oFrag.byId("myPopoverFrag", "OKButton");

			oDateTimePickerStart.setDateValue(oAppointment.getStartDate());
			oDateTimePickerEnd.setDateValue(oAppointment.getEndDate());
			oInfoInput.setValue(oAppointment.getText());

			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oOKButton);
			this._oDetailsPopover.openBy(oAppointment);
		},

		updateButtonEnabledState: function(oDateTimePickerStart, oDateTimePickerEnd, oButton) {
			var bEnabled = oDateTimePickerStart.getValueState() !== "Error" && oDateTimePickerStart.getValue() !== "" && oDateTimePickerEnd.getValue() !==
				"" && oDateTimePickerEnd.getValueState() !== "Error";

			oButton.setEnabled(bEnabled);
		},

		handleOkButton: function(oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oStartValue = oFrag.byId("myPopoverFrag", "startDate").getDateValue(),
				oEndValue = oFrag.byId("myPopoverFrag", "endDate").getDateValue(),
				sInfoValue = oFrag.byId("myPopoverFrag", "moreInfo").getValue(),
				sAppointmentPath = this._oDetailsPopover.getBindingContext().sPath;

			this._oDetailsPopover.getModel().setProperty(sAppointmentPath + "/start", oStartValue);
			this._oDetailsPopover.getModel().setProperty(sAppointmentPath + "/end", oEndValue);
			this._oDetailsPopover.getModel().setProperty(sAppointmentPath + "/info", sInfoValue);
			this._oDetailsPopover.close();
		},

		handleCancelButton: function(oEvent) {
			this._oDetailsPopover.close();
		},

		handleAppointmentCreate: function(oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oDateTimePickerStart,
				oDateTimePickerEnd,
				oBeginButton;

			if (!this._oCreatePopover) {
				this._oCreatePopover = sap.ui.xmlfragment("myPopoverCreateFrag", "StammtischApp.fragment.AppointmentCreateDialog", this);
				this.getView().addDependent(this._oCreatePopover);
			}

			oDateTimePickerStart = oFrag.byId("myPopoverCreateFrag", "startDate");
			oDateTimePickerEnd = oFrag.byId("myPopoverCreateFrag", "endDate");
			oBeginButton = this._oCreatePopover.getBeginButton();

			oDateTimePickerStart.setValue("");
			oDateTimePickerEnd.setValue("");
			oDateTimePickerStart.setValueState("None");
			oDateTimePickerEnd.setValueState("None");

			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oBeginButton);
			this._oCreatePopover.openBy(oEvent.getSource());
		},

		_validateDateTimePicker: function(sValue, oDateTimePicker) {
			if (sValue === "") {
				oDateTimePicker.setValueState("Error");
			} else {
				oDateTimePicker.setValueState("None");
			}
		},

		handleDetailsChange: function(oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oDTPStart = oFrag.byId("myPopoverFrag", "startDate"),
				oDTPEnd = oFrag.byId("myPopoverFrag", "endDate"),
				oOKButton = oFrag.byId("myPopoverFrag", "OKButton");

			this._validateDateTimePicker(oEvent.getParameter("value"), oEvent.getSource());
			this.updateButtonEnabledState(oDTPStart, oDTPEnd, oOKButton);
		},

		handleCreateChange: function(oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oDateTimePickerStart = oFrag.byId("myFrag", "startDate"),
				oDateTimePickerEnd = oFrag.byId("myFrag", "endDate"),
				oBeginButton = this.oNewAppointmentDialog.getBeginButton();

			this._validateDateTimePicker(oEvent.getParameter("value"), oEvent.getSource());
			this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, oBeginButton);
		},

		handleCreateButton: function(oEvent) {
			var oFrag = sap.ui.core.Fragment,
				oStartDate,
				oEndDate,
				sTitle,
				sInfoResponse,
				oNewAppointment,
				oModel,
				sPath,
				oPersonAppointments;

			oStartDate = oFrag.byId("myPopoverCreateFrag", "startDate").getDateValue();
			oEndDate = oFrag.byId("myPopoverCreateFrag", "endDate").getDateValue();
			sTitle = oFrag.byId("myPopoverCreateFrag", "inputTitle").getValue();
			sInfoResponse = oFrag.byId("myPopoverCreateFrag", "moreInfo").getValue();

			if (oFrag.byId("myPopoverCreateFrag", "startDate").getValueState() !== "Error" && oFrag.byId("myPopoverCreateFrag", "endDate").getValueState() !==
				"Error") {

				oNewAppointment = {
					start: oStartDate,
					end: oEndDate,
					title: sTitle,
					info: sInfoResponse
				};
				oModel = this.getView().getModel();
				sPath = "/people/0/appointments";
				oPersonAppointments = oModel.getProperty(sPath);

				oPersonAppointments.push(oNewAppointment);

				oModel.setProperty(sPath, oPersonAppointments);
				this.oNewAppointmentDialog.close();
			}
		},

		handleCreateCancelButton: function(oEvent) {
			this._oCreatePopover.close();
		}

	});

});
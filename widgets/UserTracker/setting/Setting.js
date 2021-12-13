






















define([
  "dojo/_base/declare",
  "jimu/BaseWidgetSetting",
  "dijit/_WidgetsInTemplateMixin",
  'jimu/utils'
],
  function (
    declare,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,) {

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: "user-tracker-setting",


      postCreate: function () {
        console.log("postcreate")
        this.inherited(arguments);


      },

      startup: function () {

        this.inherited(arguments);
        this.setConfig(this.config);

        var self = this


        if (Object.hasOwnProperty.call(this.config, "jobUrl")) {
         
          this['job-url'].value = this.config.jobUrl

        }

        this['job-url'].onchange = function (e) {

          self.config.jobUrl = self['job-url'].value

        }


      },

      getConfig: function () {


        if (!this.config) {
          this.config = {};
        }

        return this.config;
      },

      setConfig: function (config) {
        this.config = config || {};
        var self = this;


      }

    });

  });






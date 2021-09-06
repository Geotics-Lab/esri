///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-construct",
    "jimu/BaseWidgetSetting",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Form",
    "jimu/dijit/CheckBox",
    "dijit/form/NumberTextBox",
    "dijit/form/ValidationTextBox"
  ],
  function(declare, lang, query, domClass, domConstruct,
    BaseWidgetSetting, _WidgetsInTemplateMixin) {

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: "jimu-widget-add-data-setting",
  


      postCreate: function () {
        this.inherited(arguments);

        var self = this;
      },

      startup: function () {


        if (this._started) {
          return;
        }
        this.inherited(arguments);
        this.setConfig(this.config);
        var self = this;

        this["config-layer"].value = JSON.stringify(this.config.layers)


        if (this.config.filterAction == true) {
          this["filter-map-setter"].setAttribute('checked', this.config.filterAction)
        }
        if (this.zoomAction.filterAction == true) {
          this["zoom-map-setter"].setAttribute('checked', this.config.zoomAction)
        }
        
       
        

        this["config-layer"].onchange = function (params) {
          self.config.layers = JSON.parse(self["config-layer"].value)
          console.log(self.config)
        }

        this["filter-map-setter"].onchange = function (params) {
          self.config.filterAction = this.checked
          console.log(self.config)
        }

        this["zoom-map-setter"].onchange = function (params) {
          self.config.zoomAction = this.checked
          console.log(self.config)
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

      }

    });

  });

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
  function (declare, lang, query, domClass, domConstruct,
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


        this["style-editor"].innerHTML = this.config.style
        
        this["style-save"].onclick = function (params) {
          this.config.style = this["style-editor"].innerHTML
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

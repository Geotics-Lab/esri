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
  'jimu/LayerInfos/LayerInfos',
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
  function (declare, LayerInfos, lang, query, domClass, domConstruct,
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
        this.layerInfos = LayerInfos.getInstanceSync()._layerInfos;
        this.setConfig(this.config);
        var self = this;

        //init config

        if(!this.config.hasOwnProperty("clickLayer")){
          this.config.clickLayer = []
        }

        if(!this.config.hasOwnProperty("clickJoinLayer")){
          this.config.clickJoinLayer = []
        }

        if(!this.config.hasOwnProperty("geometryService")){
          this.config.geometryService = ""
        }

        if(!this.config.hasOwnProperty("zoomAction")){
          this.config.zoomAction = false
        }

        if(!this.config.hasOwnProperty("filterAction")){
          this.config.filterAction = false
        }


        //retrieve config

        if (this.config.filterAction == true) this["filter-map-setter"].setAttribute('checked', this.config.filterAction)

        if (this.config.zoomAction == true) this["zoom-map-setter"].setAttribute('checked', this.config.zoomAction)

        this["geometry-service"].value = this.config.geometryService

        this["config-click"].value = JSON.stringify(this.config.clickLayer, null, "\t")

        this["config-join-click"].value = JSON.stringify(this.config.clickJoinLayer, null, "\t")

        this["config-layer"].value = JSON.stringify(this.config.layers, null, "\t")

        //listen change

        this["geometry-service"].onchange = function (params) {
          self.config.geometryService = self["geometry-service"].value
          console.log(self.config)
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

        this["config-click"].onchange = function (params) {
          self.config.clickLayer = JSON.parse(self["config-click"].value)
          console.log(self.config)
        }

        this["config-join-click"].onchange = function (params) {
          self.config.clickJoinLayer = JSON.parse(self["config-join-click"].value)
          console.log(self.config)
        }

       

        this["select-layer-add"].onclick = function (e) {


          self.config.layers.push({
            "url": self["select-layer-id"].value,
            "surveyTileField": self["select-layer-field-ortho"].value,
            "surveyNameField": self["select-layer-field-name"].value,
            "surveyDateField": self["select-layer-field-date"].value,
            "blocField": self["select-layer-field-bloc"].value
          })

          self["config-layer"].value = JSON.stringify(self.config.layers, null, "\t")

        }

        this["select-layer-id"].onchange = function (e) {

          self.layerInfos.forEach(element => {

            console.log(element.layerObject.url , e.target.value)
            if (element.layerObject.url == e.target.value) {

              var fields = element.layerObject._fields
              console.log(element.layerObject._fields.target)
              console.log(element.layerObject._fields)

              for (const key in fields) {
                const field = fields[key];

                var option = document.createElement('option')
                option.innerHTML = field.alias
                option.value = field.name

                self["select-layer-field-ortho"].appendChild(option)

                var option2 = document.createElement('option')
                option2.innerHTML = field.alias
                option2.value = field.name

                self["select-layer-field-date"].appendChild(option2)

                var option3 = document.createElement('option')
                option3.innerHTML = field.alias
                option3.value = field.name

                self["select-layer-field-name"].appendChild(option3)

                var option4 = document.createElement('option')
                option4.innerHTML = field.alias
                option4.value = field.name

                self["select-layer-field-bloc"].appendChild(option4)

              }

            }

          });

        }



        this["click-layer-add"].onclick = function (e) {


          self.config.clickLayer.push({
              "layerId" : self["click-layer-id"].value,
              "orthoField" : self["click-layer-field"].value
          })

          self["config-click"].value = JSON.stringify(self.config.clickLayer, null, "\t")

        }

        this["click-layer-id"].onchange = function (e) {

          self.layerInfos.forEach(element => {

            if (element.id == e.target.value) {

              console.log(element.layerObject)

              if (element.layerObject.fields) {
                var fields = element.layerObject.fields
              }
              else{
                var fields = element.layerObject._fields
              }
              
              console.log(fields.target)
              console.log(fields)

              for (const key in fields) {
                const field = fields[key];

                var option = document.createElement('option')
                option.innerHTML = field.alias
                option.value = field.name

                self["click-layer-field"].appendChild(option)

              }

            }

          });

        }

        this["config-join-click"].onchange = function (e) {
          self.config.clickJoinLayer = JSON.parse(self["config-join-click"].value)
        }


        // Build interface

        this.layerInfos.forEach(element => {

          var optionClickLayer = document.createElement('option')

          optionClickLayer.innerHTML = element.title

          optionClickLayer.value = element.layerObject.url
      

          this["select-layer-id"].appendChild(optionClickLayer)


        });

        
        this.layerInfos.forEach(element => {

          var optionClickLayer = document.createElement('option')

          optionClickLayer.innerHTML = element.title

          optionClickLayer.value = element.id

          this["click-layer-id"].appendChild(optionClickLayer)


        });

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

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
  "jimu/BaseWidgetSetting",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Form",
  "jimu/dijit/CheckBox",
  "dijit/form/NumberTextBox",
  "dijit/form/ValidationTextBox"
],
  function (declare, LayerInfos,
    BaseWidgetSetting, _WidgetsInTemplateMixin) {

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: "jimu-widget-add-data-setting",


      postCreate: function () {
        this.inherited(arguments);

        var self = this;
      },

      startup: function () {
        var self = this
        if (this._started) {
          return;
        }
        this.layerInfos = LayerInfos.getInstanceSync()._layerInfos;
        this.inherited(arguments);
        this.setConfig(this.config);

        console.log(this)

        this.setVisibilityTogglingFilter()


        this['import-config'].onchange = function (e) {
          var files = document.getElementById('import-config').files;
          console.log(files);
          if (files.length <= 0) {
            return false;
          }
        
          var fr = new FileReader();
        
          fr.onload = function(e) { 
          console.log(e);
            var result = JSON.parse(e.target.result);
            console.log(result)
            self.config = result
          }
        
          fr.readAsText(files.item(0));
          
        }
        this['export-config'].onclick = function (e) {
          var saveData = (function () {
            var a = document.createElement("a");
            // document.body.appendChild(a);
            // a.style = "display: none";
            return function (data, fileName) {
                var json = JSON.stringify(data),
                    blob = new Blob([json], {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
            }());
            
    
            saveData(self.config, "config.json");
        }
      },

      setVisibilityTogglingFilter: function (params) {

        var self = this

        this.visibilityTogglingFilterParameters = {
          "applyIfVisible": false,
          "visibilityLayerId": null,
          "filteredLayerId": [],
          "layerFilterField": null,
          "layerFilterOperator": "=",
          "layerFilterValue": null
        }

        this["retrieved-params"].innerHTML = JSON.stringify(this.config.filterLayerOnLayerVisibilityChange, undefined, 2)

        this.layerInfos.forEach(element => {

          var optionVisibilityLayer = document.createElement('option')
          var optionFilteredLayer = document.createElement('option')

          optionVisibilityLayer.innerHTML = element.title
          optionFilteredLayer.innerHTML = element.title

          optionVisibilityLayer.value = element.id
          optionFilteredLayer.value = element.id

          this["visibility-layer-id"].appendChild(optionVisibilityLayer)
          this["filtered-layer-id"].appendChild(optionFilteredLayer)


        });

        this["visibility-layer-id"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.visibilityLayerId = e.target.value
        }

        this["filtered-layer-id"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.filteredLayerId.push(e.target.value)

          self["layer-filter-field"].innerHTML = "<option>select field</option>"

          self.layerInfos.forEach(element => {

            if (element.id == e.target.value) {

              var fields = element.layerObject._fields
              console.log(element.layerObject._fields.target)
              console.log(element.layerObject._fields)

              for (const key in fields) {
                const field = fields[key];

                var option = document.createElement('option')
                option.innerHTML = field.alias
                option.value = field.name

                self["layer-filter-field"].appendChild(option)

              }

            }

          });
        }

        this["apply-if-visible"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.applyIfVisible = e.target.checked
        }

        this["layer-filter-field"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.layerFilterField = e.target.value
        }
        this["layer-filter-operator"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.layerFilterOperator = e.target.value.replace("&lt;", "<").replace('&gt;', ">")
        }

        this["layer-filter-value"].oninput = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.layerFilterValue = e.target.value
        }

        this["add-params"].onclick = function (params) {

          if (
            self.visibilityTogglingFilterParameters.layerFilterField != null &&
            self.visibilityTogglingFilterParameters.layerFilterValue != null &&
            self.visibilityTogglingFilterParameters.filteredLayerId.length != 0 &&
            self.visibilityTogglingFilterParameters.visibilityLayerId != null
          ) {

            var isExisting = false
            self.config.filterLayerOnLayerVisibilityChange.forEach(element => {

              if (element.visibilityLayerId == self.visibilityTogglingFilterParameters.visibilityLayerId) {

                alert("Filter already exist on layers, new filter will be append to existing layer. The others parameters need to be the same.")
                element.filteredLayerId = self.visibilityTogglingFilterParameters.filteredLayerId
                isExisting = true
              }

            });

            if (!isExisting) {
              self.config.filterLayerOnLayerVisibilityChange.push(self.visibilityTogglingFilterParameters)
            }
            
            self["retrieved-params"].innerHTML = JSON.stringify(self.config.filterLayerOnLayerVisibilityChange, undefined, 2)

          }
          else {
            console.warn(self.visibilityTogglingFilterParameters)
            alert("invalid self.visibilityTogglingFilterParameters")
          }

        }
        this["reset-params"].onclick = function (params) {
          self.config.filterLayerOnLayerVisibilityChange = []
          self["retrieved-params"].innerHTML = JSON.stringify(self.config.filterLayerOnLayerVisibilityChange, undefined, 2).replace("<", "&lt;").replace(">", '&gt;')

        }

        this['toggle-edit-params'].onclick = function (e) {

          switch (self["retrieved-params"].getAttribute('contenteditable')) {
            case "true":
              self["retrieved-params"].setAttribute('contenteditable', "false")
              self["valid-edit-params"].style.display = "none"
              break;

            case "false":
              self["retrieved-params"].setAttribute('contenteditable', "true")
              self["valid-edit-params"].style.display = "unset"
              break;
          }

        }

        this["valid-edit-params"].onclick = function (e) {
          self.config.filterLayerOnLayerVisibilityChange = JSON.parse(self["retrieved-params"].innerHTML.replace("&lt;", "<").replace('&gt;', ">"))
          self["retrieved-params"].setAttribute('contenteditable', "false")
          self["valid-edit-params"].style.display = "none"
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

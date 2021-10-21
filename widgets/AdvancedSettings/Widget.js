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
  "dojo/on",
  "esri/layers/WebTiledLayer",
  "esri/geometry/Extent",
  "esri/SpatialReference",
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/_base/array"
],
  function (declare, lang, on, WebTiledLayer, Extent, SpatialReference, BaseWidget, _WidgetsInTemplateMixin, array) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: "AddData",
      baseClass: "jimu-widget-add-data",

      postCreate: function () {
        this.inherited(arguments);
      },

      startup: function () {

        console.log(this)
        var self = this

        for (const key in this.config) {

          const parameters = this.config[key];

          switch (key) {
            case "filterLayerOnLayerVisibilityChange":
              this.filterLayerOnLayerVisibilityChange(parameters)
              break;


          }


        }


      },

      filterLayerOnLayerVisibilityChange: function (parameters) {

        var self = this

        parameters.forEach(element => {

          console.log(element)

          var visibilityLayer = this.map.getLayer(element.visibilityLayerId)

          var filteredLayers = []
          element.filteredLayerId.forEach(filteredLayerUid => {
            filteredLayers.push(this.map.getLayer(filteredLayerUid))
          });
          
          var filter = element.layerFilterField+ element.layerFilterOperator +element.layerFilterValue
          
          var applyIfVisible = element.applyIfVisible



          visibilityLayer.on("visibility-change", function (e) {
            console.log(e)

            switch (applyIfVisible) {

              case true:

                switch (e.visible) {
                  case true:
                    self.setDefinitionExpression(filteredLayers, filter)
                    break;

                  case false:
                    self.unsetDefinitionExpression(filteredLayers, filter)
                    break;
                }

                break;

              case false:

                switch (e.visible) {
                  case true:
                    self.unsetDefinitionExpression(filteredLayers, filter)
                    break;

                  case false:
                    self.setDefinitionExpression(filteredLayers, filter)
                    break;
                }

                break;
            }
          })

        });



      },

      setDefinitionExpression: function (layers, definitionExpression) {
        console.log(layer, definitionExpression)


        layers.forEach(layer => {
          var baseExpressionDefinition = ""
          var operator = ""
          if (layer.getDefinitionExpression() != undefined) {
            if (layer.getDefinitionExpression().length > 0) {
  
            }
          }
  
          var newDefinitionExpression = baseExpressionDefinition + operator + definitionExpression
          layer.setDefinitionExpression(newDefinitionExpression);
          console.log(newDefinitionExpression)
          console.log(layer.getDefinitionExpression())
        });

       

      },
      unsetDefinitionExpression: function (layers, definitionExpression) {



        console.log(layer, definitionExpression)

        layers.forEach(layer => {
          
        try {
          var newDefinitionExpression = layer.getDefinitionExpression().replace(" AND " + definitionExpression, "")

        } catch (error) {

        }
        try {
          var newDefinitionExpression = layer.getDefinitionExpression().replace(definitionExpression, "")

        } catch (error) {

        }
        layer.setDefinitionExpression(newDefinitionExpression);
        console.log(newDefinitionExpression)
        console.log(layer.getDefinitionExpression())
        });


      },


      _GET: function (path) {

        return new Promise((resolve, reject) => {

          var xmlHttp = new XMLHttpRequest();
          xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              resolve(xmlHttp.responseText);
          }
          xmlHttp.open("GET", path, true); // true for asynchronous 
          xmlHttp.send(null);

        })
      }


    });

  });

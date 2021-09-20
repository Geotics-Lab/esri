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
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/_base/array"
],
  function (declare, BaseWidget, _WidgetsInTemplateMixin, array) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: "AdvencedSettings",
      baseClass: "jimu-widget-advanced-settings",

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
            case "customScript":
              this.AddCustomScript(parameters)
              break;
            case "customCss":
              this.AddCustomCss(parameters)
              break;


          }


        }


      },



      AddCustomScript: function (scriptList) {


        scriptList.forEach(scriptContent => {


          switch (scriptContent.target) {
            case "body":
              var target = document.body
              break;
          
            case "head":
              var target = document.head
              break;
          }


          console.log(target , scriptContent)

          switch (scriptContent.format) {
            case "src":
              var script = document.createElement('script');
              var test_element = document.createElement('div');
              test_element.innerHTML = scriptContent.content;

              var element = test_element.childNodes[0];
              var attributes = element.attributes;

              for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];

                script.setAttribute(attribute.name, attribute.value);
              }
              
              target.appendChild(script);

              break;

            case "text":
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.innerHTML = scriptContent.content
              target.appendChild(script);
              break;
          }



          //document.head.appendChild(createElementFromHTML(scriptContent.content))

        });


        function createElementFromHTML(htmlString) {
          var div = document.createElement('div');
          div.innerHTML = htmlString.trim();

          return div.firstChild;
        }


      },

      AddCustomCss: function (cssList) {


        cssList.forEach(cssContent => {

          var styleSheet = document.createElement("style")
          styleSheet.type = "text/css"
          styleSheet.innerText = cssContent.content
          document.head.appendChild(styleSheet)

        });



      },

      filterLayerOnLayerVisibilityChange: function (parameters) {

        var self = this

        parameters.forEach(element => {

          console.log(element)

          var visibilityLayer = this.map.getLayer(element.visibilityLayerId)
          var filteredLayer = this.map.getLayer(element.filteredLayerId)
          var filter = element.layerFilterField + element.layerFilterOperator + element.layerFilterValue
          var operator = element.layerFilterCondition
          element.layerFilter
          var applyIfVisible = element.applyIfVisible



          visibilityLayer.on("visibility-change", function (e) {
            console.log(e)

            switch (applyIfVisible) {

              case true:

                switch (e.visible) {
                  case true:
                    self.setDefinitionExpression(filteredLayer, filter, operator)
                    break;

                  case false:
                    self.unsetDefinitionExpression(filteredLayer, filter, operator)
                    break;
                }

                break;

              case false:

                switch (e.visible) {
                  case true:
                    self.unsetDefinitionExpression(filteredLayer, filter)
                    break;

                  case false:
                    self.setDefinitionExpression(filteredLayer, filter)
                    break;
                }

                break;
            }
          })

        });



      },

      setDefinitionExpression: function (layer, definitionExpression, condition) {
        console.log(layer, definitionExpression)

        var baseExpressionDefinition = ""
        var operator = ""
        
        if (layer.getDefinitionExpression() != undefined) {
          if (layer.getDefinitionExpression().length > 0) {

            var baseExpressionDefinition = layer.getDefinitionExpression()
            var operator = " " + condition + " "

          }
        }

        var newDefinitionExpression = baseExpressionDefinition + operator + definitionExpression
        layer.setDefinitionExpression(newDefinitionExpression);
        console.log(newDefinitionExpression)
        console.log(layer.getDefinitionExpression())

      },


      unsetDefinitionExpression: function (layer, definitionExpression, condition) {
        console.log(layer, definitionExpression)
        console.log(layer.getDefinitionExpression())


        if (layer.getDefinitionExpression().includes(definitionExpression + " " + condition + " ")) {
          var newDefinitionExpression = layer.getDefinitionExpression().replace(definitionExpression + " " + condition + " ", "")
          console.log("replace : x or")

        }
        else if (layer.getDefinitionExpression().includes(" " + condition + " " + definitionExpression)) {
          var newDefinitionExpression = layer.getDefinitionExpression().replace(" " + condition + " " + definitionExpression, "")
          console.log("replace : or x")
        }
        else {
          var newDefinitionExpression = layer.getDefinitionExpression().replace(definitionExpression, "")
          console.log("replace : x")
        }


        layer.setDefinitionExpression(newDefinitionExpression);
        console.log(newDefinitionExpression)
        console.log(layer.getDefinitionExpression())
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

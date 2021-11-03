
define(["dojo/_base/declare",
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  'dojo/on'
],
  function (declare, BaseWidget, _WidgetsInTemplateMixin, on) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: "AdvencedSettings",
      baseClass: "jimu-widget-advanced-settings",

      postCreate: function () {
        this.inherited(arguments);
      },

      startup: function () {

        console.log(this)
        var self = this

        this.activeFiltre = {}



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
          
          console.info(element)

          var visibilityLayer = this.map.getLayer(element.visibilityLayerId)

          visibilityLayer.filteringParameters = {
            definitionExpression: element.layerFilterField + element.layerFilterOperator + element.layerFilterValue,
            condition : element.layerFilterCondition,
            applyIfVisible : element.applyIfVisible, 
            filteredLayers : []
          }

          element.filteredLayerId.forEach(filteredLayerUid => {
            visibilityLayer.filteringParameters.filteredLayers.push(this.map.getLayer(filteredLayerUid))
          });



          visibilityLayer.on("visibility-change", function (e) {

            console.warn(this)

            switch (visibilityLayer.filteringParameters.applyIfVisible) {

              case true:

                switch (e.visible) {
                  case true:
                    self.setDefinitionExpression(visibilityLayer.filteringParameters.filteredLayers, visibilityLayer.filteringParameters.definitionExpression, visibilityLayer.filteringParameters.condition)
                    break;

                  case false:
                    self.unsetDefinitionExpression(visibilityLayer.filteringParameters.filteredLayers, visibilityLayer.filteringParameters.definitionExpression, visibilityLayer.filteringParameters.condition)
                    break;
                }

                break;

              case false:

                switch (e.visible) {
                  case true:
                    self.unsetDefinitionExpression(visibilityLayer.filteringParameters.filteredLayers, visibilityLayer.filteringParameters.definitionExpression, visibilityLayer.filteringParameters.condition)
                    break;

                  case false:
                    self.setDefinitionExpression(visibilityLayer.filteringParameters.filteredLayers, visibilityLayer.filteringParameters.definitionExpression, visibilityLayer.filteringParameters.condition)
                    break;
                }

                break;
            }




          })


          filteredLayers.forEach(filteredLayer => {

            on(filteredLayer, 'update-end', function (e) {
              console.info("resfresh definition expression")
              self.refreshDefinitionExpression()


              repetitionCount = 0
              var interval = setInterval(() => {

                console.log("interval")
                self.refreshDefinitionExpression()

                if (repetitionCount > 10) {
                  clearInterval(interval)
                }

                repetitionCount++
              }, 500);
            })

          });

        });


        /*     setInterval(() => {
              this.refreshDefinitionExpression()
            }, 1000); */



      },

      setDefinitionExpression: function (layers, definitionExpression, condition) {
        console.log(layers, definitionExpression)

        layers.forEach(layer => {

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
          console.log("set new defex", newDefinitionExpression)

          this.activeFiltre[layer.id + definitionExpression] = {
            layer: layer,
            definitionExpression: definitionExpression,
            condition: condition,
            newDefinitionExpression: newDefinitionExpression
          }

        });



      },


      unsetDefinitionExpression: function (layers, definitionExpression, condition) {

        layers.forEach(layer => {

          if (layer.getDefinitionExpression().includes(definitionExpression + " " + condition + " ")) {
            var newDefinitionExpression = layer.getDefinitionExpression().replace(definitionExpression + " " + condition + " ", "")
          }
          else if (layer.getDefinitionExpression().includes(" " + condition + " " + definitionExpression)) {
            var newDefinitionExpression = layer.getDefinitionExpression().replace(" " + condition + " " + definitionExpression, "")
          }
          else {
            var newDefinitionExpression = layer.getDefinitionExpression().replace(definitionExpression, "")
          }

          console.log("unsetdefexp", newDefinitionExpression)
          layer.setDefinitionExpression(newDefinitionExpression);
          delete this.activeFiltre[layer.id + definitionExpression]

        });


      },


      refreshDefinitionExpression: function () {

        console.log(this.activeFiltre)

        for (const key in this.activeFiltre) {
          const filter = this.activeFiltre[key];

          if (!filter.layer.getDefinitionExpression().includes(filter.definitionExpression)) {
            this.setDefinitionExpression(filter.layer, filter.definitionExpression, filter.condition)
          }

        }
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


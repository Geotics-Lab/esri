






















define([
  "dojo/_base/declare",
  'jimu/LayerInfos/LayerInfos',
  "jimu/BaseWidgetSetting",
  "dijit/_WidgetsInTemplateMixin",
  'jimu/utils',
  './lib/codemirror',
  './lib/css',
  './lib/javascript',
  './lib/closebrackets',
  './lib/matchbrackets'
],
  function (
    declare,
    LayerInfos,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    utils,
    CodeMirror) {

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: "jimu-widget-add-data-setting",


      postCreate: function () {
        console.log("postcreate")
        this.inherited(arguments);

        utils.loadStyleLink('codemirrorstyle', this.folderUrl + 'setting/css/codemirror.css');
        utils.loadStyleLink('codemirrortheme', this.folderUrl + 'setting/css/material-darker.css');


      },

      startup: function () {

        this.inherited(arguments);
        this.layerInfos = LayerInfos.getInstanceSync()._layerInfos;
        this.setConfig(this.config);

        var self = this

        this.enableConfigExport()
        this.enableConfigImport()
        this.enableUiSizeToggle()

        setTimeout(() => {

          self.setVisibilityTogglingFilter()
          self.setCustomScript()
          self.setCustomCss()

        }, 2000);



      },

      enableConfigImport: function () {

        var self = this

        this['import-config'].onchange = function (e) {
          var files = document.getElementById('import-config').files;
          console.log(files);
          if (files.length <= 0) {
            return false;
          }

          var fr = new FileReader();

          fr.onload = function (e) {
            console.log(e);
            var result = JSON.parse(e.target.result);
            console.log(result)
            self.config = result
          }

          fr.readAsText(files.item(0));

        }
      },

      enableConfigExport: function () {

        var self = this

        this['export-config'].onclick = function (e) {
          var saveData = (function () {
            var a = document.createElement("a");
            // document.body.appendChild(a);
            // a.style = "display: none";
            return function (data, fileName) {
              var json = JSON.stringify(data),
                blob = new Blob([json], { type: "octet/stream" }),
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

      enableUiSizeToggle: function () {

        var self = this

        this['toggle-ui-size'].onclick = function (e) {

          if (this.getAttribute('state') == "min") {
            self['ui'].classList.add('setting-maximize')
            this.innerHTML = "minimize ui"
            this.setAttribute('state', 'max')
          }
          else {
            self['ui'].classList.remove('setting-maximize')
            this.innerHTML = "maximize ui"
            this.setAttribute('state', 'min')
          }



        }
      },

      setVisibilityTogglingFilter: function (params) {

        var self = this

        var codeMirror = CodeMirror.fromTextArea(this["retrieved-params"], {
          lineNumbers: true,
          mode: 'javascript',
          theme: 'material-darker',
          matchBrackets: true,
          autoCloseBrackets: true
        });

        codeMirror.setValue(JSON.stringify(this.config.filterLayerOnLayerVisibilityChange, undefined, 2))

        this.visibilityTogglingFilterParameters = {
          "applyIfVisible": false,
          "visibilityLayerId": null,
          "filteredLayerId": [],
          "layerFilterField": null,
          "layerFilterOperator": "=",
          "layerFilterCondition": "AND",
          "layerFilterValue": null
        }






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

        this["layer-filter-condition"].onchange = function (e) {
          console.log(e)
          self.visibilityTogglingFilterParameters.layerFilterCondition = e.target.value
        }

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
            codeMirror.setValue(JSON.stringify(self.config.filterLayerOnLayerVisibilityChange, undefined, 2))


          }
          else {
            console.warn(self.visibilityTogglingFilterParameters)
            alert("invalid self.visibilityTogglingFilterParameters")
          }

        }

        codeMirror.on("change", function () {
          console.log("codemirrorchange")
          try {
            self.config.filterLayerOnLayerVisibilityChange = JSON.parse(codeMirror.getValue())
          }
          catch (error) {
            console.log("invalid json")
          }
        });

      },

      setCustomScript: function () {
        console.log("setCustomScript")
        var self = this

        var codeMirror = CodeMirror.fromTextArea(this["custom-script-content"], {
          lineNumbers: true,
          mode: 'javascript',
          theme: 'material-darker',
          matchBrackets: true,
          autoCloseBrackets: true
        });

        var index = 0
        this.config.customScript.forEach(element => {
          var li = document.createElement("li")
          li.innerHTML = element.name
          li.classList.add("list-group-item")
          li.setAttribute("script-name", element.name)
          li.setAttribute("script-index", index)
          li.setAttribute("script-content", element.content)

          li.onclick = function (e) {
            var name = this.getAttribute('script-name')
            var content = this.getAttribute('script-content')
            var indexSelected = this.getAttribute('script-index')
            self["custom-script-content"].setAttribute('selected', indexSelected)
            codeMirror.setValue(content)
            self["custom-script-name"].value = name
            self['save-script'].style.display = "inline"
            self['remove-script'].style.display = "inline"
            self['add-script'].style.display = "none"
            self["custom-script-type"].setAttribute('disabled')
            self["custom-script-target"].setAttribute('disabled')

          }
          this["script-list"].appendChild(li)
          index++
        });

        this["add-script"].onclick = function (e) {
          self.config.customScript.push(JSON.parse(JSON.stringify({
            name: self["custom-script-name"].value,
            content: codeMirror.getValue(),
            format: self["custom-script-type"].value,
            target: self["custom-script-target"].value,
          })))

          var li = document.createElement("li")
          li.innerHTML = self["custom-script-name"].value
          li.classList.add("list-group-item")
          li.setAttribute("script-name", self["custom-script-name"].value)
          li.setAttribute("script-index", index)
          li.setAttribute("script-content", codeMirror.getValue())
          li.onclick = function (e) {
            var name = this.getAttribute('script-name')
            var content = this.getAttribute('script-content')
            var indexSelected = this.getAttribute('script-index')
            self["custom-script-content"].setAttribute('selected', indexSelected)
            codeMirror.setValue(content)
            self["custom-script-name"].value = name
            self['save-script'].style.display = "inline"
            self['remove-script'].style.display = "inline"
            self['add-script'].style.display = "none"
            self["custom-script-type"].setAttribute('disabled')
            self["custom-script-target"].setAttribute('disabled')

          }
          self["script-list"].appendChild(li)

          self["custom-script-name"].value = ""
          codeMirror.setValue("")

          index++
          console.log("config", self.config)
        }

        this["save-script"].onclick = function (e) {
          var indexSelected = self["custom-script-content"].getAttribute('selected')

          self.config.customScript[indexSelected] = {
            name: self["custom-script-name"].value,
            content: codeMirror.getValue()
          }
          self["script-list"].querySelectorAll('[script-index="' + indexSelected + '"]')[0].setAttribute("script-name", self["custom-script-name"].value)
          self["script-list"].querySelectorAll('[script-index="' + indexSelected + '"]')[0].setAttribute("script-content", self["custom-script-content"].value)
          self["script-list"].querySelectorAll('[script-index="' + indexSelected + '"]')[0].innerHTML = self["custom-script-name"].value


          self['add-script'].style.display = "inline"
          self['save-script'].style.display = "none"
          self['remove-script'].style.display = "none"
          self["custom-script-name"].value = ""
          codeMirror.setValue("")


          self["custom-script-type"].removeAttribute('disabled')
          self["custom-script-target"].removeAttribute('disabled')

        }

        this["remove-script"].onclick = function (e) {
          var indexSelected = self["custom-script-content"].getAttribute('selected')
          self['save-script'].style.display = "none"
          self['remove-script'].style.display = "none"
          self['add-script'].style.display = "inline"
          self["custom-script-name"].value = ""
          codeMirror.setValue("")
          self["script-list"].querySelectorAll('[script-index="' + indexSelected + '"]')[0].remove()

          for (let count = 0; count < self["script-list"].querySelectorAll('[script-index]').length; count++) {
            self["script-list"].querySelectorAll('[script-index]')[count].setAttribute('script-index', count)

          }
          self["custom-script-type"].removeAttribute('disabled')
          self["custom-script-target"].removeAttribute('disabled')
          self.config.customScript.splice(indexSelected, 1)

          index--
        }

      },

      setCustomCss: function () {
        console.log("sertcustomScript")
        var self = this

        var codeMirror = CodeMirror.fromTextArea(this['custom-css-content'], {
          lineNumbers: true,
          mode: 'text/css',
          theme: 'material-darker',
          matchBrackets: true,
          autoCloseBrackets: true
        });
        //console.log(this['custom-css-content-sizer'],this['custom-css-content-sizer'].clientWidth)
        //this.CSScodemirror.setSize( 300, null);


        var index = 0
        this.config.customCss.forEach(element => {
          var li = document.createElement("li")
          li.innerHTML = element.name
          li.classList.add("list-group-item")
          li.setAttribute("css-name", element.name)
          li.setAttribute("css-index", index)
          li.setAttribute("css-content", element.content)

          li.onclick = function (e) {
            var name = this.getAttribute('css-name')
            var content = this.getAttribute('css-content')
            var indexSelected = this.getAttribute('css-index')
            self["custom-css-content"].setAttribute('selected', indexSelected)
            self["custom-css-content"].value = content
            self["custom-css-name"].value = name
            self['save-css'].style.display = "inline"
            self['remove-css'].style.display = "inline"
            self['add-css'].style.display = "none"
            codeMirror.setValue(content);
          }
          this["css-list"].appendChild(li)
          index++
        });

        this["add-css"].onclick = function (e) {

          console.log(codeMirror.getValue())
          self.config.customCss.push(JSON.parse(JSON.stringify({
            name: self["custom-css-name"].value,
            content: codeMirror.getValue()
          })))

          var li = document.createElement("li")
          li.innerHTML = self["custom-css-name"].value
          li.classList.add("list-group-item")
          li.setAttribute("css-name", self["custom-css-name"].value)
          li.setAttribute("css-index", index)
          li.setAttribute("css-content", codeMirror.getValue())
          li.onclick = function (e) {
            var name = this.getAttribute('css-name')
            var content = this.getAttribute('css-content')
            var indexSelected = this.getAttribute('css-index')
            self["custom-css-content"].setAttribute('selected', indexSelected)
            self["custom-css-content"].value = codeMirror.getValue()
            self["custom-css-name"].value = name
            self['save-css'].style.display = "inline"
            self['remove-css'].style.display = "inline"
            self['add-css'].style.display = "none"

          }
          self["css-list"].appendChild(li)

          self["custom-css-name"].value = ""
          self["custom-css-content"].value = ""

          index++
          console.log("config", self.config)
        }

        this["save-css"].onclick = function (e) {
          var indexSelected = self["custom-css-content"].getAttribute('selected')

          self.config.customCss[indexSelected] = {
            name: self["custom-css-name"].value,
            content: codeMirror.getValue()
          }
          self["css-list"].querySelectorAll('[css-index="' + indexSelected + '"]')[0].setAttribute("css-name", self["custom-css-name"].value)
          self["css-list"].querySelectorAll('[css-index="' + indexSelected + '"]')[0].setAttribute("css-content", codeMirror.getValue())
          self["css-list"].querySelectorAll('[css-index="' + indexSelected + '"]')[0].innerHTML = self["custom-css-name"].value


          self['add-css'].style.display = "inline"
          self['save-css'].style.display = "none"
          self['remove-css'].style.display = "none"
          self["custom-css-name"].value = ""
          codeMirror.setValue("")


        }

        this["remove-css"].onclick = function (e) {
          var indexSelected = self["custom-css-content"].getAttribute('selected')
          self['save-css'].style.display = "none"
          self['remove-css'].style.display = "none"
          self['add-css'].style.display = "inline"
          self["custom-css-name"].value = ""
          self["custom-css-content"].value = ""
          self["css-list"].querySelectorAll('[css-index="' + indexSelected + '"]')[0].remove()

          for (let count = 0; count < self["css-list"].querySelectorAll('[css-index]').length; count++) {
            self["css-list"].querySelectorAll('[css-index]')[count].setAttribute('css-index', count)

          }

          self.config.customCss.splice(indexSelected, 1)

          index--
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






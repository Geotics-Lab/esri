///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2017 Esri. All Rights Reserved.
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

define([
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/promise/all',
  'dojo/_base/declare',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/utils',
  'jimu/BaseWidget',
  'jimu/MapManager',
  'jimu/filterUtils',
  'jimu/dijit/Message',
  'esri/lang',
  'esri/request',
  'esri/symbols/jsonUtils',
  'esri/layers/FeatureLayer',
  'esri/dijit/PopupTemplate',
  'esri/renderers/SimpleRenderer',
  './TaskSetting',
  './SingleQueryLoader',
  './SingleQueryResult',
  './utils',
  'jimu/LayerInfos/LayerInfos',
  'jimu/dijit/LoadingShelter',
  'dijit/form/Select',

],
  function (on, query, Deferred, lang, html, array, all, declare, _WidgetsInTemplateMixin, jimuUtils, BaseWidget,
    MapManager, FilterUtils, Message, esriLang, esriRequest, symbolJsonUtils, FeatureLayer, PopupTemplate,
    SimpleRenderer, TaskSetting, SingleQueryLoader, SingleQueryResult, queryUtils, LayerInfos) {

    return declare([BaseWidget, _WidgetsInTemplateMixin], {
      name: 'Query',
      baseClass: 'jimu-widget-query',
      currentTaskSetting: null,
      hiddenClass: "not-visible",
      _resultLayerInfos: null,//[{value,label,taskIndex,singleQueryResult}]
      mapManager: null,
      layerInfosObj: null,
      labelTasks: '',
      labelResults: '',

      /*

      popupInfo -> popupTempalte -> PopupRenderer

      test:
      http://map.floridadisaster.org/GIS/rest/services/Events/FL511_Feeds/MapServer/4
      http://maps.usu.edu/ArcGIS/rest/services/MudLake/MudLakeMonitoringSites/MapServer/0
      http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0
      1. if queryType is 1, it means that the query supports OrderBy and Pagination.
         such as: http://services2.arcgis.com/K1Xet5rYYN1SOWtq/ArcGIS/rest/services/
         USA_hostingFS/FeatureServer/0
      2. if queryType is 2, it means that the query supports objectIds, but
         doesn't support OrderBy or Pagination.
         such as: http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer
      3. if queryType is 3, it means that the query doesn't support objectIds.
      */

      postMixInProperties: function () { var this_query_widget = this
        this.inherited(arguments);
        this.layerInfosObj = LayerInfos.getInstanceSync();
        this.mapManager = MapManager.getInstance();
        this._resultLayerInfos = [];
        var strClearResults = this.nls.clearResults;
        var tip = esriLang.substitute({ clearResults: strClearResults }, this.nls.operationalTip);
        this.nls.operationalTip = tip;
        this.labelTasks = this.nls.tasks;
        this.labelResults = this.nls.queryResults;
        this._setUrlForConfig();
        if (this.config) {
          this.config = queryUtils.getConfigWithValidDataSource(this.config);
          this._updateConfig();
          if (this.config.labelTasks) {
            this.labelTasks = this.config.labelTasks;
          }
          if (this.config.labelResults) {
            this.labelResults = this.config.labelResults;
          }
        }
      },

      _updateConfig: function () { var this_query_widget = this
        if (this.config && this.config.queries && this.config.queries.length > 0) {
          array.forEach(this.config.queries, lang.hitch(this, function (singleConfig) {
            this._rebuildFilter(singleConfig.url, singleConfig.filter);
          }));
        }
      },

      _setUrlForConfig: function () { var this_query_widget = this
        //set url attribute of config if webMapLayerId is set
        if (this.config && this.config.queries && this.config.queries.length > 0) {
          array.forEach(this.config.queries, lang.hitch(this, function (singleConfig) {
            if (singleConfig.webMapLayerId) {
              var layerInfoOrTableInfo = this.layerInfosObj.getLayerOrTableInfoById(singleConfig.webMapLayerId);
              if (layerInfoOrTableInfo) {
                singleConfig.url = layerInfoOrTableInfo.getUrl();
              }
            }
          }));
        }
      },

      _rebuildFilter: function (url, filter) {
        try {
          if (filter) {
            delete filter.expr;
            var filterUtils = new FilterUtils();
            filterUtils.isHosted = jimuUtils.isHostedService(url);
            filterUtils.getExprByFilterObj(filter);
          }
        } catch (e) {
          console.log(e);
        }
      },

      postCreate: function () { var this_query_widget = this
        this.inherited(arguments);
        this._initSelf();
        this._updateResultDetailUI();
        var trs = query('.single-task', this.tasksTbody);
        if (trs.length === 1) {
          html.addClass(this.domNode, 'only-one-task');
          this._showTaskSettingPane();
          this._onClickTaskTr(trs[0]);
        }

        this.initChartFunctions()

      },

      onOpen: function () { var this_query_widget = this
        console.log("onOpen")
        this.onOpenManageLayers()
        var info = this._getCurrentResultLayerInfo();
        var singleQueryResult = info && info.singleQueryResult;
        if (singleQueryResult) {
          singleQueryResult.showLayer();
        }
        this._showTempLayers();
        this.inherited(arguments);


      },

      onClose: function () { var this_query_widget = this
        console.log("onClose")

        this.onCloseManageLayers()
        if (this.config.hideLayersAfterWidgetClosed) {
          this._hideAllLayers();
        }
        this._hideInfoWindow();
        this._hideTempLayers();
        this.inherited(arguments);
      },

      onActive: function () { var this_query_widget = this
        //this.map.setInfoWindowOnClick(false);
        // this.mapManager.disableWebMapPopup();
        this._showTempLayers();
      },

      onDeActive: function () { var this_query_widget = this
        //deactivate method of DrawBox dijit will call this.map.setInfoWindowOnClick(true) inside
        // this.drawBox.deactivate();
        if (this.currentTaskSetting) {
          this.currentTaskSetting.deactivate();
        }
        this.mapManager.enableWebMapPopup();
        this._hideTempLayers();
      },

      destroy: function () { var this_query_widget = this
        this._hideInfoWindow();
        this._removeResultLayerInfos(this._resultLayerInfos);
        this.inherited(arguments);
      },

      _hideTempLayers: function () { var this_query_widget = this
        if (this.currentTaskSetting) {
          this.currentTaskSetting.hideTempLayers();
        }
      },

      _showTempLayers: function () { var this_query_widget = this
        if (this.currentTaskSetting) {
          this.currentTaskSetting.showTempLayers();
        }
      },

      _initSelf: function () { var this_query_widget = this
        var queries = this.config.queries;

        if (queries.length === 0) {
          html.setStyle(this.tasksNode, 'display', 'none');
          html.setStyle(this.noQueryTipSection, 'display', 'block');
          return;
        }

        //create query tasks
        array.forEach(queries, lang.hitch(this, function (singleConfig, index) {
          var name = singleConfig.name;
          var strTr = '<tr class="single-task">' +
            '<td class="first-td"><img class="task-icon" /></td>' +
            '<td class="second-td">' +
            '<div class="list-item-name task-name-div"></div>' +
            '</td>' +
            '</tr>';
          var tr = html.toDom(strTr);
          var queryNameDiv = query(".task-name-div", tr)[0];
          queryNameDiv.innerHTML = name;
          html.place(tr, this.tasksTbody);
          var img = query("img", tr)[0];
          if (singleConfig.icon) {
            img.src = jimuUtils.processUrlInWidgetConfig(singleConfig.icon, this.folderUrl);
          } else {
            img.src = this.folderUrl + "css/images/default_task_icon.png";
          }
          tr.taskIndex = index;
          tr.singleConfig = singleConfig;
          if (index % 2 === 0) {
            html.addClass(tr, 'even');
          } else {
            html.addClass(tr, 'odd');
          }
        }));
      },

      _onTabHeaderClicked: function (event) {
        var target = event.target || event.srcElement;
        if (target === this.taskQueryItem) {
          var currentResultLayerInfo = this._getCurrentResultLayerInfo();
          if (currentResultLayerInfo) {
            var singleQueryResult = currentResultLayerInfo.singleQueryResult;
            if (singleQueryResult) {
              if (singleQueryResult.singleRelatedRecordsResult || singleQueryResult.multipleRelatedRecordsResult) {
                singleQueryResult._showFeaturesResultDiv();
              }
            }
          }
          this._switchToTaskTab();
        } else if (target === this.resultQueryItem) {
          this._switchToResultTab();
        }
      },

      _switchToTaskTab: function () { var this_query_widget = this
        html.removeClass(this.resultQueryItem, 'selected');
        html.removeClass(this.resultTabView, 'selected');
        html.addClass(this.taskQueryItem, 'selected');
        html.addClass(this.taskTabView, 'selected');
      },

      _switchToResultTab: function () { var this_query_widget = this
        this._updateResultDetailUI();
        html.removeClass(this.taskQueryItem, 'selected');
        html.removeClass(this.taskTabView, 'selected');
        html.addClass(this.resultQueryItem, 'selected');
        html.addClass(this.resultTabView, 'selected');
      },

      _updateResultDetailUI: function () { var this_query_widget = this
        if (this._resultLayerInfos.length > 0) {
          html.removeClass(this.resultSection, this.hiddenClass);
          html.addClass(this.noresultSection, this.hiddenClass);
        } else {
          html.addClass(this.resultSection, this.hiddenClass);
          html.removeClass(this.noresultSection, this.hiddenClass);
        }
      },

      _showTaskListPane: function () { var this_query_widget = this
        this._switchToTaskTab();
        html.setStyle(this.taskList, 'display', 'block');
        html.setStyle(this.taskSettingContainer, 'display', 'none');
      },

      _showTaskSettingPane: function () { var this_query_widget = this
        this._switchToTaskTab();
        html.setStyle(this.taskList, 'display', 'none');
        html.setStyle(this.taskSettingContainer, 'display', 'block');
      },

      /*------------------------------task list------------------------------------*/

      _onTaskListClicked: function (event) {
        var target = event.target || event.srcElement;
        var tr = jimuUtils.getAncestorDom(target, lang.hitch(this, function (dom) {
          return html.hasClass(dom, 'single-task');
        }), 10);

        if (!tr) {
          return;
        }

        this._onClickTaskTr(tr);
      },

      _onClickTaskTr: function (tr) {
        //this._getLayerInfoAndServiceInfo(tr).then(lang.hitch(this, function(response){
        this._getLayerInfoAndRelationshipLayerInfos(tr).then(lang.hitch(this, function (response) {
          var layerInfo = response.layerInfo;
          //var serviceInfo = response.serviceInfo;
          var relationshipLayerInfos = response.relationshipLayerInfos;
          var relationshipPopupTemplates = response.relationshipPopupTemplates;
          tr.singleConfig.objectIdField = jimuUtils.getObjectIdField(layerInfo);
          var popupInfo = this._getPopupInfo(layerInfo, tr.singleConfig);
          if (!popupInfo) {
            console.error("can't get popupInfo");
          }
          popupInfo.fieldInfos = queryUtils.getPortalFieldInfosWithoutShape(layerInfo, popupInfo.fieldInfos);
          delete popupInfo.readFromWebMap;
          //now we get all layerDefinitions and popupInfos
          //we prepare currentAttrs here
          var currentAttrs = SingleQueryLoader.getCleanCurrentAttrsTemplate();
          currentAttrs.queryTr = tr;
          currentAttrs.config = lang.clone(tr.singleConfig);
          currentAttrs.config.popupInfo = popupInfo; //add popupInfo attribute
          currentAttrs.layerInfo = layerInfo;
          //currentAttrs.serviceInfo = serviceInfo;
          currentAttrs.relationshipLayerInfos = relationshipLayerInfos;
          currentAttrs.relationshipPopupTemplates = relationshipPopupTemplates;
          currentAttrs.query.maxRecordCount = layerInfo.maxRecordCount || 1000;

          currentAttrs.queryType = queryUtils.getQueryType(layerInfo);

          //after get currentAttrs, we can show task setting pane destroy the old TaskSetting dijit and create a new one
          if (this.currentTaskSetting) {
            this.currentTaskSetting.destroy();
          }
          this.currentTaskSetting = null;
          this._showTaskSettingPane();
          this.currentTaskSetting = new TaskSetting({
            nls: this.nls,
            map: this.map,
            currentAttrs: currentAttrs,
            layerInfosObj: this.layerInfosObj,
            onBack: lang.hitch(this, function () {
              this._showTaskListPane();
            }),
            onApply: lang.hitch(this, function (currentAttrs) {
              this._onBtnApplyClicked(currentAttrs);
            })
          });

          if (this.currentTaskSetting.canAutoRunning()) {
            this._switchToResultTab();
            //if the task can run without specify other parameters, then we run it automatically
            this.currentTaskSetting.run();
          }

          this.currentTaskSetting.placeAt(this.taskSettingContainer);
        }), lang.hitch(this, function (err) {
          console.error("can't get layerInfo", err);
        }));
      },

      _getLayerInfoAndServiceInfo: function (tr) {
        var def = new Deferred();
        var layerDef = this._getLayerInfo(tr);
        var serviceDef = this._getServiceInfo(tr);
        this.shelter.show();
        all([layerDef, serviceDef]).then(lang.hitch(this, function (results) {
          if (!this.domNode) {
            return;
          }
          this.shelter.hide();
          tr.layerInfo = results[0];
          tr.serviceInfo = results[1];
          def.resolve({
            layerInfo: tr.layerInfo,
            serviceInfo: tr.serviceInfo
          });
        }), lang.hitch(this, function (err) {
          console.error(err);
          if (!this.domNode) {
            return;
          }
          this.shelter.hide();
          var errMsg = "";
          if (err && err.httpCode === 403) {
            errMsg = this.nls.noPermissionsMsg;
          }
          this._showQueryErrorMsg(errMsg);
          def.reject();
        }));
        return def;
      },

      _getLayerInfoAndRelationshipLayerInfos: function (tr) {
        var def = new Deferred();
        this.shelter.show();
        var layerDef = this._getLayerInfo(tr);
        layerDef.then(lang.hitch(this, function (layerInfo) {
          tr.layerInfo = layerInfo;
          this._getRelationshipLayerInfos(tr).then(lang.hitch(this, function (relationshipLayerInfos) {
            if (!this.domNode) {
              return;
            }

            tr.relationshipLayerInfos = relationshipLayerInfos;
            var relationshipPopupTemplates = {};
            var webMapItemData = this.map.itemInfo.itemData;

            var baseServiceUrl = tr.singleConfig.url.replace(/\d*\/*$/g, '');

            for (var layerId in relationshipLayerInfos) {
              var layerDefinition = relationshipLayerInfos[layerId];
              //var popupInfo = queryUtils.getDefaultPopupInfo(layerDefinition, false, true);
              var layerUrl = baseServiceUrl + layerId;
              var popupInfo = queryUtils.getPopupInfoForRelatedLayer(webMapItemData, layerUrl, layerDefinition);
              relationshipPopupTemplates[layerId] = new PopupTemplate(popupInfo);
            }
            this.shelter.hide();
            def.resolve({
              layerInfo: layerInfo,
              relationshipLayerInfos: relationshipLayerInfos,
              relationshipPopupTemplates: relationshipPopupTemplates
            });
          }), lang.hitch(this, function (err) {
            if (!this.domNode) {
              return;
            }
            this.shelter.hide();
            def.reject(err);
          }));
        }), lang.hitch(this, function (err) {
          if (!this.domNode) {
            return;
          }
          this.shelter.hide();
          def.reject(err);
        }));
        return def;
      },

      //get layer definition
      _getLayerInfo: function (tr) {
        var def = new Deferred();
        if (tr.layerInfo) {
          def.resolve(tr.layerInfo);
        } else {
          var layerUrl = tr.singleConfig.url;
          esriRequest({
            url: layerUrl,
            content: {
              f: 'json'
            },
            handleAs: 'json',
            callbackParamName: 'callback'
          }).then(lang.hitch(this, function (layerInfo) {
            tr.layerInfo = layerInfo;
            def.resolve(layerInfo);
          }), lang.hitch(this, function (err) {
            def.reject(err);
          }));
        }
        return def;
      },

      //get meta data of MapServer or FeatureServer
      _getServiceInfo: function (tr) {
        var def = new Deferred();
        if (tr.serviceInfo) {
          def.resolve(tr.serviceInfo);
        } else {
          var layerUrl = tr.singleConfig.url;
          var serviceUrl = this._getServiceUrlByLayerUrl(layerUrl);
          esriRequest({
            url: serviceUrl,
            content: {
              f: 'json'
            },
            handleAs: 'json',
            callbackParamName: 'callback'
          }).then(lang.hitch(this, function (serviceInfo) {
            tr.serviceInfo = serviceInfo;
            def.resolve(serviceInfo);
          }), lang.hitch(this, function (err) {
            def.reject(err);
          }));
        }
        return def;
      },

      //get relationship layers definition
      _getRelationshipLayerInfos: function (tr) {
        var def = new Deferred();
        if (tr.relationshipLayerInfos) {
          def.resolve(tr.relationshipLayerInfos);
        } else {
          var layerInfo = tr.layerInfo;
          var relationships = layerInfo.relationships;
          if (relationships && relationships.length > 0) {
            var layerUrl = tr.singleConfig.url;
            var serviceUrl = this._getServiceUrlByLayerUrl(layerUrl);
            var defs = array.map(relationships, lang.hitch(this, function (relationship) {
              var url = serviceUrl + "/" + relationship.relatedTableId;
              return esriRequest({
                url: url,
                content: {
                  f: 'json'
                },
                handleAs: 'json',
                callbackParamName: 'callback'
              });
            }));
            all(defs).then(lang.hitch(this, function (results) {
              tr.relationshipLayerInfos = {};
              array.forEach(relationships, lang.hitch(this, function (relationship, index) {
                tr.relationshipLayerInfos[relationship.relatedTableId] = results[index];
              }));
              def.resolve(tr.relationshipLayerInfos);
            }), lang.hitch(this, function (err) {
              tr.relationshipLayerInfos = null;
              def.reject(err);
            }));
          } else {
            tr.relationshipLayerInfos = {};
            def.resolve(tr.relationshipLayerInfos);
          }
        }
        return def;
      },

      _getServiceUrlByLayerUrl: function (layerUrl) {
        var lastIndex = layerUrl.lastIndexOf("/");
        var serviceUrl = layerUrl.slice(0, lastIndex);
        return serviceUrl;
      },

      _getPopupInfo: function (layerDefinition, config) {
        var result = null;
        var defaultPopupInfo = queryUtils.getDefaultPopupInfo(layerDefinition, false, false);
        result = defaultPopupInfo;
        var popupInfo = null;
        if (config.popupInfo) {
          //new query
          if (config.popupInfo.readFromWebMap) {
            if (config.webMapLayerId) {
              var layerInfo = null;
              if (queryUtils.isTable(layerDefinition)) {
                layerInfo = this.layerInfosObj.getTableInfoById(config.webMapLayerId);
              } else {
                layerInfo = this.layerInfosObj.getLayerInfoById(config.webMapLayerId);
              }
              if (layerInfo) {
                popupInfo = layerInfo.getPopupInfo();
                if (popupInfo) {
                  popupInfo = lang.clone(popupInfo);
                  result = popupInfo;
                } else {
                  result = defaultPopupInfo;
                }
              } else {
                result = defaultPopupInfo;
              }
            } else {
              result = defaultPopupInfo;
            }
          } else {
            //custom popup info
            popupInfo = lang.clone(config.popupInfo);
            delete popupInfo.readFromWebMap;
            result = popupInfo;
          }
        } else if (config.popup) {
          //old query, update old config.popup to new config.popupInfo
          result = queryUtils.upgradePopupToPopupInfo(layerDefinition, config.popup);
        } else {
          result = defaultPopupInfo;
        }

        if (!result) {
          result = defaultPopupInfo;
        }

        result.showAttachments = !!layerDefinition.hasAttachments;

        queryUtils.removePopupInfoUnsupportFields(layerDefinition, result);

        return result;
      },

      /*------------------------------task list------------------------------------*/

      //start to query
      _onBtnApplyClicked: function (currentAttrs) {
        //we should enable web map popup here
        this.mapManager.enableWebMapPopup();

        html.addClass(this.resultTabView, this.hiddenClass);

        //set query.resultLayer
        var singleResultLayer = currentAttrs.config.singleResultLayer;
        if (singleResultLayer) {
          var taskIndex = currentAttrs.queryTr.taskIndex;
          var taskOptions = this._getResultLayerInfosByTaskIndex(taskIndex);
          if (taskOptions.length > 0) {
            //When SingleQueryResult is destroyed, the related feature layer is removed
            this._removeResultLayerInfos(taskOptions);
          }
        }

        var queryName = this._getBestQueryName(currentAttrs.config.name || '');

        this._createNewResultLayer(currentAttrs, queryName);

        this.shelter.show();

        var singleQueryResult = new SingleQueryResult({
          map: this.map,
          nls: this.nls,
          label: queryName,
          currentAttrs: currentAttrs,
          queryWidget: this,
          onBack: lang.hitch(this, function () {
            this._switchToResultTab();
          })
        });
        this.own(on(singleQueryResult, 'show-related-records', lang.hitch(this, this._onShowRelatedRecords)));
        this.own(on(singleQueryResult, 'hide-related-records', lang.hitch(this, this._onHideRelatedRecords)));
        this.own(on(singleQueryResult, 'features-update', lang.hitch(this, this._onFeaturesUpdate)));
        //we should put singleQueryResult into the dom tree when _onSingleQueryFinished is called
        //singleQueryResult.placeAt(this.singleResultDetails);

        singleQueryResult.executeQueryForFirstTime().then(lang.hitch(this, function (/*allCount*/) {
          if (!this.domNode) {
            return;
          }
          this.shelter.hide();
          html.removeClass(this.resultTabView, this.hiddenClass);
          // if(allCount > 0){
          //   this._onSingleQueryFinished(singleQueryResult, queryName);
          // }
          this._onSingleQueryFinished(singleQueryResult, queryName);
          this._updateResultDetailUI();
        }), lang.hitch(this, function (err) {
          console.error(err);
          if (!this.domNode) {
            return;
          }
          this.shelter.hide();
          html.removeClass(this.resultTabView, this.hiddenClass);
        }));
      },

      _getBestQueryName: function (queryName) {
        if (queryName) {
          queryName += " _" + this.nls.queryResult;
        }
        else {
          queryName += this.nls.queryResult;
        }
        var finalName = queryName;
        var allNames = array.map(this.map.graphicsLayerIds, lang.hitch(this, function (glId) {
          var layer = this.map.getLayer(glId);
          return layer.name;
        }));
        var flag = 2;
        while (array.indexOf(allNames, finalName) >= 0) {
          finalName = queryName + '_' + flag;
          flag++;
        }
        return finalName;
      },

      //create a FeatureLayer
      _createNewResultLayer: function (currentAttrs, queryName) {
        var resultLayer = null;
        var renderer = null;
        var taskIndex = currentAttrs.queryTr.taskIndex;

        var layerInfo = lang.clone(currentAttrs.layerInfo);

        //override layerInfo
        layerInfo.name = queryName;
        //ImageServiceLayer doesn't have drawingInfo
        if (!layerInfo.drawingInfo) {
          layerInfo.drawingInfo = {};
        }

        layerInfo.drawingInfo.transparency = 0;
        layerInfo.minScale = 0;
        layerInfo.maxScale = 0;
        layerInfo.effectiveMinScale = 0;
        layerInfo.effectiveMaxScale = 0;
        layerInfo.defaultVisibility = true;
        delete layerInfo.extent;

        //only keep necessary fields
        var singleQueryLoader = new SingleQueryLoader(this.map, currentAttrs);
        var necessaryFieldNames = singleQueryLoader.getOutputFields();
        layerInfo.fields = array.filter(layerInfo.fields, lang.hitch(this, function (fieldInfo) {
          return necessaryFieldNames.indexOf(fieldInfo.name) >= 0;
        }));
        var featureCollection = {
          layerDefinition: layerInfo,
          featureSet: null
        };

        //For now, we should not add the FeatureLayer into map.
        resultLayer = new FeatureLayer(featureCollection);
        //set taskIndex for resutlLayer
        resultLayer._queryWidgetTaskIndex = taskIndex;
        //set popupTemplate
        var popupInfo = lang.clone(currentAttrs.config.popupInfo);
        var popupTemplate = new PopupTemplate(popupInfo);
        if (popupInfo.showAttachments) {
          var url = currentAttrs.config.url;
          var objectIdField = currentAttrs.config.objectIdField;
          queryUtils.overridePopupTemplateMethodGetAttachments(popupTemplate, url, objectIdField);
        }
        resultLayer.setInfoTemplate(popupTemplate);

        currentAttrs.query.resultLayer = resultLayer;

        //set renderer
        //if the layer is a table, resultsSymbol will be null
        if (!queryUtils.isTable(currentAttrs.layerInfo)) {
          if (!currentAttrs.config.useLayerSymbol && currentAttrs.config.resultsSymbol) {
            var symbol = symbolJsonUtils.fromJson(currentAttrs.config.resultsSymbol);
            renderer = new SimpleRenderer(symbol);
            resultLayer.setRenderer(renderer);
          }
        }

        return resultLayer;
      },

      /*---------------------------query result list-------------------------------*/

      _onSingleQueryFinished: function (singleQueryResult, queryName) {

        this.loadQueryData(singleQueryResult)
        console.warn("query")

        this.currentTaskSetting.onGetQueryResponse();
        singleQueryResult.placeAt(this.singleResultDetails);
        this._hideAllSingleQueryResultDijits();
        this._switchToResultTab();
        html.setStyle(singleQueryResult.domNode, 'display', 'block');
        var currentAttrs = singleQueryResult.getCurrentAttrs();
        var taskIndex = currentAttrs.queryTr.taskIndex;

        var resultLayerInfo = {
          value: jimuUtils.getRandomString(),
          label: queryName,
          taskIndex: taskIndex,
          singleQueryResult: singleQueryResult
        };

        this._resultLayerInfos.push(resultLayerInfo);

        this.resultLayersSelect.addOption({
          value: resultLayerInfo.value,
          label: resultLayerInfo.label
        });
        this.resultLayersSelect.set('value', resultLayerInfo.value);

        this._showResultLayerInfo(resultLayerInfo);

        this._updateResultDetailUI();
      },

      _onResultLayerSelectChanged: function () { var this_query_widget = this
        var resultLayerInfo = this._getCurrentResultLayerInfo();
        if (resultLayerInfo) {
          this._showResultLayerInfo(resultLayerInfo);
        }
      },

      _getCurrentResultLayerInfo: function () { var this_query_widget = this
        var resultLayerInfo = null;
        var value = this.resultLayersSelect.get('value');
        if (value) {
          resultLayerInfo = this._getResultLayerInfoByValue(value);
        }
        return resultLayerInfo;
      },

      _hideAllLayers: function (/*optional*/ ignoredSingleQueryResult) {
        var dijits = this._getAllSingleQueryResultDijits();
        array.forEach(dijits, lang.hitch(this, function (singleQueryResult) {
          if (singleQueryResult && singleQueryResult !== ignoredSingleQueryResult) {
            singleQueryResult.hideLayer();
          }
        }));
      },

      _removeResultLayerInfosByTaskIndex: function (taskIndex) {
        var resultLayerInfos = this._getResultLayerInfosByTaskIndex(taskIndex);
        this._removeResultLayerInfos(resultLayerInfos);
      },

      _getResultLayerInfoByValue: function (value) {
        var resultLayerInfo = null;
        array.some(this._resultLayerInfos, lang.hitch(this, function (item) {
          if (item.value === value) {
            resultLayerInfo = item;
            return true;
          } else {
            return false;
          }
        }));
        return resultLayerInfo;
      },

      _getResultLayerInfosByTaskIndex: function (taskIndex) {
        var resultLayerInfos = this._resultLayerInfos;
        resultLayerInfos = array.filter(resultLayerInfos, lang.hitch(this, function (resultLayerInfo) {
          return resultLayerInfo.taskIndex === taskIndex;
        }));
        return resultLayerInfos;
      },

      _removeResultLayerInfoByValues: function (values) {
        var indexArray = [];
        array.forEach(this._resultLayerInfos, lang.hitch(this, function (resultLayerInfo, index) {
          if (values.indexOf(resultLayerInfo.value) >= 0) {
            indexArray.push(index);
            if (resultLayerInfo.singleQueryResult && resultLayerInfo.singleQueryResult.domNode) {
              resultLayerInfo.singleQueryResult.destroy();
            }
            resultLayerInfo.singleQueryResult = null;
          }
        }));
        indexArray.reverse();
        array.forEach(indexArray, lang.hitch(this, function (index) {
          this._resultLayerInfos.splice(index, 1);
        }));
        this.resultLayersSelect.removeOption(values);

        var options = this.resultLayersSelect.getOptions();
        if (options && options.length > 0) {
          this.resultLayersSelect.set('value', options[0].value);
        } else {
          if (typeof this.resultLayersSelect._setDisplay === "function") {
            this.resultLayersSelect._setDisplay("");
          }
        }

        this._updateResultDetailUI();
      },

      _removeResultLayerInfos: function (resultLayerInfos) {
        var values = array.map(resultLayerInfos, lang.hitch(this, function (resultLayerInfo) {
          return resultLayerInfo.value;
        }));
        return this._removeResultLayerInfoByValues(values);
      },

      _getAllSingleQueryResultDijits: function () { var this_query_widget = this
        var dijits = [];

        if (this._resultLayerInfos && this._resultLayerInfos.length > 0) {
          array.forEach(this._resultLayerInfos, lang.hitch(this, function (resultLayerInfo) {
            if (resultLayerInfo && resultLayerInfo.singleQueryResult) {
              dijits.push(resultLayerInfo.singleQueryResult);
            }
          }));
        }

        return dijits;
      },

      _hideAllSingleQueryResultDijits: function () { var this_query_widget = this
        var dijits = this._getAllSingleQueryResultDijits();
        array.forEach(dijits, lang.hitch(this, function (dijit) {
          html.setStyle(dijit.domNode, 'display', 'none');
        }));
      },

      _showResultLayerInfo: function (resultLayerInfo) {
        this._hideAllSingleQueryResultDijits();
        var singleQueryResult = resultLayerInfo.singleQueryResult;
        this._hideAllLayers(singleQueryResult);
        if (singleQueryResult) {
          html.setStyle(singleQueryResult.domNode, 'display', 'block');
          singleQueryResult.showLayer();
          singleQueryResult.zoomToLayer();
        }
      },

      removeSingleQueryResult: function (singleQueryResult) {
        var value = null;
        array.some(this._resultLayerInfos, lang.hitch(this, function (resultLayerInfo) {
          if (resultLayerInfo.singleQueryResult === singleQueryResult) {
            value = resultLayerInfo.value;
            return true;
          } else {
            return false;
          }
        }));
        if (value !== null) {
          this._removeResultLayerInfoByValues([value]);
        }
      },

      _onShowRelatedRecords: function () { var this_query_widget = this
        html.addClass(this.resultLayersSelectDiv, this.hiddenClass);
      },

      _onHideRelatedRecords: function () { var this_query_widget = this
        html.removeClass(this.resultLayersSelectDiv, this.hiddenClass);
      },

      _onFeaturesUpdate: function (args) {
        var taskIndex = args.taskIndex;
        var features = args.features;
        try {
          this.updateDataSourceData(taskIndex, {
            features: features
          });
        } catch (e) {
          console.error(e);
        }
      },

      /*-------------------------common functions----------------------------------*/

      _isImageServiceLayer: function (url) {
        return (url.indexOf('/ImageServer') > -1);
      },

      _showQueryErrorMsg: function (/* optional */ msg) {
        new Message({ message: msg || this.nls.queryError });
      },

      _hideInfoWindow: function () { var this_query_widget = this
        if (this.map && this.map.infoWindow) {
          this.map.infoWindow.hide();
          if (typeof this.map.infoWindow.setFeatures === 'function') {
            this.map.infoWindow.setFeatures([]);
          }
        }
      },
      //-----------------------------------------------------------------------------

      initChartFunctions: function () { var this_query_widget = this

        this.defineChartParams()
        this.createTabElement()
        this.activeTabEvent()

      },


      defineChartParams: function () { var this_query_widget = this

        this.chart = {
          dataSet: [],
          attributes: [],
          data: [],
          stats: {
            unique: null,
            count: null,
            percent: null,
            total: null,
          },
          type: null,
          variable: null,
          color: {
            background: [],
            border: []
          }
        }
        this.multiChart = {
          dataSet: [],
          attributes: [],
          data: [],
          stats: {
            unique: [],
            count: [],
            percent: [],
            total: [],
          },
          type: null,
          variable: [],
          color: {
            background: [],
            border: []
          }
        }

        console.log(this)
      },



      createTabElement: function () { var this_query_widget = this

        this_query_widget.tabHeader.classList.add("flex")
        this_query_widget.taskQueryItem.classList.remove("jimu-float-leading")
        this_query_widget.resultQueryItem.classList.remove("jimu-float-trailing")

        chartTab = document.createElement("div")
        chartTab.classList.add("query-tab-item")
        chartTab.classList.add("jimu-ellipsis")
        chartTab.classList.add("tab-cartQuery")
        chartTab.innerHTML = "Stats"

        this_query_widget.tabHeader.appendChild(chartTab)
        this_query_widget.chartQueryItem = chartTab


        //---


      },

      activeTabEvent: function () { var this_query_widget = this
        this_query_widget = this

        this.chartQueryItem.onclick = function () {

          this_query_widget.chartQueryItem.classList.add("selected")
          this_query_widget.chartTabView.classList.add("displayTrue")

          this_query_widget.taskTabView.classList.add("displayFalse")
          this_query_widget.taskTabView.classList.remove("displayTrue")
          this_query_widget.taskQueryItem.classList.remove("selected")

          this_query_widget.resultTabView.classList.add("displayFalse")
          this_query_widget.resultTabView.classList.remove("displayTrue")
          this_query_widget.resultQueryItem.classList.remove("selected")

          this_query_widget.loadChartEnginer()


        }

        this.taskQueryItem.onclick = function (params) {

          this_query_widget.chartQueryItem.classList.remove("selected")
          this_query_widget.chartTabView.classList.remove("displayTrue")
          this_query_widget.chartTabView.classList.add("displayFalse")
          this_query_widget.taskTabView.classList.add("displayTrue")



        }

        this.resultQueryItem.onclick = function (params) {

          this_query_widget.chartQueryItem.classList.remove("selected")
          this_query_widget.chartTabView.classList.remove("displayTrue")
          this_query_widget.taskTabView.classList.remove("displayTrue")
          this_query_widget.chartTabView.classList.add("displayFalse")
          this_query_widget.resultTabView.classList.add("displayTrue")



        }


      },

      loadQueryData: function (singleQueryResult) {

        var this_query_widget = this

        this_query_widget.chartFieldSelect.innerHTML = ""

        this_query_widget.taskTabView.classList.add("displayFalse")
        this_query_widget.taskTabView.classList.remove("displayTrue")
        this_query_widget.resultTabView.classList.add("displayTrue")
        this_query_widget.resultTabView.classList.remove("displayFalse")
        this_query_widget.chartTabView.classList.add("displayFalse")
        this_query_widget.chartTabView.classList.remove("displayTrue")
        this_query_widget.buildChartBox()
        this_query_widget.chartTableBodyStats.innerHTML = ""

        graphics = singleQueryResult.currentAttrs.query.resultLayer.graphics
        fields = singleQueryResult.currentAttrs.layerInfo.fields

        this.chart.dataSet = []
        this.chart.attributes = []


        for (var index = 0; index < fields.length; index++) {

          element = fields[index]

          this.chart.attributes.push(element.name)

          fieldOption = document.createElement("option")
          fieldOption.innerHTML = element.alias
          fieldOption.value = element.name

          this.chartFieldSelect.appendChild(fieldOption)

        }

        for (var index = 0; index < graphics.length; index++) {

          element = graphics[index]

          this.chart.dataSet.push(element.attributes)

        }

      },

      loadChartEnginer: function () { var this_query_widget = this

        this_query_widget.chart.selectedFields = []

        if (this.chart.dataSet.length > 0) {

          this_query_widget.chartTypeSelect.onchange = function (evt) {

            this_query_widget.sumarizeData()
            this_query_widget.drawChart()
            this_query_widget.chartTools.style.display = "flex"

          }

          this_query_widget.chartFieldSelect.onchange = function (evt) {

            this_query_widget.chart.selectedFieldElement = evt.explicitOriginalTarget
            this_query_widget.sumarizeData()
            this_query_widget.drawChart()
            this_query_widget.chartTools.style.display = "flex"

            if (this_query_widget.chart.selectedFields.includes(this_query_widget.chart.selectedFieldElement.value) == false) {
              this_query_widget.chart.selectedFields.push(this_query_widget.chart.selectedFieldElement.value)
            }


          }
          this_query_widget.chartStatBtn.onclick = function () {

            if (this_query_widget.chartStatContainer.style.height == "") {
              this_query_widget.chartStatContainer.style.height = "300px"
              this_query_widget.chartStatContainer.style.border = "solid #AAAAAA 1px";
            }
            else if (this_query_widget.chartStatContainer.style.height == "0px") {
              this_query_widget.chartStatContainer.style.height = "300px"
              this_query_widget.chartStatContainer.style.border = "solid #AAAAAA 1px";
            }
            else {
              this_query_widget.chartStatContainer.style.height = "0px"
              this_query_widget.chartStatContainer.style.border = "solid white 1px";
            }



          }

          this_query_widget.chartImgDownloaderBtn1.onclick = function () {

            alert("Redimensionez la taille du widget pour modifier la qualité de l'image.")

            canvas = document.getElementById("chartCanvas");
            img = canvas.toDataURL("image/png");
            this_query_widget.chartImgDownloaderBtn.setAttribute("download", "canvas.png");
            this_query_widget.chartImgDownloaderBtn.setAttribute("href", img);
            this_query_widget.chartImgDownloaderBtn.click()
          }


          this_query_widget.chartDownloadExcel.onclick = function () {

            this_query_widget.buildCsv()
          }

          this_query_widget.chartDownloadExcelResume.onclick = function () {

            this_query_widget.buildCsvResume()
          }
          this_query_widget.chartDownloadPdf.onclick = function () {

            var r = confirm("Vous apprétez à effectuer un export PDF, cette opperation peu durer quelques minutes. ");

            if (r == true) {
              this_query_widget.buildPdf()
            }

          }


        }


        else {
          alert("Vous devez effectuez un recherche")
        }




      },

      sumarizeData: function () { var this_query_widget = this


        this_query_widget.chart.data = []
        this_query_widget.chart.stats = []
        this_query_widget.chart.color = {}
        this_query_widget.chart.color.background = []
        this_query_widget.chart.color.border = []



        //---------------------------
        function getData() {
          var a = []
          for (var index = 0; index < this_query_widget.chart.dataSet.length; index++) {
            element = this_query_widget.chart.dataSet[index]
            a.push(element[this_query_widget.chartFieldSelect.value])
          }
          return a;
        }
        //---------------------------
        function getOccurence(arr) {
          var a = [], b = [], prev;
          arr.sort();
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== prev) {
              a.push(arr[i]);
              b.push(1);
            } else {
              b[b.length - 1]++;
            }
            prev = arr[i];
          }

          return [a, b];
        }
        //---------------------------
        function getPercent(arr, tot) {
          var a = []

          for (var index = 0; index < arr.length; index++) {
            element = arr[index]
            a.push(Math.round(element / tot * 100))
          }

          return a;
        }
        //---------------------------
        function getColors(arr) {
          background = []
          border = []
          for (var index = 0; index < arr.length; index++) {
            var r = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);
            background.push("rgb(" + r + "," + g + "," + b + ", 0.25)")
            border.push("rgb(" + r + "," + g + "," + b + ", 0.85)")
          }
          return [background, border]
        }
        //---------------------------

        data = getData()
        unique = getOccurence(data)[0]
        count = getOccurence(data)[1]
        total = data.length
        console.log(total)
        percent = getPercent(count, total)
        colours = getColors(unique)
        type = this_query_widget.chartTypeSelect.value
        variable = this_query_widget.chartFieldSelect.value

        this_query_widget.chart.data = data
        this_query_widget.chart.stats.unique = unique
        this_query_widget.chart.stats.count = count
        this_query_widget.chart.stats.percent = percent
        this_query_widget.chart.stats.total = total
        this_query_widget.chart.color.background = colours[0]
        this_query_widget.chart.color.border = colours[1]
        this_query_widget.chart.variable = variable
        this_query_widget.chart.type = type

        console.log(this_query_widget.chart.stats)

        this_query_widget.multiChart.data.push(data)
        this_query_widget.multiChart.stats.unique.push(unique)
        this_query_widget.multiChart.stats.count.push(count)
        this_query_widget.multiChart.stats.percent.push(percent)
        this_query_widget.multiChart.stats.total.push(total)
        this_query_widget.multiChart.color.background.push(colours[0])
        this_query_widget.multiChart.color.border.push(colours[1])
        this_query_widget.multiChart.variable.push(variable)
        this_query_widget.multiChart.type = type



        console.warn("single", this_query_widget.chart)
        console.warn("multi", this_query_widget.multiChart)


      },

      drawChart: function () { var this_query_widget = this


        require(['./widgets/QueryToChart/chartjs/Chart.min.js'], function (Chart) {

          statsBox = this_query_widget.buildStatsBox()
          chartBox = this_query_widget.buildChartBox()
          ctx = chartBox.getContext('2d');
          chartParams = this_query_widget.loadChartParams()

          this_query_widget.chart.myChart = new Chart(ctx, chartParams);

        });

      },

      loadChartParams: function () { var this_query_widget = this

        chartParams = {

          type: this_query_widget.chart.type,
          data: {
            labels: this_query_widget.chart.stats.unique,
            datasets: [{
              label: this_query_widget.chart.variable.toUpperCase(),
              data: this_query_widget.chart.stats.count,
              backgroundColor: this_query_widget.chart.color.background,
              borderColor: this_query_widget.chart.color.border,
              borderWidth: 1.5
            },]
          },
          options: {
            legend: {
              display: true,
              fullWidth: true,
              labels: {
                fontColor: 'rgb(44, 62, 80)'
              }
            },
            title: {
              display: true,
              text: this_query_widget.chart.variable.toUpperCase(),
              fontColor: 'rgb(44, 62, 80)'
            },
            responsive: true,
            maintainAspectRatio: false,
            showLines: true,

          }
        }


        return chartParams;


      },

      buildChartBox: function () { var this_query_widget = this

        this_query_widget.chartContainer.innerHTML = ""
        canvas = document.createElement("canvas")
        canvas.id = "chartCanvas"
        canvas.style.height = "100px"
        canvas.style.width = "100px"
        this_query_widget.chartContainer.appendChild(canvas)

        return canvas;

      },

      buildStatsBox: function () { var this_query_widget = this

        this_query_widget.chartTableBodyStats.innerHTML = ""


        for (var index = 0; index < this_query_widget.chart.stats.unique.length; index++) {

          label = this_query_widget.chart.stats.unique[index]
          count = this_query_widget.chart.stats.count[index]
          percent = this_query_widget.chart.stats.percent[index]

          statRow = document.createElement("tr")
          labelCell = document.createElement("td")
          countCell = document.createElement("td")
          percentCell = document.createElement("td")
          labelCell.innerHTML = label
          countCell.innerHTML = count
          percentCell.innerHTML = percent

          statRow.appendChild(labelCell)
          statRow.appendChild(countCell)
          statRow.appendChild(percentCell)

          this_query_widget.chartTableBodyStats.appendChild(statRow)
        }

        this_query_widget.chartTableFootStatsCount.innerHTML = this_query_widget.chart.stats.total

      },

      buildCsv: function () { var this_query_widget = this

        rows = [["variable", "effectif", "ratio"]]

        for (var index = 0; index < this_query_widget.chart.stats.unique.length; index++) {
          variable = this_query_widget.chart.stats.unique[index]
          effectif = this_query_widget.chart.stats.count[index]
          ratio = this_query_widget.chart.stats.percent[index]

          row = [variable, effectif, ratio]
          rows.push(row)
        }
        rows.push(["total", this_query_widget.chart.stats.total, "100%"])
        console.log(rows)

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.style.display = "none"
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "stats.csv");
        document.body.appendChild(link);

        link.click();


      },



      buildCsvResume: function () { var this_query_widget = this

        rows = []

        rows.push(this_query_widget.chart.attributes)

        separator = []
        for (var index = 0; index < this_query_widget.chart.attributes.length; index++) {
          separator.push("---")
        }

        for (var index = 0; index < this_query_widget.chart.stats.unique.length; index++) {
          variable = this_query_widget.chart.stats.unique[index]
          effectif = this_query_widget.chart.stats.count[index]
          ratio = this_query_widget.chart.stats.percent[index]

          for (var index2 = 0; index2 < this_query_widget.chart.dataSet.length; index2++) {

            item = this_query_widget.chart.dataSet[index2]

            if (item[this_query_widget.chart.variable] == variable) {

              values = []
              Object.keys(item).forEach(function (key) {
                values.push(item[key])
              });
              rows.push(values)
            }

          }

          rows.push(separator, [variable, effectif, ratio + "%"], separator)

        }

        console.log(rows)

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.style.display = "none"
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "abstract.csv");
        document.body.appendChild(link);

        link.click();

      },
      buildPdf: function () { var this_query_widget = this

        require(['./widgets/QueryToChart/html2pdf/dist/html2pdf.bundle.min.js'], function (html2pdf) {


          page = document.createElement("div")
          header = document.createElement("div")
          title = document.createElement("h1")
          logo = document.createElement("img")
          main = document.createElement("div")
          chart = document.createElement("div")
          legend = document.createElement("div")

          logo.setAttribute("src", "");


          page.style.border = "solid 1px"

          header.style.display = "flex"
          header.style.height = "100px"
          header.style.width = "100%"

          title.style.padding = "30px"
          title.style.width = "100%"
          title.style.height = "100%"
          title.style.border = "solid 1px"
          title.style.position = "relative"
          title.style.top = "-21px"

          logo.style.height = "100%"
          logo.style.width = "100px"
          logo.style.border = "solid 1px"
          logo.style.position = "relative"
          logo.style.top = "0px"

          main.style.border = "solid 1px"
          main.style.paddingTop = "200px"

          chart.style.marginBottom = "40px"
          chart.style.margin = "auto"

          chart.classList.add("html2pdf__page-breakAfter")
          //legend.classList.add("html2pdf__page-breakBefore")



          title.innerHTML = "<b>RAPPORT</b>"
          header.appendChild(title)
          header.appendChild(logo)
          chart.appendChild(document.getElementById("chartCanvas"))
          legend.appendChild(this_query_widget.chartTableStats.cloneNode(true))
          main.appendChild(chart)
          main.appendChild(legend)
          page.appendChild(header)
          page.appendChild(main)


          var opt = {
            margin: 1,
            filename: 'myfile.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { before: '.html2pdf__page-breakBefore', after: ['.html2pdf__page-breakAfter'] }
          };
          html2pdf().set(opt).from(page).save();


        })


      },

      onOpenManageLayers: function () { var this_query_widget = this
        console.log("onOpen")

        this_pp_SM = this

        showList = []

        hideListe = [
        ]

        Object.keys(this.map._layers).forEach(function (key) {

          layerUrl = this_pp_SM.map._layers[key].url

          if (showList.includes(layerUrl) == true) {

            this_pp_SM.map.getLayer(this_pp_SM.map._layers[key].id).setVisibility(1)

          }
          if (hideListe.includes(layerUrl) == true) {

            this_pp_SM.map.getLayer(this_pp_SM.map._layers[key].id).setVisibility(0)

          }

        })

      },

      onCloseManageLayers: function () { var this_query_widget = this
        console.log("onClose")

        this_pp_SM = this

        hideListe = []

        showList = [
          
        ]

        Object.keys(this.map._layers).forEach(function (key) {

          layerUrl = this_pp_SM.map._layers[key].url

          if (hideListe.includes(layerUrl) == true) {

            this_pp_SM.map.getLayer(this_pp_SM.map._layers[key].id).setVisibility(0)

          }
          if (showList.includes(layerUrl) == true) {

            this_pp_SM.map.getLayer(this_pp_SM.map._layers[key].id).setVisibility(1)

          }

        })

      }




    });
  });
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
	"esri/layers/FeatureLayer",
	"esri/geometry/Extent",
	"esri/SpatialReference",
	"esri/tasks/QueryTask",
	"esri/tasks/query",
	"jimu/BaseWidget",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/_base/array"
],
	function (declare, lang, on, WebTiledLayer, FeatureLayer, Extent, SpatialReference, QueryTask, Query, BaseWidget, _WidgetsInTemplateMixin, array) {
		return declare([BaseWidget, _WidgetsInTemplateMixin], {

			name: "AddData",
			baseClass: "jimu-widget-add-data",

			postCreate: function () {
				this.inherited(arguments);
			},

			startup: function () {

				console.log("alteia missions", this)

				var self = this
				this.layers = this.getLayers()
				this.webTiledLayer = null
				this.blocDescription = null
				this.surveyDescription = null
				this.startDate = null
				this.endDate = null
				this.selectedIndex = null
				this.temporaryDefinitionExpression = ""

				this.host = this.config.host

				this.tryToEnableClickLayer()
				this.tryToEnableClickJoinLayer()




				self.getMissionsDescription().then(function (description) {
					self.blocDescription = description
					self.addBlocs(self.blocDescription)
				})

				this["mission-selector"].onchange = function (e) {

					self.selectedIndex = this.value
					self.surveyDescription = self.getLatestMission(self.blocDescription[this.value])
					self.clearTiledLayer()
					self.addTiledLayer(self.surveyDescription)

				}

				this["start-date"].onchange = function (e) {

					self.startDate = new Date(this.value)
					self.clearMissions()
					self.clearTiledLayer()

					if (self.selectedIndex != null) {

						self.surveyDescription = self.getLatestMission(self.blocDescription[self.selectedIndex])
						self.clearTiledLayer()
						self.addTiledLayer(self.surveyDescription)
					}


				}

				this["end-date"].onchange = function (e) {

					self.endDate = new Date(this.value)
					self.clearMissions()
					self.clearTiledLayer()
					self.addBlocs(self.blocDescription)

					if (self.selectedIndex != null) {

						self.surveyDescription = self.getLatestMission(self.blocDescription[self.selectedIndex])
						self.clearTiledLayer()
						self.addTiledLayer(self.surveyDescription)
					}



				}


			},


			tryToEnableClickLayer : function () {

				var self = this

				if (this.config.clickLayer.length > 0) {


					this.config.clickLayer.forEach(layerInfo => {
						var layer = self.map.getLayer(layerInfo.layerId)

						layer.on("click", function (e) {
							if (self["get-by-click"].checked == true) {

								
								self.config.clickLayer.forEach(element => {
									if (element.layerId == e.graphic._layer.id) {

										

										var url = e.graphic.attributes[element.orthoField]
										
										self.clearTiledLayer()
										var tilesUrl = url.replace("{z}", "{level}").replace("{x}", "{col}").replace("{y}", "{row}")

										self.webTiledLayer = new WebTiledLayer(tilesUrl, {
											"copyright": '',
											"id": "Alteia Orthomosaic"
										});
										self.map.addLayer(self.webTiledLayer);
									}
								});

							}
							
						})
					});

					this["get-by-click"].onchange = function (e) {

						if (self["get-by-click"].checked == true) {

							//document.getElementById("map").style.cursor = "crosshair"
	
						}
						else {
							//document.getElementById("map").style.cursor = "none"
						}
						
					}

					



				}
				else {
					this["mission-by-click"].style.display = "none"
				}
			},

			tryToEnableClickJoinLayer : function () {

				var self = this
				if (this.config.clickJoinLayer.length > 0) {


					this.config.clickJoinLayer.forEach(layerInfo => {
						var layer = self.map.getLayer(layerInfo.layerId)

						layer.on("click", function (e) {
							if (self["get-by-click-join"].checked == true) {

								
								self.config.clickJoinLayer.forEach(element => {
									if (element.layerId == e.graphic._layer.id) {

										

										var joinValue = e.graphic.attributes[element.joinField]
										
										self.getJoinnedFeature(element.joinLayerUrl, element.joinField, joinValue).then(function(result) {
											console.log(result)
										})
									}
								});

							}
							
						})
					});

				

					



				}
				else {
					this["mission-by-click-join"].style.display = "none"
				}
			},



			addBlocs: function (description) {

				var self = this

				for (const key in description) {

					const element = description[key];

					var option = document.createElement('option')

					option.innerHTML = key
					option.value = key
					option.setAttribute("survey-description", JSON.stringify(element))

					self["mission-selector"].appendChild(option)

				}

			},

			getLatestMission: function (missionsList) {

				var latestMission = null
				var sortedMissionList = this.getSortedMissionList(missionsList)

				sortedMissionList.forEach(element => {
					console.log(element)
					console.log(this.dateFilterIsValid(new Date(element.date)))
					if (this.dateFilterIsValid(new Date(element.date))) {
						latestMission = element
						return
					}
				});




				return latestMission
			},

			getSortedMissionList: function (missionList) {

				var sortedMissionList = missionList.sort(function (a, b) {
					var c = new Date(a.date);
					var d = new Date(b.date);
					return c - d;
				});

				return sortedMissionList


			},

			clearMissions: function () {
				this["mission-selector"].innerHTML = "<option>Block</option>"
			},

			addTiledLayer: function (description) {

				if (description == null) {
					alert("no referenced orthomosaic for this block.")
				}
				else {
					var tilesUrl = description.url.replace("{z}", "{level}").replace("{x}", "{col}").replace("{y}", "{row}")

					this.webTiledLayer = new WebTiledLayer(tilesUrl, {
						"copyright": '',
						"id": "Alteia Orthomosaic"//description.name
					});
					this.map.addLayer(this.webTiledLayer);
					this.setLayersDefinitionExpression(description)

					/* 	var spatialRef = new SpatialReference({ wkid: 4326 });
						var extent = new Extent();
						extent.xmin = description.real_bbox.bbox[0];
						extent.ymin = description.real_bbox.bbox[1];
						extent.xmax = description.real_bbox.bbox[2];
						extent.ymax = description.real_bbox.bbox[3];
						extent.spatialReference = spatialRef;
		
						this.map.setExtent(extent); */
				}



			},

			setLayersDefinitionExpression: function (description) {

				var layersUrl = []
				var previousDefinitionExpression = this.temporaryDefinitionExpression

				this.config.layers.forEach(element => {
					layersUrl.push(element.url)
				});

				this.layers.forEach(layer => {

					console.log(layer)


					if (layersUrl.includes(layer.url)) {

						var definitionExpressionField = null

						if (layer.getDefinitionExpression() == undefined) {
							var definitionExpression = "1 = 1"
						}
						else {
							var definitionExpression = layer.getDefinitionExpression()
						}


						console.log("this.temporaryDefinitionExpression", this.temporaryDefinitionExpression)
						console.log("definitionExpression : ", definitionExpression)
						console.log("previousDefinitionExpression : ", previousDefinitionExpression)

						this.config.layers.forEach(element => {
							if (element.url == layer.url) {
								definitionExpressionField = element.surveyNameField
							}

						});

						var temporaryDefinitionExpression = definitionExpressionField + " = '" + description.name + "'"


						if (this.temporaryDefinitionExpression.length > 0) {

							definitionExpression = definitionExpression.replace(" AND " + previousDefinitionExpression, "")
							console.log("new base definitionExpression : ", definitionExpression)


						}
						console.log("new definitionExpression : ", definitionExpression + " AND " + temporaryDefinitionExpression)

						if (this.config.filterAction == true) {
							layer.setDefinitionExpression(definitionExpression + " AND " + temporaryDefinitionExpression)
						}

						this.temporaryDefinitionExpression = temporaryDefinitionExpression
					}

				});


				if (this.config.zoomAction == true) {
					this.setExtentOfDefinitionExpression(this.temporaryDefinitionExpression)
				}



			},

			setExtentOfDefinitionExpression: function (definitionExpression) {

				var self = this

				featureLayer = new FeatureLayer("https://gis-dv1.eramet.com/server/rest/services/00-POC/aa_gco_cc_DroneLandMarks/FeatureServer/0")

				query = new Query();


				query.outFields = ["*"];
				query.where = definitionExpression

				featureLayer.queryExtent(query, function (result) {
					console.log(result.extent)
					//var center = result.extent.getCenter()

					//self.map.centerAndZoom(center, self.map.getZoom())
					self.map.setExtent(result.extent, true).then(function (params) {
						self.map.setZoom(self.map.getZoom() - 1)
					})

				});
			},



			getJoinnedFeature: function (url, field, value) {

				var self = this
				return new Promise((resolve, reject) => {

				featureLayer = new FeatureLayer(url)

				query = new Query();


				query.outFields = ["*"];
				query.where = field + "=" + value

				featureLayer.queryExtent(query, function (result) {
					resolve(result)
					

				});
			})
			},

			clearTiledLayer: function () {

				try {
					this.map.removeLayer(this.webTiledLayer)

				}
				catch (e) { }
			},



			dateFilterIsValid: function (date) {

				function isDate(date) {
					return date > 0
				}


				if (isDate(this.startDate) == false && isDate(this.endDate) == false) {
					return true
				}
				if (isDate(this.startDate) == false && isDate(this.endDate) == true) {
					if (date < this.endDate) {
						return true
					}
				}
				if (isDate(this.startDate) == true && isDate(this.endDate) == false) {
					if (this.startDate < date) {
						return true
					}
				}
				if (isDate(this.startDate) == true && isDate(this.endDate) == true) {
					if (this.startDate < date && date < this.endDate) {
						return true
					}
				}

			},

			getMissionsDescription: function () {

				var self = this

				return new Promise((resolve, reject) => {

					var uniqueMissionListByBloc = {}
					var allFeaturesPromise = []



					for (const key in self.config.layers) {

						const layer = self.config.layers[key];

						allFeaturesPromise.push(self.getAllLayerFeatures(layer.url))

					}



					Promise.all(allFeaturesPromise).then(function (values) {

						values.forEach(value => {

							value.features.forEach(feature => {

								var blocCursor = feature.attributes[self.config.layers[value.index].blocField]


								if (!Object.hasOwnProperty.call(uniqueMissionListByBloc, blocCursor)) {
									uniqueMissionListByBloc[blocCursor] = []
								}


								var missionIsAlreadyAdded = uniqueMissionListByBloc[blocCursor].includes(feature.attributes[self.config.layers[value.index].surveyNameField])
								var missionLength = feature.attributes[self.config.layers[value.index].surveyNameField].length

								if (missionIsAlreadyAdded == false && missionLength > 1) {

									uniqueMissionListByBloc[blocCursor].push({
										url: feature.attributes[self.config.layers[value.index].surveyTileField],
										date: feature.attributes[self.config.layers[value.index].surveyDateField],
										name: feature.attributes[self.config.layers[value.index].surveyNameField]
									})
								}
							});


						});

						resolve(uniqueMissionListByBloc)

					})



				})

			},



			getAllLayerFeatures: function (url) {

				var self = this

				return new Promise((resolve, reject) => {


					function onResults(results) {

						resolve({
							index: index,
							features: results.features
						})

					}


					for (var index = 0; index < self.config.layers.length; index++) {
						const element = self.config.layers[index];
						if (url == element.url) {
							break
						}
					}

					queryTask = new QueryTask(url);


					query = new Query();
					//query.returnGeometry = false;
					query.outFields = ["*"];
					query.where = "1=1";


					queryTask.execute(query, onResults);


				})

			},

			executeIfLayersLoaded: function (callback) {

				var toCheckLayers = []
				var checkedLayers = 0

				this.config.layers.forEach(element => {
					layersUrl.push(element.url)
				});


				this.layers.forEach(layer => {

					if (layersUrl.includes(layer.url)) {
						checkedLayers++
						if (toCheckLayers.length == checkedLayers) {
							callback()
						}
					}

				});

			},

			getLayers: function name(params) {

				var layers = []

				this.map.graphicsLayerIds.forEach(element => {

					layers.push(this.map.getLayer(element))

				});

				return layers
			}


		});

	});

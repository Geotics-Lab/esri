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
	"esri/tasks/GeometryService",
	"esri/tasks/BufferParameters",
	"jimu/BaseWidget",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/_base/array"
],
	function (declare, lang, on, WebTiledLayer, FeatureLayer, Extent, SpatialReference, QueryTask, Query, GeometryService,

		BufferParameters, BaseWidget, _WidgetsInTemplateMixin, array) {
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

				this['block-tab'].onclick = function name(params) {

					self["get-by-click-join"].checked = false
					for (let index = 0; index < document.getElementsByClassName("wmts-adaptor-tab").length; index++) {
						const element = document.getElementsByClassName("wmts-adaptor-tab")[index];
						element.classList.remove('active')
					}
					for (let index = 0; index < document.getElementsByClassName("wmts-adaptor-tab-content").length; index++) {
						const element = document.getElementsByClassName("wmts-adaptor-tab-content")[index];
						element.classList.remove('active')
					}
					this.classList.add('active')
					self['block-tab-content'].classList.add('active')
				}
				this['click-tab'].onclick = function name(params) {
					self["get-by-click-join"].checked = true
					for (let index = 0; index < document.getElementsByClassName("wmts-adaptor-tab").length; index++) {
						const element = document.getElementsByClassName("wmts-adaptor-tab")[index];
						console.log(element)
						element.classList.remove('active')
					}
					for (let index = 0; index < document.getElementsByClassName("wmts-adaptor-tab-content").length; index++) {
						const element = document.getElementsByClassName("wmts-adaptor-tab-content")[index];
						console.log(element)
						element.classList.remove('active')
					}
					this.classList.add('active')
					self['click-tab-content'].classList.add('active')
				}


			},


			tryToEnableClickLayer: function () {

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

			tryToEnableClickJoinLayer: function () {

				var self = this


				if (this.config.clickJoinLayer.length > 0) {

					this.map.on("click", function (e) {

						console.log(e)

						self.config.clickJoinLayer.forEach(layerInfo => {

							if (layerInfo.layerId.includes('MapServer')) {
								console.log("endsWith mapserver")

								if (self["get-by-click-join"].checked == true) {

									gs = new GeometryService(self.config.geometryService);

									var params = new BufferParameters();

									params.distances = [20];
									params.bufferSpatialReference = self.map.spatialReference;
									params.outSpatialReference = self.map.spatialReference;
									params.unit = GeometryService.UNIT_METER
									params.geometries = [e.mapPoint];

									console.log(params);

									gs.buffer(params, function (result) {
										console.log(result)
										query = new Query();
										queryTask = new QueryTask(layerInfo.layerId);

										query.returnGeometry = false;
										query.outFields = ["*"];
										query.geometry = result[0];
										query.where = "1=1";

										queryTask.execute(query, function (featureSet) {
											console.log(featureSet)

											var joinValue = featureSet.features[0].attributes[layerInfo.joinField]

											self.getJoinnedFeature(layerInfo.joinLayerUrl, layerInfo.joinField, joinValue).then(function (result) {
												console.log(result)
												var features = result.features
												var uniqueMission = self.getUniqueMissions(features, layerInfo)
												self.buildMissionList(uniqueMission)

												console.log(uniqueMission)
											})
										});
									});


								}
							}

						})

					})


					this.config.clickJoinLayer.forEach(layerInfo => {
						if (layerInfo.layerId.includes('MapServer') == false) {
							
							var layer = self.map.getLayer(layerInfo.layerId)

							layer.on("click", function (e) {
								if (self["get-by-click-join"].checked == true) {
									console.log(e)


									self.config.clickJoinLayer.forEach(element => {
										if (element.layerId == e.graphic._layer.id) {



											var joinValue = e.graphic.attributes[element.joinField]

											self.getJoinnedFeature(element.joinLayerUrl, element.joinField, joinValue).then(function (result) {
												console.log(result)
												var features = result.features
												var uniqueMission = self.getUniqueMissions(features, element)
												self.buildMissionList(uniqueMission)

												console.log(uniqueMission)
											})
										}
									});

								}

							})
						}
					});







				}
				else {
					this["mission-by-click-join"].style.display = "none"
				}
			},

			getUniqueMissions: function (features, settings) {

				var missionList = []
				var uniqueMissions = []

				features.forEach(element => {
					missionUrl = element.attributes[settings.missionUrl]
					missionName = element.attributes[settings.missionName]
					missionDate = element.attributes[settings.missionDate]

					if (missionList.includes(missionName) == false) {
						missionList.push(missionName)
						uniqueMissions.push({
							url: missionUrl,
							name: missionName,
							date: missionDate
						})
					}
				});

				return uniqueMissions
			},

			buildMissionList: function (list) {

				this['related-missions'].innerHTML = ""

				var self = this

				list.forEach(element => {

					var uiRow = document.createElement('div')
					uiRow.innerHTML = element.name
					uiRow.setAttribute('url', element.url)
					uiRow.classList.add('related-row')

					uiRow.onclick = function name(params) {
						var url = this.getAttribute('url')
						self.clearTiledLayer()
						var tilesUrl = url.replace("{z}", "{level}").replace("{x}", "{col}").replace("{y}", "{row}")

						self.webTiledLayer = new WebTiledLayer(tilesUrl, {
							"copyright": '',
							"id": "Alteia Orthomosaic"
						});
						self.map.addLayer(self.webTiledLayer);



						for (let index = 0; index < document.getElementsByClassName('related-row').length; index++) {
							const element = document.getElementsByClassName('related-row')[index];
							element.classList.remove("active")
						}

						this.classList.add('active')
					}

					this['related-missions'].appendChild(uiRow)
				});

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
					query.where = field + "='" + value + "'"

					console.log(query.where)

					featureLayer.queryFeatures(query, function (result) {
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

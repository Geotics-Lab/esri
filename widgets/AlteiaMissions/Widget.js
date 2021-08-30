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

				this.map.on('load', function (e) {
					console.warn("mapload")
				})

				console.log("missions")
				console.log(this)
				var self = this
				this.webTiledLayer = null
				this.missionsDescription = null
				this.surveyDescription = null
				this.startDate = null
				this.endDate = null

				this.host = this.config.host



				self.getMissionsDescription().then(function (description) {
					self.missionsDescription = description
					self.addMissions(self.missionsDescription)
				})

				this["mission-selector"].onchange = function (e) {
					console.log(this)
					self.surveyDescription = self.missionsDescription[this.value]
					self.clearTiledLayer()
					console.info(self.surveyDescription)
					self.addTiledLayer(self.surveyDescription)

				}

				this["start-date"].onchange = function (e) {

					self.startDate = new Date(this.value)
					self.clearMissions()
					self.clearTiledLayer()
					self.addMissions(self.missionsDescription)

				}

				this["end-date"].onchange = function (e) {

					self.endDate = new Date(this.value)
					self.clearMissions()
					self.clearTiledLayer()
					self.addMissions(self.missionsDescription)

				}


			},



			addMissions: function (description) {

				var self = this

				var i = 0

				description.forEach(element => {

					if (this.dateFilterIsValid(new Date(element.date))) {
						var option = document.createElement('option')

						option.innerHTML = element.name
						option.value = i
						option.setAttribute("survey-description", JSON.stringify(element))

						self["mission-selector"].appendChild(option)
						i++
					}



				})

			},

			clearMissions: function () {
				this["mission-selector"].innerHTML = "<option>Mission</option>"
			},

			addTiledLayer: function (description) {

				var tilesUrl = description.url.replace("{z}", "{level}").replace("{x}", "{col}").replace("{y}", "{row}")

				console.log("add ", tilesUrl)
				this.webTiledLayer = new WebTiledLayer(tilesUrl, {
					"copyright": '',
					"id": description.name
				});
				this.map.addLayer(this.webTiledLayer);
				this.setLayersDefinitionExpression(description)
				console.log(description)

				/* 	var spatialRef = new SpatialReference({ wkid: 4326 });
					var extent = new Extent();
					extent.xmin = description.real_bbox.bbox[0];
					extent.ymin = description.real_bbox.bbox[1];
					extent.xmax = description.real_bbox.bbox[2];
					extent.ymax = description.real_bbox.bbox[3];
					extent.spatialReference = spatialRef;
	
					this.map.setExtent(extent); */

			},

			setLayersDefinitionExpression: function (description) {

				var layersUrl = []

				this.config.layers.forEach(element => {
					layersUrl.push(element.url)
				});


				this.map._layers.forEach(layer => {

					if (layersUrl.includes(layer.url)) {
						console.log("layer = ", layer)
						console.log(this.config.surveyNameField + " = '" + description.name + "'")
						layer.setDefinitionExpression(this.config.surveyNameField + " = '" + description.name + "'")
					}

				});

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

					var uniqueMissionList = []
					var description = []
					var allFeaturesPromise = []

					var template = {
						url: "",
						date: "",
						name: ""
					}



					for (const key in self.config.layers) {

						const layer = self.config.layers[key];

						console.log(layer)

						allFeaturesPromise.push(self.getAllLayerFeatures(layer.url))

					}



					Promise.all(allFeaturesPromise).then(function (values) {

						values.forEach(value => {
							console.log(value)

							value.features.forEach(feature => {
								template.name = feature.attributes[self.config.layers[value.index].surveyNameField]
								template.date = feature.attributes[self.config.layers[value.index].surveyDateField]
								template.url = feature.attributes[self.config.layers[value.index].surveyTileField]

								if (uniqueMissionList.includes(template.name) == false) {
									uniqueMissionList.push(template.name)
									description.push(template)
								}
							});


						});

						console.warn(description)
						resolve(description)

					})



				})

			},



			getAllLayerFeatures: function (url) {

				var self = this

				return new Promise((resolve, reject) => {


					function onResults(results) {
						console.log("result", results)

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

					console.info(query, queryTask)

					queryTask.execute(query, onResults);


				})

			},

			executeIfLayersLoaded : function (callback) {

				var toCheckLayers = []
				var checkedLayers = 0

				this.config.layers.forEach(element => {
					layersUrl.push(element.url)
				});


				this.map._layers.forEach(layer => {

					if (layersUrl.includes(layer.url)) {
						checkedLayers ++
						if (toCheckLayers.length == checkedLayers) {
							callback()
							break
						}
					}

				});
				
			}


		});

	});

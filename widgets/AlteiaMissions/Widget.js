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

					self.surveyDescription  = JSON.parse(this.getAttribute("survey-description"))
					self.clearTiledLayer()
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

				description.forEach(element => {

					if (this.dateFilterIsValid(new Date(element.date))) {
						var option = document.createElement('option')

						option.innerHTML = element.name
						option.setAttribute("survey-description", JSON.stringify(element))

						self["mission-selector"].appendChild(option)
					}



				})

			},

			clearMissions: function () {
				this["mission-selector"].innerHTML = "<option>Mission</option>"
			},

			addTiledLayer: function (description) {

				this.webTiledLayer = new WebTiledLayer(description.url, {
					"copyright": '',
					"id": description.name
				});
				this.map.addLayer(this.webTiledLayer);
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

						var description = []

						var template = {
							url : "test",
							date : "test",
							name : "test"
						}

						var mapLayers = this.map._layers


						for (const key in mapLayers) {

								const layer = mapLayers[key];

								if (layer.url.startsWith("https://gis-dv1.eramet.com/server/rest/services/00-POC/")) {
									console.info(layer)
								}
								
							
						}
						console.warn(this.map)

						description.push(template)

						resolve(description)

					

				})

			}


		});

	});

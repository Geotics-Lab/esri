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
  function(declare, lang, on, WebTiledLayer,Extent,SpatialReference, BaseWidget, _WidgetsInTemplateMixin,  array) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: "AddData",
      baseClass: "jimu-widget-add-data",

      postCreate: function() {
        this.inherited(arguments);
      },

      startup: function() {
		
		 console.log("missions")
		 console.log(this)
		 var self = this
		 this.selectedProject = null
		 this.selectedMission = null
		 this.webTiledLayer = null
		 this.projectsDescripyion = null
		 this.missionsDescription = null
		 this.surveyDescription = null
		 this.startDate = null
		 this.endDate = null
		  
       this.host = this.config.host
	   
	   this.getProjectsDescription().then(function(description){
					self.projectsDescription = description
					self.addProjects(self.projectsDescription)
		})
		
		
		this["project-selector"].onchange = function(e){
			
			self.selectedProject = this.value
			self.selectedMission = null
			self.missionsDescription = null
			self.surveyDescription = null
			self.clearMissions()
			self.clearTiledLayer()
			
			self.getMissionsDescription(self.selectedProject).then(function(description){
				self.missionsDescription = description
				self.addMissions(self.missionsDescription)
			})
			
		}
		
		this["mission-selector"].onchange = function(e){
			
			self.selectedMission = this.value
			
			self.getSurveyDescription(self.selectedProject, self.selectedMission).then(function(description){
					console.info(description)
					self.surveyDescription = description
					
					self.clearTiledLayer()
					self.addTiledLayer(description)


			})
			
		}
		
		this["start-date"].onchange = function(e){
			
			self.startDate = new Date(this.value)
			self.clearMissions()
			self.clearTiledLayer()
			self.addMissions(self.missionsDescription)
			
		}
		
		this["end-date"].onchange = function(e){
			
			self.endDate = new Date(this.value)
			self.clearMissions()
			self.clearTiledLayer()
			self.addMissions(self.missionsDescription)
			
		}
		
		
      },
	  
	  addProjects: function(description){
		  
		  var self = this
		  
		  description.forEach(element =>{
				
					var option = document.createElement('option')
			
					option.innerHTML = element.name
					option.setAttribute("value", element.id)
				
					self["project-selector"].appendChild(option)
	
			})		
				
				
		  
	  },
	  
	  addMissions: function(description){
		  
		   var self = this
		  
		  description.forEach(element =>{
				
					if(this.dateFilterIsValid(new Date(element.survey_date))){
						var option = document.createElement('option')
			
						option.innerHTML = element.name
						option.setAttribute("value", element.id)
						
						self["mission-selector"].appendChild(option)
					}
				
					
	
			})		
		  
	  },
	  
	  clearMissions: function(){
		  this["mission-selector"].innerHTML = "<option>Mission</option>"
	  },
	  addTiledLayer : function(description){
		  
		  this.webTiledLayer = new WebTiledLayer(description.url, {
					  "copyright": '',
					  "id": description.id
					});
			this.map.addLayer(this.webTiledLayer);
			console.log(description)
			
			var spatialRef = new SpatialReference({ wkid:4326 });
		  var extent = new Extent();
		  extent.xmin = description.real_bbox.bbox[0];
		  extent.ymin = description.real_bbox.bbox[1];
		 extent.xmax = description.real_bbox.bbox[2];
		  extent.ymax = description.real_bbox.bbox[3];
		  extent.spatialReference = spatialRef;

  this.map.setExtent(extent);

	  },
	  
	  clearTiledLayer : function(){
		  
		  try{
			this.map.removeLayer(this.webTiledLayer)
  
		  }
		  catch(e){}
	  },
	
			
		
			getProjectsDescription: function() {
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/getProjectsDescription").then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
			
			},
			dateFilterIsValid: function(survey_date){
				
				function isDate(date){
					return date>0
				}
				
				
				if(isDate(this.startDate) == false && isDate(this.endDate) == false){
					return true
				}
				if(isDate(this.startDate) == false && isDate(this.endDate) == true){
					if(survey_date < this.endDate){
						return true
					}
				}
				if(isDate(this.startDate) == true && isDate(this.endDate) == false){
					if(this.startDate < survey_date){
						return true
					}
				}
				if(isDate(this.startDate) == true && isDate(this.endDate) == true){
					if(this.startDate < survey_date && survey_date < this.endDate){
						return true
					}
				}
				
			},
			updateProjectsCache: function(){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/updateProjectsCache").then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
			
			},
			
			recursiveUpdateProjectsCache: function(){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/recursiveUpdateProjectsCache").then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
			
			},
			
			getMissionsDescription: function(projectName){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/getMissionsDescription/" + projectName).then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
				
			},
			updateMissionsCache: function(projectName){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/updateMissionsCache/" + projectName).then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
				
			},
			
			recursiveUpdateMissionsCache: function(projectName){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/recursiveUpdateMissionsCache/" + projectName).then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
				
			},
			
			getSurveyDescription: function(projectName, missionName){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/getSurveyDescription/" + projectName +"/" + missionName).then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
			
			},
			updateSurveyCache: function(projectName, missionName){
			
				var self = this
			
				return new Promise((resolve, reject) => {
				
					self._GET(self.host + "/updateSurveyCache/" + projectName +"/" + missionName).then(function(response){
					
						resolve(JSON.parse(response))
					
					})
				
				})
			
			},
			_GET: function(path){
			
				return new Promise((resolve, reject) => {
				
					var xmlHttp = new XMLHttpRequest();
					xmlHttp.onreadystatechange = function() { 
						if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
							resolve(xmlHttp.responseText);
					}
					xmlHttp.open("GET", path, true); // true for asynchronous 
					xmlHttp.send(null);
							
				})
			}	
		

    });

  });

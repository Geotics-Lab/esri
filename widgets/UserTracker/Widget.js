
define(["dojo/_base/declare",
  'jimu/portalUtils',
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  'dojo/on'
],
  function (declare, portalUtils, BaseWidget, _WidgetsInTemplateMixin, on) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

      name: "UserTracker",
      baseClass: "jimu-widget-user-tracker",

      postCreate: function () {
        this.inherited(arguments);
      },

      startup: function () {

        var self = this

        this.jobUrl = this.config.jobUrl
        this.jobSuffix = "/submitJob?f=json&env%3AoutSR=102100&JSON_input="
        this.portal = portalUtils.getPortal(this.appConfig.portalUrl);
        this.user = this.portal.getUser()
       
        this.user.then(function (user) {
     
          self.userInfo = {
            item : self.appConfig.title,
            fistname: user.firstName,
            lastname: user.lastName,
            fullname: user.fullName,
            email: user.email,
            region: user.region,
            groups: self.getGroupList(user.groups),
            role: user.role,
            datetime : Date.now()


          }
         
          console.log(self.userInfo)

          self._GET(self.jobUrl + self.jobSuffix + encodeURI(JSON.stringify(self.userInfo)))

        })


      },

      getGroupList(groups){
        output = []

        groups.forEach(group => {
          output.push(group.title)
        });

        return output
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


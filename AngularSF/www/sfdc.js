angular.module('Opportunity', []).factory('Opportunity', function (SFObject) {
    return SFObject({type: 'Opportunity', fields: ['Name', 'ExpectedRevenue', 'StageName', 'CloseDate', 'Id'], where: 'WHERE IsWon = TRUE'});
});

angular.module('SFObject', []).factory('SFObject', function ( $http, $rootScope, SFConfig) {
    function SFObjectFactory(params) {
        params = params || {};
        var type = params.type;
        var fields = params.fields;
        var where = params.where;


        function SFObject(value) {
            angular.copy(value || {}, this);
            this._orig = value || {};
        }

        SFObject.prototype.update = function (cb) {
            return SFObject.update(this, cb);
        };

        SFObject.prototype.destroy = function (cb) {
            return SFObject.remove(this, cb);
        };

        SFObject.getChangedData = function (obj) {
            var diff = {};
            var orig = obj._orig;
            if (!orig)  return {};
            angular.forEach(fields, function (field) {
                if (field != 'Id' && obj[field] !== orig[field]) diff[field] = obj[field];
            });
            return diff;
        };

        SFObject.getNewObjectData = function (obj) {
            var newObj = {};
            angular.forEach(fields, function (field) {
                if (field != 'Id') {
                    newObj[field] = obj[field];
                }
            });
            return newObj;
        };

        SFObject.query = function (successCB, failureCB) {
            var soql = 'SELECT ' + fields.join(',') + ' FROM ' + type + ' ' + where;
                                   
            return SFConfig.client.query(soql, successCB, failureCB);
        };

        SFObject.get = function (params, successCB, failureCB) {
            return SFConfig.client.retrieve(type, params.id, fields.join(), function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new SFObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        SFObject.save = function (obj, successCB, failureCB) {
            var data = SFObject.getNewObjectData(obj);
            return SFConfig.client.create(type, data, function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new SFObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        SFObject.update = function (obj, successCB, failureCB) {
            var data = SFObject.getChangedData(obj);
            debugger;
            return SFConfig.client.update(type, obj.Id, data, function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new SFObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        SFObject.remove = function (obj, successCB, failureCB) {
            return SFConfig.client.del(type, obj.Id, successCB, failureCB);
        };

        return SFObject;
    }

    return SFObjectFactory;
});

angular.module('SFDC', []).
    service('SFDC', function ($http, $rootScope, SFConfig) {
 
         //TODO - commented code is for Bootstrap/ web login
//        this.login = function (callback) {
//            if (SFConfig.client) { //already loggedin
//                return callback();
//            }
//            var ftkClientUI = new forcetk.ClientUI(SFConfig.sfLoginURL, SFConfig.consumerKey, SFConfig.oAuthCallbackURL,
//                function forceOAuthUI_successHandler(forcetkClient) { // successCallback
//                    console.log('OAuth success!');
//                    SFConfig.client = forcetkClient;
//                    SFConfig.client.serviceURL = forcetkClient.instanceUrl
//                        + '/services/data/'
//                        + forcetkClient.apiVersion;
//
//                    callback();
//                });
//            ftkClientUI.login();
//        };

            //Call getAuthCredentials to get the initial session credentials
            cordova.require("salesforce/plugin/oauth").getAuthCredentials(salesforceSessionRefreshed, getAuthCredentialsError);
            
            //register to receive notifications when autoRefreshOnForeground refreshes the sfdc session
            document.addEventListener("salesforceSessionRefresh",salesforceSessionRefreshed,false);
        function salesforceSessionRefreshed(creds) {            
            // Depending on how we come into this method, `creds` may be callback data from the auth
            // plugin, or an event fired from the plugin.  The data is different between the two.
            var credsData = creds;
            if (creds.data)  // Event sets the `data` object with the auth data.
                credsData = creds.data;
            
            SFConfig.client = new forcetk.Client(credsData.clientId, credsData.loginUrl);
            SFConfig.client.setSessionToken(credsData.accessToken, apiVersion, credsData.instanceUrl);
            SFConfig.client.setRefreshToken(credsData.refreshToken);

        }
            
        function getAuthCredentialsError(error) {
            logToConsole("getAuthCredentialsError: " + error);
        }
    });
angular.module('AngularForce', []).
service('AngularForce', function ($http, $rootScope, SFConfig) {
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


angular.module('AngularForceObject', []).factory('AngularForceObject', function ( $http, $rootScope, SFConfig) {
    function AngularForceObjectFactory(params) {
        params = params || {};
        var type = params.type;
        var fields = params.fields;
        var where = params.where;


        function AngularForceObject(value) {
            angular.copy(value || {}, this);
            this._orig = value || {};
        }

        AngularForceObject.prototype.update = function (cb) {
            return AngularForceObject.update(this, cb);
        };

        AngularForceObject.prototype.destroy = function (cb) {
            return AngularForceObject.remove(this, cb);
        };

        AngularForceObject.getChangedData = function (obj) {
            var diff = {};
            var orig = obj._orig;
            if (!orig)  return {};
            angular.forEach(fields, function (field) {
                if (field != 'Id' && obj[field] !== orig[field]) diff[field] = obj[field];
            });
            return diff;
        };

        AngularForceObject.getNewObjectData = function (obj) {
            var newObj = {};
            angular.forEach(fields, function (field) {
                if (field != 'Id') {
                    newObj[field] = obj[field];
                }
            });
            return newObj;
        };

        AngularForceObject.query = function (successCB, failureCB) {
            var soql = 'SELECT ' + fields.join(',') + ' FROM ' + type + ' ' + where;
                                   
            return SFConfig.client.query(soql, successCB, failureCB);
        };

        AngularForceObject.get = function (params, successCB, failureCB) {
            return SFConfig.client.retrieve(type, params.id, fields.join(), function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new AngularForceObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        AngularForceObject.save = function (obj, successCB, failureCB) {
            var data = AngularForceObject.getNewObjectData(obj);
            return SFConfig.client.create(type, data, function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new AngularForceObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        AngularForceObject.update = function (obj, successCB, failureCB) {
            var data = AngularForceObject.getChangedData(obj);
            debugger;
            return SFConfig.client.update(type, obj.Id, data, function (data) {
                if (data && !angular.isArray(data)) {
                    return successCB(new AngularForceObject(data))
                }
                return successCB(data);
            }, failureCB);
        };

        AngularForceObject.remove = function (obj, successCB, failureCB) {
            return SFConfig.client.del(type, obj.Id, successCB, failureCB);
        };

        return AngularForceObject;
    }

    return AngularForceObjectFactory;
});


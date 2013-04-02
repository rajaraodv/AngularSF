/**
 * bootStrapAngular is where you setup your angular app. For example,
 * the below create 'MyOppApp' app (module) and adds 'AngularForce', 'AngularForceObjectFactory' and
 * 'Opportunity' modules as its dependencies
 *
 * PS: This function is called when jquery.ready is triggered in index.html
 */
function bootStrapAngular() {
    var angularApp = angular.module('MyOppApp', ['AngularForce', 'AngularForceObjectFactory', 'Opportunity']);
    angularApp.constant('SFConfig', {});
    angularApp.config(function ($routeProvider) {
        $routeProvider.when('/edit/:oppId', { templateUrl: '#edit', onActivate: 'getOpportunity(oppId)'});
    });
    //load 'opportunity' module
    angular.bootstrap(document, ['MyOppApp']);

}

/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Opportunity' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
angular.module('Opportunity', []).factory('Opportunity', function (AngularForceObjectFactory) {
    var Opportunity = AngularForceObjectFactory({type: 'Opportunity', fields: ['Name', 'ExpectedRevenue', 'StageName', 'CloseDate', 'Id'], where: 'WHERE IsWon = TRUE'});
    return Opportunity;
});

/**
 * List Controller function controls JQM list view. It handles actions like object 'query', 'edit' & 'logout' etc
 *
 * @param $scope  AngularJS Scope Object
 * @param Opportunity AngularJS module that represents an actual Salesforce Object Class
 * @param $location  AngularJS Location service - Used to change JQM page
 * @param AngularForce AngularJS + forcetk glue - Used for AJAX calls
 * @constructor
 */
function ListCtrl($scope, Opportunity, $location, AngularForce) {

    //Set login details
    AngularForce.setCordovaLoginCred();

    //Query list of Opportunities
    $scope.query = function () {
        Opportunity.query(function (data) {
            $scope.opportunities = data.records;
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });
    };

    //Edit
    $scope.edit = function (id) {
        $location.path('/edit/' + id);
    };

    // Logout
    $scope.logout = function () {
        if (cordova) {
            var sfOAuthPlugin = cordova.require("salesforce/plugin/oauth");
            sfOAuthPlugin.logout();
        }
    };

    //Query immediately AFTER ListCtrl is loaded (i.e. wrap inside setTimeout)
    setTimeout(function () {
        $scope.query();
    }, 0);
}

/**
 *
 * @param $scope  AngularJS Scope Object
 * @param $location  AngularJS Location service - Used to change JQM page
 * @param $routeParams AngularJS Route obj - Contains route url's parameters
 * @param AngularForce AngularJS + forcetk glue - Used for AJAX calls
 * @param Opportunity Salesforce Object described as AngularJS Module that returns AngularForceObjectFactory
 * @constructor
 */
function EditCtrl($scope, $location, $routeParams, AngularForce, Opportunity) {
    var self = this;

    $scope.getOpportunity = function () {
        Opportunity.get({id: $routeParams.oppId}, function (opp) {
            self.original = opp;
            $scope.opportunity = new Opportunity(self.original);
            $scope.$apply();//Required coz sfdc/forcetk uses jquery.ajax
        });

        //switch 'save' function to saveNew or Update depending on existence of 'oppId'
        $scope.save = $routeParams.oppId && $routeParams.oppId != "" ? $scope.update : $scope.saveNew;
    };

    //Save's a new Opportunity object
    $scope.saveNew = function () {
        Opportunity.save($scope.opportunity, function (opportunity) {
            var o = opportunity;
            $scope.$apply(function () {
                $location.path('/edit/' + o.id);
            });
        });
    };

    // Update an existing opportunity
    $scope.update = function () {
        $scope.opportunity.update(function () {
            $scope.$apply(function () {
                $location.path('/');
            });
        });
    };

    //check if opportunity is not edited
    $scope.isClean = function () {
        return angular.equals(self.original, $scope.opportunity);
    };

    //delete opportunity
    $scope.destroy = function () {
        self.original.destroy(function () {
            $scope.$apply(function () {
                $location.path('/');
            });
        });
    };
}




function ListCtrl($scope, SFDC, Opportunity, $location) {
    $scope.login = function () {
        SFDC.login(function () {
            Opportunity.query(function (data) {
                $scope.projects = data.records;
                            
                $scope.$apply();//Required coz sfdc uses jquery.ajax
            });
        });
    };
    
    $scope.logout = function () {
        var sfOAuthPlugin = cordova.require("salesforce/plugin/oauth");
        sfOAuthPlugin.logout();
    }
    setTimeout(function(){
         Opportunity.query(function (data) {
              $scope.projects = data.records;
              $scope.$apply();//Required coz sfdc uses jquery.ajax
                           });}, 200);
    

    $scope.refreshTodos = function () {
        todoStore.read($scope.storageKey).then(function (data) {
            if (!data) {
                data = [];
            }
            $scope.todos = data;
        });
    };
    
    $scope.edit = function(id) {
         $location.path('/edit/'+ id);
    }
}


function CreateCtrl($scope, $location, Opportunity) {
    $scope.save = function () {
        Opportunity.save($scope.project, function (project) {
            var p = project;
            $scope.$apply(function () {
                $location.path('/edit/' + p.id);
            });
        });
    }
}

function res(data, cb) {
    var d = data;

}


function EditCtrl($scope, $location, $routeParams, SFDC, Opportunity) {
    var self = this;

    $scope.loadProject = function () {
        Opportunity.get({id: $routeParams.projectId}, function (opp) {
            self.original = opp;
            $scope.project = new Opportunity(self.original);
            $scope.$apply();//Required coz sfdc uses jquery.ajax
        });

        //switch 'save' function to saveNew or Update depending on existence of 'projectId'
        $scope.save =  $routeParams.projectId && $routeParams.projectId != "" ? $scope.update : $scope.saveNew;
    };
    $scope.saveNew = function () {
        Opportunity.save($scope.project, function (project) {
            var p = project;
            $scope.$apply(function () {
                $location.path('/edit/' + p.id);
            });
        });
    };

    $scope.update = function () {
        $scope.project.update(function () {
            $scope.$apply(function () {
                $location.path('/');
            });

        });
    };

//    SFDC.login(function () {
//        debugger;
//        Opportunity.get({id: $routeParams.projectId}, function (opp) {
//            self.original = opp;
//            $scope.project = new Opportunity(self.original);
//            $scope.$apply();//Required coz sfdc uses jquery.ajax
//        });
//    });

    $scope.isClean = function () {
        return angular.equals(self.original, $scope.project);
    };

    $scope.destroy = function () {
        self.original.destroy(function () {
            $scope.$apply(function () {
                $location.path('/');
            });
        });
    };


}

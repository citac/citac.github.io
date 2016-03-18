/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
var ConfigurationSpecificationService = (function () {
    function ConfigurationSpecificationService(http) {
        this.http = http;
    }
    ConfigurationSpecificationService.prototype.getAll = function () {
        return this.get("specs.json");
    };
    ConfigurationSpecificationService.prototype.getDetails = function (id) {
        return this.get(id + "/spec.json");
    };
    ConfigurationSpecificationService.prototype.getScript = function (id, operatingSystem) {
        return this.get(id + "/scripts/" + operatingSystem + ".txt");
    };
    ConfigurationSpecificationService.prototype.getTestSuite = function (specId, operatingSystem, suiteId) {
        return this.get(specId + "/testsuites/" + operatingSystem + "/" + suiteId + "/testsuite.json");
    };
    ConfigurationSpecificationService.prototype.getTestCase = function (specId, operatingSystem, suiteId, caseId) {
        return this.get(specId + "/testsuites/" + operatingSystem + "/" + suiteId + "/testcases/" + caseId + "/testcase.json");
    };
    ConfigurationSpecificationService.prototype.getTestCaseRunOutput = function (specId, operatingSystem, suiteId, caseId, runId) {
        return this.get(specId + "/testsuites/" + operatingSystem + "/" + suiteId + "/testcases/" + caseId + "/run" + runId + ".txt");
    };
    ConfigurationSpecificationService.prototype.getTestStepLastOutput = function (specId, operatingSystem, suiteId, caseId, stepIndex) {
        return this.get(specId + "/testsuites/" + operatingSystem + "/" + suiteId + "/testcases/" + caseId + "/steplastrun" + stepIndex + ".txt");
    };
    ConfigurationSpecificationService.prototype.get = function (resource) {
        return this.http.get("data/" + resource).then(function (r) { return r.data; });
    };
    ConfigurationSpecificationService.$inject = ["$http"];
    return ConfigurationSpecificationService;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
/// <reference path="../services/specs.service.ts"/>
var ConfigurationSpecificationListController = (function () {
    function ConfigurationSpecificationListController(specService) {
        var _this = this;
        this.specService = specService;
        specService.getAll().then(function (data) { return _this.specs = data; });
    }
    ConfigurationSpecificationListController.$inject = ["IConfigurationSpecificationService"];
    return ConfigurationSpecificationListController;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
/// <reference path="../services/specs.service.ts"/>
var ConfigurationSpecificationDetailController = (function () {
    function ConfigurationSpecificationDetailController(specService, stateService, scope, lightBoxService) {
        var _this = this;
        this.specService = specService;
        this.stateService = stateService;
        this.scope = scope;
        this.lightBoxService = lightBoxService;
        this.specService.getDetails(this.stateParams.specId).then(function (data) {
            _this.spec = data;
            _this.testSuites = _.filter(_this.spec.testSuites, function (s) { return s.operatingSystem === _this.operatingSystem; });
        });
        this.specService.getScript(this.stateParams.specId, this.stateParams.os).then(function (data) {
            _this.script = data;
        });
        this.scope.$watch("specDetailController.selectedIssue", function () {
            if (_this.selectedIssue) {
                var ref = _this.selectedIssue.detectedBy[0];
                _this.selectedIssueLastRunDetails = null;
                _this.specService.getTestStepLastOutput(_this.stateParams.specId, _this.stateParams.os, ref.testSuiteId, ref.testCaseId, ref.testStepIndex).then(function (data) {
                    _this.selectedIssueLastRunDetails = data;
                });
            }
        });
    }
    Object.defineProperty(ConfigurationSpecificationDetailController.prototype, "stateParams", {
        get: function () {
            return this.stateService.params;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationSpecificationDetailController.prototype, "dependencyGraphUrl", {
        get: function () {
            return "data/" + this.stateParams.specId + "/graphs/" + this.stateParams.os + ".png";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationSpecificationDetailController.prototype, "operatingSystem", {
        get: function () {
            return this.stateParams.os;
        },
        enumerable: true,
        configurable: true
    });
    ConfigurationSpecificationDetailController.prototype.openDependencyGraphModal = function (operatingSystem) {
        var images = [{ url: this.dependencyGraphUrl, thumbUrl: this.dependencyGraphUrl }];
        this.lightBoxService.openModal(images, 0);
    };
    ConfigurationSpecificationDetailController.$inject = ["IConfigurationSpecificationService", "$state", "$scope", "Lightbox"];
    return ConfigurationSpecificationDetailController;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
/// <reference path="../services/specs.service.ts"/>
/// <reference path="specDetail.controller.ts"/>
var TestSuiteDetailController = (function () {
    function TestSuiteDetailController(specService, stateService, scope) {
        var _this = this;
        this.specService = specService;
        this.stateService = stateService;
        this.scope = scope;
        this.specService.getTestSuite(this.stateParams.specId, this.stateParams.os, this.stateParams.suiteId).then(function (data) {
            _this.testSuite = data;
        });
    }
    Object.defineProperty(TestSuiteDetailController.prototype, "spec", {
        get: function () {
            return this.scope.specDetailController.spec;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestSuiteDetailController.prototype, "stateParams", {
        get: function () {
            return this.stateService.params;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestSuiteDetailController.prototype, "previousTestSuiteId", {
        get: function () {
            var _this = this;
            if (!this.spec)
                return undefined;
            var index = _.findIndex(this.spec.testSuites, function (s) { return s.id === _this.stateParams.suiteId; });
            return index > 0 ? this.spec.testSuites[index - 1].id : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestSuiteDetailController.prototype, "nextTestSuiteId", {
        get: function () {
            var _this = this;
            if (!this.spec)
                return undefined;
            var index = _.findIndex(this.spec.testSuites, function (s) { return s.id === _this.stateParams.suiteId; });
            return index < this.spec.testSuites.length - 1 ? this.spec.testSuites[index + 1].id : undefined;
        },
        enumerable: true,
        configurable: true
    });
    TestSuiteDetailController.$inject = ["IConfigurationSpecificationService", "$state", "$scope"];
    return TestSuiteDetailController;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
/// <reference path="../services/specs.service.ts"/>
/// <reference path="testSuiteDetail.controller.ts"/>
var TestCaseDetailController = (function () {
    function TestCaseDetailController(specService, stateService, scope, modalService) {
        var _this = this;
        this.specService = specService;
        this.stateService = stateService;
        this.scope = scope;
        this.modalService = modalService;
        this.specService.getTestCase(this.stateParams.specId, this.stateParams.os, this.stateParams.suiteId, this.stateParams.caseId).then(function (data) {
            _this.testCase = data;
            if (_this.stateParams.stepIndex) {
                var index = parseInt(_this.stateParams.stepIndex) - 1;
                _this.selectedStep = _this.testCase.testSteps[index];
            }
        });
        this.scope.$watch("testCaseDetailController.selectedStep", function () {
            _this.selectedStepLastRunOutput = null;
            _this.selectedStepAttestedProperty = null;
            if (_this.selectedStep) {
                var index = _this.testCase.testSteps.indexOf(_this.selectedStep);
                if (_this.selectedStep.type === "assert") {
                    var previousExecStep = _.findLast(_this.testCase.testSteps.slice(0, index), function (s) { return s.type === "exec"; });
                    if (previousExecStep.resource === _this.selectedStep.resource) {
                        _this.selectedStepAttestedProperty = {
                            type: "idempotence",
                            resources: [_this.selectedStep.resource]
                        };
                    }
                    else {
                        _this.selectedStepAttestedProperty = {
                            type: "preservation",
                            resources: [previousExecStep.resource, _this.selectedStep.resource]
                        };
                    }
                }
                _this.specService.getTestStepLastOutput(_this.stateParams.specId, _this.stateParams.os, _this.stateParams.suiteId, _this.stateParams.caseId, (index + 1).toString()).then(function (data) {
                    _this.selectedStepLastRunOutput = data;
                });
            }
        });
    }
    Object.defineProperty(TestCaseDetailController.prototype, "spec", {
        get: function () {
            return this.scope.specDetailController.spec;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestCaseDetailController.prototype, "testSuite", {
        get: function () {
            return this.scope.testSuiteDetailController.testSuite;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestCaseDetailController.prototype, "stateParams", {
        get: function () {
            return this.stateService.params;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestCaseDetailController.prototype, "previousTestCaseId", {
        get: function () {
            var _this = this;
            if (!this.testSuite)
                return undefined;
            var index = _.findIndex(this.testSuite.testCases, function (c) { return c.id === _this.stateParams.caseId; });
            return index > 0 ? this.testSuite.testCases[index - 1].id : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestCaseDetailController.prototype, "nextTestCaseId", {
        get: function () {
            var _this = this;
            if (!this.testSuite)
                return undefined;
            var index = _.findIndex(this.testSuite.testCases, function (c) { return c.id === _this.stateParams.caseId; });
            return index < this.testSuite.testCases.length - 1 ? this.testSuite.testCases[index + 1].id : undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestCaseDetailController.prototype, "selectedResourceIdempotenceIssue", {
        get: function () {
            var _this = this;
            if (!this.selectedStep)
                return undefined;
            return _.find(this.spec.detectedIssues[this.stateParams.os], function (i) { return i.type === "idempotence" && i.resources[0] === _this.selectedStep.resource; });
        },
        enumerable: true,
        configurable: true
    });
    TestCaseDetailController.$inject = ["IConfigurationSpecificationService", "$state", "$scope"];
    return TestCaseDetailController;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="../model.ts"/>
/// <reference path="../services/specs.service.ts"/>
/// <reference path="testCaseDetail.controller.ts"/>
var TestCaseRunOutputController = (function () {
    function TestCaseRunOutputController(specService, stateService, scope) {
        var _this = this;
        this.specService = specService;
        this.stateService = stateService;
        this.scope = scope;
        this.specService.getTestCaseRunOutput(this.stateParams.specId, this.stateParams.os, this.stateParams.suiteId, this.stateParams.caseId, this.stateParams.runId).then(function (data) {
            _this.output = data;
        });
    }
    Object.defineProperty(TestCaseRunOutputController.prototype, "stateParams", {
        get: function () {
            return this.stateService.params;
        },
        enumerable: true,
        configurable: true
    });
    TestCaseRunOutputController.$inject = ["IConfigurationSpecificationService", "$state", "$scope"];
    return TestCaseRunOutputController;
})();
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="specList.controller.ts"/>
/// <reference path="specDetail.controller.ts"/>
/// <reference path="testSuiteDetail.controller.ts"/>
/// <reference path="testCaseDetail.controller.ts"/>
/// <reference path="testCaseRunOutput.controller.ts"/>
angular.module("citac.eval.controllers", ["citac.eval.services", "ui.bootstrap", "bootstrapLightbox"])
    .controller("ConfigurationSpecificationListController", ConfigurationSpecificationListController)
    .controller("ConfigurationSpecificationDetailController", ConfigurationSpecificationDetailController)
    .controller("TestSuiteDetailController", TestSuiteDetailController)
    .controller("TestCaseDetailController", TestCaseDetailController)
    .controller("TestCaseRunOutputController", TestCaseRunOutputController);
/// <reference path="../typings/typings.d.ts"/>
function TrimFilter() {
    return function (input) {
        if (!input)
            return input;
        return input.trim();
    };
}
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="trim.filter.ts"/>
angular.module("citac.eval.filters", [])
    .filter("trim", TrimFilter);
/// <reference path="typings/typings.d.ts"/>
/// <reference path="controllers/controllers.module.ts"/>
/// <reference path="filters/filters.module.ts"/>
var app = angular.module("citac.eval", [
    "ui.router",
    "ncy-angular-breadcrumb",
    "angular-loading-bar",
    "citac.eval.controllers",
    "citac.eval.filters"
]);
app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 500;
    }]);
/// <reference path="typings/typings.d.ts"/>
/// <reference path="app.ts"/>
angular.module("citac.eval").config([
    "$stateProvider", "$urlRouterProvider", function (stateProvider, urlRouterProvider) {
        urlRouterProvider.otherwise("/home");
        stateProvider.state("home", {
            url: "/home",
            templateUrl: "templates/home.html",
            ncyBreadcrumb: {
                label: "Home"
            }
        });
        stateProvider.state("specs", {
            url: "/specs",
            templateUrl: "templates/specList.html",
            controller: "ConfigurationSpecificationListController",
            controllerAs: "specListController",
            ncyBreadcrumb: {
                label: "Specs"
            }
        });
        stateProvider.state("specs.detail", {
            url: "/:specId/:os",
            views: {
                "@": {
                    templateUrl: "templates/specDetail.html",
                    controller: "ConfigurationSpecificationDetailController",
                    controllerAs: "specDetailController"
                }
            },
            ncyBreadcrumb: {
                label: "{{specDetailController.spec.id}} ({{specDetailController.operatingSystem}})"
            }
        });
        stateProvider.state("specs.detail.testsuite", {
            url: "/testsuite/:suiteId",
            templateUrl: "templates/testSuiteDetail.html",
            controller: "TestSuiteDetailController",
            controllerAs: "testSuiteDetailController",
            ncyBreadcrumb: {
                label: "Test Suite #{{testSuiteDetailController.testSuite.id}}"
            }
        });
        stateProvider.state("specs.detail.testsuite.testcase", {
            url: "/testcase/:caseId?stepIndex",
            templateUrl: "templates/testCaseDetail.html",
            controller: "TestCaseDetailController",
            controllerAs: "testCaseDetailController",
            ncyBreadcrumb: {
                label: "Test Case #{{testCaseDetailController.testCase.id}}"
            }
        });
        stateProvider.state("specs.detail.testsuite.testcase.runoutput", {
            url: "/run/:runId/output",
            templateUrl: "templates/testCaseRunOutput.html",
            controller: "TestCaseRunOutputController",
            controllerAs: "testCaseRunOutputController",
            ncyBreadcrumb: {
                label: "Output of Run #{{testCaseRunOutputController.stateParams.runId}}"
            }
        });
    }
]);
angular.module("citac.eval").config([
    "$breadcrumbProvider", function (breadcrumbProvider) {
        breadcrumbProvider.setOptions({
            prefixStateName: "home"
        });
    }
]);
/// <reference path="../typings/typings.d.ts"/>
/// <reference path="specs.service.ts"/>
angular.module("citac.eval.services", [])
    .service("IConfigurationSpecificationService", ConfigurationSpecificationService);
//# sourceMappingURL=app.js.map
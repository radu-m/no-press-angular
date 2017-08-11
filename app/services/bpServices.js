var moduleName = 'noPress.services';
export class BpService {
    constructor($resource) {
        this.$resource = $resource;
        this.bpUrl = 'http://0.0.0.0:8080/api/';
    }

    getBpService() {
        return this.$resource(this.bpUrl + '/core/get_page/?slug=home');  // Note: Call local JSON files with GET
        //return this.$resource(this.bpUrl);
    }

    static bpFactory($resource) {
        return new BpService($resource);
    }
}

BpService.bpFactory.$inject = ['$resource'];
angular.module(moduleName, []).factory('bpService', BpService.bpFactory);
export default moduleName;
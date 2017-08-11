import apiService from './api.service';
import stashService from './stash.service';

let apiModule = angular.module('noPress.api', []);

apiModule.factory('apiService', apiService);
apiModule.factory('stashService', stashService);


export default apiModule = apiModule.name
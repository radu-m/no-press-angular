import apiModule from '../api/api.module';

import DialogComponent from './dialog/dialog.component';

import json2htmlService from './json2html/json-2-html.service';
import json2htmlDirective from './json2html/json-2-html.directive';

import localeService from './locale/locale.service';

let commonModule = angular.module('noPress.components', [apiModule]);

// Note: Register all common components here
commonModule.component('dialogComponent', DialogComponent);

commonModule.factory('localeService', localeService);

commonModule.factory('json2htmlService', json2htmlService);
commonModule.directive('json2html', json2htmlDirective);

export default commonModule = commonModule.name
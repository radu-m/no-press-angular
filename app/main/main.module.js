import MainConfig from './main.config';
import MainController from './main.controller';

let mainModule = angular.module('main', []);

mainModule.config(MainConfig);
mainModule.controller('MainController', MainController);

export default mainModule = mainModule.name
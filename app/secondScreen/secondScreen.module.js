import SecondScreenConfig from './secondScreen.config';
import SecondScreenController from './secondScreen.controller';

let secondScreenModule = angular.module('noPress.secondScreen', []);
secondScreenModule.config(SecondScreenConfig);
secondScreenModule.controller('SecondScreenController', SecondScreenController);

export default secondScreenModule = secondScreenModule.name;
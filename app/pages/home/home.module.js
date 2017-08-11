import HomeConfig from './home.config';
import HomeController from './home.controller';

let homeModule = angular.module('noPress.home', []);

homeModule.config(HomeConfig);
homeModule.controller('HomeController', HomeController);

export default homeModule = homeModule.name
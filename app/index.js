// External Libraries
import 'angular';
import 'lodash';
// import 'jquery';
// global.$ = window.jQuery = require('jquery');

import 'angular-material/angular-material.css';
import 'font-awesome/css/font-awesome.css';
import restangular from 'restangular';
import angularAnimate from 'angular-animate';
import angularMaterial from 'angular-material';
import angularUIRouter from '@uirouter/angularjs';
import angularMessages from 'angular-messages';
import angularResource from 'angular-resource';

import utils from './utils';
import noPressConfig from './on-config';

// BoilerPlate (aka BP) Libraries
import main from './main/main.module'
import pages from './pages/pages.module';
import menus from './menus/menu/menu.module';

import secondScreen from './secondScreen/secondScreen.module';
import BpService from './services/bpServices';
import CommonModule from './common/common.module';
import apiModule from './api/api.module';
import './assets/styles/bp.css';

export const noPressModule = angular.module('noPress', [
        angularMaterial, 
        angularAnimate, 
        angularUIRouter, 
        angularMessages, 
        angularResource,
        apiModule, 
        CommonModule,
        main,
        menus, 
        pages,
         
        secondScreen, 
        BpService
    ]);

noPressModule.config(noPressConfig);

noPressModule.controller('NoPressRootController', NoPressRootController);

NoPressRootController.$inject = ['$mdSidenav', '$state'];
function NoPressRootController($mdSidenav, $state) {
    let vm = this;
    vm.isAppRendered = true;

}

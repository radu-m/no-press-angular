class NpButtonController {
    constructor(...deps) {
        this.$scope = deps[0];
        this.$location = deps[1];
        this.followUrl = this.followUrl;
    }

    followUrl (){
        if (this.$scope.link && this.$scope.link.indexOf('http') === 0) {
            this.$location.absUrl(this.$scope.link);
        } else {
            this.$location.path(this.$scope.link);
        }
    };
}

NpButtonController.$inject = ['$scope', '$location'];

class npButtonDirective {
    constructor(...deps){
        this.restrict = 'A';
        this.replace = true;
        this.controllerAs = 'vm';
        this.controller = NpButtonController;
        this.templateUrl = require('./button.template.html');
        this.scope = {};
    }

    link(scope, element, attrs, ngModel) {
        scope.buttonLabel = attrs.npButton;
        scope.cssClass = attrs.class || '';
        scope.link = decodeURIComponent(attrs.buttonUrl) || '';

        if (attrs.class.indexOf('disabled') >= 0) {
            elem.attr('disabled', 'disabled');
        }

        if (attrs.buttonAction) {
            let parts = attrs.buttonAction.replace(')', '').split('(');
            scope.actionName = parts[0];
            scope.actionParams = parts[1]; // trim(parts[1]).explode(',')
        }
    }    

    static factory(...deps) {
        return new npButtonDirective(...deps);
    }
}

npButtonDirective.factory.$inject = [];

export default npButtonDirective.factory;
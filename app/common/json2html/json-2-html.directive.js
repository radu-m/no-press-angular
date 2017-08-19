class Json2htmlController {
    constructor() {
        var vm = this;
    }
}

Json2htmlController.$inject = [];

class json2htmlDirective {
    constructor(...deps){
        this.$compile = deps[0];
        this.json2htmlService = deps[1];

        this.controller = Json2htmlController;
        this.restrict = 'E';
        this.require = 'ngModel';
        this.replace = true;
    }

    link(scope, element, attrs, ngModel) {
        scope.$watch(()=> {
            return ngModel.$modelValue
        }, (newVal)=> {
            if (newVal && typeof newVal !== String) {
                //h = $(document.createElement('div'));
                element.html('');
                this.json2htmlService.parse(ngModel.$modelValue, element);
            } else {

            }
            this.$compile(element.contents())(scope);
        });
    }    

    static factory(...deps) {
        return new json2htmlDirective(...deps);
    }
}

json2htmlDirective.factory.$inject = [
    '$compile',
    'json2htmlService'
];

export default json2htmlDirective.factory;
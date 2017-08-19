class textBoxController {
    constructor(...deps) {
        console.log('....', deps[0])
        this.$attrs = deps[0];
        this.$state = deps[1];

        this.boxTitle = this.$attrs.boxTitle;
        this.boxSubtitle = this.$attrs.boxSubtitle;
        this.cssClass = this.$attrs.class;
        this.imgSrc = this.$attrs.imgSrc != '' ? this.$attrs.imgSrc : null;
        this.boxExtraLink = null;
        this.boxContent = '';
        this.cssStyle = {};
        this.imgHref = null;

        if (this.$state.params.postSlug) {
            stashSrv.getSinglePost(this.$state.params.postSlug)
                .then(function (post) {
                    if(this.cssClass.indexOf('post-header-with-auth') >= 0) {
                        this.imgSrc = post.author.avatar;
                        this.cssStyle['background-image'] = 'url(' + post.author.avatar + ')';
                    }
                })
        }else {
            this.imgSrc = this.$attrs.imgSrc;
        }


        if (this.imgSrc) {
        /**
        * Inline CSS, dude!? Really!? Bleah!
        * TODO: make it go away
        */
            this.cssStyle['background-image'] = 'url(' + this.imgSrc + ')';
        }

        this.imgHref = this.parseVcLinkString(this.$attrs.imgHref);

        if (this.$attrs.boxContent != '') {
            this.boxContent = this.$attrs.content;
        }

        if (this.$attrs.boxExtraLink && this.$attrs.boxExtraLink.trim()) {
            this.boxExtraLink = this.parseVcLinkString(this.$attrs.boxExtraLink);
        }
    }

    parseVcLinkString(str) {
        let parts = str ? str.split('|').filter(Boolean) : [];

        return parts.length
            ? {
                href: parts[0].replace('url:', '').trim(),
                title: parts[1].replace('title:', '').trim()
            }
            : null;
    }
}

textBoxController.$inject = ['$attrs', '$state'];


class textBoxDirective {
    constructor(...deps){
        this.$compile = deps[0];
        this.$state = deps[1];
        this.stashService = deps[2];

        this.templateUrl = require('./text-box.template.html'),
        this.controller = textBoxController;
        this.controllerAs = 'vm';
        this.restrict = 'AE';
        this.compile = ($templateElement, $templateAttributes) => {
            return {
                pre: this.preLink,
                post: this.postLink
            }
        };
        this.scope = {};
    }

    preLink(scope, element, attrs) {
        /**
         * TODO: Refactor this to properly handle the template
         */
        element.removeAttr('box-title');
        element.removeAttr('box-subtitle');
        element.removeAttr('content');
        element.removeAttr('img-href');
        element.removeAttr('box-extra-link');
    }    

    postLink(scope, element) {
        this.$compile(element.contents())(scope);
    }    

    static factory(...deps) {
        return new textBoxDirective(...deps);
    }
}

textBoxDirective.factory.$inject = [
    '$compile',
    '$state',
    'stashService'
];

export default textBoxDirective.factory;
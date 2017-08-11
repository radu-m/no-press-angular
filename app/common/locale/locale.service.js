class LoaleService{
	constructor(...deps){
		this.$q = deps[0];
		this.$location = deps[1];
		this.apiService = deps[2];

		this.activeLang = null;
		this.languages = null;
		this.defaultLangCode = null;
	}

    getAllRegisteredLang() {
    	var self = this;

        if (this.languages) {
            return this.$q.when(this.languages);
        }

        return this.apiService.get('/locale/get_registered_languages')
            .then(function (result) {
                self.setAvailableLang(result.data);
                return self.activeLang;
            })
    };

    getActiveLangCode(){
        return this.activeLang ? this.activeLang['language_code'] : null;
    };

    setAvailableLang(langList) {
        this.languages = langList;
/*        if(!langList.length){
        	this.languages = langList = [
        		{
					en: {
					   id: 1,
					   active: 1,
					   native_name: 'English',
					   missing: 0,
					   translated_name: 'English',
					   language_code: 'en',
					   country_flag_url: 'http://yourdomain/wpmlpath/res/flags/en.png',
					   url: 'http://yourdomain/about'
	  	        	}
  	        	}
        	]
        }
*/
        if (!this.activeLang) {
            let lang = null;

            if(this.$location.search('lang')) {
                lang = langList[this.$location.search('lang')];
            }
            /**
             * TODO: look for $cookie val or...
             **/

            this.setActiveLang(lang || langList[0]);
        }

console.log('languages -- ', this.languages)

    };

    setActiveLang(lang) {
        var self = this;

        if (lang) {
            this.activeLang = lang;
        } else {
            angular.forEach(this.languages, function (lang) {
                if (lang.active) {
                    self.activeLang = lang;
                    self.defaultLangCode = lang['language_code'];
                    return;
                }
            })
        }

        this.$location.search('lang', this.activeLang['language_code']);
        this.setLocale(this.activeLang['default_locale']);
    };

    setLocale(locale) {
        locale = locale;
    };

    static factory(...deps) {
        return new LoaleService(...deps);
    }
}

LoaleService.factory.$inject = [
    '$q', 
    '$location', 
    'apiService'
];

export default LoaleService.factory;
class HomeController {

	constructor($state, pageData, registeredLang) {
	    const vm = this;

	    vm.htmlJson = pageData.content;
	}

}

HomeController.$inject = ['$state', 'pageData', 'registeredLang'];
export default HomeController;
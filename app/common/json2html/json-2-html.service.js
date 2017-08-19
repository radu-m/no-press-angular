export class Json2htmlService {

	constructor(...deps) {
        this.attrsBlackList = {
            img: ['width', 'height']
        };
	}

	parse(json, $parent) {
        if (angular.isString(json)) {
            /** fix for situations where the string does not contain markup, but it should */
            json = {
                value: json,
                nodeType: 3,
                tag: 'p'
            };
        }

        function* entries(obj) {
            for (let key of Object.keys(obj)) {
                yield [key, obj[key]];
            }
        }

        if (json.nodeType != 3) {
            var elem = angular.element(document.createElement(json.tag));

            if (json.attrs) {
                for (let [aName, aValue] of entries(json.attrs)) {
                    /**
                     * This filtering should be done on the server
                     **/
                    if (!this.attrsBlackList[json.tag] || this.attrsBlackList[json.tag].indexOf(aName) < 0) {
                        elem.attr(aName, aValue);
                    }
                }
            }

            if (json.children) {
                for (let [k, child] of entries(json.children)) {
                    if (k && child) {
                        $parent.append(this.parse(child, elem));
                    }
                }
            }

            if (json.tag == 'root') {
                $parent.html(elem.html());
            } else {
                $parent.append(elem);
            }

        } else {
            $parent.append(json.value);
        }
	}

	static factory() {
		return new Json2htmlService;
	}
}

Json2htmlService.factory.$inject = [];
export default Json2htmlService.factory;
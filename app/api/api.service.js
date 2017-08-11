class ApiService{

	constructor(...deps){
		this.$q = deps[0];
		this.$http = deps[1];

        this.pendingRequests = {};
        this.apiPath = '/api';
	}

    Error(code, message) {
        this.code = code;
        this.message = message;
    }

    removeReqFromPending(path) {
        //this.pendingRequests.splice(indexOf(this.pendingRequests, path), 1);
        delete this.pendingRequests[path];
    }

    handleSuccess(response) {
        if (response.status === 200 && response.data.code === 200) {
            return response.data.data;
        } else {
            var error = new this.Error(response.data.code, response.data.message);
            return this.$q.reject(error);
        }
    }

    handleError(response) {
        return (response) => {
            if(angular.isArray(this.pendingRequests)) {
                this.pendingRequests.splice(this.pendingRequests.indexOf(path), 1);
            }

            var error = new this.Error(response.status, 'Can\'t reach REST service');
            return this.$q.reject(error);
        }
    }

    makeFullPath(path) {
        return 'http' + '://' + '0.0.0.0:8080' + this.apiPath + path;
    }

    checkReqStatus(path) {
        // could use the this.$q.$$state.status here
        // http://stackoverflow.com/questions/24091513/get-state-of-angular-deferred
        /**
         * TODO: check for parameters too, to allow for simultaneous calls to same path, with different params
         * */
        return this.pendingRequests[path];
    }

    ////

    get(path, params, notApi, allowMultiple) {
        console.log('GET', path, params);
        var self = this;

        if (!allowMultiple && this.checkReqStatus(path)) {
            return this.pendingRequests[path];
        }

        if (typeof notApi === 'undefined') {
            notApi = false;
        }

        let deferred = this.$http.get(notApi ? path : this.makeFullPath(path), {params: params})
            .then(
                function(result){
                    if(notApi){
                        return result;
                    }else {
                        return self.handleSuccess(result);
                    }
                }, 
                self.handleError())
            .finally(function () {
                self.removeReqFromPending(path);
            });

        this.pendingRequests[path] = deferred;

        return deferred;
    }

    post(path, params, allowMultiple) {
        console.log('POST', path, params);

        if (!allowMultiple && this.checkReqStatus(path)) {
            return this.pendingRequests[path];
        }

        var config = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: function (data) {
                if (angular.isUndefined(data)) {
                    return data;
                }
                return toQueryString(data);
            }
        };

        let deferred = this.$http.post(this.makeFullPath(path), params, config)
            .then(this.handleSuccess, this.handleError)
            .finally(function () {
                this.removeReqFromPending(path);
            });

        this.pendingRequests[path] = deferred;
        return deferred;

        ////

        function toQueryString(obj) {
            var parts = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
                }
            }
            return parts.join("&");
        }
    }

    postJSON(path, body, notApi, allowMultiple, timeout) {
        console.log('POST', path, body);

        if (!allowMultiple && this.checkReqStatus(path)) {
            return this.pendingRequests[path];
        }

        if (typeof notApi === 'undefined') {
            notApi = false;
        }

        var config = {
            headers: {'Content-Type': 'application/json; charset=UTF-8'}
        };

        if (!angular.isUndefined(timeout)) {
            config.timeout = timeout;
        }

        let deferred = this.$http.post(notApi ? path : this.makeFullPath(path), body, config)
            .then(this.handleSuccess, this.handleError)
            .finally(function () {
                this.removeReqFromPending(path);
            });

        this.pendingRequests[path] = deferred;
        return deferred;
    }

    postFormData(path, files, formPartName, allowMultiple) {
        /**
         * TODO: Transform this to support multiple files and progress reports
         * see:
         * https://jasonturim.wordpress.com/2013/09/12/angularjs-native-multi-file-upload-with-progress/
         * http://stackoverflow.com/questions/13591345/angularjs-tracking-status-of-each-file-being-uploaded-simultaneously
         *
         * @type {FormData}
         */

        if (!allowMultiple && this.checkReqStatus(path)) {
            return this.pendingRequests[path];
        }

        var partName = formPartName ? formPartName : 'fileUpload';

        var fd = new FormData();
        console.log(files);

        angular.forEach(files, function (f) {
            fd.append(partName, f);
        });

        var config = {
            accept: 'application/json',
            headers: {'Content-Type': undefined}, /** let it for the browser to decide */
            transformRequest: angular.identity  /** whatever the first param will be */
        };

        function bypassSuccessHandler(response) {
            console.log(response);
            if (formPartName === 'svg') {
                return response.data;
            }
            //console.log(response)
            return this.handleSuccess(response);
        }

        //return this.$http.post(this.makeFullPath(path), fd, config)
        //    .then(this.handleSuccess, this.handleError);
        let deferred = this.$http.post(this.makeFullPath(path), fd, config)
            .then(bypassSuccessHandler, this.handleError)
            .finally(function () {
                this.removeReqFromPending(path);
            });

        this.pendingRequests[path] = deferred;
        return deferred;
    }

    del(path, params, allowMultiple) {
        console.log('DELETE', path, params);

        if (!allowMultiple && this.checkReqStatus(path)) {
            return this.pendingRequests[path];
        }

        let deferred = this.$http.delete(this.makeFullPath(path), {params: params})
            .then(this.handleSuccess, this.handleError)
            .finally(function () {
                this.removeReqFromPending(path);
            });

        this.pendingRequests[path] = deferred;
        return deferred;
    }

    static factory(...deps) {
        return new ApiService(...deps);
    }
}

ApiService.factory.$inject = [
    '$q', 
    '$http', 
];

export default ApiService.factory;
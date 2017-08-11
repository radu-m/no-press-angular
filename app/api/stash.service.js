 class StashService{
	constructor(...deps){
		this.$q = deps[0];
		this.$filter = deps[1];
		this.apiService = deps[2];
		this.localeService = deps[3];

	    this.formNameToId = {};
	    this.catIdToSlug = {}; // used with pinned posts


	    this.stash = {
	        categories: null,
	        publishedOn: {},
	        layoutCommons: {},
	        posts: {},
	        forms: {},
	        geo: null
	    };
	}

    getContent(type, param, idx, forceRequest) {
        if (idx && this.stash[idx] && !forceRequest) {
            return $q.when(this.stash[idx]);
        }

        this.addLangParam(param);

        return this.apiService.get('/get_' + type, param)
            .then(function (result) {
                return result;
            });
    };

    getMenu(menuLocation, forceRequest, isMainNav) {
        if (forceRequest === undefined) {
            forceRequest = false;
        }

        var acLangCode = this.localeService.getActiveLangCode();

        if (acLangCode
            && this.stash.layoutCommons[acLangCode]
            && this.stash.layoutCommons[acLangCode][menuLocation]
            && !forceRequest) {

            return $q.when(this.stash.layoutCommons[acLangCode][menuLocation]);
        }

        let path = isMainNav ? '/menus/get_main_menu' : '/menus/get_nav_menu';

        let params = {'m': menuLocation};
        addLangParam(params);

        return this.apiService.get(path, params, false, true)
            .then((result) => {
                if (!this.stash.layoutCommons) {
                    this.stash.layoutCommons = {};
                }
                this.addLangKeys('layoutCommons');

                var m = result.data;
                var remappedItems = {};

                // remap by slug to set active item by state.param
                angular.forEach(result.data.items, function (mItem, idx) {

                    if (mItem['object_slug'].length > 0) {
                        remappedItems[mItem['object_slug']] = mItem;
                    } else {
                        if (mItem['type'] === 'custom' && mItem['url'].length > 0) {
                            let assumeSlug = '';
                            if (mItem.url == '#' || mItem.url == '/') {
                                assumeSlug = mItem.title.toLowerCase().replace(' ', '-');
                                remappedItems[assumeSlug] = mItem;
                            } else {
                                // check and remove trailing '/'
                                if (mItem.url.slice(-1) == '/') {
                                    mItem.url = mItem.url.slice(0, -1);
                                }
                                assumeSlug = mItem.url.split('/').pop();
                                remappedItems[assumeSlug] = mItem;
                            }
                        }
                    }
                });

                m.items = remappedItems;
                this.stash.layoutCommons[acLangCode][m['theme_location']] = m;
                return m;
            });
    };

    getEntirePage(slug) {
        var self = this;
        if (!this.stash.page) {
            this.stash.page = {};
        }

        var acLangCode = this.localeService.getActiveLangCode();

        this.addLangKeys('page');
console.log('acLangCode -- ', this.localeService.getActiveLangCode())

console.log('stash -- ', this.stash)
        if (this.stash.page[acLangCode][slug]) {
            return $q.when(this.stash.page[acLangCode][slug]);
        }

        return this.getContent('page', {'slug': slug})
            .then(function (result) {
                return self.stash.page[acLangCode][slug] = result.page;
            })
    };

    getPostCards(cat, force) {
        let excludePosts = [];
        let params = {
            orderby: 'date',
            order: 'DESC',
            paged: 0
        };

        var acLangCode = this.localeService.getActiveLangCode();

        if (!this.stash.posts[acLangCode]) {
            this.addLangKeys('posts');
        }

        if (angular.isObject(cat)) {
            var catSlug = cat['object_slug'];
            params.cat = cat['object_id'];
            force = true;
        } else {
            params['cat-slug'] = cat;
            catSlug = cat;
        }

        /**
         * this is good, but for parent categories, the post_count == 0
         * so have to look at the total count for child cats
         **/

        let existing = preventNewRequest(catSlug);

        if (!force && existing) {
            /**
             * If there are posts to exclude, we already have all posts, since there's no
             * paging implemented anywhere
             *
             * TODO: implement paging
             **/
            return $q.when(existing);
        }

        if (this.stash.categories[acLangCode] && this.stash.categories[acLangCode][catSlug]) {
            angular.forEach(Object.keys(this.stash.categories[acLangCode][catSlug].posts),
                function (postSlug) {
                    excludePosts.push(this.stash.posts[acLangCode][postSlug].id);
                });

            params.notin = excludePosts.join(',');
            params['posts_per_page'] = 10;
        }

        addLangParam(params);

        return this.apiService.get('/monposts/get_post_cards', params)
            .then(function (result) {
                angular.forEach(result.data, function (post) {
                    if (!this.stash.posts[acLangCode][post.slug]) {
                        // decode chars that might have been encoded when creating the JSON
                        post.title = $.parseHTML(post.title)[0].nodeValue;
                        this.stash.posts[acLangCode][post.slug] = post;
                    }

                    //remapCustomAttachmentsByLang(post);
                    remapAttachemntsByLang(post);
                    cacheCats(post);
                    mapPostsByDate(post);
                    setPinnedPostForCat(post);
                });

                return getPostsUnderCat(catSlug);
            })
    };

    getSinglePostCard(postSlug) {
        var acLangCode = this.localeService.getActiveLangCode();

        if (!this.stash.posts[acLangCode][postSlug]) {
            return $q.reject();
        }
        return $q.when(this.stash.posts[acLangCode][postSlug]);
    };

    getSinglePostById(postId) {
        let theCard = null;
        var acLangCode = this.localeService.getActiveLangCode();

        if (!acLangCode) {
            return $q.reject();
        }


        if (!this.stash.posts[acLangCode]) {
            this.stash.posts[acLangCode] = {};
        }

        angular.forEach(this.stash.posts[acLangCode], function (post) {
            if (post.id == postId) {
                theCard = post;
            }
        });

        if (theCard) {
            return $q.when(theCard);
        }

        let params = {
            id: postId
        };

        //addLangParam(params);

        return this.apiService.get('/monposts/get_single_post', params)
            .then(function (result) {
                if (result) {
                    return getSinglePostSuccessHandler(result.data.post, acLangCode);
                } else {
                    console.warn('no post found with ID: ', postId)
                }
            });
    };

    getSinglePost(postSlug) {
        let params = {
            slug: postSlug
        };

        var acLangCode = this.localeService.getActiveLangCode();

        if (!acLangCode) {
            return $q.reject();
        }

        if (!this.stash.posts[acLangCode]) {
            this.stash.posts[acLangCode] = {};
        }

        if (this.stash.posts[acLangCode] && this.stash.posts[acLangCode][postSlug]) {
            if (this.stash.posts[acLangCode][postSlug].content) {
                return $q.when(this.stash.posts[acLangCode][postSlug])
            }
        } else {
            this.stash.posts[acLangCode][postSlug] = {};
        }

        this.addLangKeys('posts');
        addLangParam(params);

        return this.apiService.get('/monposts/get_single_post', params)
            .then(function (result) {
                //console.log('######################## ', result)
                return getSinglePostSuccessHandler(result.data.post, acLangCode);
            });
    };

    getAllCategories() {
        var self = this;
        var acLangCode = this.localeService.getActiveLangCode();

        if (this.stash.categories && this.stash.categories[acLangCode]) {
            return this.$q.when(this.stash.categories[acLangCode]);
        }

        this.addLangKeys('categories');
        let params = {};
        this.addLangParam(params);

        return this.apiService.get('/get_category_index', params)
            .then(function (result) {
                //this.stash.categories = {}; // result.categories;
                let tmpCatMap = {};

                angular.forEach(result.categories, function (cat) {
                    cat.posts = [];
                    cat.childSlugs = [];
                    self.stash.categories[acLangCode][cat.slug] = cat;
                    catIdToSlug[cat.id] = cat.slug;

                    if (!cat.parent) {
                        // top-level category
                        tmpCatMap[cat.id] = cat.slug;
                    }
                });

                // add both-way reference between parents and children
                angular.forEach(self.stash.categories[acLangCode], function (cat) {
                    if (cat.parent) {
                        let parent = self.stash.categories[acLangCode][tmpCatMap[cat.parent]];
                        parent.childSlugs.push(cat.slug);
                        parent['post_count'] += 1;
                        // replace the parent ID with parent-slug
                        cat.parent = parent.slug;
                    }
                });

                return self.stash.categories[acLangCode];
            })
    };

    getPublishingIntervals() {
        return this.stash.publishedOn;
    };

    getForm(fId) {
        //console.log('getForm by ID ', fId, ' ---- ', this.stash.forms);
        if (this.stash.forms[fId]) {
            return $q.when(this.stash.forms[fId]);
        }
        let params = {fid: fId};
        addLangParam(params);

        return this.apiService.get('/forms/get_form', params)
            .then(function (result) {
                console.log(result);

                this.stash.forms[result.id] = result;
                return result;
            })
    };

    getFormByName(fName) {
        //console.log('getFormByName ', formNameToId, ' ... ', formNameToId[fName]);
        if (formNameToId[fName]) {
            return this.getForm(formNameToId[fName]);
        }

        let params = {fname: fName};
        addLangParam(params);

        return this.apiService.get('/forms/get_form_by_name', params)
            .then(function (result) {
                formNameToId[result.title.toLowerCase()] = result.id;
                this.stash.forms[result.id] = result;
                return result;
            })
    };

    submitForm(fId, fields) {
        return this.apiService.postJSON('/forms/submit_form', {id: fId, fields: fields})
            .then(function (result) {
                {
                    console.log('Submitted form ' + fId + ' => ', result)
                    return result;
                }
            })
    };

    submitDownloadAttForm(fId, fields) {
        return this.apiService.postJSON('/forms/submit_download_attachments_form',
            {id: fId, fields: fields})
            .then(function (result) {
                {
                    console.log('Submitted form ' + fId + ' => ', result)
                    return result;
                }
            })
    };

    getStashedData(keyChain) {
        return Object.getByString(this.stash, keyChain);
    };

    putDataToStash(keyChain, data) {
        return Object.setByString(this.stash, keyChain, data);
    };

    getLatestPost(catSlug) {
        let theCat = this.stash.categories[this.localeService.getActiveLangCode()][catSlug];
        return theCat ? theCat.latest : false;
    };

    setLatestPost(cat, post) {
        var acLangCode = this.localeService.getActiveLangCode();

        if (post && cat && this.stash.categories[acLangCode][cat]) {
            this.stash.categories[acLangCode][cat].latest = {
                id: post.id,
                slug: post.slug
            }
        }
    };

    getPinnedPostForCat(catSlug){
        if(!catSlug){
            return false;
        }

        let theCat = this.stash.categories[this.localeService.getActiveLangCode()][catSlug];
        return theCat.pinned ? theCat.pinned : false;
    };

    isPostPinned(catId){
        if(!catId){
            return false;
        }

        return catIdToSlug[catId]; // return slug || undefined
    };

    ///
    cacheCats(post) {
        var acLangCode = this.localeService.getActiveLangCode();

        if (!this.stash.categories || !this.stash.categories[acLangCode]) {
            return false;
        }

        angular.forEach(post.categories, function (cat) {
            // make it a map to ensure unique elements, without looping every time
            this.stash.categories[acLangCode][cat.slug]['posts'][post.slug] = post.id;
            // also, it allows saving the same slug on multiple levels of cat hierarchy
            if (cat.parent) {
                let parentSlug = '';

                angular.forEach(this.stash.categories[acLangCode], function (aCat, slug) {
                    if (aCat.id == cat.parent) {
                        parentSlug = aCat.slug;
                        return;
                    }
                });

                this.stash.categories[acLangCode][parentSlug]['posts'][post.slug] = post.id;
            }
        });

    }

    mapPostsByDate(post) {
        let date = new Date(post.date),
            y = date.getFullYear(),
            m = date.getMonth(),
            dateKey = y + '-' + m;

        if (!this.stash.publishedOn[dateKey]) {
            this.stash.publishedOn[dateKey] = []
        }
        // save this on post for future ref.
        post.year = y;
        post.month = m;

        this.stash.publishedOn[dateKey].push({
            id: post.id,
            slug: post.slug,
            timestamp: post.date
        });

        this.stash.publishedOn[dateKey] = $filter('orderBy')(this.stash.publishedOn[dateKey], 'timestamp', true);
    }

    getPostsUnderCat(catSlug) {
        let out = [];
        var acLangCode = this.localeService.getActiveLangCode();

        if (!this.stash.categories[acLangCode][catSlug]) {
            return out;
        }

        angular.forEach(Object.keys(this.stash.categories[acLangCode][catSlug].posts),
            function (postSlug) {
                out.push(this.stash.posts[acLangCode][postSlug]);
            });

        return out;
    }

    remapAttachemntsByLang(post) {
        var mapped = {};
        if (post.attachments.length > 0) {
            angular.forEach(post.attachments, function (att) {
                if (att.lang) {
                    mapped[att.lang] = att;
                } else {
                    mapped[att.id + ''] = att;
                }
            })
        }
        post.attachments = mapped;
    }

    preventNewRequest(catSlug) {
        var acLangCode = this.localeService.getActiveLangCode();

        if (!catSlug || !this.stash.categories[acLangCode]) {
            return false;
        }

        let out = getPostsUnderCat(catSlug);
        let catPostCount = this.stash.categories[acLangCode][catSlug] ? this.stash.categories[acLangCode][catSlug]['post_count'] : null;

        return out && out.length >= catPostCount ? out : false;
    }

    remapCustomAttachmentsByLang(post) {
        var mapped = {};
        if (post.attachments.length > 0) {
            angular.forEach(post.attachments, function (att) {
                if (att.lang) {
                    mapped[att.lang] = att;
                } else {
                    mapped[att.id + ''] = att;
                }
            })
        }
        post.attachments = mapped;
    }

    addLangKeys(keyChain) {
    	var self = this;
        angular.forEach(this.localeService.languages, function (lang, langKey) {
        	console.log('self -- ', keyChain)
            self.putDataToStash(keyChain + '.' + langKey, {});
        })
    }

    addLangParam(params) {
        if (this.localeService.defaultLangCode != this.localeService.getActiveLangCode()) {
            params.lang = this.localeService.getActiveLangCode();
        }
    }

    getSinglePostSuccessHandler(post, lang) {
        //console.log('getSinglePostSuccessHandler - ', post, ' --- ', lang);

        if (!this.stash.posts[lang][post.slug]) {
            remapAttachemntsByLang(post);
            this.stash.posts[lang][post.slug] = post;
        } else {
            angular.extend(this.stash.posts[lang][post.slug], post);
        }
        // add the prev and next urls to the post object too (optional)
        //this.stash.posts[lang][post.slug]['prev_url'] = data['previous_slug'] || null;
        //this.stash.posts[lang][post.slug]['next_url'] = data['next_slug'] || null;

        return this.stash.posts[lang][post.slug];
    }

    setPinnedPostForCat(post){
        if(post['custom_fields']['category_sticky_post']){
            let acLangCode = this.localeService.getActiveLangCode();
            let catId = post['custom_fields']['category_sticky_post'];
            if(this.stash.categories[acLangCode][catIdToSlug[catId]]) {
                this.stash.categories[acLangCode][catIdToSlug[catId]]['pinned'] = {
                    id: post.id,
                    slug: post.slug
                }
            }
        }
    }


    static factory(...deps) {
        return new StashService(...deps);
    }
}

StashService.factory.$inject = [
    '$q', 
    '$filter', 
    'apiService',
    'localeService'
];

export default StashService.factory;
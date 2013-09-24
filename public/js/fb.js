/*
 * 
 * 
 */

(function(w) {
    
    var log = function(o)
    {
        if (w.console && w.console.log) {
            try{console.log(o)}catch(e){}
        }  
    }
    
    var Logger = function(){}
    Logger.prototype.log = function(o)
    {
        log(o);
    }

    var FB = function()
    {
        /* @var view */
        this.view = null;
        this.helpers = {};
        this.fieldsToAnalyse = 'interests,movies,tv,books,games';
        this.viewerData = null;
        this.viewerFriendsIds = [];
        this.suggestionData = null; // Alias to this.view.gallery.data
    }
    
    FB.prototype.init = function()
    {
        this.view = new View();
        this.initHelpers();
        this.appbaseprefix = $('body').data('basePrefix');
        this.initParams();
        this.run();
    }
    
    FB.prototype.initHelpers = function()
    {
        this.helpers.logger = new Logger();
        this.helpers.common = new Helper();
    }
    
    FB.prototype.initParams = function()
    {
        this.params = {};
        var q = document.location.search;
        var tmp = q.substr(q.indexOf('?') + 1).split('&');
        var i = tmp.length;
        while (i--) {
            var v = tmp[i].split('=');
            this.params[v[0]] = decodeURIComponent(v[1]);
        }
        //log(this.params);
    }
    
    FB.prototype.api = function(method, params, callback)
    {
        VK.api(method, params, function(data) { 
            if (callback && typeof(callback) === "function") callback(data);
        });
    }
    
    FB.prototype.getViewerId = function()
    {
        return this.params.viewer_id || this.params.user_id;
    }

    FB.prototype.run = function()
    {
        var self = this;
        this.view.statusbar.construct('Заправка топливом');
        this.loadViewerData(function(data){
            self.checkUserAlreadyAnalysed(data,
                function(){
                    // Already analysed
                    // So we can retrive saved data and construct gallery

                },
                function(){
                    // Not analysed
                    if (self.enoughInterests()) {
                        self.doAnalyse();
                    } else {
                        self.suggestInterests();
                    }
                });  
        });
    }
    
    FB.prototype.suggestInterests = function()
    {
        var self = this;
        var users = new Users();
        var params = {
            uid: self.getViewerId(),
            count: 100,
            fields: 'interests'
        };
        users.getFriendsOf(params, 
            function(data) {
                if (data.response && data.response.length) {
                    var interests = [];
                    for(var uKey in data.response) {
                        var userInterests = self.getUserInterests(data.response[uKey]);
                        if (userInterests.length > 0) {
                            interests = interests.concat(userInterests);
                        }
                    }
                    var normalInterests = [];
                    for (var iKey in interests) {
                        var interest = interests[iKey].trim().toLowerCase();
                        var condition = interest.length > 3 
                            && interest.length < 10
                            && interest.indexOf(' ') === -1
                            && interest.indexOf('&') === -1
                            && normalInterests.indexOf(interest) === -1;
                        if (condition) {
                            normalInterests.push(interest);
                        }
                    }
                    shuffle(normalInterests);
                    normalInterests = normalInterests.slice(0, 112);
                    
                    if (normalInterests.length < 10) {
                        normalInterests = normalInterests.concat([
                            'читать',
                            'петь',
                            'музыка',
                            'море',
                            'книги',
                            'природа',
                            'походы',
                            'игры',
                            'танцевать',
                            'йога',
                            'театр',
                            'языки',
                            'стихи',
                            'сказки',
                            'девушки',
                            'парни',
                            'отдых',
                            'крокодил',
                            'аватар',
                            'кино',
                            'плавание',
                            'футбол',
                            'флирт',
                            'улыбаться'
                        ]);
                    }
                    
                    self.view.statusbar.set("Выберите интересы");
                    self.view.interestsBox.construct(normalInterests, 'Пожалуйста, выберите не менее пяти наиболее близких Вам интересов');
                    self.view.toolbar.addButton({
                        id: 'interests-submit',
                        text: 'Продолжить',
                        position: 'right'
                    }, self.processSelectedInterests.bind(self));
                    self.view.toolbar.addButton({
                        id: 'interests-select_all',
                        text: 'Выбрать все',
                        position: 'right',
                        color: 'gray'
                    }, self.view.interestsBox.selectAllInterests.bind(self.view.interestsBox));
                } else {
                    // You don't have friends!!!
                }
            }
        );    
    }
    
    FB.prototype.processSelectedInterests = function()
    {
        var interests = this.view.interestsBox.getSelectedInterests();
        if (interests.length < 5) {
            this.view.interestsBox.highlightInfoMessage();
        } else {
            this.view.toolbar.remove();
            this.view.interestsBox.remove(true);
            this.viewerData.interests = interests.join();
            this.doAnalyse();
        }
    }
    
    FB.prototype.getUserInterests = function(userData)
    {
        var interests = [];
        var interestsKeys = this.fieldsToAnalyse.split(',');
        for (var key in interestsKeys) {
            if (typeof(userData[interestsKeys[key]]) !== 'undefined') {
                var iteratedInterest = userData[interestsKeys[key]];
                if (iteratedInterest != '') {
                    var userInterests = iteratedInterest.split(',');
                    interests = interests.concat(userInterests);
                }
            }
        } 
        return interests;
    }
    
    FB.prototype.enoughInterests = function()
    {
        var interests = this.getUserInterests(this.viewerData);
        return (interests.length > 0);
    }
    
    FB.prototype.checkUserAlreadyAnalysed = function(data, analysed, notAnalysed)
    {
        //Check data.uid in the database
        
        
        notAnalysed();  
    }
    
    FB.prototype.loadViewerFriendsIds = function()
    {
        var self = this;
        var users = new Users();
        users.getFriendsOf({uid: self.getViewerId()}, 
            function(data) {
                if (data.response && data.response.length) {
                    self.viewerFriendsIds = data.response;
                }
            }
        );
    }
    
    FB.prototype.isOppositeSex = function(u1, u2)
    {
        if (!u2) u2 = this.viewerData;
        if (typeof(u1.sex) === 'undefined' || typeof(u2.sex) === 'undefined') return false;
        if (u1.sex == 0 || u2.sex == 0) return false;
        
        return u1.sex != u2.sex;
    }
    
    FB.prototype.isViewer = function(user)
    {
        if (typeof(user.uid) === 'undefined') return false;
        return this.viewerData.uid == user.uid;
    }
    
    FB.prototype.doAnalyse = function(friendsOf)
    {
        var self = this;
        var users = new Users();
        
        self.loadViewerFriendsIds();    

        var params = {
            uid: friendsOf || '',
            fields: self.fieldsToAnalyse+',sex',
            filterSex: (typeof(self.viewerData.sex) !== 'undefined' && self.viewerData.sex != 0) ? true : false
        };
        users.getFriendsOfFriends(params, 
            function(data) {
                //log(data);
                if (data.response) {
                    // First step passed. We've got somebody's friends
                    self.view.progressbar.construct();
                    //self.view.carousel.construct(data.response);
                } else {
                    // We can't get user friends. That sucks.
                    log(data);
                }
            }, 
            function(data) {
                // Cool. We've got friends of somebody's friends.
                //log(data);
                self.view.progressbar.animate();
                self.view.carousel.remove(true);
                self.view.statusbar.set("Анализ данных");
                users.getSuggestions(data, function(d){
                    //log(d);
                    self.view.progressbar.remove();
                    if (d.response) {
                        self.suggestionData = d.response;

                        if (self.suggestionData.found > 0) {
                            self.view.statusbar.set("По Вашим интересам "+self.helpers.common.foundUsersFormat(self.suggestionData.found));
                            
                            users.mergePhotos(d.response.users, function(updata){
                                self.view.gallery.construct(updata);
                            });
                        } else {
                            self.view.statusbar.set("К сожалению, по Вашим интересам не найдено ни одного человека");
                        }

                    } else {
                        log(d);
                    } 
                });
            },
            function(progress, message) {
                self.view.progressbar.move(progress);
                self.view.statusbar.set("Загрузка списка друзей "+message);
            }
        );  
    }
    
    FB.prototype.loadViewerData = function(onsuccess, onfailure)
    {
        var self = this;
        var users = new Users();
        users.get({uids: self.getViewerId(), fields: 'first_name,last_name,sex,'+self.fieldsToAnalyse}, function(data) {
            if (data.response) {
                self.viewerData = data.response[0];
                if (typeof(onsuccess) === 'function') onsuccess(data.response[0]);
            } else {
                if (typeof(onfailure) === 'function') onfailure(data);
                log(data);
            }
        });
    }
    
    FB.prototype.showRequestBox = function()
    {
        var activeUserData = this.suggestionData.users[this.view.gallery.getActiveUserIndex()];
        var message = "У тебя в друзьях есть интересный человек. \r\n";
        message += (activeUserData.sex == 1) ? 'Её' : 'Его';
        message += ' зовут '+activeUserData.first_name;
        message += '. ';
        message += 'У нас с ';
        message += (activeUserData.sex == 1) ? 'ней' : 'ним';
        message += ' общие интересы: ';
        var allInterests = [];
        if (activeUserData.interests && activeUserData.interests.length) allInterests = allInterests.concat(activeUserData.interests);
        if (activeUserData.movies && activeUserData.movies.length) allInterests = allInterests.concat(activeUserData.movies);
        if (activeUserData.tv && activeUserData.tv.length) allInterests = allInterests.concat(activeUserData.tv);
        if (activeUserData.books && activeUserData.books.length) allInterests = allInterests.concat(activeUserData.books);
        if (activeUserData.games && activeUserData.games.length) allInterests = allInterests.concat(activeUserData.games);
        message += allInterests.join(", ");
        
        VK.api('wall.post', {message: message /*,attachment: 'photo4359453_280280401'*/, owner_id: activeUserData.mutual.uid }, 
            function(result) {
                if (result.response) {
                    
                } else {
                    if (result.error && result.error.error_code === 10007) return;
                    VK.callMethod('showRequestBox', activeUserData.mutual.uid, message, '');
                }
            }
        );
    }
    
    FB.prototype.showHelloBox = function()
    {
        var activeUserData = this.suggestionData.users[this.view.gallery.getActiveUserIndex()];
        var message = "Привет, "+activeUserData.first_name+"! \r\n";
        message += 'У нас общие интересы: ';
        var allInterests = [];
        if (activeUserData.interests && activeUserData.interests.length) allInterests = allInterests.concat(activeUserData.interests);
        if (activeUserData.movies && activeUserData.movies.length) allInterests = allInterests.concat(activeUserData.movies);
        if (activeUserData.tv && activeUserData.tv.length) allInterests = allInterests.concat(activeUserData.tv);
        if (activeUserData.books && activeUserData.books.length) allInterests = allInterests.concat(activeUserData.books);
        if (activeUserData.games && activeUserData.games.length) allInterests = allInterests.concat(activeUserData.games);
        message += allInterests.join(", ");
        
        VK.api('wall.post', {message: message, owner_id: activeUserData.uid }, 
            function(result) {
                if (result.response) {
                    
                } else {
                    if (result.error && result.error.error_code === 10007) return;
                    VK.callMethod('showRequestBox', activeUserData.uid, message, '');
                }
            }
        );
    }
    
    FB.prototype.showUserPhotos = function()
    {
        var self = this;
        var activeUserData = this.suggestionData.users[this.view.gallery.getActiveUserIndex()];
        VK.api('photos.getProfile', {uid: activeUserData.uid, limit: 100}, 
            function(data) {
                if (data.response && data.response.length) {
                    data.response.reverse();
                    self.view.slider.construct(data.response);
                } else {
                    log(data);
                }
            }
        );
    }
    
    FB.prototype.showInviteBox = function()
    {
        VK.callMethod('showInviteBox');
    }
    
    var fb = new FB();
  
    w.FB = fb;
})(window)


    var Users = function()
    {
        
    }
    
    Users.prototype.get = function(params, callback)
    {
        FB.api("users.get", 
            {   
                uids:params.uids || FB.params.viewer_id, 
                fields: params.fields || '',
                name_case: params.name_case || ''
            },
            callback
        );
    }
    
    Users.prototype.getFriendsOf = function(params, callback)
    {
        FB.api("friends.get", 
            {   
                uid: params.uid || '', 
                fields: params.fields || '',
                name_case: params.name_case || '',
                count: params.count || '',
                offset: params.offset || ''
            },
            callback
        );
    }
    
    Users.prototype.randomize = function(users, limit)
    {
        return shuffle(users).slice(0,limit);
    }
    
    Users.prototype.getFriendsOfFriends = function(params, firstStepCallback, resultsCallback, progressCallback)
    {
        var self = this;
        var resultSent = false;
        var friends = [];
        var friendsLimit = params.count || 100;
        var firstStepParams = {uid: params.uid || '', count: 1000, fields: "uid,first_name,photo_medium_rec,photo_medium", name_case: "gen"};
        this.getFriendsOf(firstStepParams, function(firstStepData) {
            if (firstStepData.response && firstStepData.response.length > 0) {
                firstStepData.response = self.randomize(firstStepData.response, friendsLimit);
            }
            
            if (typeof(firstStepCallback) === 'function') firstStepCallback(firstStepData);
            
            if (firstStepData.response && firstStepData.response.length > 0) {
                returnCurrentState(0,'...');
                var userFriendsCount = firstStepData.response.length;
                var counter = 0, timeout = 0;
                for(var firstStepKey in firstStepData.response) {
                    (function(k){
                        setTimeout(function(){
                            params.uid = firstStepData.response[k].uid;
                            params.count = 1000;
                            self.getFriendsOf(params, function(secondStepData){
                                counter++;
                                if (secondStepData.response) {
                                    for(var secondStepKey in secondStepData.response) {
                                        if (params.filterSex && !FB.isOppositeSex(secondStepData.response[secondStepKey])) continue;
                                        if (FB.isViewer(secondStepData.response[secondStepKey])) continue;
                                        
                                        secondStepData.response[secondStepKey].mutual = {uid: firstStepData.response[k].uid, f_n: firstStepData.response[k].first_name, p: firstStepData.response[k].photo_medium_rec};
                                        friends.push(secondStepData.response[secondStepKey]);
                                    }
                                } else {
                                    FB.helpers.logger.log(secondStepData);
                                }
                                returnCurrentState(parseInt(counter*100/firstStepData.response.length), firstStepData.response[k].first_name);
                                if (counter === firstStepData.response.length) {
                                    returnResults();
                                }
                            });
                        }, timeout += 550);
                    })(firstStepKey);
                }
                
                /*
                * In case we lost at least one secondStep API response
                * or the responses are very slow
                * just retrieve the currently collected data
                * after the maximum awaiting time
                */
               var awaitingTime = 30*1000;
               if (userFriendsCount > 50) {
                   awaitingTime = 0.7*1000*userFriendsCount;
               } else if (userFriendsCount > 20) {
                   awaitingTime = 1.5*1000*userFriendsCount;
               } else if (userFriendsCount > 5) {
                   awaitingTime = 2.5*1000*userFriendsCount;
               }
               setTimeout(function(){
                   returnCurrentState(100, '...');
                   returnResults(true);
               }, awaitingTime );
                
                
            } else {
                returnResults();
            }            
        });
        
        var returnResults = function(fromTimeout) {
            if (!resultSent) {
                resultSent = true;
                if (typeof(resultsCallback) === 'function') resultsCallback(friends);
                if (fromTimeout) FB.helpers.logger.log('returned from timeout');
            }
        }
        
        var returnCurrentState = function(progress, message) {
            if (!resultSent && typeof(progressCallback) === 'function') {
                progressCallback(progress, message);
            }
        }
        
    }
    
    
    Users.prototype.getSuggestions = function(data, callback)
    {
        if (!FB.viewerData)
            throw 'There is no viewerData';
        
        var postData = {
           user: FB.viewerData,
           users: data,
           viewerFriendsIds: FB.viewerFriendsIds
        }
        
        $.post(FB.appbaseprefix+'/users/analyse', postData, 
            function(response) {
                callback(response);
            },
        "json");
    }
    
    Users.prototype.mergePhotos = function(users, callback)
    {
        if (users.length == 0)
            throw 'No users passed';
        
        var ids = [];
        for (var key in users) {
           ids.push(users[key].uid);
        }
        
        var merge = function(usr, res, kU, kP) {
            usr[kU].first_name = res[kP].first_name;
            usr[kU].last_name = res[kP].last_name;
            usr[kU].photo_medium = res[kP].photo_medium;
            usr[kU].photo_big = res[kP].photo_big; 
            return usr;
        }
        
        var postData = {
           uids: ids.join(),
           fields: "first_name,last_name,photo_medium,photo_big"
        }
        
        this.get(postData, function(data){
            if (data.response) {
                for (var keyP in data.response) {
                    var uid = data.response[keyP].uid;
                    if (users[keyP].uid == uid) {
                        users = merge(users, data.response, keyP, keyP);
                    } else {
                        for(var keyU in users) {
                            if (users[keyU].uid == uid) {
                                users = merge(users, data.response, keyU, keyP); 
                                break;
                            }
                        } 
                    } 
                }
                if (typeof(callback) === 'function') callback(users);
            }
        });
    }

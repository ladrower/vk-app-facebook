
    var View = function()
    {
        this.initialWidth = 827;
        this.initialHeight = 500;
        this.paddingHeight = 50;
    }
    
    View.prototype.resizeWindow = function(w, h)
    {
        VK.callMethod('resizeWindow', w || this.initialWidth, h || this.initialHeight);
    }
    
    View.prototype.generateButton = function(id, className, text, position, color, wide, onClickHandler) {
        var floatClass = (position === 'right') ? 'fl_r' : 'fl_l';
        var colorClass = (color === 'gray') ? 'button_gray' : 'button_blue';
        var buttonWrap = $('<div/>').addClass(floatClass);
        var buttonContainer = $('<div/>').addClass(colorClass);
        if (wide) {
            buttonWrap.addClass('full_width');
            buttonContainer.addClass('button_wide');
        }
        var button = $('<button/>',{
            id: id
        }).text(text);
        
        if (className !== null) button.addClass(className);
        
        if (typeof(onClickHandler) === 'function') {
            button.click(function(event){
                event.preventDefault();
                onClickHandler();
            });
        }
        
        buttonWrap.append(buttonContainer.append(button));
        return buttonWrap;
    }
    
    View.prototype.toolbar = 
    {
        selectorId: 'toolbar',
        position: 'bottom'
    }
    
    View.prototype.toolbar.setPosition = function(position)
    {
        this.position = (position === 'top') ? 'top' : 'bottom';
        $('#'+this.selectorId).removeClass().addClass('position-'+this.position);
    }
    
    View.prototype.toolbar.addButton = function(params,handler)
    {
        if (!$('#'+this.selectorId).is('div')) {
            $("<div/>", {id: this.selectorId}).addClass('position-'+this.position).appendTo("#index-container");
        }
        $('#'+this.selectorId).append(FB.view.generateButton(
            params.id,
            params.className || null,
            params.text || 'ok',
            params.position || 'left',
            params.color || 'blue',
            params.wide || false,
            handler
        ));
        return this;
    }
    
    View.prototype.toolbar.clean = function()
    {
        $('#'+this.selectorId).empty();
        return this;
    }
    
    View.prototype.toolbar.remove = function()
    {
        $('#'+this.selectorId).remove();
        return this;
    }
    
    View.prototype.interestsBox = 
    {
        selectorId: 'interests-box'
    }
    
    View.prototype.interestsBox.construct = function(interests, infoMessage)
    {
        this.remove();
        var box = $("<div/>", {
            id: this.selectorId 
        }).hide().appendTo("#index-container");
        
        var checkboxes = $('<div class="checkboxes-wrap">').appendTo(box);
        for (var iKey in interests) {
            var checkbox = $(
            '<div class="checkbox-container">'+
                '<div class="checkbox"><div class="checkbox_off"></div></div>'+
                '<div class="checkbox_label"></div>'+
            '</div>'
            );
            $(checkbox).find('.checkbox_label').text(interests[iKey].toLowerCase());
            checkboxes.append($(checkbox));
        }
        
        box.prepend($('<div/>').addClass('info-message').text(infoMessage));
        
        $(box).show();
        this.initEvents();
        return this;
    }
    
    View.prototype.interestsBox.selectAllInterests = function()
    {
        var checkboxes = $('#'+this.selectorId).find('.checkbox-container');
        checkboxes.each(function(){
            $(this).removeClass('selected').addClass('selected');
            $(this).find('.checkbox div')[0].className = 'checkbox_on';
        });
    }
    
    View.prototype.interestsBox.getSelectedInterests = function()
    {
        var selected = $('#'+this.selectorId).find(".checkbox-container.selected");
        var interests = [];
        selected.each(function(index) {
            interests.push($(this).find('.checkbox_label').text());
        });
        return interests;
    }
    
    View.prototype.interestsBox.highlightInfoMessage = function()
    {
        var message = $('#'+this.selectorId).find('.info-message');
        message.addClass('highlighted');
        setTimeout(function(){
            message.removeClass('highlighted');
        },5000);
    }
    
    View.prototype.interestsBox.initEvents = function()
    {
        var self = this;
        $('#'+this.selectorId).off();
        $('#'+this.selectorId).on("click", ".checkbox-container", function(event){
            event.preventDefault();
            var cb = $(this).find('.checkbox div');
            var className = '';
            if (cb[0].className.indexOf('_on') === -1) {
                className += 'checkbox_on';
                $(this).addClass('selected');
            } else {
                className += 'checkbox_off';
                $(this).removeClass('selected');
            } 
            if (cb[0].className.indexOf('_hover') !== -1) {
                className += '_hover';
            }
            cb[0].className = className;  
        }); 
        $('#'+this.selectorId).on("mouseenter", ".checkbox-container", function(event){
            var cb = $(this).find('.checkbox div');
            cb[0].className += '_hover';
        });
        $('#'+this.selectorId).on("mouseleave", ".checkbox-container", function(event){
            var cb = $(this).find('.checkbox div');
            cb[0].className = cb[0].className.replace('_hover', '');
        });
        return this;
    }
    
    View.prototype.interestsBox.remove = function(fade)
    {
        if (fade) {
            $("#"+this.selectorId).fadeOut('fast', function(){
                $(this).remove();
            })
        } else {
            $("#"+this.selectorId).remove();
        }
        return this;
    }
    
    View.prototype.carousel = 
    {

    }
    
    View.prototype.carousel.construct = function(usersData)
    {
        this.remove();
        var container = $("<div/>", {
            id: "carousel",
            width: "100%",
            height: "500px"
        }).hide().appendTo("#index-container");

        var count = 0;
        var timeout = 0;
        var cloudLimit = 10;
        var backgroundLimit = 27;
        for (var key in usersData) {
            count++;
            (function(k,c){
                timeout += (c <= cloudLimit) ? 0 : 1000;
                setTimeout(function(){
                    $("<img/>", {
                        'src': usersData[k].photo_medium_rec || usersData[k].photo_medium,
                        'class': ((c <= cloudLimit) ? "cloudcarousel" : "background")
                    }).hide().appendTo(container).fadeIn('slow');  
                }, timeout)
            })(key, count);
            if (count > backgroundLimit) break; 
        }
        
        setTimeout(function(){
            $(container).CloudCarousel(		
                {
                    xPos: 400,
                    yPos: 100,
                    autoRotate: 'right',
                    autoRotateDelay: 1000,
                    speed: 0.02
                }
            ).fadeIn('slow');
        }, 100); 
        return this;
    }
    
    View.prototype.carousel.remove = function(fade)
    {
        if (fade) {
            $("#carousel").fadeOut('slow',function(){
                $("#carousel").remove();
            })
        } else {
            $("#carousel").remove();
        }
        return this;
    }
    
    View.prototype.statusbar = {
        selectorId: 'statusbar'
    }
    
    View.prototype.statusbar.construct = function(value)
    {
        if (!$('#'+this.selectorId).is('div')) {
            $("<div/>", {id: this.selectorId}).prependTo("#index-container");
        }
        if (value) $('#'+this.selectorId).text(value);   
        return this;
    }
    
    View.prototype.statusbar.set = function(value)
    {
        $('#'+this.selectorId).text(value);   
        return this;
    }
    
    View.prototype.progressbar = {
        selectorId: 'progressbar'
    }
    
    View.prototype.progressbar.construct = function(initialValue)
    {
        if (!$('#'+this.selectorId).is('div')) {
            $("<div/>", {id: this.selectorId}).prependTo("#index-container");
        }
        $('#'+this.selectorId).progressbar({
            value: initialValue || 0
        });
        
        return this;
    }
    
    View.prototype.progressbar.animate = function(on)
    {
        if (on || typeof(on) === 'undefined')
            $('#'+this.selectorId).addClass('animated');
        else 
            $('#'+this.selectorId).removeClass('animated');
        return this;
    }
    
    View.prototype.progressbar.move = function(value)
    {
        if (value > 100 || value < 0)
            throw "Incorrect progress value passed";
        $('#'+this.selectorId).progressbar( "option", "value", value );
        return this;
    }
    
    View.prototype.progressbar.remove = function()
    {
        $('#'+this.selectorId).remove();
        return this;
    }
    
    View.prototype.slider = 
    {
        selectorId: 'slider',
        data: null,
        adjustInterval: null
    }
    
    View.prototype.slider.construct = function(photos)
    {
        var self = this;
        if (photos.length === 0) return this;
        
        this.remove();
        this.data = photos;
        
        var slider = $("<div/>", {id: this.selectorId}).addClass('nivoSlider').hide();
        $("<div/>", {id: this.selectorId+'-wrapper'}).append(slider).appendTo("#index-container");
        
        for (var pKey in photos) {
            var src = photos[pKey].src_xbig || photos[pKey].src_big;
            var img = $('<img/>', {
                src: src
            });
            slider.append(img);
        }
        
        $('#'+this.selectorId).nivoSlider({
            animSpeed: 100,
            manualAdvance: true,
            afterChange: function() {
                clearInterval(self.adjustInterval);
                self.adjustInterval = setInterval(function() {
                    self.adjustHeight();
                }, 500);
                self.adjustHeight();
            },
            afterLoad: function() {
                self.initControls(this);
                setTimeout(function(){
                    self.adjustInterval = setInterval(function() {
                        self.adjustHeight();
                    }, 100);
                }, 1000)
            }
        }); 
        
        slider.show();
        return this;
    }
    
    View.prototype.slider.initControls = function(nivoslider)
    {
        var self = this;
        if (typeof(nivoslider) === 'undefined') return this;
        
        FB.view.toolbar.setPosition('top');
        
        FB.view.toolbar.addButton({
            id: 'slider-photo-close',
            text: 'Закрыть фото',
            position: 'right',
            color: 'blue'
        }, self.remove.bind(self));
        
        if (this.data.length > 1) {
            FB.view.toolbar.addButton({
                id: 'slider-photo-next',
                text: 'Вперед',
                position: 'right',
                color: 'gray'
            }, nivoslider.showNext.bind(nivoslider));

            FB.view.toolbar.addButton({
                id: 'slider-photo-prev',
                text: 'Назад',
                position: 'right',
                color: 'gray'
            }, nivoslider.showPrev.bind(nivoslider)); 
        }
        
        FB.view.toolbar.addButton({
            id: 'slider-photo-user-poke',
            text: 'Подмигнуть',
            position: 'left',
            color: 'blue'
        }, FB.showHelloBox.bind(FB));
        
        return this;
    }
    
    View.prototype.slider.adjustHeight = function()
    {
        var slideHeight = $('#'+this.selectorId+'-wrapper').outerHeight(true);

        var height = slideHeight; 
        FB.view.resizeWindow(null, height+FB.view.paddingHeight);
        return this;
    }
    
    View.prototype.slider.clean = function()
    {
        $('#'+this.selectorId).empty();
        clearInterval(this.adjustInterval);
        this.adjustInterval = null;
        FB.view.toolbar.remove();
        FB.view.gallery.adjustHeight();
        return this;
    }
    
    View.prototype.slider.remove = function()
    {
        this.clean();
        $('#'+this.selectorId+'-wrapper').remove();
        return this;
    }
    
    View.prototype.gallery = 
    {
        selectorId: 'gallery',
        data: null,
        slidingRange: 807,
        isBuilding: false,
        galleryDom: null
    }
    
    View.prototype.gallery.construct = function(users)
    {
        var self = this;
        this.data = users;
        
        if (this.data.length > 0) {
            if (!$('#'+this.selectorId).is('div')) {
                $("<div/>", {id: this.selectorId}).prependTo("#index-container").hide();
            }
            self.initSlider();
            self.initEvents(); 
        }
        return this;
    }
    
    View.prototype.gallery.initEvents = function()
    {
        var self = this;
        $('#'+this.selectorId).off();
        $('#'+this.selectorId).on("click", ".btn_previous", function(event){
            event.preventDefault();
            self.showPrevious();
        }); 
        $('#'+this.selectorId).on("click", ".btn_next", function(event){
            event.preventDefault();
            self.showNext();
        });
        $('#'+this.selectorId).on("click", ".photoContainer img", function(event){
            event.preventDefault();
            FB.showUserPhotos();
        });
        $('#'+this.selectorId).on("click", ".mutualContainer a", function(event){
            event.preventDefault();
            FB.showRequestBox();
        });
        $('#'+this.selectorId).on("click", ".user-poke", function(event){
            event.preventDefault();
            FB.showHelloBox();
        });
        $('#'+this.selectorId).on("click", ".user-photos", function(event){
            event.preventDefault();
            FB.showUserPhotos();
        });
   
        
        return this;
    }
    
    View.prototype.gallery.initSlider = function()
    {
        var self = this;
        var initialUserIndex = 0;        
        this.galleryDom = $('#'+this.selectorId);
        this.galleryDom.html('<div class="sliderContainer"></div>');
        this.galleryDom.find(".sliderContainer").data('active-user', initialUserIndex);
        
        if (this.data.length > 1) {
            this.galleryDom.append('<div class="sliderControls">'+
                                '<div class="btn_previous"></div>'+
                                '<div class="btn_next"></div>'+
                            '</div>');
                        
            var previousIndex = (initialUserIndex == 0) ? (this.data.length-1) : (initialUserIndex-1);
            var nextIndex = initialUserIndex+1;
            this.addUser(initialUserIndex);
            this.addUser(previousIndex, 'prev', true);
            this.addUser(nextIndex, 'next');
        } else {
            this.addUser(initialUserIndex);
        }
        this.galleryDom.fadeIn("slow", function(){
            self.adjustHeight();
        });
        return this;
    }
    
    View.prototype.gallery.adjustHeight = function()
    {
        var activeUserContainer = $('#'+this.selectorId+'_userContainer_'+this.getActiveUserIndex());
        var userHeight = activeUserContainer.outerHeight(true);
        
        var defaultHeight = FB.view.initialHeight-FB.view.paddingHeight;
        var height = (userHeight > defaultHeight) ? userHeight : defaultHeight; 
        FB.view.resizeWindow(null, height+FB.view.paddingHeight);
        return this;
    }
    
    View.prototype.gallery.getActiveUserIndex = function()
    {
        var slider = this.galleryDom.find(".sliderContainer");
        return slider.data('active-user');
    }
    
    View.prototype.gallery.showPrevious = function()
    {
        this.slide(false);
        return this;
    }
    
    View.prototype.gallery.showNext = function()
    {
        this.slide(true);
        return this;
    }
    
    View.prototype.gallery.slide = function(next)
    {
        var self = this;
        if (this.isBuilding) return;
        this.isBuilding = true;
        var slider = this.galleryDom.find(".sliderContainer");
        var newIndex = (next) ? (slider.data('active-user')+1) : (slider.data('active-user')-1);
        
        var slideSign = (next) ? '-' : '+';
        slider.find('.userContainer').animate({"left": slideSign+'='+this.slidingRange+'px'}, 200, function() {
            self.rebuildSlider(newIndex);
        });
        return this;
    }
    
    View.prototype.gallery.rebuildSlider = function(newIndex)
    {
        var slider = this.galleryDom.find(".sliderContainer");
        
        var activeIndex = newIndex;
        if (newIndex < 0) {
            activeIndex = this.data.length-1;
        } else if (newIndex >= this.data.length) {
            activeIndex = 0;
        }
        
        slider.data('active-user', activeIndex);
        var activeUserContainer = $('#'+this.selectorId+'_userContainer_'+activeIndex);
        activeUserContainer.removeClass('prev').removeClass('next').addClass('active');
        activeUserContainer.prevAll().remove();
        activeUserContainer.nextAll().remove();
        
        var previousIndex = (activeIndex == 0) ? (this.data.length-1) : (activeIndex-1);
        var nextIndex = (activeIndex >= (this.data.length-1)) ? 0 : activeIndex+1;
        this.addUser(previousIndex, 'prev', true);
        this.addUser(nextIndex, 'next');
        
        this.adjustHeight();
        
        this.isBuilding = false;
        
        return this;
    }
    
    
    View.prototype.gallery.addUser = function(index, className, prepend)
    {   
        if (typeof(this.data[index]) === 'undefined')
            throw 'No user found';
        
        var slider = this.galleryDom.find(".sliderContainer");
        var userClassName = (className) ? ' '+className : ' active';
        var userContainer = $('<div class="userContainer'+userClassName+'" id="'+this.selectorId+'_userContainer_'+index+'">'+
                                '<div class="leftBlock">'+
                                    '<div class="photoContainer"></div>'+
                                    '<div class="actionsContainer"></div>'+
                                '</div>'+
                                '<div class="rightBlock">'+
                                    '<div class="nameContainer"></div>'+
                                    '<div class="interestsContainer"></div>'+
                                    '<div class="mutualContainer"></div>'+
                                '</div>'+
                            '</div>');
        
        if (prepend) {
            slider.prepend(userContainer);
        } else {
            slider.append(userContainer);
        }
        
        var user = this.data[index];
        
        userContainer
            .data('number', index)
            .data('uid', user.uid)
            .find(".photoContainer").append($("<img>", {src: user.photo_big}));
            
        userContainer.find(".actionsContainer")
        .append(FB.view.generateButton(
            'user-pokeTo'+user.uid,
            'user-poke',
            'Поприветсвовать',
            'left',
            'blue',
            true
        )).append(FB.view.generateButton(
            'user-viewPhotos'+user.uid,
            'user-photos',
            'Смотреть фотографии',
            'left',
            'gray',
            true
        ));
        
            
        userContainer.find(".nameContainer").append($("<a>", {href: 'http://vk.com/id'+user.uid}).attr('target','_blank').text(user.first_name+' '+user.last_name));
        
        var interestsContainer = userContainer.find(".interestsContainer");
        interestsContainer.append('<h4>Совпадения по интересам</h4>');
        
        if (user.interests && user.interests.length > 0) {
            interestsContainer.append('<div class="interestsBox interests"><b>Интересы</b>: <span></span></div>');
            interestsContainer.find('.interests span').text(user.interests.join(', '));
        }
        if (user.movies && user.movies.length > 0) {
            interestsContainer.append('<div class="interestsBox movies"><b>Любимые фильмы</b>: <span></span></div>');
            interestsContainer.find('.movies span').text(user.movies.join(', '));
        }
        if (user.tv && user.tv.length > 0) {
            interestsContainer.append('<div class="interestsBox tv"><b>Любимые телешоу</b>: <span></span></div>');
            interestsContainer.find('.tv span').text(user.tv.join(', '));
        }
        if (user.books && user.books.length > 0) {
            interestsContainer.append('<div class="interestsBox books"><b>Любимые книги</b>: <span></span></div>');
            interestsContainer.find('.books span').text(user.books.join(', '));
        }
        if (user.games && user.games.length > 0) {
            interestsContainer.append('<div class="interestsBox games"><b>Любимые игры</b>: <span></span></div>');
            interestsContainer.find('.games span').text(user.games.join(', '));
        } 
        
        var mutualContainer = userContainer.find(".mutualContainer");
        mutualContainer.append($("<h4>").text(user.first_name+' в друзьях у Вашего друга '+ user.mutual.f_n));
        mutualContainer.append($("<a>", {href: 'http://vk.com/id'+user.mutual.uid}).attr('target','_blank').append($("<img>", {src: user.mutual.p})) );
        
        
        return this;
    }
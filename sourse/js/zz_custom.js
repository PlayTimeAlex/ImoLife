(function($) {
    $(document).ready(function(){
        //Проверка на ввод цифр
        $(".js-num").on( "keydown", function(event) {
            if ( $.inArray(event.keyCode,[46,8,9,27,13]) !== -1 ||
                (event.keyCode == 65 && event.ctrlKey === true) ||
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                return;
            } else {
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                    event.preventDefault();
                }
            }
        });

        //wow
        var wow = new WOW();
        wow.init();

        $('.wow[data-wow-delay]').each(function(){
            $(this).css('transitionDelay', $(this).data('wow-delay'));
            console.log('test');
        });

        //fix header
        var $nav = $('.b-topnav');
        $(window).scroll(function(){
            if($(window).scrollTop() > 0){
                $nav.addClass('b-topnav_fixed');
            } else {
                $nav.removeClass('b-topnav_fixed');
            }
        });

        //timer
        timer();
        function timer()
        {
            var now = new Date();
            var newDate = new Date((now.getMonth()+1)+"/"+now.getDate()+"/"+now.getFullYear()+" 23:59:59");
            var totalRemains = (newDate.getTime()-now.getTime());
            if (totalRemains>1)
            {
                var Days = (parseInt(parseInt(totalRemains/1000)/(24*3600)));
                var Hours = (parseInt((parseInt(totalRemains/1000) - Days*24*3600)/3600));
                var Min = (parseInt(parseInt((parseInt(totalRemains/1000) - Days*24*3600) - Hours*3600)/60));
                var Sec = parseInt((parseInt(totalRemains/1000) - Days*24*3600) - Hours*3600) - Min*60;
                if (Days<10){Days="0"+Days}
                if (Hours<10){Hours="0"+Hours}
                if (Min<10){Min="0"+Min}
                if (Sec<10){Sec="0"+Sec}
                $(".b-timer .day").each(function() { $(this).text(Days); });
                $(".b-timer .hour").each(function() { $(this).text(Hours); });
                $(".b-timer .min").each(function() { $(this).text(Min); });
                $(".b-timer .sec").each(function() { $(this).text(Sec); });
                setTimeout(timer, 1000);
            }
        }

        var $header = $('.b-header');
        $(window).scroll(function(){
            if($(window).scrollTop() > 165){
                $header.addClass('fixed');
            } else {
                $header.removeClass('fixed');
            }
        });

        //Плейсхолдер на ИЕ9
        $('input, textarea').placeholder();

        //colorbox
        $('.colorbox_form').colorbox({
            width: 340,
            inline: true,
            className: 'colorbox_form-wind',
            onOpen: function(){
                $('body').css('overflow', 'hidden');
            },
            onClosed: function(){
                $('body').css('overflow', 'visible');
            }
        });

        $(".colorbox-yt").colorbox({
            inline: true,
            innerWidth:640,
            innerHeight:390,
            className: 'colorbox_yt-wind',
            onOpen: function(){
                $('body').css('overflow', 'hidden');
            },
            onClosed: function(){
                $('body').css('overflow', 'visible');
            }
        });

        //Переключение табов
        $('a', '.b-tab__header').click(function(){
            var $parent = $(this).closest('.b-tab');

            $('.b-tab__header a', $parent).removeClass('current');
            $(this).addClass('current');

            $('.b-tab__tab', $parent).removeClass('current');

            $($(this).attr('href')).addClass('current');

            return false;
        });

        //scroll
        function scrollto_c(elem, time) {
            if(time == "undefined") time = 1000;
            $('html, body').animate({
                scrollTop: $(elem).offset().top - 65
            }, time);
        }

        $('.anim-scroll').click(function () {
            scrollto_c($(this).attr('href'));
            return false;
        });

        // Cache selectors
        var topMenu = $(".b-topnav"),
            topMenuHeight = topMenu.outerHeight()+15,
        // All list items
            menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
            scrollItems = menuItems.map(function(){
                var item = $($(this).attr("href"));
                if (item.length) { return item; }
            });

        // Bind to scroll
        $(window).scroll(function(){
            // Get container scroll position
            var fromTop = $(this).scrollTop()+topMenuHeight;
            // Get id of current scroll item
            var cur = scrollItems.map(function(){
                if ($(this).offset().top < (fromTop + 65))
                    return this;
            });
            // Get the id of the current element

            cur = cur[cur.length-1];

            var id = cur && cur.length ? cur[0].id : "";
            // Set/remove active class
            menuItems.removeClass("current").filter("[href=#"+id+"]").addClass("current");
        });

        // Контактная форма
        $('.js-ftext[required]').keyup(function(){
            textValidate($(this));
        });

        $("form" ).on( "submit", function(event) {
            event.preventDefault();

            var $form = $(this);
            if($form.hasClass('sending'))
                return;

            var $filds = $form.find('.js-ftext[required]'),
                sendData =  $form.serialize();

            var  message = {};
            var $output = $form.find('.js-form__output');

            message.empty = false;

            $filds.each(function(){
                if(textValidate($(this)))
                    message.empty = true;
            });

            $output.html('');
            var errHtml = '';

            if(message.empty){
                errHtml += '<p>Заполните обязательные поля</p>';
            }

            if(errHtml){
                $output.addClass('error').removeClass('success').append(errHtml).show('fast', function(){
                    $.colorbox.resize();
                });
                return false;
            } else {
                $output.hide('fast', function(){
                    $.colorbox.resize();
                });
            }

            $.ajax({
                type:"post",
                data: sendData,
                url:"send.php",
                beforeSend: function(){
                    $form.addClass('sending');
                    $('.js-form__submit').addClass('sending');
                },
                complete: function(data){
                    $form.removeClass('sending');
                    $('.js-form__submit').removeClass('sending');
                    $output.append(data.responseText).removeClass('error').show('fast', function(){
                        $.colorbox.resize();
                    });
                    $form[0].reset();
                }
            });
        });

        /*
         * Проверка валидности текстовых полей
         *
         * @param {jQuery object} джейквери объект валидируемого поля.
         *
         * return bool
         * */
        function textValidate(el) {
            var type = el.attr('type');
            if(type == 'text' || type == "email" || type == "tel" || type == ""){
                if(el.val() != ""){
                    el.removeClass('error');
                    return false;
                } else {
                    el.addClass('error');
                    return true;
                }
            }
        };

        $('.b-videos__citem').click(function(){
            $('#js-videow').attr('src', $(this).attr('href'));
            console.log($(this).attr('href'));
            return false;
        });
    });

    $(window).load(function() {
        $('.b-slider').flexslider({
            controlNav: false
        });
        $('.b-flexslider').flexslider({
            animation: "slide",
            animationLoop: false,
            controlNav: false,
            slideshow: false
        });
    });
}(jQuery));
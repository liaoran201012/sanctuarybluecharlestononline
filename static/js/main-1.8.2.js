(function($) {

    "use strict";

    var trawell_app = {

        /* Settings */
        settings: {

            admin_bar: {
                height: 0,
                position: ''
            }

        },


        init: function() {

            this.admin_bar_check();
            this.sticky_sidebar();
            this.accordion_widget();
            this.sticky_header();
            this.fit_vids();
            this.sliders();
            this.instagram_slider();
            this.responsive_sidebar();
            this.header_action_search();
            this.init_load_more_click();
            this.init_infinite_scroll();
            this.scroll_push_state();
            this.scroll_animate();
            this.gutenberg_gallery();
            this.popup();
            this.reverse_menu();
            this.start_kenburns();
            this.object_fit_fix();
            this.video_fallback_image();
            this.animate_counters();
            this.cover_image_parallax();
            this.align_full_fix();

        },


        resize: function() {

            this.admin_bar_check();
            this.sticky_sidebar();
            this.align_full_fix();
        },

        scroll: function() {

        },

        /* Check if WP admin bar is set and get its properties */
        admin_bar_check: function() {

            if ($('#wpadminbar').length && $('#wpadminbar').is(':visible')) {
                this.settings.admin_bar.height = $('#wpadminbar').height();
                this.settings.admin_bar.position = $('#wpadminbar').css('position');
            }

        },

        sticky_sidebar: function() {

            if (!$('.trawell-sidebar-sticky').length) {
                return;
            }

            $('body').imagesLoaded(function() {

                var sidebar_sticky = $('.trawell-sidebar-sticky');
                var top_padding = window.matchMedia('(min-width: 1260px)').matches ? 50 : 30;

                sidebar_sticky.each(function() {

                    var match_media_breakpoint = $(this).parent().hasClass('trawell-sidebar-mini') ? 730 : 1024;
                    var sticky_offset = $('.trawell-header-sticky').length && !trawell_js_settings.header_sticky_up ? $('.trawell-header-sticky').outerHeight() : 0;
                    var admin_bar_offset = trawell_app.settings.admin_bar.position == 'fixed' ? trawell_app.settings.admin_bar.height : 0;

                    var offset_top = sticky_offset + admin_bar_offset + top_padding;

                    if (window.matchMedia('(min-width: ' + match_media_breakpoint + 'px)').matches) {

                        $(this).stick_in_parent({
                            inner_scrolling: true,
                            offset_top: offset_top
                        });

                    } else {

                        $(this).css('height', 'auto');
                        $(this).css('min-height', '1px');
                        $(this).trigger("sticky_kit:detach");
                    }

                });
            });


        },

        accordion_widget: function() {


            /* Add Accordion menu arrows */

            $(".widget").each(function() {

                var menu_item = $(this).find('.menu-item-has-children > a, .page_item_has_children > a, .cat-parent > a');
                menu_item.after('<span class="trawell-accordion-nav"><i class="o-angle-down-1"></i></span>');

            });

            /* Accordion menu click functionality*/
            $('.widget').on('click', '.trawell-accordion-nav', function() {
                $(this).next('ul.sub-menu:first, ul.children:first').slideToggle('fast').parent().toggleClass('active');
            });


        },


        responsive_sidebar: function() {

            /* Hidden sidebar */

            $('body').on('click', '.trawell-hamburger', function() {
                $('body').addClass('trawell-sidebar-action-open trawell-lock');
                var top = trawell_app.settings.admin_bar.position == 'fixed' || $(window).scrollTop() == 0 ? trawell_app.settings.admin_bar.height : 0;

                $('.trawell-sidebar').css('top', top);

            });

            $('body').on('click', '.trawell-action-close, .trawell-body-overlay', function() {
                $('body').removeClass('trawell-sidebar-action-open trawell-lock');
            });

            $(document).keyup(function(e) {
                if (e.keyCode == 27 && $('body').hasClass('trawell-sidebar-action-open')) {
                    $('body').removeClass('trawell-sidebar-action-open trawell-lock');
                }
            });


            //unwrapp responsive menu widget if all other widgets are unwrapped
            var widgets = $('.trawell-sidebar .widget:not(.trawell-responsive-nav)');
            var widgets_unwrapped = $('.trawell-sidebar .widget.widget-no-padding:not(.trawell-responsive-nav)');

            if (widgets.length == widgets_unwrapped.length && widgets.length != 0) {
                $('.trawell-responsive-nav').addClass('widget-no-padding');
            }

        },

        header_action_search: function() {

            $('body').on('click', '.trawell-action-search span', function() {

                $(this).find('i').toggleClass('o-exit-1', 'o-search-1');
                $(this).closest('.trawell-action-search').toggleClass('active');
                setTimeout(function() {
                    $('.active input[type="text"]').focus();
                }, 150);

            });

            $(document).on('click', function(evt) {
                if (!$(evt.target).is('.trawell-action-search span') && $(window).width() < 580) {

                    $('.trawell-action-search.active .sub-menu').css('width', $(window).width());
                }
            });

        },


        sticky_header: function() {

            var sticky = $('.trawell-header-sticky');

            if (trawell_empty(sticky)) {
                return false;
            }

            var trawell_last_top = 0;

            $(window).scroll(function() {
                var top = $(window).scrollTop();
                var sticky_top = trawell_app.settings.admin_bar.position == 'fixed' ? trawell_app.settings.admin_bar.height : 0;

                if (trawell_js_settings.header_sticky_up) {

                    if (trawell_last_top > top && top >= trawell_js_settings.header_sticky_offset) {
                        trawell_app.show_sticky_header(sticky, sticky_top);
                    } else {
                        trawell_app.hide_sticky_header(sticky);
                    }

                } else {

                    if (top >= trawell_js_settings.header_sticky_offset) {
                        trawell_app.show_sticky_header(sticky, sticky_top);
                    } else {
                        trawell_app.hide_sticky_header(sticky);
                    }
                }
                trawell_last_top = top;

            });

        },

        fit_vids: function() {
            var obj = $('.trawell-entry, .widget, .trawell-cover > .container, .trawell-custom-content');
            var iframes = [
                "iframe[src*='youtube.com/embed']",
                "iframe[src*='player.vimeo.com/video']",
                "iframe[src*='kickstarter.com/projects']",
                "iframe[src*='players.brightcove.net']",
                "iframe[src*='hulu.com/embed']",
                "iframe[src*='vine.co/v']",
                "iframe[src*='videopress.com/embed']",
                "iframe[src*='dailymotion.com/embed']",
                "iframe[src*='vid.me/e']",
                "iframe[src*='player.twitch.tv']",
                "iframe[src*='facebook.com/plugins/video.php']",
                "iframe[src*='gfycat.com/ifr/']",
                "iframe[src*='liveleak.com/ll_embed']",
                "iframe[src*='media.myspace.com']",
                "iframe[src*='archive.org/embed']",
                "iframe[src*='w.soundcloud.com/player']",
                "iframe[src*='channel9.msdn.com']",
                "iframe[src*='content.jwplatform.com']",
                "iframe[src*='wistia.com']",
                "iframe[src*='vooplayer.com']",
                "iframe[src*='content.zetatv.com.uy']",
                "iframe[src*='embed.wirewax.com']",
                "iframe[src*='eventopedia.navstream.com']",
                "iframe[src*='cdn.playwire.com']",
                "iframe[src*='drive.google.com']",
                "iframe[src*='videos.sproutvideo.com']"
            ];

            obj.fitVids({
                customSelector: iframes.join(','),
                ignore: '[class^="wp-block"]'
            });
        },


        show_sticky_header: function(sticky, sticky_top) {

            if (trawell_empty(sticky_top)) {
                sticky = 0;
            }

            if (!sticky.hasClass('active')) {
                sticky.css('top', sticky_top);
                sticky.addClass('active');
            }
        },

        hide_sticky_header: function(sticky) {

            if (sticky.hasClass('active')) {
                sticky.removeClass('active');
            }

        },


        sliders: function() {

            $('body').imagesLoaded(function() {

                $('.trawell-cover-gallery .gallery, .trawell-cover-slider, .gallery.gallery-columns-1, .wp-block-gallery.columns-1, .trawell-cover-gallery .wp-block-gallery').each(function() {
                    var $elem = $(this);

                    if (!$elem.hasClass('trawell-cover-slider') && trawell_empty(trawell_js_settings.use_gallery)) {
                        return;
                    }

                    if (!$elem.hasClass('owl-carousel')) {
                        $elem.addClass('owl-carousel');
                    }

                    var columns = $elem.hasClass('wp-block-gallery') ? $elem.attr('class').match(/columns-(\d+)/) : $elem.attr('class').match(/gallery-columns-(\d+)/);
                    var items = trawell_empty(columns) ? 1 : columns[1];
                    var autoplay = false;

                    if ($elem.hasClass('trawell-cover-slider')) {
                        autoplay = trawell_js_settings.home_slider_autoplay ? true : false;
                    }

                    $elem.owlCarousel({
                        rtl: trawell_js_settings.rtl_mode ? true : false,
                        loop: true,
                        nav: true,
                        autoWidth: false,
                        autoHeight: true,
                        autoplay: autoplay,
                        autoplayTimeout: parseInt(trawell_js_settings.home_slider_autoplay_time) * 1000,
                        autoplayHoverPause: true,
                        center: false,
                        fluidSpeed: 300,
                        margin: 0,
                        items: items,
                        navText: ['<i class="o-angle-left-1"></i>', '<i class="o-angle-right-1"></i>'],
                        responsive: {
                            0: {
                                items: items == 1 ? 1 : 2,
                            },
                            729: {
                                items: items == 1 ? 1 : 3,
                            },
                            1024: {
                                items: items == 1 ? 1 : 4,
                            },
                            1200: {
                                items: items,
                            },
                        }
                    });
                });
            });
        },

        instagram_slider: function() {

            var pre_footer_instagram = $('.trawell-pre-footer .meks-instagram-widget');

            if (!pre_footer_instagram.length) {
                return;
            }

            if (!pre_footer_instagram.hasClass('owl-carousel')) {
                pre_footer_instagram.addClass('owl-carousel');
            }

            pre_footer_instagram.owlCarousel({
                rtl: trawell_js_settings.rtl_mode ? true : false,
                loop: true,
                nav: true,
                autoWidth: false,
                center: true,
                fluidSpeed: 300,
                margin: 0,
                items: 5,
                navText: ['<i class="o-angle-left-1"></i>', '<i class="o-angle-right-1"></i>'],
                lazyLoad: true,
                responsive: {
                    0: {
                        items: 2,
                    },
                    729: {
                        items: 3,
                    },
                    1024: {
                        items: 4,
                    },
                    1200: {
                        items: 5,
                    },
                }
            });

        },

        gutenberg_gallery: function() {

            if (trawell_empty(trawell_js_settings.use_gallery)) return;

            var g_gallery = $('.wp-block-gallery');

            if (!g_gallery.length) return;

            $('body').imagesLoaded(function() {

                var images = document.querySelectorAll('.wp-block-gallery img');

                g_gallery.find('a').each(function(i) {
                    var width = images[i].naturalWidth;
                    var height = images[i].naturalHeight;
                    $(this).attr('data-size', JSON.stringify({ 'w': width, 'h': height }));
                });

            });

        },

        popup: function() {


            $('body').on('click', '.gallery-item a, a.trawell-popup-img, .wp-block-gallery a', function(e) {


                if (!$(this).hasClass('trawell-popup-img') && trawell_empty(trawell_js_settings.use_gallery)) { 
                    
                    return false;

                }

                e.preventDefault();


                var pswpElement = document.querySelectorAll('.pswp')[0];

                var items = [];
                var index = 0;
                var opener = $(this);
                var is_owl = opener.closest('.gallery, .wp-block-gallery').hasClass('owl-carousel') ? true : false;
                var popup_items = [];
                var is_gallery = !opener.hasClass('trawell-popup-img');

                if (is_gallery) {
                    popup_items = is_owl ? $(this).closest('.gallery, .wp-block-gallery').find('.owl-item:not(.cloned) .gallery-item a, .owl-item:not(.cloned) .blocks-gallery-item a, .wp-block-gallery a') : $(this).closest('.gallery, .wp-block-gallery').find('.gallery-item a, .blocks-gallery-item a, .wp-block-gallery a');
                } else {
                    popup_items = $('a.trawell-popup-img');
                }

                if (trawell_empty(popup_items)) {
                    return true;
                }

       

                $.each(popup_items, function(ind) {

                    if (opener.attr('href') == $(this).attr('href')) {
                        index = ind;
                    }

                    var size = JSON.parse($(this).attr('data-size'));
                    var item = {
                        src: $(this).attr('href'),
                        w: size.w,
                        h: size.h,
                        title: is_gallery ? $(this).closest('.gallery-item, .blocks-gallery-item').find('figcaption').html() : $(this).closest('figure.wp-caption').find('figcaption').html()
                    };

                    items.push(item);

                });

                var options = {
                    history: false,
                    index: index,
                    preload: [2, 2],
                    captionEl: true,
                    fullscreenEl: false,
                    zoomEl: false,
                    shareEl: false,
                    preloaderEl: true
                };

                var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                gallery.init();

            });



        },

        reverse_menu: function() {

            $('.trawell-header').on('mouseenter', 'ul li', function(e) {

                if ($(this).find('ul').length) {

                    var rt = ($(window).width() - ($(this).find('ul').offset().left + $(this).find('ul').outerWidth()));

                    if (rt < 0) {
                        $(this).find('ul').addClass('trawell-rev');
                    }

                }
            });

        },

        init_load_more_click: function() {
            $('body').on('click', '.load-more > a', function(e) {
                e.preventDefault();
                var $this = $(this),
                    url = $this.attr('href');

                if (!trawell_empty(url)) {
                    trawell_app.load_more({
                        url: url,
                        elem_with_new_url: '.load-more > a'
                    }, function() {});
                }
            });
        },

        init_infinite_scroll: function() {

            if (!trawell_empty($('.trawell-pagination .trawell-infinite-scroll'))) {

                var trawell_infinite_allow = true;

                $(window).scroll(function() {
                    var $pagination = $('.trawell-pagination');

                    if (trawell_empty($pagination)) {
                        return;
                    }

                    if (trawell_infinite_allow && ($(this).scrollTop() > ($pagination.offset().top - $(this).height() - 200))) {

                        trawell_infinite_allow = false;

                        var $load_more_button = $('.trawell-pagination .trawell-infinite-scroll a'),
                            url = $load_more_button.attr('href');

                        trawell_app.load_more({
                            url: url,
                            elem_with_new_url: '.trawell-infinite-scroll a'
                        }, function() {
                            trawell_infinite_allow = true;
                        });

                    }
                });
            }
        },

        load_more: function(args, callback) {
            if (trawell_empty(args)) {
                console.error('Args can\'t be empty');
                return;
            }

            trawell_app.toggle_pagination_loader();

            var defaults = {
                    url: window.location.href,
                    container: '.trawell-posts',
                    elem_with_new_url: '.load-more > a',
                    attr_with_new_url: 'href'
                },
                options = $.extend({}, defaults, args);

            if (trawell_empty(options.url)) {
                console.error('You must provide url to next page');
            }

            $("<div>").load(options.url, function() {
                var $this = $(this),
                    new_url = $this.find(options.elem_with_new_url).attr(options.attr_with_new_url),
                    next_title = $this.find('title').text(),
                    $new_posts = $this.find(options.container).children();

                $new_posts.imagesLoaded(function() {

                    $new_posts.hide().appendTo('.trawell-posts:last').fadeIn();

                    if (window.location.href !== new_url) {

                        if (!trawell_empty(new_url)) {
                            $(options.elem_with_new_url).attr(options.attr_with_new_url, new_url);
                        } else {
                            $(options.elem_with_new_url).closest('.trawell-pagination').fadeOut('fast').remove();
                        }

                        var push_obj = {
                            prev: window.location.href,
                            next: options.url,
                            offset: $(window).scrollTop(),
                            prev_title: window.document.title,
                            next_title: next_title
                        };

                        trawell_app.push_state(push_obj);

                        if (typeof callback === 'function') {
                            callback(true);
                        }
                    } else {
                        $(options.elem_with_new_url).closest('.trawell-pagination').fadeOut('fast').remove();

                        if (typeof callback === 'function') {
                            callback(false);
                        }
                    }

                    trawell_app.toggle_pagination_loader();
                    trawell_app.sticky_sidebar();
                });
            });
        },

        toggle_pagination_loader: function() {
            $('.trawell-pagination').toggleClass('trawell-loader-active');
        },

        push_state: function(args) {
            var defaults = {
                    prev: window.location.href,
                    next: '',
                    offset: $(window).scrollTop(),
                    prev_title: window.document.title,
                    next_title: window.document.title,
                    increase_counter: true
                },
                push_object = $.extend({}, defaults, args);

            if (push_object.increase_counter) {
                trawell_app.pushes.up++;
                trawell_app.pushes.down++;
            }
            delete(push_object.increase_counter);

            trawell_app.pushes.url.push(push_object);
            window.document.title = push_object.next_title;
            window.history.pushState(push_object, '', push_object.next);
        },

        pushes: {
            url: [],
            up: 0,
            down: 0
        },

        scroll_push_state: function() {

            /* Handling URL on ajax call for load more and infinite scroll case */
            if (!trawell_empty($('.trawell-pagination .load-more a')) || !trawell_empty($('.trawell-pagination .trawell-infinite-scroll'))) {

                trawell_app.push_state({
                    increase_counter: false
                });

                var last_up, last_down = 0;

                $(window).scroll(function() {
                    if (trawell_app.pushes.url[trawell_app.pushes.up].offset !== last_up && $(window).scrollTop() < trawell_app.pushes.url[trawell_app.pushes.up].offset) {
                        last_up = trawell_app.pushes.url[trawell_app.pushes.up].offset;
                        last_down = 0;
                        window.document.title = trawell_app.pushes.url[trawell_app.pushes.up].prev_title;
                        window.history.replaceState(trawell_app.pushes.url, '', trawell_app.pushes.url[trawell_app.pushes.up].prev); //1

                        trawell_app.pushes.down = trawell_app.pushes.up;
                        if (trawell_app.pushes.up !== 0) {
                            trawell_app.pushes.up--;
                        }
                    }
                    if (trawell_app.pushes.url[trawell_app.pushes.down].offset !== last_down && $(window).scrollTop() > trawell_app.pushes.url[trawell_app.pushes.down].offset) {
                        last_down = trawell_app.pushes.url[trawell_app.pushes.down].offset;
                        last_up = 0;

                        window.document.title = trawell_app.pushes.url[trawell_app.pushes.down].next_title;
                        window.history.replaceState(trawell_app.pushes.url, '', trawell_app.pushes.url[trawell_app.pushes.down].next);

                        trawell_app.pushes.up = trawell_app.pushes.down;
                        if (trawell_app.pushes.down < trawell_app.pushes.url.length - 1) {
                            trawell_app.pushes.down++;
                        }

                    }
                });

            }
        },

        scroll_animate: function() {

            $('body').on('click', '.trawell-scroll-animate', function(e) {

                e.preventDefault();
                var target = this.hash;
                var $target = $(target);
                var offset = trawell_js_settings.header_sticky ? $('.trawell-header-sticky').height() : 0;

                $('html, body').stop().animate({
                    'scrollTop': $target.offset().top - offset
                }, 900, 'swing', function() {
                    window.location.hash = target;
                });

            });
        },

        start_kenburns: function() {

            if (window.matchMedia('(max-width: 439px)').matches) {
                return false;
            }

            $('body').imagesLoaded(function() {
                $('body.trawell-animation-kenburns').addClass('trawell-animation-kenburns-start');
            });

        },
        object_fit_fix: function() {
            $('body').imagesLoaded(function() {
                objectFitImages('.trawell-item a.entry-image img,.trawell-cover img');
            });

        },

        video_fallback_image: function() {

            if (!trawell_js_settings.home_cover_video_image_fallback) {
                return;
            }

            if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return;
            }

            this.is_autoplay_supported(function(supported) {
                if (!supported) {
                    $('.trawell-cover-video-item video').css('display', 'none');
                    $('.trawell-cover-video-item .trawell-fallback-video-image').css('display', 'block');
                }
            });
        },

        is_autoplay_supported: function(callback) {

            // Is the callback a function?
            if (typeof callback !== 'function') {
                console.log('is_autoplay_supported: Callback must be a function!');
                return false;
            }
            // Check if sessionStorage already exist for autoplay_supported,
            if (!sessionStorage.autoplay_supported) {

                // Create video element to test autoplay
                var video = document.createElement('video');
                video.autoplay = true;
                video.src = 'data:video/mp4;base64,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';
                video.load();
                video.style.display = 'none';
                video.playing = false;
                video.play();
                // Check if video plays
                video.onplay = function() {
                    this.playing = true;
                };
                // Video has loaded, check autoplay support
                video.oncanplay = function() {
                    if (video.playing) {
                        sessionStorage.autoplay_supported = 'true';
                        callback(true);
                    } else {
                        sessionStorage.autoplay_supported = 'false';
                        callback(false);
                    }
                };

            } else {
                // We've already tested for support
                if (sessionStorage.autoplay_supported === 'true') {
                    callback(true);
                } else {
                    callback(false);
                }
            }
        },

        animate_counters: function() {

            if (!trawell_js_settings.home_counter_animate) {
                return;
            }

            var numbers = $('.trawell-numbers');

            if (numbers.length == 0) {
                return;
            }

            var animate = true;

            $(window).scroll(function() {

                var offset_top = numbers.offset().top - window.innerHeight;

                if (animate && $(window).scrollTop() > offset_top) {

                    $('.display-2').each(function() {

                        var $this = $(this),
                            count = $this.attr('data-count');

                        $({ count_start: 0 }).animate({ count_start: count }, {

                            duration: 2000,
                            easing: 'swing',
                            step: function() {
                                $this.text(Math.floor(this.count_start));
                            },
                            complete: function() {
                                $this.text(this.count_start);
                            }

                        });

                    });

                    animate = false;
                }
            });
        },

        cover_image_parallax: function() {

            if (!trawell_js_settings.cover_parallax) {
                return;
            }

            $('.trawell-parallax .trawell-cover-item').css('background-image', 'url(' + $('.trawell-parallax .trawell-cover-item .entry-image img').attr('src') + ')');
        },

        align_full_fix: function() {

            if (!$('body').hasClass('trawell-sidebar-none')) {
                return;
            }

            var style = '.alignfull { width: ' + $(window).width() + 'px; margin-left: -' + $(window).width() / 2 + 'px; margin-right: -' + $(window).width() / 2 + 'px; left:50%; right:50%; }';

            if ($('#trawell-align-fix').length) {
                $('#trawell-align-fix').html(style);
            } else {
                $('head').append('<style id="trawell-align-fix" type="text/css">' + style + '</style>');
            }

        }

    };

    $(document).ready(function() {
        trawell_app.init();
    });

    $(window).resize(function() {
        trawell_app.resize();
    });

    $(window).scroll(function() {
        trawell_app.scroll();
    });


    /**
     * Checks if variable is empty or not
     *
     * @param variable
     * @returns {boolean}
     */
    function trawell_empty(variable) {

        if (typeof variable === 'undefined') {
            return true;
        }

        if (variable === null) {
            return true;
        }

        if (variable.length === 0) {
            return true;
        }

        if (variable === "") {
            return true;
        }

        if (typeof variable === 'object' && $.isEmptyObject(variable)) {
            return true;
        }

        return false;
    }

})(jQuery);
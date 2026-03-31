// js/menu.js
(function (Drupal) {
    'use strict';

    let loadListenerBound = false;
    let ran = false;

    let customSwiper = {
        swipers: [],

        init() {
            document.querySelectorAll('.swiper').forEach((e) => {
                this.initSwiper(e)
            })

            // document.querySelectorAll('.swiper2').forEach((e) => {
            //     this.initSwiper2(e)
            // })
        },

        initSwiper(htmlElement) {
            let options = {
                spaceBetween: 23,
                slidesPerView: htmlElement.getAttribute('slide-views') ? htmlElement.getAttribute('slide-views') : 5,
                slidesOffsetBefore: 0,
                slidesOffsetAfter: 0,
            }

            let hasBreakpoints = htmlElement.getAttribute('has-breakpoints') ? htmlElement.getAttribute('has-breakpoints') : true;

            let allowTouch = htmlElement.getAttribute('allow-touch') ? htmlElement.getAttribute('allow-touch') : true;

            if (hasBreakpoints === "false") {
                hasBreakpoints = false
            }

            if (allowTouch === "false") {
                allowTouch = false
            }

            if (hasBreakpoints) {
                options.breakpoints = {
                    360: {
                        slidesPerView: 1.2,
                        slidesOffsetBefore: 0,
                    },
                    768: {
                        slidesPerView: 2.2,
                        slidesOffsetBefore: 0,
                    },
                    1025: {
                        slidesPerView: 3.2,
                        slidesOffsetBefore: 0,
                    }
                }
            }

            options.allowTouchMove = allowTouch;

            if (htmlElement.getAttribute('navigation')) {
                options.navigation = {
                    nextEl: htmlElement.getAttribute('navigation') + '-next',
                    prevEl: htmlElement.getAttribute('navigation') + '-prev'
                }
            }

            let swiper = new Swiper(htmlElement, options)
            this.swipers.push(swiper)
        },
    }

    function runAfterWindowLoad() {
        if (ran) return;
        ran = true;
        customSwiper.init()
    }

    Drupal.behaviors.customSwiper = {
        attach: function () {
            if (document.readyState === 'complete') {
                runAfterWindowLoad();
            } else if (!loadListenerBound) {
                loadListenerBound = true;
                window.addEventListener('load', runAfterWindowLoad, { once: true });
            }
        }
    };

})(Drupal);

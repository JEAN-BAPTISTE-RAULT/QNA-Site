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

            let allowTouch = htmlElement.getAttribute('allow-touch');
            allowTouch = allowTouch === 'false' ? false : true;

            const rawBreakpoints = htmlElement.getAttribute('data-breakpoints');
            if (rawBreakpoints) {
                try {
                    options.breakpoints = JSON.parse(rawBreakpoints);
                } catch (e) {
                    console.warn('Swiper: data-breakpoints JSON invalide sur', htmlElement, e);
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

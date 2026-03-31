// js/menu.js
(function (Drupal) {
    'use strict';

    let loadListenerBound = false;
    let ran = false;

    let modalVideo = {
        currentModal: undefined,
        currentModalDOM: undefined,

        modalVideoTemplate: `
        <div class="modal modal-centered modal-xl fade modal-video" id="{modalSelector}{modalId}" tabindex="-1" aria-labelledby="{modalSelector}{modalId}Label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="ratio ratio-16x9">{iframe}</div>
                        <i class="icon-X modal-close" data-bs-dismiss="modal" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>`,

        allModals: [],

        init() {
            let _modals = [...document.querySelectorAll('.tempalte-modal-video-content')];

            if(_modals.length > 0) {
                this.allModals = [...document.querySelectorAll('.tempalte-modal-video-content')].map((modalObj)=>{
                    let _modalId = modalObj.getAttribute('modal-id');
                    let _btnSelector = modalObj.getAttribute('button-selector');
                    let _modalSelector = modalObj.getAttribute('modal-selector');
    
                    let _r = {
                        modalId: _modalId,
                        btnSelector: `${_btnSelector}`,
                        modalSelector: `${_modalSelector}`,
                        iframe: document.importNode(modalObj.content.querySelector('iframe'), true)
                    }
    
                    this.setModalEvent(_r);
    
                    return _r;
                });
            };
        },

        createModal(modalOpt) {
            return new Promise((resolve) => {
                const iframeHTML = modalOpt.iframe.outerHTML;
                
                let _modalDOMToDispaly = this.modalVideoTemplate
                    .replace(/{modalId}/g, modalOpt.modalId)
                    .replace(/{modalSelector}/g, modalOpt.modalSelector.substring(1))
                    .replace(/{iframe}/g, iframeHTML);
    
                const parser = new DOMParser();
                const doc = parser.parseFromString(_modalDOMToDispaly, 'text/html');
                this.currentModalDOM = doc.body.firstElementChild;
                document.body.appendChild(this.currentModalDOM);

                resolve();
            });
        },

        openModal(modalSelector) {
            this.currentModal = bootstrap.Modal.getOrCreateInstance(
                document.querySelector(modalSelector)
            );
            this.currentModal.show();

            this.currentModalDOM.addEventListener('hidden.bs.modal', ()=>{
                this.deleteModal(document.querySelector(`#${this.currentModalDOM.id}`));
            });
        },

        deleteModal(element) {
            this.currentModal = undefined;
            this.currentModalDOM = undefined;
            document.body.removeChild(element);
        },

        setModalEvent(modalOpt) {
            let _buttonId = `${modalOpt.btnSelector}${modalOpt.modalId}`;
            let _modalId = `${modalOpt.modalSelector}${modalOpt.modalId}`

            document.querySelector(_buttonId).addEventListener('click', ()=>{
                this.createModal(modalOpt).then(()=>{
                    this.openModal(_modalId);
                })
            })
        }
    }

    function runAfterWindowLoad() {
        if (ran) return;
        ran = true;
        modalVideo.init()
    }

    Drupal.behaviors.modalVideo = {
        attach: function () {
            if (document.readyState === 'complete') {
                runAfterWindowLoad();
            } else if (!loadListenerBound) {
                loadListenerBound = true;
                window.addEventListener('load', runAfterWindowLoad, { once: true });
            }
        }
    };

})(Drupal, bootstrap);

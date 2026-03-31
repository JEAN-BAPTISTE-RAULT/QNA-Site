// js/menu.js
(function (Drupal) {
  'use strict';

  let loadListenerBound = false;
  let ran = false;

  let NeshamaMenu = {
    mainNav: undefined,
    navItems: undefined,
    currentRootActive: undefined,

    addDynamicClass() {
      document.querySelectorAll('.menu--level-1').forEach((item)=>{
        if(!!item.querySelector('.menu--level-3')) {
          item.classList.add('menu-item--has-small-child')
        }
      })
    },

    init() {
      this.mainNav = document.querySelector('.menu-root');

      this.setEvents();
      this.setGlobalEvents();
      this.setMenuClasses();
      this.buildMobileMenu();
    },

    cloneAndPurifyNode(node, options = {}) {
      const {
        allowedAttrNames = [],
        allowedAttrRegex = [],
        allowedClasses = [],
        removeStyle = true,
        removeOnAttr = true
      } = options;

      const clone = node.cloneNode(true);

      function isAttrAllowed(name) {
        if (allowedAttrNames.includes(name)) return true;
        for (const rx of allowedAttrRegex) {
          if (rx.test(name)) return true;
        }
        return false;
      }

      function isClassAllowed(className) {
        for (const c of allowedClasses) {
          if (typeof c === 'string') {
            if (c === className) return true;
          } else if (c instanceof RegExp) {
            if (c.test(className)) return true;
          }
        }
        return false;
      }

      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT, null, false);

      let el = walker.currentNode;
      do {
        if (el.nodeType === Node.ELEMENT_NODE) {
          const attrs = Array.from(el.attributes);
          for (const attr of attrs) {
            const name = attr.name;
            if (removeOnAttr && /^on/i.test(name)) {
              el.removeAttribute(name);
              continue;
            }
            if (removeStyle && name.toLowerCase() === 'style') {
              el.removeAttribute('style');
              continue;
            }
            if (!isAttrAllowed(name)) {
              el.removeAttribute(name);
            }
          }

          if (el.classList && el.classList.length > 0) {
            const keep = [];
            for (const cls of Array.from(el.classList)) {
              if (isClassAllowed(cls)) keep.push(cls);
            }
            if (keep.length > 0) {
              el.className = keep.join(' ');
            } else {
              el.removeAttribute('class');
            }
          }
        }
      } while (walker.nextNode() && (el = walker.currentNode));

      return this.addDepthClasses(clone);
    },

    buildMobileMenu() {
      const menu = this.cloneAndPurifyNode(this.mainNav, {
        allowedAttrNames: ['href']
      });

      let _mebileMenuContainer = document.createElement('div');
      _mebileMenuContainer.className = "menu-mobile-container";

      let _closeButton = document.createElement('i');
      _closeButton.className = "icon-X";
      let _menuLogo = document.querySelector('.block-system-branding-block').cloneNode(true);
      
      let _menuMobileHeader = document.createElement('div');
      _menuMobileHeader.className = "menu-mobile-header";
      _menuMobileHeader.appendChild(_menuLogo);
      _menuMobileHeader.appendChild(_closeButton);

      _mebileMenuContainer.appendChild(_menuMobileHeader);
      _mebileMenuContainer.appendChild(menu);

      document.body.appendChild(_mebileMenuContainer);

      window.setTimeout(()=>{
        this.setMenuMobileEvent();
      })
    },

    addDepthClasses(rootUl) {
      rootUl.classList.add("menu-mobile", "root");

      function traverse(element, depth) {
        if (element.tagName === "LI") {
          element.classList.add('depth', `depth-${depth}`);
        }

        for (const child of element.children) {
          if (child.tagName === "UL") {
            child.classList.add('parent', `parent-${depth}`);
            for (const li of child.children) {
              traverse(li, depth + 1);
            }
          }
        }
      };

      for (const li of rootUl.children) {
        if (li.tagName === "LI") traverse(li, 0);
      };

      for (const li of rootUl.children) {
        if (li.tagName !== "LI") continue;
        if (!li.classList.contains("depth-0")) continue;

        const directChildren = Array.from(li.children);
        const titleDiv = directChildren.find(ch =>
          ch.tagName === "DIV" && ch.querySelector("span")
        );

        const childUl = directChildren.find(ch =>
          ch.tagName === "UL" && ch.classList.contains("parent-0")
        );

        if (!titleDiv || !childUl) continue;

        titleDiv.classList.add('root-title')
        const srcSpan = titleDiv.querySelector("span");
        if (!srcSpan) continue;
        const clonedSpan = srcSpan.cloneNode(true);

        const clonedDiv = document.createElement("div");
        clonedDiv.classList.add('title-back');
        clonedDiv.appendChild(clonedSpan);

        const wrapper = document.createElement("div");
        wrapper.classList.add("parent-wrapper", "parent-wrapper-0");

        li.insertBefore(wrapper, childUl);
        wrapper.appendChild(clonedDiv);
        wrapper.appendChild(childUl);

        if (childUl.querySelector("li.depth-3")) {
          childUl.classList.add("parent-tab");
          childUl.querySelectorAll('.depth-1 > div').forEach((title)=>{
            title.classList.add('parent-tab-title', 'parent-tab-title-1');
          });
          childUl.querySelectorAll('.depth-2 > div').forEach((title)=>{
            title.classList.add('parent-tab-title', 'parent-tab-title-2');
          });
        }
      };

      return rootUl;
    },

    closeAllSubMenuMobile(classToRemove) {
      document.querySelectorAll(`.${classToRemove}`).forEach((item)=>{
        item.classList.remove(classToRemove);
      })
    },

    setMenuMobileEvent() {
      let _root = document.querySelector('.menu-mobile.root');

      _root.querySelectorAll('.root-title').forEach((title)=>{
        title.addEventListener('click', ()=>{
          let _isOpen = title.classList.contains('root-title--active');
          this.closeAllSubMenuMobile("root-title--active");

          if(_isOpen) {
            title.classList.remove('root-title--active');
          }else{
            title.classList.add('root-title--active');
          };
        });
      });

      _root.querySelectorAll('.parent-tab-title-1').forEach((title)=>{
        title.addEventListener('click', ()=>{
          let _isOpen = title.classList.contains('parent-tab-title--active');
          this.closeAllSubMenuMobile("parent-tab-title--active");
          if(_isOpen){
            title.classList.remove('parent-tab-title--active');
          }else{
            title.classList.add('parent-tab-title--active');
          }
        });
      });

      _root.querySelectorAll('.parent-tab-title-2').forEach((title)=>{
        title.addEventListener('click', ()=>{
          let _isOpen = title.classList.contains('parent-tab-title--active');
          _root.querySelectorAll('.parent-tab-title-2.parent-tab-title--active').forEach((opened)=>{
            opened.classList.remove('parent-tab-title--active');
          });

          if(_isOpen) {
            title.classList.remove('parent-tab-title--active');
          }else{
            title.classList.add('parent-tab-title--active');
          };
        });
      });

      _root.querySelectorAll('.title-back').forEach((back)=>{
        back.addEventListener('click', ()=>{
          this.closeAllSubMenuMobile("root-title--active");
          this.closeAllSubMenuMobile("parent-tab-title--active");
        });
      });

      document.querySelectorAll('.button-menu-mobile, .menu-mobile-header .icon-X').forEach((btn)=>{
        btn.addEventListener('click', ()=>{
          let _menu = document.querySelector('.menu-mobile-container');
          let _btn = document.querySelector('.button-menu-mobile');
          this.closeAllSubMenuMobile("root-title--active");
          this.closeAllSubMenuMobile("parent-tab-title--active");
          _menu.classList.toggle('menu-mobile-container--open');

          if(_menu.classList.contains('menu-mobile-container--open')){
            _btn.setAttribute('aria-expanded', true);
          }else{
            _btn.setAttribute('aria-expanded', false);
          };
        })
      })
    },

    setMenuClasses() {
      let _current = this.mainNav.querySelector('.is-active');

      if(_current) {
        _current.closest('.menu-item-root')
                .querySelector('.link-root')
                .classList.add('link-root--active');
        this.currentRootActive = document.querySelector('.link-root--active');
      }
    },

    closeAllSubMenu(subLevel = '') {
      document.querySelectorAll(`.menu-sub${subLevel ? `.menu-sub--${subLevel}` : ''}`).forEach((item)=>{
        item.classList.remove('menu-sub-open')
      });
    },

    closeAllLink(parentItem, linkLevel) {
      parentItem.querySelectorAll(`.link-sub--${linkLevel}`).forEach((link)=>link.classList.remove('link-sub--active'));
      if(linkLevel === '1') parentItem.querySelectorAll(`.link-sub--2`).forEach((link)=>link.classList.remove('link-sub--active'));
    },

    resetLink() {
      this.mainNav.querySelectorAll('.menu-sub--1 .link-sub').forEach((item)=>{
        item.classList.remove('link-sub--active');
      });
    },

    setEvents() {
      this.mainNav.querySelectorAll('.menu-item--expanded > .link').forEach((item)=>{
        item.addEventListener('click', ()=>{
          this.computeDynamicSubMenuHeight(item, true);
          let _currentItem = item.parentNode.querySelector('ul.menu-sub');
          let _isOpen = _currentItem.classList.contains('menu-sub-open');
          let _isInColumn = _currentItem.parentNode.parentNode.classList.contains('menu-sub-column');
          let _isSubLink2 = item.classList.contains('link-sub--2');

          if(item.classList.contains('link-sub')) {
            this.closeAllLink(item.parentNode.parentNode, _isSubLink2 ? '2' : '1');
            item.classList.add('link-sub--active');
          };

          if(item.classList.contains('link-root')) {
            this.closeAllSubMenu();
            this.resetLink();
          };

          if(_isInColumn) {
            this.closeAllSubMenu('2');
            this.closeAllSubMenu('3');
          };
          if(_isSubLink2) this.closeAllSubMenu('3');

          if(_isOpen) {
            _currentItem.classList.remove('menu-sub-open');
          }else{
            _currentItem.classList.add('menu-sub-open');
            this.computeDynamicSubMenuHeight(item);
          };
        });
      });

      const linksRoot = document.querySelectorAll('.link.link-root');

      linksRoot.forEach((link)=>{
        link.addEventListener('click', ()=>{
          let _current = document.querySelector('.link-root--active');
          if(_current) _current.classList.remove('link-root--active');
          link.classList.add('link-root--active');
        })
      })
    },

    computeDynamicSubMenuHeight(currentElement, isReset = false){
      let _offset = 68;
      let _allSubMenuOpen = document.querySelectorAll('.menu-sub-open');

      if(!currentElement.classList.contains('link-root')) {
        let _parent = _allSubMenuOpen[0];
        let _parentHeight = _parent.offsetHeight - _offset;
        let _greatestSubMenuHeight = _parent.offsetHeight - _offset;
        
        _allSubMenuOpen.forEach((subMenu, index)=>{
          if(subMenu.offsetHeight >= _greatestSubMenuHeight && index > 0) {
            _greatestSubMenuHeight = subMenu.offsetHeight;
          };
        });
        
        if(_greatestSubMenuHeight >= _parentHeight && !isReset) {
          _parent.style.height = `${_greatestSubMenuHeight + _offset}px`;
        }else{
          _parent.style.height = 'auto';
        };
      };
    },

    ticking: false,
    last: undefined,

    watchMenuScroll() {
      this.doc = document.scrollingElement || document.documentElement;
      this.last = this.doc.scrollTop || 0;
      this.ticking = false;

      // états précédents pour éviter de réassigner inutilement
      this.prevDirection = null; // 'up' | 'down' | null
      this.prevPosition = null;  // 'top' | 'bottom' | null

      this._onMenuScroll = () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => this.updateMenuScrollClass());
          this.ticking = true;
        }
      };

      window.addEventListener('scroll', this._onMenuScroll, { passive: true });

      // état initial
      this.updateMenuScrollClass();
    },

    updateMenuScrollClass() {
      const doc = this.doc || document.scrollingElement || document.documentElement;
      const body = document.body;

      const current = doc.scrollTop || 0;
      const max = (doc.scrollHeight || 0) - window.innerHeight;
      const nearBottom = max > 0 && Math.ceil(current) >= Math.ceil(max - 1); // tolérance 1px

      // --- POSITION (top / bottom) ---
      let newPosition = null;
      if (current <= 0) newPosition = 'top';
      else if (nearBottom) newPosition = 'bottom';

      // si la position a changé, on met à jour les classes de position
      if (newPosition !== this.prevPosition) {
        // retirer l'ancienne position (s'il y en avait une)
        if (this.prevPosition === 'top') body.classList.remove('at-top');
        if (this.prevPosition === 'bottom') body.classList.remove('at-bottom');

        // ajouter la nouvelle (s'il y en a une)
        if (newPosition === 'top') body.classList.add('at-top');
        if (newPosition === 'bottom') body.classList.add('at-bottom');

        this.prevPosition = newPosition;
      }
      // si newPosition === prevPosition : on ne touche pas aux classes de position

      // --- DIRECTION (up / down) ---
      // on ne change la direction que si on détecte un mouvement (strictement > ou <)
      let newDirection = this.prevDirection; // par défaut on conserve la précédente
      if (current > this.last) newDirection = 'down';
      else if (current < this.last) newDirection = 'up';
      // si current === last : aucun changement de direction, on conserve la valeur précédente

      if (newDirection !== this.prevDirection) {
        // enlever l'ancienne classe direction si existante
        if (this.prevDirection === 'down') body.classList.remove('scroll-down');
        if (this.prevDirection === 'up') body.classList.remove('scroll-up');

        // ajouter la nouvelle classe si existante
        if (newDirection === 'down') body.classList.add('scroll-down');
        if (newDirection === 'up') body.classList.add('scroll-up');

        this.prevDirection = newDirection;
      }
      // si newDirection === prevDirection : on ne touche pas à la classe direction

      // mise à jour de l'état pour la prochaine frame
      this.last = current;
      this.ticking = false;
    },

    setGlobalEvents() {
      window.addEventListener('scroll', () => {
        this.closeAllSubMenu();
      }, { passive: true });

      this.watchMenuScroll();

      document.addEventListener('click', (e) => {
        if (!this.mainNav.contains(e.target)) {
          this.closeAllSubMenu();

          let _current = document.querySelector('.link-root--active');
          if(_current) _current.classList.remove('link-root--active');
          if(this.currentRootActive) this.currentRootActive.classList.add('link-root--active');
        }
      });
    }
  }

  function runAfterWindowLoad() {
    if (ran) return;
    ran = true;
    NeshamaMenu.init();
  }

  Drupal.behaviors.neshamaMenu = {
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

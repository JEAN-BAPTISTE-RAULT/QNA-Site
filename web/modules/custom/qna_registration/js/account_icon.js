(function (Drupal, once) {
  Drupal.behaviors.qnaAccountIcon = {
    attach(context) {
      const widgets = once('nr-account-icon', '.nr-account-icon', context);
      widgets.forEach((wrap) => {
        const button = wrap.querySelector('.nr-account-button');
        const dropdown = wrap.querySelector('.nr-dropdown');
        if (!button || !dropdown) return;

        const close = () => {
          dropdown.hidden = true;
          button.setAttribute('aria-expanded', 'false');
        };

        const open = () => {
          dropdown.hidden = false;
          button.setAttribute('aria-expanded', 'true');
        };

        button.addEventListener('click', (e) => {
          e.preventDefault();
          const expanded = button.getAttribute('aria-expanded') === 'true';
          expanded ? close() : open();
        });

        document.addEventListener('click', (e) => {
          if (!wrap.contains(e.target)) close();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') close();
        });
      });
    }
  };
})(Drupal, once);

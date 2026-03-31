(function (Drupal, once) {
  Drupal.behaviors.neshamaForgotPassword = {
    attach(context) {
      const buttons = once('forgot-pass', '.forgot-pass-button', context);
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const form = btn.closest('form');
          const input =
            form?.querySelector('input[name="name"]') ||
            document.querySelector('#edit-name');

          const value = (input?.value || '').trim();
          if (!value) {
            alert(Drupal.t('Please enter your email address first'));
            input?.focus();
            return;
          }

          const relative = Drupal.url('user/password');
          const url = new URL(relative, window.location.origin);
          url.searchParams.set('name', value);
          window.location.href = url.toString();
        });
      });
    },
  };
})(Drupal, once);
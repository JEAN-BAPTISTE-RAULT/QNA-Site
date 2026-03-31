(function (Drupal, once) {
  Drupal.behaviors.neshamaLoginEye = {
    attach: function (context) {
      const wrappers = once('neshama-login-eye', '.password-with-eye', context);
      wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input[type="password"], input[type="text"]');
        const link = wrapper.querySelector('.password-toggle');
        if (!input || !link) return;

        link.addEventListener('click', function (e) {
          e.preventDefault();
          const isPassword = input.getAttribute('type') === 'password';
          input.setAttribute('type', isPassword ? 'text' : 'password');
          link.textContent = isPassword ? Drupal.t('Hide password') : Drupal.t('Show password');
          link.setAttribute('aria-label', link.textContent);
        });
      });
    }
  };
})(Drupal, once);
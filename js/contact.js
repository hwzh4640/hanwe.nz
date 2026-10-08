(() => {
  'use strict';
  const link = document.getElementById('contact-email');
  link.addEventListener('click', () => {
    const mailbox = ['g01', 'hanwe-nz'].join('.');
    const domain = ['app', 'hzemail', 'com'].join('.');
    link.href = 'mailto:' + mailbox + '@' + domain;
  });
})();

// Pequenas interações e UX dos formulários
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  // Toggle do cadastro doador
  const showRegD = $('#showRegisterDonor');
  const regFormD = $('#registerDonorForm');
  const cancelRegD = $('#cancelRegisterDonor');
  if (showRegD && regFormD) {
    showRegD.addEventListener('click', (e) => {
      e.preventDefault();
      regFormD.classList.remove('hidden');
      showRegD.parentElement.classList.add('hidden');
      const first = regFormD.querySelector('input');
      first && first.focus();
    });
    cancelRegD && cancelRegD.addEventListener('click', () => {
      regFormD.classList.add('hidden');
      showRegD.parentElement.classList.remove('hidden');
    });
  }

  // Toggle do cadastro ONG
  const showRegO = $('#showRegisterOng');
  const regFormO = $('#registerOngForm');
  const cancelRegO = $('#cancelRegisterOng');
  if (showRegO && regFormO) {
    showRegO.addEventListener('click', (e) => {
      e.preventDefault();
      regFormO.classList.remove('hidden');
      showRegO.parentElement.classList.add('hidden');
      const first = regFormO.querySelector('input');
      first && first.focus();
    });
    cancelRegO && cancelRegO.addEventListener('click', () => {
      regFormO.classList.add('hidden');
      showRegO.parentElement.classList.remove('hidden');
    });
  }

  // Banners automáticos via querystring (?ok=... | ?err=...)
  const params = new URLSearchParams(location.search);
  const okMsg = params.get('ok');
  const errMsg = params.get('err');
  if (okMsg || errMsg) {
    const host = document.createElement('div');
    host.className = `banner ${okMsg ? 'ok' : 'err'} show`;
    host.textContent = decodeURIComponent(okMsg || errMsg);
    const card = document.querySelector('.card');
    card && card.prepend(host);
    // limpar a querystring visualmente (sem recarregar do servidor)
    history.replaceState(null, '', location.pathname);
  }

  // Enter envia (melhor UX)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      const form = e.target.closest('form');
      if (form) {
        const submit = form.querySelector('button[type="submit"], .btn:not(.outline)');
        submit && submit.click();
      }
    }
  });
})();
(function () {
  const grid = document.getElementById('pedidosGrid');
  const q = document.getElementById('q');
  const categoria = document.getElementById('categoria');
  const btnFiltrar = document.getElementById('btnFiltrar');

  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelModalBtn = document.getElementById('btnCancelarModal');

  const mPedidoId = document.getElementById('mPedidoId');
  const mTitulo = document.getElementById('mTitulo');
  const mMeta = document.getElementById('mMeta');
  const mDesc = document.getElementById('mDesc');
  const mQtd = document.getElementById('mQtd');

  const dNome = document.getElementById('dNome');
  const dContato = document.getElementById('dContato');
  const dMsg = document.getElementById('dMsg');
  const btnEnviarDoacao = document.getElementById('btnEnviarDoacao');

  // estado do usuário logado
  let meusPedidosIntent = new Set();      // IDs de pedidos em que já doou
  let meuTotalPorPedido = {};             // mapa: pedido_id -> total já doado (quantidade somada)

  async function carregarMinhasIntencoes() {
    try {
      const r = await fetch('php/actions/minhas_intencoes.php', { credentials: 'include' });
      if (!r.ok) { meusPedidosIntent = new Set(); meuTotalPorPedido = {}; return; }
      const data = await r.json();
      if (data && Array.isArray(data.pedido_ids)) {
        meusPedidosIntent = new Set(data.pedido_ids.map(String));
        meuTotalPorPedido = data.totais || {};
      } else {
        meusPedidosIntent = new Set();
        meuTotalPorPedido = {};
      }
    } catch {
      meusPedidosIntent = new Set();
      meuTotalPorPedido = {};
    }
  }

  async function listarPedidos() {
    await carregarMinhasIntencoes();
    try {
      const params = new URLSearchParams();
      if (q.value) params.set('q', q.value);
      if (categoria.value) params.set('categoria', categoria.value);

      grid.innerHTML = '<div class="muted">Carregando pedidos...</div>';

      const res = await fetch(`php/actions/listar_pedidos.php?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        grid.innerHTML = '<div class="muted">Nenhum pedido encontrado.</div>';
        return;
      }
      grid.innerHTML = data.map(p => {
        const ja = meusPedidosIntent.has(String(p.id));
        const meuTot = meuTotalPorPedido[String(p.id)] || 0;
        return cardPedido(p, ja, meuTot);
      }).join('');
      grid.querySelectorAll('[data-open]').forEach(btn => {
        btn.addEventListener('click', () => abrirModal(btn.getAttribute('data-id')));
      });
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div class="muted">Erro ao carregar pedidos.</div>';
    }
  }

  // --- CHIP estiloso “Já doou aqui” + “Você já doou: X (Y%)” + métricas (restante) ---
  function cardPedido(p, jaDoouAntes, meuTotal) {
    const desc = (p.descricao || '').slice(0, 160) + (p.descricao && p.descricao.length > 160 ? '...' : '');
    const restante = typeof p.restante === 'number' ? p.restante : (parseInt(p.restante || '0', 10) || 0);
    const metaQtd = parseInt(p.quantidade || '1', 10) || 1;
    const myPct = Math.min(100, Math.round((Math.max(0, parseInt(meuTotal || 0, 10)) / metaQtd) * 100));

    const checkSVG = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
      </svg>`;

    const chip = jaDoouAntes
      ? `<span class="chip chip--donated chip--right" title="Você já sinalizou pelo menos uma doação para este pedido">${checkSVG} Já doou aqui</span>`
      : '';

    const meuBloco = jaDoouAntes
      ? `
        <small class="muted" style="display:block;margin-top:6px">
          Você já doou: <strong>${meuTotal}</strong> (${myPct}% da meta)
        </small>
        <div style="margin-top:6px;height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden">
          <div style="height:100%;width:${myPct}%;background:#59e0cf"></div>
        </div>
      `
      : '';

    const meta = `
      <div class="row" style="justify-content:space-between;align-items:center;gap:8px">
        <small class="muted">Necessário: ${metaQtd} • Concluídas: ${p.total_concluida || 0} • Restante: ${restante}</small>
        ${chip}
      </div>
      ${meuBloco}
    `;

    return `
      <article class="card" style="padding:12px;background:rgba(255,255,255,.03)">
        <h4>${escapeHTML(p.titulo)}</h4>
        <p class="muted">ONG: ${escapeHTML(p.ong_nome)} • ${escapeHTML(p.categoria || '')}</p>
        ${meta}
        <p>${escapeHTML(desc)}</p>
        <div class="row"><button class="btn" data-open data-id="${p.id}">Ver / Doar</button></div>
      </article>
    `;
  }

  async function abrirModal(id) {
    try {
      const res = await fetch(`php/actions/detalhar_pedido.php?id=${encodeURIComponent(id)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const p = await res.json();

      mPedidoId.value = p.id;
      mTitulo.textContent = p.titulo;
      mMeta.textContent = `ONG: ${p.ong_nome} • ${p.categoria || ''}`;
      mDesc.textContent = p.descricao || '';

      const metaQtd = parseInt(p.quantidade || '1', 10) || 1;
      const restante = p.restante ?? Math.max(0, metaQtd - (p.total_concluida || 0));
      const meuTotal = meuTotalPorPedido[String(p.id)] || 0;
      const myPct = Math.min(100, Math.round((Math.max(0, parseInt(meuTotal || 0, 10)) / metaQtd) * 100));

      mQtd.textContent = `Quantidade necessária: ${metaQtd} (restante: ${restante}) • Você já doou: ${meuTotal} (${myPct}%)`;

      dNome.value = '';
      dContato.value = '';
      dMsg.value = '';
      const qtdInput = document.getElementById('dQtd');
      if (qtdInput) qtdInput.value = '1';

      modal.classList.remove('hidden');
    } catch (err) {
      console.error(err);
    }
  }

  function fecharModal() { modal.classList.add('hidden'); }

  btnFiltrar && btnFiltrar.addEventListener('click', listarPedidos);
  closeModalBtn && closeModalBtn.addEventListener('click', fecharModal);
  cancelModalBtn && cancelModalBtn.addEventListener('click', fecharModal);

  btnEnviarDoacao && btnEnviarDoacao.addEventListener('click', async () => {
    const qtdInput = document.getElementById('dQtd');
    const payload = {
      pedido_id: mPedidoId.value,
      nome: dNome.value.trim(),
      contato: dContato.value.trim(),
      mensagem: dMsg.value.trim(),
      quantidade: Math.max(1, parseInt((qtdInput?.value || '1'), 10))
    };
    if (!payload.pedido_id) return;
    try {
      const res = await fetch('php/actions/registrar_doacao.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) { console.error(await res.text()); return; }

      // recarrega tudo para refletir "restante" e "meu total"
      await listarPedidos();
      fecharModal();
    } catch (err) { console.error(err); }
  });

  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  listarPedidos();
})();
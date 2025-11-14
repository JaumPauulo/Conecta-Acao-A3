(function () {
  const tbody = document.getElementById('tbodyPedidos');
  const badge = document.getElementById('pendentesBadge');

  // modal criar/editar
  const modal = document.getElementById('modalForm');
  const closeForm = document.getElementById('closeForm');
  const btnNovo = document.getElementById('btnNovo');
  const btnCancelar = document.getElementById('btnCancelar');
  const btnSalvar = document.getElementById('btnSalvar');
  const formTitle = document.getElementById('formTitle');
  const pedidoId = document.getElementById('pedidoId');
  const titulo = document.getElementById('titulo');
  const descricao = document.getElementById('descricao');
  const categoria = document.getElementById('categoria');
  const quantidade = document.getElementById('quantidade');

  // modal intenções (kanban 2 colunas)
  const modalInt = document.getElementById('modalIntencoes');
  const closeInt = document.getElementById('closeIntencoes');
  const headerInt = document.getElementById('headerIntencoes');
  const colPendentes = document.getElementById('colPendentes');
  const colConcluidas = document.getElementById('colConcluidas');
  const tituloInt = document.getElementById('tituloIntencoes');

  let pedidoAtualNoModal = null; // id do pedido atualmente aberto no modal

  function abrirForm() { modal.classList.remove('hidden'); }
  function fecharForm() { modal.classList.add('hidden'); limparForm(); }
  function limparForm() { pedidoId.value=''; titulo.value=''; descricao.value=''; categoria.value=''; quantidade.value='1'; }

  function abrirInt() { modalInt.classList.remove('hidden'); }
  function fecharInt() {
    modalInt.classList.add('hidden');
    if (headerInt) headerInt.innerHTML = '';
    if (colPendentes) colPendentes.innerHTML = '';
    if (colConcluidas) colConcluidas.innerHTML = '';
    pedidoAtualNoModal = null;
  }

  const showError = async (res, fb) => {
    // mantém silencioso na maioria dos casos; log no console
    try {
      const raw = await res.text();
      console.error('Request error:', res.status, raw || fb);
    } catch (e) {
      console.error('Request error:', res.status, fb);
    }
  };

  // binds UI
  closeForm && closeForm.addEventListener('click', fecharForm);
  btnCancelar && btnCancelar.addEventListener('click', fecharForm);
  closeInt && closeInt.addEventListener('click', fecharInt);

  btnNovo && btnNovo.addEventListener('click', () => {
    formTitle.textContent = 'Criar Pedido';
    abrirForm();
    setTimeout(() => titulo.focus(), 0);
  });

  btnSalvar && btnSalvar.addEventListener('click', async () => {
    if (!titulo.value.trim()) return;
    const payload = {
      id: pedidoId.value || undefined,
      titulo: titulo.value.trim(),
      descricao: descricao.value.trim(),
      categoria: categoria.value.trim(),
      quantidade: parseInt(quantidade.value || '1', 10)
    };
    try {
      const res = await fetch('php/actions/salvar_pedido.php', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) return showError(res, 'Falha ao salvar.');
      await carregar();
      fecharForm();
    } catch (e) { console.error(e); }
  });

  // carregar tabela pedidos
  async function carregar() {
    tbody.innerHTML = '<tr><td colspan="5" class="muted" style="padding:10px 12px">Carregando...</td></tr>';
    try {
      const res = await fetch('php/actions/meus_pedidos.php', { credentials:'include' });
      if (!res.ok) return showError(res, 'Erro ao carregar pedidos.');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="muted" style="padding:10px 12px">Você ainda não tem pedidos.</td></tr>';
        if (badge) badge.style.display='none';
        return;
      }
      tbody.innerHTML = data.map(rowPedido).join('');
      bindAcoes();

      const totalPend = data.reduce((s,p)=>s+(parseInt(p.pendentes||0,10)),0);
      if (badge) {
        if (totalPend>0) { badge.textContent = `${totalPend} pendente${totalPend>1?'s':''}`; badge.style.display='inline-block'; }
        else { badge.style.display='none'; }
      }
    } catch (e) {
      console.error(e);
      tbody.innerHTML = '<tr><td colspan="5" class="muted" style="padding:10px 12px">Falha de rede ao carregar.</td></tr>';
      if (badge) badge.style.display='none';
    }
  }

  function rowPedido(p) {
    const badgeP = p.pendentes > 0 ? `<span style="margin-left:8px;padding:2px 8px;border-radius:999px;background:#ffe08a;color:#2a1d00;font-size:12px">Pendentes: ${p.pendentes}</span>` : '';
    const rowStyle = p.pendentes > 0 ? 'background:rgba(255,224,138,.12);' : '';
    const rowDone = p.status === 'atendido' ? 'opacity:.75; filter:grayscale(.1);' : '';
    return `
      <tr style="border-top:1px solid rgba(255,255,255,.08); ${rowStyle} ${rowDone}">
        <td style="padding:10px 12px">${escapeHTML(p.titulo)} ${badgeP}</td>
        <td style="padding:10px 12px">${escapeHTML(p.categoria || '')}</td>
        <td style="padding:10px 12px">${escapeHTML(p.quantidade || 1)}</td>
        <td style="padding:10px 12px">${escapeHTML(p.status)}</td>
        <td style="padding:10px 12px; display:flex; gap:6px; flex-wrap:wrap">
          <a href="#" data-intencoes data-id="${p.id}" class="btn">Intenções</a>
          <a href="#" data-edit data-id="${p.id}" class="btn">Editar</a>
          ${p.status === 'ativo' ? `<a href="#" data-done data-id="${p.id}" class="btn outline">Marcar atendido</a>` : ''}
          <a href="#" data-del data-id="${p.id}" class="btn outline">Excluir</a>
        </td>
      </tr>
    `;
  }

  function bindAcoes() {
    tbody.querySelectorAll('[data-edit]').forEach(a =>
      a.addEventListener('click', (e)=>{e.preventDefault(); editar(a.dataset.id);})
    );
    tbody.querySelectorAll('[data-done]').forEach(a =>
      a.addEventListener('click', (e)=>{e.preventDefault(); marcarAtendido(a.dataset.id);})
    );
    tbody.querySelectorAll('[data-del]').forEach(a =>
      a.addEventListener('click', (e)=>{e.preventDefault(); excluir(a.dataset.id);})
    );
    tbody.querySelectorAll('[data-intencoes]').forEach(a =>
      a.addEventListener('click', (e)=>{e.preventDefault(); listarIntencoes(a.dataset.id);})
    );
  }

  async function editar(id) {
    try {
      const res = await fetch(`php/actions/detalhar_pedido.php?id=${encodeURIComponent(id)}`, { credentials:'include' });
      if (!res.ok) return showError(res, 'Erro ao carregar pedido.');
      const p = await res.json();
      pedidoId.value = p.id; titulo.value = p.titulo || '';
      descricao.value = p.descricao || ''; categoria.value = p.categoria || '';
      quantidade.value = p.quantidade || 1;
      formTitle.textContent = 'Editar Pedido';
      abrirForm();
    } catch (e) { console.error(e); }
  }

  async function marcarAtendido(id) {
    if (!confirm('Marcar este pedido como atendido?')) return;
    try {
      const res = await fetch('php/actions/marcar_atendido.php', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, credentials:'include',
        body: JSON.stringify({ id })
      });
      if (!res.ok) return showError(res, 'Falha ao marcar atendido.');
      carregar();
    } catch (e) { console.error(e); }
  }

  async function excluir(id) {
    if (!confirm('Excluir este pedido? Essa ação não pode ser desfeita.')) return;
    try {
      const res = await fetch('php/actions/excluir_pedido.php', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, credentials:'include',
        body: JSON.stringify({ id })
      });
      if (!res.ok) return showError(res, 'Falha ao excluir.');
      carregar();
    } catch (e) { console.error(e); }
  }

  // ====== KANBAN (pendentes/concluídas) ======
  async function listarIntencoes(pedidoId) {
    try {
      pedidoAtualNoModal = pedidoId;

      const res = await fetch(`php/actions/detalhar_pedido.php?id=${encodeURIComponent(pedidoId)}`, { credentials:'include' });
      if (!res.ok) return;
      const p = await res.json();

      const resp = await fetch(`php/actions/intencoes_por_pedido.php?pedido_id=${encodeURIComponent(pedidoId)}`, { credentials:'include' });
      if (!resp.ok) return;
      const ints = await resp.json();

      const totalConcluida = Array.isArray(ints) ? ints.reduce((s, d) => s + ((d.status === 'concluida' ? (parseInt(d.quantidade||1,10)) : 0)), 0) : 0;
      const totalPendente  = Array.isArray(ints) ? ints.reduce((s, d) => s + ((d.status === 'pendente' ? (parseInt(d.quantidade||1,10)) : 0)), 0) : 0;
      const alvo = parseInt(p.quantidade || 1, 10);
      const perc = Math.min(100, Math.round((totalConcluida / Math.max(1, alvo)) * 100));

      tituloInt.textContent = `Intenções — ${p.titulo}`;
      if (headerInt) {
        headerInt.innerHTML = `
          <li class="kcard" style="margin:0">
            <div class="row" style="justify-content:space-between;align-items:center">
              <div><strong>Meta:</strong> ${alvo} • <strong>Concluídas:</strong> ${totalConcluida} • <strong>Pendentes:</strong> ${totalPendente}</div>
              <div class="muted">${perc}%</div>
            </div>
            <div style="margin-top:8px;height:10px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden">
              <div style="height:100%;width:${perc}%;background:#59e0cf"></div>
            </div>
          </li>
        `;
      }

      if (colPendentes) colPendentes.innerHTML = '';
      if (colConcluidas) colConcluidas.innerHTML = '';

      (ints || []).forEach(d => {
        const el = document.createElement('div');
        const q = Math.max(1, parseInt(d.quantidade || 1, 10));
        const actions = d.status === 'pendente'
          ? `<button class="btn" data-done data-id="${d.id}">Marcar concluída</button>
             <button class="btn outline" data-cancel data-id="${d.id}">Cancelar</button>`
          : `<span class="muted">Status: ${escapeHTML(d.status)}</span>`;

        const colorClass = d.status === 'concluida' ? 'green' : 'yellow';
        el.className = 'kcard ' + colorClass;
        el.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
            <div>
              <strong>${escapeHTML(d.nome_doador || 'Doador')}</strong>
              <div class="muted">${escapeHTML(d.contato || '')}</div>
            </div>
            <span class="kbadge">Qtd: <strong>${q}</strong></span>
          </div>
          <div style="margin:6px 0">${escapeHTML(d.mensagem || '')}</div>
          <div class="row">${actions}</div>
        `;

        if (d.status === 'concluida') colConcluidas.appendChild(el);
        else colPendentes.appendChild(el);
      });

      // bind ações (sem alerts)
      modalInt.querySelectorAll('[data-done]').forEach(b =>
        b.addEventListener('click', (e)=>{ e.preventDefault(); setStatusDoacao(b.dataset.id, 'concluida'); })
      );
      modalInt.querySelectorAll('[data-cancel]').forEach(b =>
        b.addEventListener('click', (e)=>{ e.preventDefault(); setStatusDoacao(b.dataset.id, 'cancelada'); })
      );

      abrirInt();
    } catch (e) { console.error(e); }
  }

  async function setStatusDoacao(id, status) {
    try {
      const res = await fetch('php/actions/alterar_status_doacao.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials:'include',
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) return;

      // Atualiza a tabela e o kanban automaticamente, sem alert/fechar modal
      await carregar();
      if (pedidoAtualNoModal) {
        await listarIntencoes(pedidoAtualNoModal);
      }
    } catch (e) { console.error(e); }
  }

  function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  carregar();
})();
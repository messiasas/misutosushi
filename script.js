// =========================================================
// CONFIGURAÇÕES: edite aqui
// =========================================================
const CONFIG = {
  whatsapp: "5500000000000",   // DDI + DDD + número, só dígitos
  mensagemPadrao: "Olá! Vim pelo site do Misuto Sushi e gostaria de mais informações.",
  // 0 = domingo ... 6 = sábado. null = fechado.
  horarios: {
    0: { abre: "11:00", fecha: "16:00" },
    1: null,
    2: { abre: "11:00", fecha: "23:00" },
    3: { abre: "11:00", fecha: "23:00" },
    4: { abre: "11:00", fecha: "23:00" },
    5: { abre: "11:00", fecha: "23:59" },
    6: { abre: "11:00", fecha: "23:59" }
  },
};

// ---------- Utilidades ----------
const waUrl = texto => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
document.getElementById("ano").textContent = new Date().getFullYear();

// Todos os links com data-wa abrem o WhatsApp
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = waUrl(CONFIG.mensagemPadrao);
  a.target = "_blank";
  a.rel = "noopener";
});

// ---------- Menu mobile ----------
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("menu");
const fecharMenu = () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
};
toggle.addEventListener("click", () => {
  const aberto = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", aberto);
  toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", fecharMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });

// ---------- Header muda ao rolar ----------
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ---------- Datas: não permite escolher dias passados ----------
const hojeISO = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().split("T")[0];
document.querySelectorAll('input[type="date"]').forEach(i => (i.min = hojeISO));

// ---------- Formulário → WhatsApp ----------
// Cada campo com data-label vira uma linha da mensagem.
document.querySelectorAll("[data-wa-form]").forEach(form => {
  const status = form.querySelector(".form__status");
  form.addEventListener("submit", e => {
    e.preventDefault();
    let valido = true;
    form.querySelectorAll("[data-label]").forEach(campo => {
      const ok = campo.checkValidity();
      campo.classList.toggle("is-invalid", !ok);
      if (!ok) valido = false;
    });
    if (!valido) {
      status.textContent = "Preencha os campos obrigatórios.";
      form.querySelector(".is-invalid").focus();
      return;
    }
    const linhas = [...form.querySelectorAll("[data-label]")]
      .filter(c => c.value.trim())
      .map(c => {
        const v = c.type === "date" ? c.value.split("-").reverse().join("/") : c.value.trim();
        return `${c.dataset.label}: ${v}`;
      });
    status.textContent = "Abrindo o WhatsApp...";
    window.open(waUrl(`${form.dataset.mensagem}\n\n${linhas.join("\n")}`), "_blank");
    setTimeout(() => (status.textContent = ""), 4000);
  });
  form.querySelectorAll("[data-label]").forEach(c => c.addEventListener("input", () => c.classList.remove("is-invalid")));
});

// Abas do cardápio
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", e => {
    const next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
    if (next) { selectTab(next); next.focus(); }
  });
});

// Horários e selo "Aberto agora"
const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const toMin = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
const agora = new Date();
const hoje = agora.getDay();
const tabela = document.getElementById("horarios");
if (tabela) {
  [1, 2, 3, 4, 5, 6, 0].forEach(d => {
    const h = CONFIG.horarios[d];
    const tr = document.createElement("tr");
    if (d === hoje) tr.className = "is-today";
    tr.innerHTML = `<td>${DIAS[d]}</td><td>${h ? `${h.abre} às ${h.fecha}` : "Fechado"}</td>`;
    tabela.appendChild(tr);
  });
}
const h = CONFIG.horarios[hoje];
const min = agora.getHours() * 60 + agora.getMinutes();
const aberto = !!h && min >= toMin(h.abre) && min < toMin(h.fecha);
const selo = document.getElementById("status");
if (selo) {
  selo.classList.add(aberto ? "is-open" : "is-closed");
  selo.querySelector("span:last-child").textContent = aberto ? "Aberto agora" : "Fechado agora";
}

/**
 * sweetyhard LMS — Ortak Navigasyon & Paylaşımlı Oturum
 * Tüm modüllere <script src="nav.js"></script> ile ekle
 */

(function(){
  const STORAGE_KEY = 'sweetyhard_lms_user';

  const MODULES = [
    { title:'🩸 Hematoloji & Onkoloji', file:'hematoloji_egitim.html' },
    { title:'🔬 Sifiliz',               file:'sifiliz_guncellenmis.html' },
    { title:'🫁 Legionella',             file:'legionella_egitim.html' },
    { title:'🧬 MBL (Metallo-Beta-Laktamaz)', file:'Mbl_egitim_modul.html' },
    { title:'🦠 EBV Klinik Paneli',     file:'EBV_algoritma.html' },
  ];

  // Mevcut sayfa hangi modül?
  const currentFile = location.pathname.split('/').pop() || 'index.html';

  /* ── Oturum yardımcıları ── */
  function getUser()  { return localStorage.getItem(STORAGE_KEY) || ''; }
  function setUser(u) { localStorage.setItem(STORAGE_KEY, u); }
  function clearUser(){ localStorage.removeItem(STORAGE_KEY); }

  /* ── Diğer modüllerin login ekranlarını ortak auth ile pas geç ── */
  window.__lmsGetUser  = getUser;
  window.__lmsSetUser  = setUser;
  window.__lmsClearUser= clearUser;

  /* ── CSS enjekte et ── */
  const style = document.createElement('style');
  style.textContent = `
    #lms-nav{
      position:fixed;bottom:20px;right:20px;z-index:99999;
      font-family:'DM Mono','JetBrains Mono',monospace;
      font-size:12px;
    }
    #lms-nav-bar{
      display:flex;align-items:center;gap:8px;
      background:rgba(10,12,18,.92);
      border:1px solid #2a3348;
      border-radius:40px;
      padding:8px 14px;
      backdrop-filter:blur(14px);
      box-shadow:0 8px 32px rgba(0,0,0,.5);
    }
    #lms-nav .lms-user{
      color:#7a8599;letter-spacing:.04em;
      padding-right:8px;border-right:1px solid #2a3348;
    }
    #lms-nav .lms-user b{color:#dde4f0;}
    #lms-nav a.lms-btn, #lms-nav button.lms-btn{
      background:none;border:none;cursor:pointer;
      color:#7a8599;text-decoration:none;
      padding:4px 10px;border-radius:20px;
      transition:background .15s,color .15s;
      white-space:nowrap;
    }
    #lms-nav a.lms-btn:hover, #lms-nav button.lms-btn:hover{
      background:rgba(255,255,255,.07);color:#dde4f0;
    }
    #lms-nav button.lms-logout{color:#e05252;}
    #lms-nav button.lms-logout:hover{background:rgba(224,82,82,.12);color:#ff6b6b;}
    #lms-dropdown{
      position:absolute;bottom:calc(100% + 8px);right:0;
      background:rgba(15,18,28,.97);
      border:1px solid #2a3348;border-radius:12px;
      padding:8px;min-width:240px;
      box-shadow:0 12px 40px rgba(0,0,0,.6);
      display:none;
    }
    #lms-dropdown.open{display:block;}
    .lms-drop-item{
      display:block;padding:9px 12px;
      border-radius:8px;color:#7a8599;
      text-decoration:none;font-size:12px;
      transition:background .15s,color .15s;
    }
    .lms-drop-item:hover{background:rgba(255,255,255,.06);color:#dde4f0;}
    .lms-drop-item.active{color:#e05252;background:rgba(224,82,82,.08);}
    .lms-drop-label{
      font-size:9px;letter-spacing:.12em;text-transform:uppercase;
      color:#3a4155;padding:4px 12px 8px;
    }
    .lms-sep{border:none;border-top:1px solid #1e2330;margin:4px 0;}
    .lms-home-link{
      display:flex;align-items:center;gap:8px;
      padding:9px 12px;border-radius:8px;
      color:#5a8fd4;text-decoration:none;font-size:12px;
      transition:background .15s;
    }
    .lms-home-link:hover{background:rgba(90,143,212,.1);}
  `;
  document.head.appendChild(style);

  /* ── Nav DOM ── */
  function buildNav(user) {
    const wrap = document.createElement('div');
    wrap.id = 'lms-nav';

    const otherModules = MODULES.filter(m => m.file !== currentFile);

    wrap.innerHTML = `
      <div id="lms-dropdown">
        <div class="lms-drop-label">Modüller</div>
        ${MODULES.map(m=>`
          <a class="lms-drop-item ${m.file===currentFile?'active':''}"
             href="${m.file}">${m.title}${m.file===currentFile?' ← şu an':''}</a>
        `).join('')}
        <hr class="lms-sep">
        <a class="lms-home-link" href="index.html">🏠 Ana Sayfaya Dön</a>
      </div>
      <div id="lms-nav-bar">
        <span class="lms-user">👤 <b>${user}</b></span>
        <a class="lms-btn" href="index.html">🏠 Ana Sayfa</a>
        <button class="lms-btn" id="lms-mod-btn">📚 Modüller ▾</button>
        <button class="lms-btn lms-logout" id="lms-logout-btn">Çıkış ⏏</button>
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById('lms-mod-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('lms-dropdown').classList.toggle('open');
    });
    document.addEventListener('click', () => {
      document.getElementById('lms-dropdown').classList.remove('open');
    });
    document.getElementById('lms-logout-btn').addEventListener('click', () => {
      clearUser();
      // Mevcut modülün logout fonksiyonunu çağır varsa
      if (typeof doLogout === 'function') doLogout();
      else location.href = 'index.html';
    });
  }

  /* ── Modüllerdeki login fonksiyonlarını yakala ── */
  // Sayfa yüklendikten sonra mevcut oturumu uygula
  window.addEventListener('load', () => {
    const user = getUser();

    if (user) {
      buildNav(user);
      // Eğer modülde login ekranı varsa ve hâlâ açıksa otomatik geç
      const loginScreen = document.getElementById('loginScreen');
      const app = document.getElementById('app');
      if (loginScreen && app) {
        // Modüle özgü giriş mantığını tetikle
        if (typeof autoLogin === 'function') {
          autoLogin(user);
        } else {
          // Genel: loginScreen gizle, app göster
          loginScreen.style.display = 'none';
          app.style.display = 'block';
          // Kullanıcı adı alanlarını doldur
          const nameEl = document.getElementById('topbarUser') ||
                         document.getElementById('userNameEl');
          if (nameEl) nameEl.textContent = user;
          const avatarEl = document.getElementById('avatarEl');
          if (avatarEl) avatarEl.textContent = user[0].toUpperCase();
        }
      }
    }
  });

  /* ── Login formlarından kullanıcı adını yakala ve kaydet ── */
  document.addEventListener('DOMContentLoaded', () => {
    // index.html hariç modüllerde login butonunu izle
    if (currentFile === 'index.html') return;

    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    // Orijinal click handler'a ek olarak kullanıcı adını kaydet
    loginBtn.addEventListener('click', () => {
      setTimeout(() => {
        const nameInput = document.getElementById('loginName') ||
                          document.getElementById('loginUser');
        if (nameInput && nameInput.value.trim()) {
          setUser(nameInput.value.trim());
          // Nav'ı ekle (henüz yoksa)
          if (!document.getElementById('lms-nav')) {
            buildNav(nameInput.value.trim());
          }
        }
      }, 300);
    });
  });

})();

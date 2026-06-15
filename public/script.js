/* ==========================================
   API BASE URL & STATE
   ========================================== */
const API = '/api';
let currentFilter = 'All';
let currentSearch = '';
let cachedTeam = []; // Local cache of team data for instant search/filter

/* ==========================================
   THEME MANAGEMENT
   ========================================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('nexus_theme', theme); // Only theme uses localStorage now
  themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}
setTheme(localStorage.getItem('nexus_theme') || 'dark');
themeToggle.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ==========================================
   NAVBAR
   ========================================== */
const navbar = document.querySelector('.navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
navToggle.addEventListener('click', () => { const o = navLinks.classList.toggle('open'); navToggle.setAttribute('aria-expanded', o); });
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }));

/* ==========================================
   DATA FETCHING FROM BACKEND
   ========================================== */
async function fetchCompany() {
  try {
    const res = await fetch(`${API}/company`);
    if (!res.ok) throw new Error('Failed to fetch company');
    return await res.json();
  } catch (err) {
    showToast('Error loading company data: ' + err.message, 'error');
    return null;
  }
}

async function fetchTeam() {
  try {
    const res = await fetch(`${API}/team`);
    if (!res.ok) throw new Error('Failed to fetch team');
    cachedTeam = await res.json();
    return cachedTeam;
  } catch (err) {
    showToast('Error loading team data: ' + err.message, 'error');
    return [];
  }
}

async function addMemberAPI(formData) {
  try {
    const res = await fetch(`${API}/team`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to add member');
    return await res.json();
  } catch (err) {
    showToast('Error adding member: ' + err.message, 'error');
    return null;
  }
}

async function updateMemberAPI(id, formData) {
  try {
    const res = await fetch(`${API}/team/${id}`, { method: 'PUT', body: formData });
    if (!res.ok) throw new Error('Failed to update member');
    return await res.json();
  } catch (err) {
    showToast('Error updating member: ' + err.message, 'error');
    return null;
  }
}

async function deleteMemberAPI(id) {
  try {
    const res = await fetch(`${API}/team/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete member');
    return await res.json();
  } catch (err) {
    showToast('Error deleting member: ' + err.message, 'error');
    return null;
  }
}

async function updateCompanyAPI(data) {
  try {
    const res = await fetch(`${API}/company`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    });
    if (!res.ok) throw new Error('Failed to update company');
    return await res.json();
  } catch (err) {
    showToast('Error saving company: ' + err.message, 'error');
    return null;
  }
}

/* ==========================================
   RENDER COMPANY INFO
   ========================================== */
function renderCompany(c) {
  if (!c) return;
  document.getElementById('heroCompanyName').textContent = c.name;
  document.getElementById('heroDescription').textContent = c.description;
  document.getElementById('missionText').textContent = c.mission;
  document.getElementById('visionText').textContent = c.vision;
  
  // Stats are hardcoded in HTML for simplicity, but could be in DB
  document.getElementById('heroStats').innerHTML = `
    <div class="hero-stat"><span class="hero-stat-number" data-target="127">0+</span><span class="hero-stat-label">Projects</span></div>
    <div class="hero-stat-divider"></div>
    <div class="hero-stat"><span class="hero-stat-number" data-target="24">0</span><span class="hero-stat-label">Team Members</span></div>
    <div class="hero-stat-divider"></div>
    <div class="hero-stat"><span class="hero-stat-number" data-target="14">0</span><span class="hero-stat-label">Countries</span></div>`;
  
  animateHeroCounters();
}

function animateHeroCounters() {
  document.querySelectorAll('.hero-stat-number').forEach(el => {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.textContent.replace(/[0-9]/g, '');
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / 2000, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(update);
    })(start);
  });
}

/* ==========================================
   RENDER TEAM GRID
   ========================================== */
function getRoles() {
  return [...new Set(cachedTeam.map(m => m.role))].sort();
}

function buildFilters() {
  const group = document.getElementById('filterGroup');
  group.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = `filter-btn${currentFilter === 'All' ? ' active' : ''}`;
  allBtn.textContent = 'All';
  allBtn.onclick = () => { currentFilter = 'All'; buildFilters(); renderTeam(); };
  group.appendChild(allBtn);

  getRoles().forEach(role => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${currentFilter === role ? ' active' : ''}`;
    btn.textContent = role;
    btn.onclick = () => { currentFilter = role; buildFilters(); renderTeam(); };
    group.appendChild(btn);
  });
}

function renderTeam() {
  const grid = document.getElementById('teamGrid');
  const empty = document.getElementById('emptyState');
  const search = currentSearch.toLowerCase().trim();
  
  const filtered = cachedTeam.filter(m => {
    return (currentFilter === 'All' || m.role === currentFilter) && 
           (!search || m.name.toLowerCase().includes(search));
  });

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.style.display = 'none'; empty.style.display = 'block';
  } else {
    grid.style.display = ''; empty.style.display = 'none';
    filtered.forEach((m, i) => grid.appendChild(createCard(m, i)));
  }
  renderAdminList();
}

function createCard(m, i) {
  const card = document.createElement('article');
  card.className = 'team-card';
  card.style.animationDelay = `${i * 0.08}s`;
  card.setAttribute('tabindex', '0');
  card.onclick = () => openModal(m);
  card.onkeydown = (e) => { if (e.key === 'Enter') openModal(m); };

  let socials = '';
  if (m.linkedin) socials += `<a href="${m.linkedin}" target="_blank" onclick="event.stopPropagation()" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>`;
  if (m.github) socials += `<a href="${m.github}" target="_blank" onclick="event.stopPropagation()" aria-label="GitHub"><i class="fab fa-github"></i></a>`;
  if (!socials) socials = '<span style="color:rgba(255,255,255,0.4);font-size:0.78rem;">No links</span>';

  card.innerHTML = `
    <div class="team-card-image">
      <img src="${m.image || `https://picsum.photos/seed/${m.id}/400/500.jpg`}" alt="${m.name}" loading="lazy">
      <span class="team-card-role">${m.role}</span>
      <div class="team-card-overlay"><div class="team-card-socials">${socials}</div></div>
    </div>
    <div class="team-card-info"><h3>${m.name}</h3><p>${m.bio}</p></div>`;
  return card;
}

/* ==========================================
   SEARCH & FILTER
   ========================================== */
document.getElementById('searchInput').addEventListener('input', function() {
  currentSearch = this.value;
  document.getElementById('searchClear').style.display = currentSearch ? 'flex' : 'none';
  renderTeam();
});
document.getElementById('searchClear').addEventListener('click', function() {
  document.getElementById('searchInput').value = ''; currentSearch = ''; this.style.display = 'none';
  renderTeam();
});
document.getElementById('resetFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value = ''; currentSearch = ''; currentFilter = 'All';
  document.getElementById('searchClear').style.display = 'none'; buildFilters(); renderTeam();
});

/* ==========================================
   MODAL
   ========================================== */
function openModal(m) {
  const body = document.getElementById('modalBody');
  let socials = '';
  if (m.linkedin) socials += `<a href="${m.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i> LinkedIn</a>`;
  if (m.github) socials += `<a href="${m.github}" target="_blank"><i class="fab fa-github"></i> GitHub</a>`;
  
  body.innerHTML = `
    <div class="modal-image"><img src="${m.image || `https://picsum.photos/seed/${m.id}/600/400.jpg`}" alt="${m.name}"></div>
    <span class="modal-role">${m.role}</span>
    <h2 class="modal-name">${m.name}</h2>
    <p class="modal-bio">${m.bio}</p>
    ${socials ? `<div class="modal-socials">${socials}</div>` : ''}`;
  
  document.getElementById('memberModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('memberModal').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modalClose').onclick = closeModal;
document.getElementById('memberModal').onclick = (e) => { if (e.target.id === 'memberModal') closeModal(); };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('memberModal').classList.contains('active')) closeModal();
    else if (document.getElementById('adminPanel').classList.contains('open')) closeAdmin();
  }
});

/* ==========================================
   ADMIN PANEL LOGIC
   ========================================== */
function openAdmin() {
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('adminOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  populateCompanyForm();
}
function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('adminOverlay').classList.remove('active');
  document.body.style.overflow = '';
  resetMemberForm();
}

document.getElementById('adminToggle').onclick = openAdmin;
document.getElementById('adminClose').onclick = closeAdmin;
document.getElementById('adminOverlay').onclick = closeAdmin;

// Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  };
});

// Company Form
async function populateCompanyForm() {
  const c = await fetchCompany();
  if (!c) return;
  document.getElementById('companyName').value = c.name;
  document.getElementById('companyTagline').value = c.tagline;
  document.getElementById('companyDescription').value = c.description;
  document.getElementById('companyMission').value = c.mission;
  document.getElementById('companyVision').value = c.vision;
}

document.getElementById('companyForm').onsubmit = async (e) => {
  e.preventDefault();
  // Basic validation
  let valid = true;
  ['companyName', 'companyDescription', 'companyMission', 'companyVision'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('error'); document.getElementById(id+'Error').textContent='Required'; valid=false; }
    else { el.classList.remove('error'); document.getElementById(id+'Error').textContent=''; }
  });
  if (!valid) return;

  const res = await updateCompanyAPI({
    name: document.getElementById('companyName').value.trim(),
    tagline: document.getElementById('companyTagline').value.trim(),
    description: document.getElementById('companyDescription').value.trim(),
    mission: document.getElementById('companyMission').value.trim(),
    vision: document.getElementById('companyVision').value.trim()
  });

  if (res) {
    showToast(res.message, 'success');
    const c = await fetchCompany();
    renderCompany(c);
  }
};

// Team Member Form
let uploadedFile = null;
document.getElementById('memberImageUpload').onchange = function() {
  if (this.files[0]) {
    if (this.files[0].size > 500000) { showToast('Image must be under 500KB', 'error'); this.value=''; return; }
    uploadedFile = this.files[0];
    document.getElementById('uploadPreviewImg').src = URL.createObjectURL(uploadedFile);
    document.getElementById('uploadPreview').style.display = 'inline-block';
  }
};
document.getElementById('removeUpload').onclick = () => {
  uploadedFile = null; document.getElementById('memberImageUpload').value = '';
  document.getElementById('uploadPreview').style.display = 'none';
};

document.getElementById('memberForm').onsubmit = async (e) => {
  e.preventDefault();
  let valid = true;
  if (!document.getElementById('memberName').value.trim()) { document.getElementById('memberName').classList.add('error'); document.getElementById('nameError').textContent='Required'; valid=false; }
  else { document.getElementById('memberName').classList.remove('error'); document.getElementById('nameError').textContent=''; }
  
  if (!document.getElementById('memberRole').value) { document.getElementById('memberRole').classList.add('error'); document.getElementById('roleError').textContent='Select role'; valid=false; }
  else { document.getElementById('memberRole').classList.remove('error'); document.getElementById('roleError').textContent=''; }

  if (!document.getElementById('memberBio').value.trim()) { document.getElementById('memberBio').classList.add('error'); document.getElementById('bioError').textContent='Required'; valid=false; }
  else { document.getElementById('memberBio').classList.remove('error'); document.getElementById('bioError').textContent=''; }
  
  if (!valid) return;

  const formData = new FormData();
  formData.append('name', document.getElementById('memberName').value.trim());
  formData.append('role', document.getElementById('memberRole').value);
  formData.append('bio', document.getElementById('memberBio').value.trim());
  formData.append('linkedin', document.getElementById('memberLinkedIn').value.trim());
  formData.append('github', document.getElementById('memberGitHub').value.trim());
  
  if (uploadedFile) {
    formData.append('image', uploadedFile);
  } else {
    formData.append('image', document.getElementById('memberImage').value);
  }

  const editId = document.getElementById('memberId').value;
  const res = editId ? await updateMemberAPI(editId, formData) : await addMemberAPI(formData);

  if (res) {
    showToast(res.message, 'success');
    resetMemberForm();
    cachedTeam = await fetchTeam(); // Refresh cache
    buildFilters();
    renderTeam();
  }
};

function resetMemberForm() {
  document.getElementById('memberForm').reset();
  document.getElementById('memberId').value = '';
  uploadedFile = null;
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('formTitle').textContent = 'Add New Member';
  document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-plus"></i> Add Member';
  document.getElementById('formCancelBtn').style.display = 'none';
  document.querySelectorAll('#tab-team .form-error').forEach(e => e.textContent='');
  document.querySelectorAll('#tab-team .error').forEach(e => e.classList.remove('error'));
}
document.getElementById('formCancelBtn').onclick = resetMemberForm;

// Admin List
function renderAdminList() {
  const list = document.getElementById('adminList');
  document.getElementById('adminCount').textContent = cachedTeam.length;
  list.innerHTML = '';
  if (cachedTeam.length === 0) { list.innerHTML = '<p style="text-align:center;color:var(--fg-muted);padding:1rem">No members found.</p>'; return; }

  cachedTeam.forEach(m => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = `
      <div class="admin-list-avatar"><img src="${m.image || `https://picsum.photos/seed/${m.id}/100/100.jpg`}" alt="${m.name}" loading="lazy"></div>
      <div class="admin-list-info"><h4>${m.name}</h4><span>${m.role}</span></div>
      <div class="admin-list-actions">
        <button class="edit-btn" data-id="${m.id}" aria-label="Edit"><i class="fas fa-pen"></i></button>
        <button class="delete-btn" data-id="${m.id}" aria-label="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
    list.appendChild(item);
  });

  list.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const m = cachedTeam.find(x => x.id === btn.dataset.id);
      if(!m) return;
      document.getElementById('memberId').value = m.id;
      document.getElementById('memberName').value = m.name;
      document.getElementById('memberRole').value = m.role;
      document.getElementById('memberImage').value = m.image;
      document.getElementById('memberBio').value = m.bio;
      document.getElementById('memberLinkedIn').value = m.linkedin;
      document.getElementById('memberGitHub').value = m.github;
      document.getElementById('formTitle').textContent = 'Edit Member';
      document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
      document.getElementById('formCancelBtn').style.display = '';
      document.querySelector('.admin-form-section').scrollIntoView({behavior:'smooth'});
    };
  });

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async function() {
      if (this.classList.contains('confirming')) {
        const res = await deleteMemberAPI(this.dataset.id);
        if (res) {
          showToast(res.message, 'success');
          cachedTeam = await fetchTeam();
          buildFilters();
          renderTeam();
        }
        return;
      }
      this.classList.add('confirming');
      this.innerHTML = '<i class="fas fa-check"></i>';
      this.style.background = 'var(--danger-bg)'; this.style.borderColor = 'var(--error)'; this.style.color = 'var(--error)';
      setTimeout(() => { if(this) { this.classList.remove('confirming'); this.innerHTML='<i class="fas fa-trash"></i>'; this.style.background=''; this.style.borderColor=''; this.style.color=''; }}, 3000);
    };
  });
}

/* ==========================================
   SCROLL REVEAL & MISC
   ========================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }});
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function showToast(msg, type='info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':type==='error'?'exclamation-circle':'info-circle'}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => { t.classList.add('out'); t.addEventListener('animationend', () => t.remove()); }, 3500);
}

document.getElementById('contactBtn').onclick = () => showToast("Message received! We'll be in touch within 24 hours.", 'success');
document.querySelectorAll('.footer-socials a').forEach(l => l.onclick = (e) => { e.preventDefault(); showToast('Opening '+l.getAttribute('aria-label')+'...'); });

/* ==========================================
   DATABASE TAB LOGIC (Export/Import/Reset)
   ========================================== */
function updateDBStats() {
  document.getElementById('dbTeamCount').textContent = cachedTeam.length;
  document.getElementById('dbRolesCount').textContent = getRoles().length;
}

// Export: Trigger browser download from API
document.getElementById('exportBtn').addEventListener('click', () => {
  // Simply open the API endpoint in a new tab/window to trigger download
  window.location.href = `${API}/export`;
  showToast('Downloading database export...', 'success');
});

// Import: Read file, parse JSON, send to API
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async function() {
  const file = this.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const res = await fetch(`${API}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      
      const result = await res.json();
      showToast(result.message, 'success');
      
      // Refresh the page data
      const company = await fetchCompany();
      renderCompany(company);
      cachedTeam = await fetchTeam();
      buildFilters();
      renderTeam();
      updateDBStats();
      
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  this.value = ''; // Reset file input
});

// Reset: Two-click confirmation, then call API
document.getElementById('resetBtn').addEventListener('click', async function() {
  if (this.classList.contains('confirming')) {
    try {
      const res = await fetch(`${API}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset');
      const result = await res.json();
      
      showToast(result.message, 'success');
      this.classList.remove('confirming');
      this.innerHTML = '<i class="fas fa-trash-can"></i> Reset Database';
      this.style.background = ''; this.style.color = '';
      
      // Refresh page data
      const company = await fetchCompany();
      renderCompany(company);
      cachedTeam = await fetchTeam();
      buildFilters();
      renderTeam();
      updateDBStats();
      resetMemberForm();
      
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
    return;
  }

  this.classList.add('confirming');
  this.innerHTML = '<i class="fas fa-check"></i> Click Again to Confirm';
  this.style.background = 'var(--danger-bg)';
  this.style.color = 'var(--error)';

  setTimeout(() => {
    if (this.classList.contains('confirming')) {
      this.classList.remove('confirming');
      this.innerHTML = '<i class="fas fa-trash-can"></i> Reset Database';
      this.style.background = ''; this.style.color = '';
    }
  }, 4000);
});

// Update stats when switching to Database tab
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.onclick = function() {
    // ... keep existing tab switching code, but add this line:
    if (this.dataset.tab === 'database') updateDBStats();
  };
});

/* ==========================================
   INITIALIZATION - Fetch from Backend on Load
   ========================================== */
async function init() {
  const company = await fetchCompany();
  renderCompany(company);
  
  await fetchTeam();
  buildFilters();
  renderTeam();
}

init();
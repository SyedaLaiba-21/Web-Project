// LOADER 
let pct = 0;
const loaderInterval = setInterval(() => {
  pct += Math.floor(Math.random() * 18) + 5;
  if (pct >= 100) { pct = 100; clearInterval(loaderInterval); }
  document.getElementById('loaderPct').textContent = `LOADING · ${pct}%`;
  if (pct === 100) {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader.classList.add('fade-out');
      setTimeout(() => loader.style.display = 'none', 850);
    }, 400);
  }
}, 160);

// EMOJIS 
const EMOJIS = ['🍝','🥩','🍗','🐟','🦞','🥗','🍲','🍜','🥘','🍱','🍣','🍛','🥐','🧁','🍮','🍰','🎂','🍩','🍪','🧇','🥞','🥓','🌮','🌯','🍕','🍔','🌭','🥙','🥚','🍿','🧆','🥜','🫘','🥦','🥕','🥑','🍅','🍋','🫐','🍓','🍒','🍑','🍍','🥝','🫖','☕','🍵','🧋','🥤','🍹','🍸','🥂','🍾'];

// MENU ITEMS (12 dishes with Unsplash images) 

const API_URL = "http://localhost:5000/api/menu";
const CAT_API_URL = "http://localhost:5000/api/categories";
const SPECIAL_API_URL = "http://localhost:5000/api/specials";

let menuItems = [];
let categories = [];
let specials = [];

let orders = [
  { id:'#2042', table:'Table 3', items:'Beef Bourguignon × 2, Crème Brûlée × 2', total:'8000', time:'8:42 PM', status:'preparing' },
  { id:'#2043', table:'Table 7', items:'Truffle Arancini × 1, Tiramisu × 2', total:'3800', time:'8:55 PM', status:'pending' },
  { id:'#2044', table:'Table 11', items:'Grilled Sea Bass × 2, Lobster Bisque × 1', total:'7900', time:'9:01 PM', status:'ready' },
  { id:'#2045', table:'Table 2', items:'Caesar Salad × 3, Wagyu Burger × 1', total:'6500', time:'9:08 PM', status:'preparing' },
  { id:'#2046', table:'Table 5', items:'Mango Cheesecake × 4', total:'4800', time:'9:12 PM', status:'served' },
  { id:'#2047', table:'Table 8', items:'Eggs Benedict × 2, Champagne Punch × 2', total:'8200', time:'9:18 PM', status:'pending' },
  { id:'#2048', table:'Table 1', items:'Lamb Rack × 1, Crème Brûlée × 1', total:'4900', time:'9:25 PM', status:'preparing' },
];


async function loadMenuItems() {
  try {

    const response = await fetch(API_URL);

    const data = await response.json();

    menuItems = data.map(item => ({
      id: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      desc: item.description,
      emoji: item.emoji || "🍽️",
      tags: item.tags || [],
      available: item.available,
      img: item.image
    }));

    renderMenuGrid();
    renderMenuTable();
    updateStats();

  } catch (error) {
    console.error(error);
    showToast("Failed to load menu items", "error");
  }
}
async function loadCategories() {
  try {

    const response = await fetch(CAT_API_URL);

    const data = await response.json();

    categories = data.map(cat => ({
      id: cat._id,
      name: cat.name,
      emoji: cat.emoji || "📂",
      desc: cat.desc || cat.description || "",
      img: cat.image
    }));

    renderCategories();

  } catch (error) {
    console.error(error);
    showToast("Failed to load categories", "error");
  }
}

async function loadSpecials() {
  try {

    const response = await fetch(SPECIAL_API_URL);

    const data = await response.json();

    specials = data.map(sp => ({
      id: sp._id,
      name: sp.name,
      emoji: sp.emoji || "⭐",
      origPrice: sp.origPrice,
      salePrice: sp.salePrice,
      discount: sp.discount,
      valid: sp.valid,
      desc: sp.desc || sp.description || "",
      img: sp.image,
      active: sp.active
    }));

    renderSpecials();

  } catch (error) {
    console.error(error);
    showToast("Failed to load specials", "error");
  }
}

let currentView='grid', currentFilter='all', editingId=null, nextId=300;
const statusFlow = ['pending','preparing','ready','served'];
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop';

// NAV 
function showPage(id, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  closeSidebar();
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOverlay').classList.toggle('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }

// MODALS
function openModal(id) { document.getElementById(id).classList.add('open'); if (id==='addItemModal' && editingId===null) clearItemForm(); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); if (id==='addItemModal') editingId=null; }
document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', e => { if (e.target===el) el.classList.remove('open'); }));

// EMOJI PICKERS
function buildEmojiPicker(cId, iId) {
  const c = document.getElementById(cId); if (!c) return;
  c.innerHTML = EMOJIS.map(e => `<div class="emoji-opt" onclick="selectEmoji('${e}','${iId}','${cId}')">${e}</div>`).join('');
}
function selectEmoji(emoji, iId, cId) {
  document.getElementById(iId).value = emoji;
  document.querySelectorAll('#' + cId + ' .emoji-opt').forEach(el => el.classList.remove('sel'));
  event.target.classList.add('sel');
}

// BADGE RENDER
function renderBadges(tags) {
  const map = { veg:['b-veg','🌿 Veg'], hot:['b-hot','🌶️ Hot'], new:['b-new','✨ New'], popular:['b-popular','⭐ Popular'], gf:['b-gf','🌾 GF'] };
  return tags.map(t => { const [cls, label] = map[t] || ['b-new', t]; return `<span class="badge ${cls}">${label}</span>`; }).join('');
}

// ITEM IMAGE
function getImg(item) { return (item.img && item.img.trim()) ? item.img : DEFAULT_IMG; }

// MENU RENDER
function getFiltered() {
  const q = (document.getElementById('menuSearch')?.value||'').toLowerCase();
  return menuItems.filter(i => {
    const mf = currentFilter==='all' || i.category===currentFilter;
    const ms = !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    return mf && ms;
  });
}

function renderMenuGrid() {
  const grid = document.getElementById('menuGrid');
  const items = getFiltered();
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>No dishes found</h3><p>Adjust your search or filter to discover our menu</p><button class="btn btn-primary" onclick="openModal('addItemModal')">Add a Dish</button></div>`;
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-card-img">
        <img src="${getImg(item)}" alt="${item.name}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'"/>
        <div class="img-category">${item.category}</div>
        <div class="img-status ${item.available ? 's-on' : 's-off'}"></div>
        <div class="img-price">${item.price.toFixed(2)}</div>
        <div class="img-badges">${renderBadges(item.tags)}</div>
      </div>
      <div class="menu-card-body">
        <div class="item-name">${item.emoji} ${item.name}</div>
        <div class="item-desc">${item.desc || 'No description available.'}</div>
      </div>
      <div class="menu-card-footer">
        <div class="avail-pill ${item.available ? 'avail-on' : 'avail-off'}" onclick="toggleAvail(${item.id})">
          ${item.available ? '● Available' : '○ Unavailable'}
        </div>
        <div class="item-actions">
          <button class="icon-btn" onclick="viewItem('${item.id}')" title="View">👁️</button>
          <button class="icon-btn" onclick="editItem('${item.id}')" title="Edit">✏️</button>
          <button class="icon-btn d" onclick="deleteItem('${item.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderMenuTable() {
  const tbody = document.getElementById('tableBody'); if (!tbody) return;
  const items = getFiltered();
  tbody.innerHTML = items.map(item => `
    <tr>
      <td><div class="flex items-center gap-2">
        <img class="tbl-img" src="${getImg(item)}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'"/>
        <div><div class="tbl-name">${item.emoji} ${item.name}</div><div class="tbl-desc">${(item.desc||'').slice(0,58)}${(item.desc||'').length>58?'…':''}</div></div>
      </div></td>
      <td><span class="badge b-new" style="font-size:9px">${item.category}</span></td>
      <td style="font-family:'Playfair Display',serif;font-size:15px;font-weight:800;color:var(--gold-dk)">${item.price.toFixed(2)}</td>
      <td><div style="display:flex;gap:4px;flex-wrap:wrap">${renderBadges(item.tags)}</div></td>
      <td><div class="toggle-wrap" onclick="toggleAvail(${item.id})">
        <div class="toggle-track ${item.available?'on':''}"><div class="toggle-thumb"></div></div>
        <span style="font-size:11px;color:${item.available?'#2d6a4f':'var(--crimson)'};font-weight:700">${item.available?'Yes':'No'}</span>
      </div></td>
      <td><div style="display:flex;gap:7px">
        <button class="btn btn-outline btn-sm" onclick="editItem('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Del</button>
      </div></td>
    </tr>
  `).join('');
}

function setView(v) {
  currentView = v;
  document.getElementById('menuGrid').classList.toggle('hidden', v !== 'grid');
  document.getElementById('menuTable').classList.toggle('hidden', v !== 'list');
  document.getElementById('gridToggle').classList.toggle('active', v === 'grid');
  document.getElementById('listToggle').classList.toggle('active', v === 'list');
}
function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderMenuGrid(); renderMenuTable();
}
function filterMenu() { renderMenuGrid(); renderMenuTable(); }

// CRUD 
function clearItemForm() {
  ['itemName','itemCategory','itemDesc','itemPrice','itemPrepTime','selectedEmoji','itemImg'].forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
  document.querySelectorAll('#addItemModal .check-pill').forEach(el => el.classList.remove('checked'));
  document.querySelectorAll('#emojiPicker .emoji-opt').forEach(el => el.classList.remove('sel'));
  document.getElementById('addItemTitle').textContent = 'Add New Dish';
}

async function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;
  const price = parseFloat(document.getElementById('itemPrice').value);
  const emoji = document.getElementById('selectedEmoji').value || '🍽️';
  const desc = document.getElementById('itemDesc').value.trim();
  const img = document.getElementById('itemImg').value.trim();

  if (!name) { showToast('Dish name is required', 'error'); return; }
  if (!category) { showToast('Please select a category', 'error'); return; }
  if (!price || isNaN(price)) { showToast('Please enter a valid price', 'error'); return; }

  const tags = [];
  document.querySelectorAll('#addItemModal .check-pill.checked input').forEach(i => tags.push(i.value));

  const payload = {
    name,
    category,
    price,
    description: desc,
    emoji,
    tags,
    available: true,
    image: img
  };

  try {
    let response;
    if (editingId !== null) {
      response = await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      throw new Error("Failed to save item");
    }

    showToast(editingId !== null ? `"${name}" updated! ✨` : `"${name}" added to Zestora! 🎉`, 'success');

    await loadMenuItems();
    closeModal('addItemModal');
  } catch (error) {
    console.error(error);
    showToast('Failed to save menu item', 'error');
  }
}
function editItem(id) {
  const item = menuItems.find(i => i.id === id); if (!item) return;
  editingId = id;
  document.getElementById('addItemTitle').textContent = 'Edit Dish';
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemDesc').value = item.desc;
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('selectedEmoji').value = item.emoji;
  document.getElementById('itemImg').value = item.img || '';
  document.querySelectorAll('#addItemModal .check-pill').forEach(el => {
    el.classList.remove('checked');
    if (item.tags.includes(el.querySelector('input').value)) el.classList.add('checked');
  });
  openModal('addItemModal');
}

async function deleteItem(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    await loadMenuItems();

    showToast("Item deleted", "success");

  } catch (error) {
    console.error(error);
    showToast("Delete failed", "error");
  }
}

function toggleAvail(id) {
  const item = menuItems.find(i => i.id === id); if (!item) return;
  item.available = !item.available;
  renderMenuGrid(); renderMenuTable(); updateStats();
  showToast(`${item.name} → ${item.available ? 'Now Available ✅' : 'Marked Unavailable'}`, item.available ? 'success' : '');
}

function viewItem(id) {
  const item = menuItems.find(i => i.id === id); if (!item) return;
  document.getElementById('viewItemTitle').textContent = item.name;
  document.getElementById('viewItemBody').innerHTML = `
    <img src="${getImg(item)}" style="width:100%;height:220px;object-fit:cover;border-radius:var(--r-sm);margin-bottom:16px;border:1px solid var(--border)" onerror="this.style.display='none'"/>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">${renderBadges(item.tags)}</div>
    <div style="font-size:11px;color:var(--gold-dk);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px">${item.category}</div>
    <div style="font-size:13.5px;color:var(--text-lt);line-height:1.75;margin-bottom:20px;font-style:italic">${item.desc||'No description available.'}</div>
    <div style="display:flex;gap:30px;padding:16px;background:var(--cream-dk);border-radius:var(--r-sm);border:1px solid var(--border)">
      <div><div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--gold-dk)">${item.price.toFixed(2)}</div><div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase">Price</div></div>
      <div><div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:${item.available?'#2d6a4f':'var(--crimson)'}">${item.available?'Yes':'No'}</div><div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase">Available</div></div>
    </div>
  `;
  document.getElementById('viewItemEdit').onclick = () => { closeModal('viewItemModal'); editItem(id); };
  openModal('viewItemModal');
}

// CATEGORIES 
function renderCategories() {

  document.getElementById('catBadge').textContent = categories.length;
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(cat => {
    const count = menuItems.filter(i => i.category === cat.name).length;
    return `
      <div class="cat-card">
        <div class="cat-banner">
          ${cat.img ? `<img src="${cat.img}" onerror="this.style.display='none'"/>` : ''}
          <div class="cat-emoji-big">${cat.emoji}</div>
        </div>
        <div class="cat-body">
          <div class="cat-name">${cat.name}</div>
          <div class="cat-count">${count} dish${count!==1?'es':''}</div>
          ${cat.desc ? `<div class="cat-desc">${cat.desc}</div>` : ''}
        </div>
        <div class="cat-footer">
          <div style="display:flex;gap:6px">
            <button class="icon-btn" title="Edit">✏️</button>
            <button class="icon-btn d" onclick="deleteCat('${cat.id}')" title="Delete">🗑️</button>
          </div>
          <button class="btn btn-outline btn-sm" onclick="viewCategoryDishes('${cat.id}')">View Dishes →</button>
        </div>
      </div>
    `;
  }).join('');
}

async function saveCategory() {
  const name = document.getElementById('catName').value.trim();
  const emoji = document.getElementById('selectedCatEmoji').value || '📂';
  const desc = document.getElementById('catDesc').value.trim();
  const img = document.getElementById('catImg').value.trim();
  if (!name) { showToast('Category name required', 'error'); return; }

  try {
    const response = await fetch(CAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji, desc, img })
    });
    if (!response.ok) throw new Error("Failed to save category");

    await loadCategories();
    closeModal('addCatModal');
    showToast(`"${name}" category created! 🎉`, 'success');
    ['catName','catDesc','catImg','selectedCatEmoji'].forEach(id => document.getElementById(id).value = '');
  } catch (error) {
    console.error(error);
    showToast('Failed to save category', 'error');
  }
}
async function deleteCat(id) {
  const cat = categories.find(c => c.id === id); if (!cat) return;
  if (!confirm(`Delete category "${cat.name}"?`)) return;

  try {
    const response = await fetch(`${CAT_API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Delete failed");

    await loadCategories();
    showToast(`"${cat.name}" deleted`, 'error');
  } catch (error) {
    console.error(error);
    showToast('Failed to delete category', 'error');
  }
}

// SPECIALS 
function renderSpecials() {

  document.getElementById('specialBadge').textContent = specials.length;
  const grid = document.getElementById('specialsGrid');
  if (!specials.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⭐</div><h3>No Active Specials</h3><p>Create a limited-time offer — your guests are waiting for a reason to celebrate</p><button class="btn btn-primary" onclick="openModal('addSpecialModal')">Create Special</button></div>`;
    return;
  }
  grid.innerHTML = specials.map(sp => `
    <div class="special-card">
      <div class="special-hero">
        ${sp.img ? `<img src="${sp.img}" onerror="this.style.display='none'"/>` : ''}
        <div class="special-hero-overlay">
          <div class="sp-emoji">${sp.emoji}</div>
          <div class="sp-disc">${sp.discount}</div>
        </div>
      </div>
      <div class="sp-body">
        <div class="sp-name">${sp.name}</div>
        <div class="sp-valid">📅 ${sp.valid}</div>
        <div class="sp-prices"><div class="sp-new">${sp.salePrice}</div><div class="sp-old">${sp.origPrice}</div></div>
        <div class="sp-desc">${sp.desc}</div>
      </div>
      <div class="sp-footer">
        <button class="btn btn-danger btn-sm" onclick="deleteSpecial('${sp.id}')">Remove</button>
        <button class="btn btn-primary btn-sm w-full" onclick="viewSpecialDetail('${sp.id}')">View Details</button>
      </div>
    </div>
  `).join('');
}

async function saveSpecial() {
  const name = document.getElementById('specialName').value.trim();
  const origPrice = parseFloat(document.getElementById('specialOrig').value) || 0;
  const salePrice = parseFloat(document.getElementById('specialSale').value);
  const emoji = document.getElementById('selectedSpecialEmoji').value || '⭐';
  const img = document.getElementById('specialImg').value.trim();
  const from = document.getElementById('specialFrom').value;
  const to = document.getElementById('specialTo').value;
  const desc = document.getElementById('specialDesc').value.trim();

  if (!name) { showToast('Offer name required', 'error'); return; }
  if (!salePrice || isNaN(salePrice)) { showToast('Sale price required', 'error'); return; }

  const discount = origPrice ? Math.round((1 - salePrice/origPrice)*100) + '% OFF' : 'Special';
  const valid = from && to ? `${from} – ${to}` : from || to || 'Limited time';

  try {
    const response = await fetch(SPECIAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji, origPrice, salePrice, discount, valid, desc, img, active: true })
    });
    if (!response.ok) throw new Error("Failed to save special");

    await loadSpecials();
    closeModal('addSpecialModal');
    showToast(`"${name}" is now live! 🌟`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Failed to save special', 'error');
  }
}
async function deleteSpecial(id) {
  try {
    const response = await fetch(`${SPECIAL_API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Delete failed");

    await loadSpecials();
    showToast('Special removed', 'error');
  } catch (error) {
    console.error(error);
    showToast('Failed to remove special', 'error');
  }
}


// VIEW CATEGORY DISHES 
function viewCategoryDishes(id) {
  const cat = categories.find(c => c.id === id); if (!cat) return;
  const dishes = menuItems.filter(i => i.category === cat.name);
  document.getElementById('viewCatTitle').textContent = cat.emoji + ' ' + cat.name + ' — ' + dishes.length + ' Dish' + (dishes.length !== 1 ? 'es' : '');
  if (!dishes.length) {
    document.getElementById('viewCatBody').innerHTML = '<div class="empty-state"><div class="empty-icon">' + cat.emoji + '</div><h3>No dishes yet</h3><p>Add dishes in this category to see them here.</p><button class="btn btn-primary" onclick="closeModal(\'viewCatModal\');openModal(\'addItemModal\')">Add a Dish</button></div>';
  } else {
    document.getElementById('viewCatBody').innerHTML = '<div class="cat-dishes-grid">' + dishes.map(item => `
      <div class="cat-dish-card">
        <div class="cat-dish-img">
          <img src="${getImg(item)}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'"/>
          <div class="img-status ${item.available ? 's-on' : 's-off'}"></div>
          <div class="img-price">${item.price.toFixed(2)}</div>
        </div>
        <div class="cat-dish-body">
          <div class="item-name">${item.emoji} ${item.name}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin:6px 0">${renderBadges(item.tags)}</div>
          <div class="item-desc">${(item.desc||'').slice(0,100)}${(item.desc||'').length>100?'…':''}</div>
        </div>
        <div class="cat-dish-footer">
          <div class="avail-pill ${item.available ? 'avail-on' : 'avail-off'}">${item.available ? '● Available' : '○ Unavailable'}</div>
          <button class="btn btn-outline btn-sm" onclick="closeModal('viewCatModal');viewItem('${item.id}')">Details</button>
        </div>
      </div>
    `).join('') + '</div>';
  }
  openModal('viewCatModal');
}

// VIEW SPECIAL DETAIL  
function viewSpecialDetail(id) {
  const sp = specials.find(s => s.id === id); if (!sp) return;
  const discPct = sp.origPrice ? Math.round((1 - sp.salePrice/sp.origPrice)*100) : 0;
  const savings = sp.origPrice ? (sp.origPrice - sp.salePrice) : 0;
  document.getElementById('viewSpecialTitle').textContent = sp.emoji + ' ' + sp.name;
  document.getElementById('viewSpecialBody').innerHTML = `
    <div class="special-detail-hero">
      ${sp.img ? `<img src="${sp.img}" onerror="this.style.display='none'" alt="${sp.name}"/>` : ''}
      <div class="special-detail-overlay">
        <div class="sp-emoji" style="font-size:48px">${sp.emoji}</div>
        <div class="sp-disc" style="font-size:22px;padding:8px 20px">${sp.discount}</div>
      </div>
    </div>
    <div style="padding:4px 0 16px">
      <div style="font-size:11px;color:var(--gold-dk);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px">📅 Valid: ${sp.valid}</div>
      <div style="font-size:15px;color:var(--text-lt);line-height:1.8;font-style:italic;margin-bottom:20px">${sp.desc || 'A curated dining experience crafted for our guests.'}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">
        <div style="background:var(--cream-dk);border:1px solid var(--border);border-radius:var(--r-sm);padding:16px;text-align:center">
          <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--gold-dk)">${sp.salePrice.toLocaleString()}</div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">Sale Price</div>
        </div>
        <div style="background:var(--cream-dk);border:1px solid var(--border);border-radius:var(--r-sm);padding:16px;text-align:center">
          <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:var(--text-muted);text-decoration:line-through">${sp.origPrice.toLocaleString()}</div>
          <div style="font-size:10px;color:var(--text-muted);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">Original</div>
        </div>
        <div style="background:linear-gradient(135deg,var(--crimson),#a0182e);border-radius:var(--r-sm);padding:16px;text-align:center">
          <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#fff">${savings.toLocaleString()}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">You Save</div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,rgba(184,134,11,.08),rgba(139,0,0,.06));border:1px solid var(--border-gold);border-radius:var(--r-sm);padding:16px;text-align:center">
        <div style="font-size:13px;color:var(--gold-dk);font-weight:700;margin-bottom:4px">✨ ${discPct}% savings on this exclusive offer</div>
        <div style="font-size:12px;color:var(--text-muted)">Offer valid: ${sp.valid}</div>
      </div>
    </div>
  `;
  openModal('viewSpecialModal');
}

// ORDERS 
function renderOrders() {
  const c = document.getElementById('ordersContainer');
  c.innerHTML = orders.map(o => `
    <div class="order-row">
      <div class="order-id">${o.id}</div>
      <div class="order-items"><strong>${o.table}</strong><span>${o.items}</span></div>
      <div class="order-total">${o.total}</div>
      <div class="order-time">${o.time}</div>
      <div><span class="ostatus os-${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></div>
      <div><button class="btn btn-ghost btn-sm" onclick="advanceOrder('${o.id}')">→ Next</button></div>
    </div>
  `).join('');
}

function advanceOrder(id) {
  const o = orders.find(o => o.id===id); if (!o) return;
  const idx = statusFlow.indexOf(o.status);
  if (idx < statusFlow.length - 1) { o.status = statusFlow[idx+1]; renderOrders(); showToast(`${id} → ${o.status}`, 'success'); }
  else showToast(`${id} already served`, '');
}
function refreshOrders() { showToast('Orders refreshed! ✅', 'success'); }

// ANALYTICS 
function renderRevenueChart() {
  const c = document.getElementById('revenueChart'); if (!c) return;
  const data = [{ v:58000, d:'Mon' },{ v:42000, d:'Tue' },{ v:67000, d:'Wed' },{ v:51000, d:'Thu' },{ v:75000, d:'Fri' },{ v:92000, d:'Sat' },{ v:84000, d:'Sun' }];
  const max = Math.max(...data.map(d => d.v));
  c.innerHTML = data.map(({ v, d }) => `
    <div class="bar-col">
      <div class="bar-val">${v}</div>
      <div class="bar-fill" style="height:${Math.round((v/max)*170)}px" title="${d}: ${v}"></div>
      <div class="bar-label">${d}</div>
    </div>
  `).join('');
}

// SETTINGS 
function showStab(id, el) {
  document.querySelectorAll('.ssec').forEach(s => s.classList.remove('active'));
  document.getElementById('settings-' + id).classList.add('active');
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}
function toggleSetting(el) { el.querySelector('.toggle-track').classList.toggle('on'); }

// STATS 
function updateStats() {
  document.getElementById('totalItems').textContent = menuItems.length;
  document.getElementById('availItems').textContent = menuItems.filter(i => i.available).length;
  document.getElementById('menuBadge').textContent = menuItems.length;
}

// CHECK PILLS 
function toggleCheck(el) { el.classList.toggle('checked'); }

// EXPORT 
function exportMenu() {
  const rows = [['Name','Category','Price','Available','Tags']].concat(
    menuItems.map(i => [i.name, i.category, i.price.toFixed(2), i.available?'Yes':'No', i.tags.join(';')])
  );
  const csv = rows.map(r => r.join(',')).join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:'zestora-menu.csv' });
  a.click();
  showToast('Menu exported! 📥', 'success');
}

// TOAST 
function showToast(msg, type = '') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', '':'🔔' };
  t.innerHTML = `<span>${icons[type]||'🔔'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(20px)'; t.style.transition='.35s ease'; setTimeout(() => t.remove(), 350); }, 3200);
}

// INIT 
async function init() {
  buildEmojiPicker('emojiPicker', 'selectedEmoji');
  buildEmojiPicker('catEmojiPicker', 'selectedCatEmoji');
  buildEmojiPicker('specialEmojiPicker', 'selectedSpecialEmoji');

  await loadMenuItems();
  await loadCategories();
  await loadSpecials();
  renderOrders();
  renderRevenueChart();
}
init();
// Lightweight static implementation wiring images from Figma export
const IMAGES = {
  banana: 'http://localhost:3845/assets/83764906c5d584c1e3e9e8ff7ae4ddbc7cf06c3c.png',
  apple: 'http://localhost:3845/assets/2efe6320bcf37b2c5313b9a5a7a6021d4a50ad64.png',
  tomato: 'http://localhost:3845/assets/12c5b97ea61feebaf3ecb4725b08557885df8313.png',
  cucumber: 'http://localhost:3845/assets/32b950bec53e0e9bdc958739bd80399a82d8075a.png',
  onion: 'http://localhost:3845/assets/3a85a1547ff6fd96697629188a0d3dbb9a45936a.png',
  potatoes: 'http://localhost:3845/assets/ee0283d764bd1b2e22c03fd308d38a124234d467.png',
  garlic: 'http://localhost:3845/assets/b106799431c5b65b77dd02466bb68d972db0688a.png',
  carrots: 'http://localhost:3845/assets/5dd711851c7f57749768226aa9698e65a13c59a4.png',
  chicken: 'http://localhost:3845/assets/281cb0f68ffdd33beb63076c5ce28029ad62a5c1.png',
  salami: 'http://localhost:3845/assets/5795a45413c4a13a06506d91ff80cba594c5abd7.png',
  ham: 'http://localhost:3845/assets/1468566417eba6f9cfb3ac1373fd7ed2b60d786d.png',
  milk: 'http://localhost:3845/assets/d4e90115ae6e82e9995efbad524ca6cec166e7a9.png',
  yoghurt: 'http://localhost:3845/assets/2ddb2986b57800ecb2b7600da1a4d10e957b8343.png',
  coffee: 'http://localhost:3845/assets/6b37cc86044e2e180d4bcbc9c6d01e6d0dea0231.png',
  orange: 'http://localhost:3845/assets/27fca1e47a01ce1311017b258e792b7a6e6e3d28.png',
  kiwi: 'http://localhost:3845/assets/e46d6157c6b0492b350d99c0ef92ce80e74b35ef.png',
  nuts: 'http://localhost:3845/assets/389a98b88fc17c11e63b64d4ae21cd87c7cfa37c.png',
  salmon: 'http://localhost:3845/assets/3685ddf91f36e4eaa012a9f689c99f2bcda91416.png',
  chocolate: 'http://localhost:3845/assets/813b97a8c804ca36a84a3da749d832c8989ad131.png',
  beer: 'http://localhost:3845/assets/c9686e7f00866ef5c02ef995b1fea05e1c479cb1.png',
  cheese: 'http://localhost:3845/assets/ab9fc965af41495675634a877252ee02c6c285db.png',
  toothpaste: 'http://localhost:3845/assets/2141553bfd04ca844489730346f2d6235d28a04f.png',
  shampoo: 'http://localhost:3845/assets/ec1cdd679ae0658d42ac0e399c718a79fab5a544.png',
  soap: 'http://localhost:3845/assets/198c190981e3aff12428da3314d6003c2431da9d.png',
  candle: 'http://localhost:3845/assets/f991774cc37f57c985f86d1bce5dc3f5bc7599bb.png',
  butter: 'http://localhost:3845/assets/58ca32f0044bc3f890ced3eb253cc44f80ef32e6.png',
  fishcans: 'http://localhost:3845/assets/3f68ed037cf0d2337ad95dca30ca081ed2c07b35.png',
  spaghetti: 'http://localhost:3845/assets/2477e8f2f70030d55b7bba0c1eb9607c13058b68.png',
  rice: 'http://localhost:3845/assets/b09faecf05677ae1fe269040316c24277c8ff2c2.png',
  bread: 'http://localhost:3845/assets/b8c746876049d628fa673ea0a68cd32280a15a1a.png',
  paprika: 'http://localhost:3845/assets/d1042af05b6bef045f3e95af2b2c69dae00d85fc.png',
  pear: 'http://localhost:3845/assets/c8cbc933fbc64e512f1511b56d2ad542a8d89e0a.png'
};

const ITEMS = Object.keys(IMAGES).map(k => ({id:k, name:k.replace(/(^.|[A-Z])/g, s=>s===s.toUpperCase()?s:' '+s).trim(), img: IMAGES[k]}));

const state = {
  chosen: [ 'banana','apple','tomato','milk','spaghetti','butter','chocolate','beer','avocado' ].filter(Boolean),
  quantities: {},
  units: {},
};

const dragState = {
  draggingId: null,
  placeholder: null,
};

function createGridItem(item){
  const el = document.createElement('div');
  el.className = 'item';
  el.innerHTML = `
    <div class="imgWrap"><img src="${item.img}" alt="${item.name}" /></div>
    <p>${item.name}</p>
  `;
  el.addEventListener('click', ()=>addItem(item.id));
  return el;
}

function renderGrid(filter=''){
  const grid = document.getElementById('itemsGrid');
  grid.innerHTML = '';
  const wrap = document.createElement('div'); wrap.className='grid';
  ITEMS.filter(it => it.name.toLowerCase().includes(filter.toLowerCase())).forEach(it => wrap.appendChild(createGridItem(it)));
  grid.appendChild(wrap);
}

function addItem(id){
  let added = false;
  if(!state.chosen.includes(id)){
    state.chosen.push(id);
    // default qty and unit
    state.quantities[id] = 1;
    state.units[id] = 'pcs';
    added = true;
  }
  renderChosen();
  // if we actually added a new item, ensure it's visible in the scroller
  if(added) ensureRowVisible(id);
}

// Ensure a row with given id is visible inside the chosen list container
function ensureRowVisible(id){
  const container = document.getElementById('chosenList');
  if(!container) return;
  const row = container.querySelector(`[data-id="${id}"]`);
  if(!row) return;
  const containerRect = container.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  // if bottom of row is below visible bottom, scroll so it's visible at bottom
  if(rowRect.bottom > containerRect.bottom){
    // scroll by the difference
    const diff = rowRect.bottom - containerRect.bottom + 8;
    container.scrollBy({ top: diff, left: 0, behavior: 'smooth' });
    return;
  }
  // if top of row is above visible top, scroll up
  if(rowRect.top < containerRect.top){
    const diff = containerRect.top - rowRect.top + 8;
    container.scrollBy({ top: -diff, left: 0, behavior: 'smooth' });
  }
}

function removeItem(id){
  state.chosen = state.chosen.filter(x=>x!==id);
  renderChosen();
}

function renderChosen(){
  const container = document.getElementById('chosenList');
  container.innerHTML = '';
  state.chosen.forEach(id => {
    const it = ITEMS.find(i=>i.id===id) || {id,name:id,img:IMAGES[id]||''};
      const qtyVal = state.quantities[it.id] ?? 1;
      const unitVal = state.units[it.id] ?? 'pcs';
      const row = document.createElement('div'); row.className='list-row';
      row.setAttribute('data-id', it.id);
      row.innerHTML = `
        
        <div class="name">${it.name}</div>
        <div class="qtyBox"><input type="number" min="1" value="${qtyVal}" /></div>
        <div class="unitBox">
          <select class="unitSelect">
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="bag">bag</option>
            <option value="liter">liter</option>
            <option value="grams">grams</option>
          </select>
        </div>
        <button class="removeBtn" title="Remove">✕</button>
      `;

      // drag start on handle and on the name (both should initiate drag)
      
      const nameEl = row.querySelector('.name');
      // make name draggable as well
      nameEl.setAttribute('draggable', 'true');

      function onDragStart(e){
        dragState.draggingId = it.id;
        e.dataTransfer.effectAllowed = 'move';
        try{ e.dataTransfer.setData('text/plain', it.id); }catch(_){ }
        row.classList.add('dragging');
        // create placeholder sized like the row
        if(!dragState.placeholder){
          const ph = document.createElement('div'); ph.className='placeholder'; ph.style.height = row.getBoundingClientRect().height + 'px';
          dragState.placeholder = ph;
        }
      }

      function onDragEnd(){
        dragState.draggingId = null;
        row.classList.remove('dragging');
        if(dragState.placeholder && dragState.placeholder.parentNode) dragState.placeholder.parentNode.removeChild(dragState.placeholder);
      }


      nameEl.addEventListener('dragstart', onDragStart);
      nameEl.addEventListener('dragend', onDragEnd);

      // wire qty input
      const qtyInput = row.querySelector('.qtyBox input');
      qtyInput.addEventListener('change', (e)=>{
        const v = parseInt(e.target.value,10) || 1;
        state.quantities[it.id] = v;
        e.target.value = v;
      });
      // wire unit select
      const unitSelect = row.querySelector('.unitSelect');
      unitSelect.value = unitVal;
      unitSelect.addEventListener('change', (e)=>{
        state.units[it.id] = e.target.value;
      });

      row.querySelector('.removeBtn').addEventListener('click', ()=>removeItem(it.id));
      container.appendChild(row);
  });
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  renderGrid();
  renderChosen();
  // initialize quantities/units for any pre-chosen items
  state.chosen.forEach(id=>{
    if(state.quantities[id] == null) state.quantities[id] = 1;
    if(state.units[id] == null) state.units[id] = 'pcs';
  });
  const input = document.getElementById('filterInput');
  input.addEventListener('input', e=>renderGrid(e.target.value));
  // basic actions
  document.getElementById('emailBtn').addEventListener('click', ()=>alert('Email action — not implemented in prototype'));
  document.getElementById('exportBtn').addEventListener('click', exportToPDF);
  
  // dragover & drop handling on chosen list
  const chosenList = document.getElementById('chosenList');
  chosenList.addEventListener('dragover', (e)=>{
    e.preventDefault();
    const y = e.clientY;
    const children = Array.from(chosenList.querySelectorAll('.list-row'));
    let insertBefore = null;
    for(const child of children){
      const rect = child.getBoundingClientRect();
      if(y < rect.top + rect.height/2){ insertBefore = child; break; }
    }
    // if placeholder exists, move it
    if(dragState.placeholder){
      if(insertBefore){
        if(insertBefore.previousSibling !== dragState.placeholder) chosenList.insertBefore(dragState.placeholder, insertBefore);
      } else {
        if(chosenList.lastElementChild !== dragState.placeholder) chosenList.appendChild(dragState.placeholder);
      }
    }
  });

  chosenList.addEventListener('drop', (e)=>{
    e.preventDefault();
    const id = dragState.draggingId || e.dataTransfer.getData('text/plain');
    if(!id) return;
    const ph = dragState.placeholder;
    // determine new index
    const children = Array.from(chosenList.querySelectorAll('.list-row'));
    let newIndex = children.length; // default append at end
    if(ph && ph.parentNode){
      const all = Array.from(chosenList.children).filter(n=>!n.classList.contains('placeholder'));
      // placeholder position is index among children
      newIndex = Array.from(chosenList.children).indexOf(ph);
    }
    // remove old
    const oldIndex = state.chosen.indexOf(id);
    if(oldIndex !== -1){
      state.chosen.splice(oldIndex,1);
    }
    // insert at newIndex
    if(newIndex < 0) newIndex = state.chosen.length;
    state.chosen.splice(newIndex,0,id);
    // cleanup
    if(ph && ph.parentNode) ph.parentNode.removeChild(ph);
    dragState.placeholder = null; dragState.draggingId = null;
    renderChosen();
  });
  
});

function exportToPDF(){
  if(!state.chosen.length){
    alert('No items selected to export');
    return;
  }
  // Use two columns only for long lists: threshold set to 35 items
  const TWO_COLUMN_THRESHOLD = 35;
  const useTwoCols = state.chosen.length > TWO_COLUMN_THRESHOLD;

  // Generate PDF using jsPDF (client-side)
  try{
    const { jsPDF } = window.jspdf || window.jspdf || {};
    if(!jsPDF){
      alert('jsPDF is not loaded. Export unavailable.');
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18; // mm
    const gutter = 10; // between columns
    const fontSize = 12;
    doc.setFontSize(fontSize);
    const lineHeight = fontSize * 0.7; // approx mm

    const items = state.chosen.map(id => {
      const it = ITEMS.find(i=>i.id===id) || {id,name:id,img:IMAGES[id]||''};
      return { name: it.name, qty: state.quantities[id] ?? 1, unit: state.units[id] ?? 'pcs' };
    });

    // single column layout
    if(!useTwoCols){
      let x = margin;
      let y = margin;
      doc.text('Shopping list', x, y);
      y += lineHeight * 1.8;
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text('Generated: ' + new Date().toLocaleString(), x, y);
      doc.setFontSize(fontSize);
      y += lineHeight * 1.6;

      for(const it of items){
        const line = `${it.name} — ${it.qty} ${it.unit}`;
        if(y + lineHeight > pageHeight - margin){
          doc.addPage();
          y = margin;
        }
        doc.setTextColor(0);
        doc.text(line, x, y);
        y += lineHeight;
      }
    } else {
      // two-column per page layout: split per page
      const colWidth = (pageWidth - margin*2 - gutter) / 2;
      const linesPerColumn = Math.floor((pageHeight - margin*2 - 20) / lineHeight);
      const itemsPerPage = linesPerColumn * 2;
      let pageIndex = 0;
      while(pageIndex * itemsPerPage < items.length){
        if(pageIndex > 0) doc.addPage();
        const start = pageIndex * itemsPerPage;
        const pageItems = items.slice(start, start + itemsPerPage);
        // header
        let xLeft = margin;
        let xRight = margin + colWidth + gutter;
        let yTop = margin;
        doc.setFontSize(14); doc.text('Shopping list', xLeft, yTop);
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text('Generated: ' + new Date().toLocaleString(), xLeft, yTop + lineHeight * 1.2);
        doc.setFontSize(fontSize); doc.setTextColor(0);
        yTop += lineHeight * 2.4;

        const leftItems = pageItems.slice(0, linesPerColumn);
        const rightItems = pageItems.slice(linesPerColumn);

        let y = yTop;
        for(const it of leftItems){
          doc.text(`${it.name} — ${it.qty} ${it.unit}`, xLeft, y);
          y += lineHeight;
        }

        y = yTop;
        for(const it of rightItems){
          doc.text(`${it.name} — ${it.qty} ${it.unit}`, xRight, y);
          y += lineHeight;
        }

        pageIndex++;
      }
    }

    const now = new Date();
    const filename = `shopping-list-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.pdf`;
    doc.save(filename);
  }catch(err){
    console.error('PDF export failed', err);
    alert('Failed to create PDF: ' + (err && err.message));
  }
}

// Lightweight static implementation wiring images from Figma export
const IMAGES = {
  banana: './images/banana.png',
  apple: './images/apple.png',
  tomato: './images/tomato.png',
  cucumber: './images/cucumber.png',
  onion: './images/onion.png',
  potatoes: './images/potato.png',
  garlic: './images/garlic.png',
  carrots: './images/carrots.png',
  chicken: './images/chicken.png',
  salami: './images/salami.png',
  ham: './images/ham.png',
  milk: './images/milk.png',
  yoghurt: './images/yoghurt.png',
  coffee: './images/coffee.png',
  orange: './images/orange.png',
  kiwi: './images/kiwi.png',
  nuts: './images/nuts.png',
  salmon: './images/salmon.png',
  chocolate: './images/chocolate.png',
  beer: './images/beer.png',
  cheese: './images/cheese.png',
  toothpaste: './images/toothpaste.png',
  shampoo: './images/shampoo.png',
  soap: './images/soap.png',
  candle: './images/candle.png',
  butter: './images/butter.png',
  fishcans: './images/fish-can.png',
  spaghetti: './images/spaghetti.png',
  rice: './images/rice.png',
  bread: './images/bread.png',
  paprika: './images/paprika.png',
  pear: './images/pear.png'
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

  document.getElementById('emailBtn-2').addEventListener('click', ()=>alert('Email action — not implemented in prototype'));
  document.getElementById('exportBtn-2').addEventListener('click', exportToPDF);
  
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

    const styles = `
      body{font-family: Arial, Helvetica, sans-serif; padding:28px; color:#111}
      h1{font-size:20px;margin:0 0 10px}
      .meta{font-size:12px;color:#666;margin-bottom:18px}
      .list{display:block}
      .list.two-col{column-count:2;column-gap:40px}
      .entry{display:block;margin:6px 0;break-inside:avoid}
      .entry .text{font-size:14px}
      .qty{font-weight:700;margin-right:6px}
      @media print{body{padding:12mm} .no-print{display:none}}
    `;

  let itemsHtml = '';
  state.chosen.forEach(id => {
    const it = ITEMS.find(i=>i.id===id) || {id,name:id,img:IMAGES[id]||''};
    const qty = state.quantities[id] ?? 1;
    const unit = state.units[id] ?? 'pcs';
     // omit images for printable export to produce a compact, print-friendly list
     itemsHtml += `<div class="entry"><div class="text"><span class="qty">${qty}</span>${unit} — ${it.name}</div></div>`;
  });

  const docHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Shopping list</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="no-print" style="text-align:right;margin-bottom:8px;">
          <button onclick="window.print()">Print / Save PDF</button>
        </div>
        <h1>Shopping list</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
        <div class="list ${useTwoCols ? 'two-col' : ''}">
          ${itemsHtml}
        </div>
      </body>
    </html>
  `;

  const w = window.open('', '_blank');
  if(!w){
    alert('Popup blocked. Allow popups for this site to export PDF.');
    return;
  }
  w.document.open();
  w.document.write(docHtml);
  w.document.close();
  // wait a bit for images to load, then call print
  const tryPrint = () => {
    try{
      w.focus();
      w.print();
    }catch(e){
      // ignore
    }
  };
  // give images a moment to load
  setTimeout(tryPrint, 600);
}

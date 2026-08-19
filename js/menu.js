import { Game } from './game.js';
import { State } from './state.js';
import { Save } from './save.js';

const Menu = {
  settingsKey: 'idleHackerSettings',
  settings: { matrix:true, scanlines:true, particles:true, reducedMotion:false },
  achievements: [
    { id:'first-breach', title:'FIRST BREACH', desc:'Complete your first exploit.', test:s=>s.lifetime>0 },
    { id:'script-kiddie', title:'SCRIPT KIDDIE', desc:'Reach 10 REP.', test:s=>s.rep>=10 },
    { id:'network-builder', title:'NETWORK BUILDER', desc:'Own 10 infrastructure units.', test:s=>s.rigs.reduce((n,r)=>n+r.count,0)>=10 },
    { id:'millionaire', title:'BLACKNET MILLIONAIRE', desc:'Earn $1,000,000 lifetime.', test:s=>s.lifetime>=1_000_000 },
    { id:'ghost', title:'GHOST', desc:'Reach 100 REP.', test:s=>s.rep>=100 },
    { id:'zero-day', title:'ZERO-DAY', desc:'Own a Zero-Day rig.', test:s=>s.rigs.some(r=>r.id==='zeroday'&&r.count>0) },
  ],
  init(){
    if(this.initialized)return;
    this.initialized=true;
    this.ensureStyles();
    this.loadSettings();
    this.bindButtons();
    this.renderSessionStatus();
    this.renderRep();
    this.updateClock();
    setInterval(()=>this.updateClock(),1000);
  },
  ensureStyles(){
    if(document.querySelector('link[data-menu-systems]'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='./css/menu-systems.css';link.dataset.menuSystems='true';document.head.appendChild(link);
  },
  bindButtons(){
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#startBtn,#loadGameBtn,#newGameBtn,#settingsBtn,#achievementsBtn,#exitBtn,#intelBtn');
      if(!button)return;
      event.preventDefault();event.stopImmediatePropagation();
      switch(button.id){
        case 'startBtn':this.enterGame();break;
        case 'loadGameBtn':this.openLoad();break;
        case 'newGameBtn':this.newGame();break;
        case 'settingsBtn':this.openSettings();break;
        case 'achievementsBtn':this.openAchievements();break;
        case 'exitBtn':this.exitGame();break;
        case 'intelBtn':this.openIntel();break;
      }
    },true);
  },
  hasSave(){return Boolean(localStorage.getItem(Save.key));},
  enterGame(){
    this.closeModal();
    const menu=document.getElementById('mainMenu');menu?.classList.add('closing');
    document.getElementById('gameScreen').hidden=false;
    Game.init();
    setTimeout(()=>{if(menu)menu.hidden=true;},280);
  },
  newGame(){
    if(!this.hasSave())return this.enterGame();
    if(!confirm('Start a new hacker career? Your local save will be permanently removed.'))return;
    localStorage.removeItem(Save.key);location.reload();
  },
  openLoad(){
    if(!this.hasSave())return this.showModal('LOAD GAME','<div class="menu-empty">NO SAVED SESSION FOUND</div><p>Create a new hacker career or start a fresh session.</p>','START NEW GAME',()=>this.newGame());
    const raw=localStorage.getItem(Save.key);let s={cash:0,lifetime:0,rep:0,trace:0,lastSave:0};
    try{s={...s,...JSON.parse(raw)}}catch{}
    const when=s.lastSave?new Date(s.lastSave).toLocaleString('en-GB'):'UNKNOWN';
    const html=`<div class="save-card"><div><span>SESSION</span><strong>BLACKNET-LOCAL</strong></div><div><span>CREDITS</span><strong>$${Math.floor(s.cash).toLocaleString()}</strong></div><div><span>REP</span><strong>${Math.floor(s.rep)}</strong></div><div><span>TRACE</span><strong>${Math.floor(s.trace)}%</strong></div><small>LAST SAVED: ${when}</small></div>`;
    this.showModal('LOAD GAME',html,'LOAD SESSION',()=>this.enterGame());
  },
  openSettings(){
    const s=this.settings;
    const html=`<div class="settings-list">${this.settingRow('matrix','MATRIX BACKDROP','Animated terminal rain and background layer.',s.matrix)}${this.settingRow('scanlines','SCANLINES','CRT scanline overlay on the menu.',s.scanlines)}${this.settingRow('particles','AMBIENT PARTICLES','Floating green data particles.',s.particles)}${this.settingRow('reducedMotion','REDUCED MOTION','Reduce decorative animation.',s.reducedMotion)}<button class="menu-system-action" id="fullscreenBtn">ENTER FULLSCREEN</button></div>`;
    this.showModal('SETTINGS',html,'CLOSE',()=>this.closeModal());
    ['matrix','scanlines','particles','reducedMotion'].forEach(key=>document.getElementById(`setting-${key}`)?.addEventListener('change',e=>{this.settings[key]=e.currentTarget.checked;this.saveSettings();this.applySettings()}));
    document.getElementById('fullscreenBtn')?.addEventListener('click',()=>this.requestFullscreen());
  },
  settingRow(id,title,desc,checked){return `<label class="setting-row"><span><strong>${title}</strong><small>${desc}</small></span><input id="setting-${id}" type="checkbox" ${checked?'checked':''}><i></i></label>`;},
  openAchievements(){
    const unlocked=this.achievements.filter(a=>a.test(State)).length;
    const html=`<div class="achievement-summary"><strong>${unlocked}/${this.achievements.length}</strong><span>ACHIEVEMENTS UNLOCKED</span></div><div class="achievement-list">${this.achievements.map(a=>{const ok=a.test(State);return `<div class="achievement ${ok?'unlocked':''}"><span>${ok?'◆':'◇'}</span><div><strong>${a.title}</strong><small>${a.desc}</small></div><b>${ok?'UNLOCKED':'LOCKED'}</b></div>`}).join('')}</div>`;
    this.showModal('ACHIEVEMENTS',html,'CLOSE',()=>this.closeModal());
  },
  openIntel(){
    const html='<div class="intel-log"><p><time>LIVE</time> BLACKNET intelligence channel established.</p><p><time>SYS</time> Target acquisition module standing by.</p><p><time>NET</time> No active security incident detected.</p><p><time>INFO</time> New operations will populate this feed.</p></div>';
    this.showModal('LATEST INTEL',html,'CLOSE',()=>this.closeModal());
  },
  exitGame(){this.showModal('DISCONNECT','<div class="disconnect-state"><span class="disconnect-pulse"></span><strong>SESSION DISCONNECTED</strong><small>Blacknet connection closed safely.</small></div>','CLOSE',()=>this.closeModal());},
  showModal(title,body,action,callback){
    this.closeModal();
    const overlay=document.createElement('div');overlay.className='menu-modal-backdrop';overlay.id='menuModal';
    overlay.innerHTML=`<section class="menu-modal" role="dialog" aria-modal="true" aria-label="${title}"><header><span>// ${title}</span><button id="menuModalX" aria-label="Close">×</button></header><div class="menu-modal-body">${body}</div><footer><button class="menu-modal-action" id="menuModalAction">${action}</button></footer></section>`;
    document.body.appendChild(overlay);overlay.addEventListener('click',e=>{if(e.target===overlay)this.closeModal()});
    document.getElementById('menuModalX').onclick=()=>this.closeModal();document.getElementById('menuModalAction').onclick=callback;
  },
  closeModal(){document.getElementById('menuModal')?.remove();},
  loadSettings(){try{const saved=JSON.parse(localStorage.getItem(this.settingsKey)||'null');if(saved)this.settings={...this.settings,...saved}}catch{}this.applySettings();},
  saveSettings(){localStorage.setItem(this.settingsKey,JSON.stringify(this.settings));},
  applySettings(){
    document.documentElement.classList.toggle('menu-no-matrix',!this.settings.matrix);document.documentElement.classList.toggle('menu-no-scanlines',!this.settings.scanlines);document.documentElement.classList.toggle('menu-no-particles',!this.settings.particles);document.documentElement.classList.toggle('menu-reduced-motion',this.settings.reducedMotion);
    const canvas=document.getElementById('matrix');if(canvas)canvas.style.display=this.settings.matrix?'':'none';
  },
  requestFullscreen(){const el=document.documentElement;if(document.fullscreenElement)return document.exitFullscreen?.();el.requestFullscreen?.().catch(()=>{});},
  renderSessionStatus(){const el=document.getElementById('menuStatus');if(el)el.textContent=this.hasSave()?'SAVED SESSION DETECTED // READY TO RESUME':'NO ACTIVE SESSION FOUND // READY TO INITIALIZE';},
  renderRep(){const el=document.getElementById('menuRep');if(!el)return;const rep=State.rep;el.textContent=rep>=100?'GHOST':rep>=50?'BLACKHAT':rep>=25?'CODER':'SCRIPT KIDDIE';},
  updateClock(){const t=new Date().toLocaleTimeString('en-GB',{hour12:false});document.getElementById('menuServerTime')?.replaceChildren(document.createTextNode(t));document.getElementById('menuUptime')?.replaceChildren(document.createTextNode(t));}
};
export { Menu };

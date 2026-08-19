import { State, getCPS } from './state.js';

export const UI = {
  renderedTab: null,
  logs: [],

  initMatrix(){
    const canvas=document.getElementById('matrix');
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight};
    resize();
    window.addEventListener('resize',resize);
    const drops=[];
    for(let i=0;i<90;i++) drops[i]=Math.random()*innerHeight;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='rgba(53,255,119,.55)';
      ctx.font='11px monospace';
      drops.forEach((y,i)=>{
        ctx.fillText(Math.random()>0.5?'1':'0',i*16,y);
        if(y>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]+=7;
      });
      requestAnimationFrame(draw);
    };
    draw();
  },

  log(text){
    this.logs.unshift(text);
    this.logs=this.logs.slice(0,20);
    const el=document.getElementById('log');
    if(!el) return;
    if(el.classList.contains('terminal')){
      el.innerHTML=this.logs.map(t=>`<div>&gt; ${this.escape(t)}</div>`).join('');
    } else {
      const d=document.createElement('div');
      d.textContent='> '+text;
      el.prepend(d);
      if(el.children.length>20) el.lastChild.remove();
    }
  },

  escape(value){
    return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  },

  float(value){
    const target=document.getElementById('hackBtn');
    if(!target) return;
    const el=document.createElement('div');
    el.className='float';
    el.textContent='+ $'+this.format(value);
    const r=target.getBoundingClientRect();
    el.style.left=(r.left+r.width/2+Math.random()*60-30)+'px';
    el.style.top=(r.top+20)+'px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),800);
  },

  format(n){
    n=Number(n)||0;
    if(n<1000) return Math.floor(n)+'';
    if(n<1e6) return (n/1000).toFixed(1)+'K';
    if(n<1e9) return (n/1e6).toFixed(2)+'M';
    if(n<1e12) return (n/1e9).toFixed(2)+'B';
    return (n/1e12).toFixed(2)+'T';
  },

  getRank(){
    if(State.rep>=250) return 'DIGITAL MYTH';
    if(State.rep>=100) return 'GHOST';
    if(State.rep>=50) return 'BLACKHAT';
    if(State.rep>=25) return 'CODER';
    if(State.rep>=10) return 'PHREAKER';
    return 'SCRIPT KIDDIE';
  },

  getTraceState(){
    if(State.trace>=81) return 'CRITICAL';
    if(State.trace>=61) return 'HUNTED';
    if(State.trace>=41) return 'MONITORED';
    if(State.trace>=21) return 'SUSPICIOUS';
    return 'CLEAN';
  },

  update(){
    const cash=document.getElementById('cash');
    const cps=document.getElementById('cps');
    const trace=document.getElementById('trace');
    const bar=document.getElementById('traceBar');
    const rep=document.getElementById('rep');
    const rank=document.getElementById('rank');
    if(cash) cash.textContent='$'+this.format(State.cash);
    if(cps) cps.textContent='+'+this.format(getCPS())+'/s';
    if(trace) trace.textContent=Math.floor(State.trace)+'%';
    if(bar) bar.style.width=Math.min(100,State.trace)+'%';
    if(rep) rep.textContent=State.rep+' REP';
    if(rank) rank.textContent=this.getRank();

    const traceState=this.getTraceState();
    const traceLabel=document.getElementById('traceLabel');
    const traceStateEl=document.getElementById('traceState');
    if(traceLabel) traceLabel.textContent=traceState;
    if(traceStateEl) traceStateEl.textContent=traceState;

    const pot=Math.floor(Math.sqrt(Math.max(0,State.lifetime)/1e6));
    const potential=document.getElementById('potential');
    if(potential) potential.textContent=pot>0?`RAID READY +${pot} REP`:'';

    const botnet=State.rigs[2]?.count||0;
    const botnetNodes=document.getElementById('botnetNodes');
    const botnetCapacity=document.getElementById('botnetCapacity');
    const botnetBar=document.getElementById('botnetBar');
    if(botnetNodes) botnetNodes.textContent=botnet;
    if(botnetCapacity) botnetCapacity.textContent=`${botnet} / 150`;
    if(botnetBar) botnetBar.style.width=Math.min(100,botnet/150*100)+'%';

    const passive=document.getElementById('passiveIncome');
    const total=document.getElementById('totalIncome');
    if(passive) passive.textContent=this.format(getCPS())+'/s';
    if(total) total.textContent=this.format(getCPS())+'/s';
    const payout=document.getElementById('targetPayout');
    if(payout) payout.textContent='$'+this.format(500+Math.floor(State.cash*.05));

    if(this.renderedTab!==State.tab) this.render();
  },

  render(){
    this.renderedTab=State.tab;
    if(State.tab==='dashboard'){
      const existing=document.querySelector('.dashboard-grid');
      if(existing) existing.style.display='grid';
      return;
    }
    const content=document.getElementById('content');
    if(!content) return;
    content.innerHTML=`<section class="workspace panel-card"><div class="panel-heading"><span>${this.tabTitle(State.tab)}</span><b>LIVE STATE</b></div><div id="workspaceBody" class="workspace-body"></div></section>`;
    const body=document.getElementById('workspaceBody');
    if(State.tab==='rigs') this.renderRigs(body);
    else if(State.tab==='upgrades') this.renderUpgrades(body);
    else if(State.tab==='contracts') this.renderContracts(body);
    else if(State.tab==='targets') this.renderTargets(body);
    else if(State.tab==='operations') this.renderOperations(body);
    else if(State.tab==='reputation') this.renderReputation(body);
    else if(State.tab==='logs') this.renderLogs(body);
  },

  tabTitle(tab){
    return ({targets:'TARGETS',operations:'OPERATIONS',rigs:'INFRASTRUCTURE',contracts:'CONTRACTS',upgrades:'UPGRADES',reputation:'REPUTATION',logs:'SYSTEM LOGS'})[tab]||'DASHBOARD';
  },

  renderRigs(body){
    State.rigs.forEach((r,i)=>{
      const d=document.createElement('div'); d.className='workspace-row';
      d.innerHTML=`<div><strong>${this.escape(r.name)}</strong><small>${this.format(r.prod*r.count)}/s · LEVEL ${r.count}</small></div><button data-buy-rig="${i}" ${State.cash<r.cost?'disabled':''}>$${this.format(r.cost)}</button>`;
      body.appendChild(d);
    });
    body.querySelectorAll('[data-buy-rig]').forEach(b=>b.onclick=()=>window.Game.buyRig(Number(b.dataset.buyRig)));
  },

  renderUpgrades(body){
    State.upgrades.forEach((u,i)=>{
      const d=document.createElement('div'); d.className='workspace-row';
      d.innerHTML=`<div><strong>${this.escape(u.name)}</strong><small>${this.escape(u.desc)} · $${this.format(u.cost)}</small></div><button data-buy-up="${i}" ${u.bought||State.cash<u.cost?'disabled':''}>${u.bought?'OWNED':'BUY'}</button>`;
      body.appendChild(d);
    });
    body.querySelectorAll('[data-buy-up]').forEach(b=>b.onclick=()=>window.Game.buyUp(Number(b.dataset.buyUp)));
  },

  renderContracts(body){
    State.contracts.forEach((c,i)=>{
      const prog=Math.min(c.progress,c.target); const pct=Math.floor(prog/c.target*100);
      const name=c.type==='clicks'?`Hack ${c.target}x`:c.type==='cash'?`Earn $${this.format(c.target)}`:`Own ${c.target} rigs`;
      const d=document.createElement('div'); d.className='workspace-row contract-row';
      d.innerHTML=`<div><strong>CONTRACT ${i+1} · ${pct}%</strong><small>${name} · Reward $${this.format(c.reward)} · ${prog}/${c.target}</small><div class="workspace-progress"><i style="width:${pct}%"></i></div></div><button data-claim="${i}" ${prog<c.target?'disabled':''}>CLAIM</button>`;
      body.appendChild(d);
    });
    body.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>window.Game.claim(Number(b.dataset.claim)));
  },

  renderTargets(body){
    body.innerHTML=`<div class="target-list"><div class="target-row active"><span>◉</span><div><strong>NEONBANK</strong><small>FINANCIAL · SECURITY 72% · MEDIUM TRACE</small></div><button data-target-hack>EXPLOIT</button></div><div class="target-row"><span>◈</span><div><strong>CYBERDYNE CORP</strong><small>CORPORATE · LOCKED BY PROGRESSION</small></div><button disabled>LOCKED</button></div><div class="target-row"><span>◆</span><div><strong>BLACKVAULT</strong><small>PRIVATE NODE · LOCKED</small></div><button disabled>LOCKED</button></div><div class="target-row"><span>◇</span><div><strong>GOVERNMENT NODE</strong><small>HIGH SECURITY · LOCKED</small></div><button disabled>LOCKED</button></div></div>`;
    body.querySelector('[data-target-hack]')?.addEventListener('click',()=>window.Game.hack());
  },

  renderOperations(body){
    body.innerHTML=`<div class="operation-card"><div><small>ACTIVE OPERATION</small><h2>NEONBANK</h2><p>Exploit channel available. Current operation uses the active hack loop.</p></div><div class="operation-steps"><span class="done">1 RECON</span><span class="active">2 EXPLOIT</span><span>3 BREACH</span><span>4 EXFILTRATE</span></div><button data-operation>EXECUTE EXPLOIT</button></div>`;
    body.querySelector('[data-operation]')?.addEventListener('click',()=>window.Game.hack());
  },

  renderReputation(body){
    const tiers=[['SCRIPT KIDDIE',0],['PHREAKER',10],['CODER',25],['BLACKHAT',50],['GHOST',100],['DIGITAL MYTH',250]];
    body.innerHTML=tiers.map(([name,req])=>`<div class="workspace-row ${State.rep>=req?'unlocked':''}"><div><strong>${name}</strong><small>${req} REP REQUIRED</small></div><span>${State.rep>=req?'UNLOCKED':'LOCKED'}</span></div>`).join('');
  },

  renderLogs(body){
    body.innerHTML=this.logs.length?this.logs.map(t=>`<div class="log-row">&gt; ${this.escape(t)}</div>`).join(''):'<div class="log-row">&gt; no activity yet...</div>';
  }
};

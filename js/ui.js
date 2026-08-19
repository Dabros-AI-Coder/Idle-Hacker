import { State, getCPS } from './state.js';
import { Events } from './events.js';

export const UI = {
  initMatrix(){
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    const resize = ()=>{ canvas.width=innerWidth; canvas.height=innerHeight };
    resize(); window.onresize=resize;
    const drops=[]; for(let i=0;i<100;i++) drops[i]=Math.random()*innerHeight;
    function draw(){
      ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#00ff41'; ctx.font='12px monospace';
      drops.forEach((y,i)=>{
        ctx.fillText(Math.random()>0.5?'1':'0', i*14, y);
        if(y>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]+=14;
      });
      requestAnimationFrame(draw);
    }
    draw();
  },
  log(t){
    const el=document.getElementById('log');
    const d=document.createElement('div');
    d.textContent='> '+t;
    el.prepend(d);
    if(el.children.length>20) el.lastChild.remove();
  },
  float(value){
    const el=document.createElement('div');
    el.className='float'; el.textContent='+ $'+UI.format(value);
    const r=document.getElementById('hackBtn').getBoundingClientRect();
    el.style.left=(r.left+r.width/2+Math.random()*60-30)+'px';
    el.style.top=(r.top+20)+'px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),800);
  },
  format(n){
    if(n<1000) return Math.floor(n)+'';
    if(n<1e6) return (n/1000).toFixed(1)+'K';
    if(n<1e9) return (n/1e6).toFixed(2)+'M';
    return (n/1e9).toFixed(2)+'B';
  },
  update(){
    document.getElementById('cash').textContent='$'+this.format(State.cash);
    document.getElementById('cps').textContent=this.format(getCPS())+'/s';
    document.getElementById('trace').textContent=Math.floor(State.trace)+'%';
    document.getElementById('traceBar').style.width=State.trace+'%';
    document.getElementById('rep').textContent=State.rep;
    const pot=Math.floor(Math.sqrt(State.lifetime/1e6));
    document.getElementById('potential').textContent=pot>0?` RAID NOW +${pot} REP`:'';
    const oc=document.getElementById('ocBtn');
    if(State.overclockActive){ oc.textContent='OVERCLOCK ACTIVE'; oc.className='overclock active'; }
    else if(State.overclockCd>0){ oc.textContent=`COOLING ${State.overclockCd.toFixed(0)}s`; oc.className='overclock cool'; }
    else{ oc.textContent='OVERCLOCK READY [5x 10s]'; oc.className='overclock'; }
    document.getElementById('combo').textContent=State.combo>1?`COMBO x${(1+State.combo*0.4).toFixed(1)} (${State.combo})`:'';
    let rank='Script Kiddie';
    if(State.cash>1000) rank='Phreaker';
    if(State.cash>10000) rank='Coder';
    if(State.cash>100000) rank='Blackhat';
    if(State.cash>1e6) rank='Ghost';
    if(State.cash>1e7) rank='Legend';
    document.getElementById('rank').textContent=rank;
    this.render();
  },
  render(){
    const p=document.getElementById('panel'); p.innerHTML='';
    if(State.tab==='rigs'){
      State.rigs.forEach((r,i)=>{
        const d=document.createElement('div'); d.className='card';
        d.innerHTML=`<div><b>${r.name}</b> x${r.count}<br><span style="font-size:11px">${r.prod}/s • ${this.format(r.prod*r.count)}/s</span></div><button ${State.cash<r.cost?'disabled':''} data-buy-rig="${i}">$${this.format(r.cost)}</button>`;
        p.appendChild(d);
      });
      p.querySelectorAll('[data-buy-rig]').forEach(b=> b.onclick=()=> window.Game.buyRig(parseInt(b.dataset.buyRig)));
    }
    if(State.tab==='upgrades'){
      State.upgrades.forEach((u,i)=>{
        const d=document.createElement('div'); d.className='card';
        d.innerHTML=`<div><b>${u.name}</b> ${u.bought?'[OWNED]':''}<br><span style="font-size:11px">${u.desc} - $${this.format(u.cost)}</span></div><button ${u.bought||State.cash<u.cost?'disabled':''} data-buy-up="${i}">${u.bought?'DONE':'BUY'}</button>`;
        p.appendChild(d);
      });
      p.querySelectorAll('[data-buy-up]').forEach(b=> b.onclick=()=> window.Game.buyUp(parseInt(b.dataset.buyUp)));
    }
    if(State.tab==='contracts'){
      State.contracts.forEach((c,i)=>{
        const prog=Math.min(c.progress,c.target);
        const pct=Math.floor(prog/c.target*100);
        const d=document.createElement('div'); d.className='card';
        let name=c.type==='clicks'?`Hack ${c.target}x`:c.type==='cash'?`Earn $${this.format(c.target)}`:`Own ${c.target} rigs`;
        d.innerHTML=`<div><b>CONTRACT ${i+1}</b> ${pct}%<br><span style="font-size:11px">${name} - ${prog}/${c.target}</span><br><span style="color:#ffcc00;font-size:11px">Reward $${this.format(c.reward)} -5% trace</span></div><button ${prog<c.target?'disabled':''} data-claim="${i}">CLAIM</button>`;
        p.appendChild(d);
      });
      p.querySelectorAll('[data-claim]').forEach(b=> b.onclick=()=> window.Game.claim(parseInt(b.dataset.claim)));
    }
  }
};

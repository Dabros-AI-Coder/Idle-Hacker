import { State, getCPS, getClick, getRigCost } from './state.js';
import { Save } from './save.js';
import { UI } from './ui.js';
import { Events } from './events.js';

export const Game = {
  started:false,
  init(){
    if(this.started) return;
    this.started=true;
    Save.load();
    this.bind();
    this.loop();
    Events.schedule();
    setInterval(()=>Save.save(),2000);
    UI.update();
    UI.log('connected to darknet...');
    document.querySelectorAll('.tab').forEach(el=>{
      el.onclick=()=>{
        State.tab=el.dataset.tab;
        document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
        document.querySelectorAll(`.tab[data-tab="${State.tab}"]`).forEach(t=>t.classList.add('active'));
        UI.render();
      };
    });
    const vuln=document.getElementById('vuln');
    if(vuln) vuln.onclick=()=>Events.hit();
  },
  bind(){
    const btn=document.getElementById('hackBtn');
    if(btn){
      const handler=(e)=>{e.preventDefault();this.hack()};
      btn.ontouchstart=handler;
      btn.onmousedown=handler;
      btn.onclick=handler;
    }
    const oc=document.getElementById('ocBtn');
    if(oc) oc.onclick=()=>this.overclock();
  },
  hack(){
    const now=Date.now();
    if(now-State.lastClick<1500){State.combo++;if(State.combo>10)State.combo=10}else State.combo=0;
    State.lastClick=now;
    clearTimeout(this.comboTimer);
    this.comboTimer=setTimeout(()=>{State.combo=0;UI.update()},1500);
    const gain=getClick();
    State.cash+=gain;State.lifetime+=gain;State.trace+=0.08;
    if(State.trace>100)State.trace=100;
    State.contracts.forEach(c=>{
      if(c.type==='clicks')c.progress++;
      if(c.type==='cash')c.progress=State.lifetime;
      if(c.type==='rigs')c.progress=State.rigs.reduce((a,r)=>a+r.count,0);
    });
    UI.float(gain);UI.log(`exploit successful +$${gain.toFixed(0)}`);UI.update();
  },
  buyRig(i){
    const r=State.rigs[i];
    if(State.cash>=r.cost){State.cash-=r.cost;r.count++;r.cost=getRigCost(r);State.trace+=0.6;UI.log('bought '+r.name);UI.update()}
  },
  buyUp(i){
    const u=State.upgrades[i];
    if(!u.bought&&State.cash>=u.cost){State.cash-=u.cost;u.bought=true;UI.log('upgrade '+u.name);UI.update()}
  },
  claim(i){
    const c=State.contracts[i];
    if(c.progress>=c.target){
      State.cash+=c.reward;State.trace-=5;if(State.trace<0)State.trace=0;
      State.contracts[i]={type:['clicks','cash','rigs'][Math.floor(Math.random()*3)],target:c.target*2,progress:0,reward:Math.floor(c.reward*2.2)};
      UI.log(`contract done +$${c.reward}`);UI.update();
    }
  },
  cleanLogs(){
    if(State.cash>=10000&&State.trace>0){State.cash-=10000;State.trace-=50;if(State.trace<0)State.trace=0;UI.log('logs cleaned');UI.update()}
  },
  doRaid(){
    const pot=Math.floor(Math.sqrt(State.lifetime/1e6));
    if(pot<=0)return alert('Need $1M lifetime');
    if(!confirm(`RAID? +${pot} REP (+${pot*15}% forever)`))return;
    State.rep+=pot;State.cash=0;State.trace=0;
    State.rigs.forEach(r=>{r.count=0;r.cost=r.baseCost});
    State.upgrades.forEach(u=>u.bought=false);
    State.combo=0;State.boostTime=0;State.overclockActive=false;State.overclockCd=0;
    State.contracts=[{type:'clicks',target:50,progress:0,reward:500},{type:'cash',target:5000,progress:0,reward:2000},{type:'rigs',target:5,progress:0,reward:5000}];
    UI.log('RAID +'+pot+' REP');UI.update();
  },
  overclock(){
    if(State.overclockActive||State.overclockCd>0)return;
    State.overclockActive=true;UI.log('OVERCLOCK 5x 10s');
    setTimeout(()=>{State.overclockActive=false;State.overclockCd=60;UI.update()},10000);
  },
  loop(){
    setInterval(()=>{
      const cps=getCPS();
      State.cash+=cps/10;State.lifetime+=cps/10;
      if(State.boostTime>0)State.boostTime-=0.1;
      if(State.overclockCd>0)State.overclockCd-=0.1;
      State.contracts.forEach(c=>{
        if(c.type==='cash')c.progress=State.lifetime;
        if(c.type==='rigs')c.progress=State.rigs.reduce((a,r)=>a+r.count,0);
      });
      UI.update();
    },100);
  }
};

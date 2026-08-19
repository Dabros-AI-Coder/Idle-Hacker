import { State } from './state.js';
import { UI } from './ui.js';

export const Events = {
  vulnTimeout: null,
  schedule(){
    clearTimeout(this.vulnTimeout);
    this.vulnTimeout = setTimeout(()=> this.spawn(), 25000 + Math.random()*20000);
  },
  spawn(){
    const el = document.getElementById('vuln');
    el.style.display = 'block';
    setTimeout(()=>{ el.style.display='none'; this.schedule(); }, 7000);
  },
  hit(){
    const el = document.getElementById('vuln');
    el.style.display = 'none';
    const bonus = State.cash * 0.15 + 500;
    State.cash += bonus;
    State.boostTime = 120;
    UI.log(`VULN EXPLOITED +$${bonus.toFixed(0)} 2x 2min`);
    this.schedule();
  }
};

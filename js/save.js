import { State, getCPS } from './state.js';

export const Save = {
  key: 'hackerTycoon_modular',
  save(){
    State.lastSave = Date.now();
    localStorage.setItem(this.key, JSON.stringify(State));
  },
  load(){
    const raw = localStorage.getItem(this.key);
    if(!raw) return;
    try{
      const p = JSON.parse(raw);
      Object.assign(State, p);
      // restore rigs/upgrades if saved partially
      if(p.rigs) State.rigs = p.rigs;
      if(p.upgrades) State.upgrades = p.upgrades;
      if(p.contracts) State.contracts = p.contracts;
      // offline
      if(p.lastSave){
        const diff = (Date.now() - p.lastSave)/1000;
        const gain = getCPS() * diff * 0.5;
        State.cash += gain;
        State.lifetime += gain;
        console.log(`Offline +$${gain}`);
      }
    }catch(e){ console.error('save corrupt', e)}
  }
};

export const State = {
  cash: 0,
  lifetime: 0,
  rep: 0,
  trace: 0,
  clickPower: 1,
  combo: 0,
  lastClick: 0,
  overclockActive: false,
  overclockCd: 0,
  boostTime: 0,
  rigs: [
    { id:'laptop', name:'Skid Laptop', baseCost:15, cost:15, prod:0.2, count:0 },
    { id:'phishing', name:'Phishing Kit', baseCost:150, cost:150, prod:1.5, count:0 },
    { id:'botnet', name:'Botnet Node', baseCost:2000, cost:2000, prod:12, count:0 },
    { id:'zeroday', name:'Zero-Day', baseCost:25000, cost:25000, prod:110, count:0 },
    { id:'quantum', name:'Quantum Rig', baseCost:300000, cost:300000, prod:900, count:0 },
  ],
  upgrades: [
    { id:'click', name:'Better Scripts', desc:'Click x3', cost:500, bought:false, mult:3, req:0 },
    { id:'proxy', name:'Proxy Chain', desc:'Global x2.5', cost:5000, bought:false, mult:2.5, req:1 },
    { id:'ai', name:'AI Assistant', desc:'Rigs x2', cost:50000, bought:false, mult:2, req:2 },
  ],
  contracts: [
    { type:'clicks', target:50, progress:0, reward:500 },
    { type:'cash', target:5000, progress:0, reward:2000 },
    { type:'rigs', target:5, progress:0, reward:5000 },
  ],
  tab: 'rigs'
};

export function getCPS(){
  let base = 0;
  State.rigs.forEach(r=> base += r.count * r.prod);
  let mult = 1 + State.rep * 0.15;
  if(State.upgrades[1].bought) mult *= State.upgrades[1].mult;
  if(State.upgrades[2].bought) mult *= State.upgrades[2].mult;
  if(State.overclockActive) mult *= 5;
  if(State.boostTime > 0) mult *= 2;
  return base * mult;
}

export function getClick(){
  let c = State.clickPower;
  if(State.upgrades[0].bought) c *= State.upgrades[0].mult;
  c *= 1 + State.rep * 0.15;
  let comboMult = 1 + State.combo * 0.4;
  if(comboMult > 3) comboMult = 3;
  if(State.overclockActive) comboMult *= 5;
  if(State.boostTime > 0) comboMult *= 2;
  return c * comboMult;
}

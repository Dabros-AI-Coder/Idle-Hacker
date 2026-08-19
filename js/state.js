export const RIG_DEFAULTS = [
  { id:'laptop', name:'Skid Laptop', baseCost:25, growth:1.15, prod:0.2 },
  { id:'phishing', name:'Phishing Kit', baseCost:150, growth:1.16, prod:1.5 },
  { id:'botnet', name:'Botnet Node', baseCost:1000, growth:1.17, prod:12 },
  { id:'zeroday', name:'Zero-Day', baseCost:10000, growth:1.18, prod:110 },
  { id:'quantum', name:'Quantum Rig', baseCost:100000, growth:1.20, prod:900 },
];

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
  rigs: RIG_DEFAULTS.map(rig=>({ ...rig, cost:rig.baseCost, count:0 })),
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

export function getRigCost(rig){
  return Math.floor(rig.baseCost * Math.pow(rig.growth, rig.count));
}

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

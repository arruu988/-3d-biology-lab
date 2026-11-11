/* 3D Biology Lab — app.js | Three.js r128 (global THREE), no build step */
(function(){
'use strict';
function el(id){return document.getElementById(id);}
function showInfo(panelId, d){
  var p = el(panelId); if(!p) return;
  p.innerHTML = '<span class="tag">'+d.tag+'</span><h3>'+d.title+'</h3><p>'+d.text+'</p><div class="neet-fact"><b>NEET fact:</b> '+d.fact+'</div>';
}
function makeButtons(containerId, items, onPick){
  var c = el(containerId); if(!c) return;
  items.forEach(function(it){
    var b=document.createElement('button'); b.textContent=it.label; b.type='button';
    b.onclick=function(){ onPick(it); c.querySelectorAll('button').forEach(function(x){x.classList.remove('active');}); b.classList.add('active'); };
    c.appendChild(b);
  });
}
/* ---- generic Three.js scene with drag rotate + click raycast ---- */
function makeScene(wrapId, onClick){
  if(typeof THREE==='undefined'){ var w=el(wrapId); if(w) w.innerHTML='<p style="padding:20px;color:#9fb0d0">3D load nahi hua — internet / Three.js CDN check karo, phir refresh karo.</p>'; return null; }
  var wrap=el(wrapId); if(!wrap) return null;
  var scene=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(48, 1.6, 0.1, 100); cam.position.set(0,0.6,7.2);
  var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  wrap.appendChild(renderer.domElement);
  function resize(){ var wdt=wrap.clientWidth||600, hgt=wrap.clientHeight||360; renderer.setSize(wdt,hgt); cam.aspect=wdt/hgt; cam.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);
  scene.add(new THREE.AmbientLight(0xffffff,0.75));
  var l1=new THREE.DirectionalLight(0xffffff,0.9); l1.position.set(4,6,6); scene.add(l1);
  var l2=new THREE.PointLight(0x22d3ee,0.7,20); l2.position.set(-5,-2,4); scene.add(l2);
  var group=new THREE.Group(); scene.add(group);
  var drag=false, px=0, py=0, velX=0.0035;
  function pos(e){ return e.touches&&e.touches[0]?e.touches[0]:e; }
  renderer.domElement.addEventListener('pointerdown',function(e){drag=true;px=pos(e).clientX;py=pos(e).clientY;});
  window.addEventListener('pointerup',function(){drag=false;});
  renderer.domElement.addEventListener('pointermove',function(e){ if(!drag) return; var p=pos(e); group.rotation.y+=(p.clientX-px)*0.008; group.rotation.x+=(p.clientY-py)*0.005; px=p.clientX; py=p.clientY; velX=0; });
  var ray=new THREE.Raycaster(), mouse=new THREE.Vector2();
  renderer.domElement.addEventListener('click',function(e){
    if(!onClick) return; var r=renderer.domElement.getBoundingClientRect();
    mouse.x=((e.clientX-r.left)/r.width)*2-1; mouse.y=-((e.clientY-r.top)/r.height)*2+1;
    ray.setFromCamera(mouse,cam);
    var hits=ray.intersectObjects(group.children,true);
    if(hits.length){ var o=hits[0].object; while(o && !o.userData.info && o.parent) o=o.parent; if(o && o.userData.info) onClick(o.userData.info, o); }
  });
  var clock=new THREE.Clock();
  (function loop(){ requestAnimationFrame(loop); var dt=clock.getDelta(); if(!drag){ group.rotation.y+=velX; } if(scene.userData.tick) scene.userData.tick(dt, group); renderer.render(scene,cam); })();
  return {scene:scene,group:group,cam:cam,renderer:renderer};
}
function sphere(color, r, x,y,z, info, sx,sy,sz){
  var m=new THREE.Mesh(new THREE.SphereGeometry(r,28,22), new THREE.MeshStandardMaterial({color:color, roughness:0.45, metalness:0.1, transparent:true, opacity:0.96}));
  m.position.set(x,y,z); if(sx) m.scale.set(sx,sy||sx,sz||sx); if(info) m.userData.info=info; return m;
}
function tube(a,b,color,r){
  var dir=new THREE.Vector3().subVectors(b,a); var len=dir.length();
  var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12), new THREE.MeshStandardMaterial({color:color, roughness:0.5}));
  m.position.copy(a).addScaledVector(dir,0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize()); return m;
}
var INFO={
 animalNucleus:{tag:'Animal Cell',label:'Nucleus',title:'Nucleus — Brain of the Cell',text:'Cell ka control centre. DNA yahin rehta hai, jo saare instructions deta hai — protein kaise bane, cell kab divide ho.',fact:'Nucleus me nucleolus hota hai, jahan rRNA banta hai. NEET me poochte hain: nucleus ko “brain” kyun kehte hain?'},
 animalMito:{tag:'Animal Cell',label:'Mitochondria',title:'Mitochondria — Powerhouse',text:'Yahan aerobic respiration hoti hai aur ATP (energy) banta hai. Iska apna DNA aur ribosome hota hai — isliye kehte hain ye pehle free-living bacteria tha.',fact:'Mitochondria ka DNA sirf maa se milta hai (maternal inheritance).'},
 animalRibo:{tag:'Animal Cell',label:'Ribosome',title:'Ribosome — Protein Factory',text:'Protein synthesis yahin hoti hai. mRNA ko padhkar amino acids ko jodta hai. Free ribosome ya RER par hote hain.',fact:'70S ribosome prokaryotes me, 80S eukaryotes me — antibiotic isi farq par kaam karte hain.'},
 animalER:{tag:'Animal Cell',label:'Endoplasmic Reticulum',title:'Endoplasmic Reticulum (ER)',text:'Rough ER (ribosome wali) protein banati/fold karti hai. Smooth ER lipid aur detox ka kaam karti hai.',fact:'Rough ER protein ko Golgi tak bhejti hai — ye sequence NEET me pakka poochte hain.'},
 animalGolgi:{tag:'Animal Cell',label:'Golgi Body',title:'Golgi Body — Post Office',text:'Protein ko modify, pack aur sahi jagah bhejta hai. Lysosome bhi yahin se bante hain.',fact:'Golgi ko “post office of the cell” kehte hain — packaging + secretion.'},
 animalLyso:{tag:'Animal Cell',label:'Lysosome',title:'Lysosome — Suicide Bag',text:'Digestive enzymes se purana/waste material todta hai. Cell marne par ye phat sakta hai — isliye suicide bag.',fact:'Lysosome ke enzymes acidic pH par kaam karte hain.'},
 animalCyto:{tag:'Animal Cell',label:'Cytoplasm',title:'Cytoplasm',text:'Jelly jaisa fluid jisme saare organelles tairte hain. Yahan glycolysis hoti hai — glucose ka pehla step.',fact:'Glycolysis cytoplasm me hoti hai — mitochondria ki zaroorat nahi.'},
 animalMem:{tag:'Animal Cell',label:'Cell Membrane',title:'Cell Membrane',text:'Phospholipid bilayer — selectively permeable. Andar-bahar kya jayega, ye decide karti hai. Fluid mosaic model.',fact:'Fluid Mosaic Model — Singer & Nicolson, 1972.'},
 plantChloro:{tag:'Plant Cell',label:'Chloroplast',title:'Chloroplast — Kitchen of the Cell',text:'Photosynthesis yahin hoti hai — sunlight + CO₂ + water → glucose + O₂. Chlorophyll green rang deta hai.',fact:'Chloroplast me bhi apna DNA hota hai, mitochondria ki tarah.'},
 plantVacuole:{tag:'Plant Cell',label:'Vacuole',title:'Vacuole — Storehouse',text:'Paani, salts aur waste store karti hai. Plant cell me 90% volume tak — turgor pressure se plant khada rehta hai.',fact:'Vacuole badi ho to cell turgid rehta hai — plant murjhata nahi.'},
 plantWall:{tag:'Plant Cell',label:'Cell Wall',title:'Cell Wall',text:'Cellulose ki sakht deewar — shape aur protection deti hai. Animal cell me nahi hoti.',fact:'Cell wall cellulose ki hoti hai — fungi me chitin, bacteria me peptidoglycan.'},
 plantNucleus:{tag:'Plant Cell',label:'Nucleus',title:'Nucleus',text:'Animal cell jaisa hi — control centre, DNA yahin.',fact:'Plant aur animal dono eukaryotic cells hain — true nucleus hota hai.'},
 plantMito:{tag:'Plant Cell',label:'Mitochondria',title:'Mitochondria',text:'Respiration aur ATP — plant me bhi powerhouse wahi.',fact:'Plant din me photosynthesis karta hai, raat me sirf respiration.'},
 heartRA:{tag:'Human Heart',label:'Right Atrium',title:'Right Atrium',text:'Body se deoxygenated blood vena cava se yahan aata hai.',fact:'SA node right atrium me hota hai — heart ka pacemaker.'},
 heartRV:{tag:'Human Heart',label:'Right Ventricle',title:'Right Ventricle',text:'Blood ko lungs tak pump karta hai (pulmonary circulation). Iski deewar left se patli hoti hai.',fact:'Right ventricle se pulmonary artery me deoxygenated blood jata hai.'},
 heartLA:{tag:'Human Heart',label:'Left Atrium',title:'Left Atrium',text:'Lungs se oxygenated blood pulmonary vein se yahan aata hai.',fact:'Pulmonary vein ekmatra vein hai jisme oxygenated blood hota hai.'},
 heartLV:{tag:'Human Heart',label:'Left Ventricle',title:'Left Ventricle',text:'Sabse moti deewar — pure body ko blood pump karta hai (aorta se).',fact:'Left ventricle ki wall sabse thick hoti hai — systemic pressure sabse zyada.'},
 heartAorta:{tag:'Human Heart',label:'Aorta',title:'Aorta',text:'Body ki sabse badi artery — left ventricle se oxygenated blood poore body me.',fact:'Aorta me blood pressure sabse zyada hota hai.'}
};

/* ---- 1. DNA double helix ---- */
(function(){
  var s=makeScene('dna-wrap'); if(!s) return;
  var g=s.group; var pts=[];
  for(var i=0;i<26;i++){ var t=i*0.55, y=2.6-i*0.21, x=Math.cos(t)*1.1, z=Math.sin(t)*1.1;
    var a=sphere(i%2?0x22d3ee:0xa78bfa,0.16,x,y,z,null); var b=sphere(i%2?0xa78bfa:0x22d3ee,0.16,-x,y,-z,null);
    g.add(a); g.add(b); g.add(tube(new THREE.Vector3(x,y,z), new THREE.Vector3(-x,y,-z), i%4<2?0x34d399:0xfacc15, 0.045));
    if(i>0){ var p=pts[pts.length-1]; }
    pts.push(a);
  }
  var c1=sphere(0xf472b6,0.07,0,2.9,0,null); g.add(c1);
  s.scene.userData.tick=function(dt,grp){ grp.rotation.y+=dt*0.25; };
})();
/* ---- 2. Animal cell ---- */
(function(){
  var picked=null;
  function pick(d, mesh){ showInfo('animal-info', d); if(picked) picked.material.emissive=new THREE.Color(0x000000); if(mesh&&mesh.material.emissive){ mesh.material.emissive=new THREE.Color(0x224466); picked=mesh; } }
  var s=makeScene('animal-wrap', function(d,m){ pick(d,m); }); if(!s) return;
  var g=s.group;
  var mem=sphere(0x38bdf8,2.0,0,0,0,INFO.animalMem,1,1,1); mem.material.transparent=true; mem.material.opacity=0.22; g.add(mem);
  var cyto=sphere(0x7dd3fc,1.85,0,0,0,INFO.animalCyto); cyto.material.opacity=0.18; g.add(cyto);
  g.add(sphere(0xa78bfa,0.75,0.2,0.3,0.4,INFO.animalNucleus));
  g.add(sphere(0x7c3aed,0.28,0.2,0.3,0.9,INFO.animalNucleus));
  g.add(sphere(0xf97316,0.42,-0.9,-0.5,0.6,INFO.animalMito,1.6,0.7,0.7));
  g.add(sphere(0xf97316,0.42,0.9,-0.9,-0.5,INFO.animalMito,1.6,0.7,0.7));
  g.add(sphere(0xfacc15,0.22,1.2,0.9,0.3,INFO.animalRibo)); g.add(sphere(0xfacc15,0.22,-1.2,0.8,-0.4,INFO.animalRibo)); g.add(sphere(0xfacc15,0.22,0.6,-1.3,0.5,INFO.animalRibo)); g.add(sphere(0xfacc15,0.22,-0.5,1.3,-0.6,INFO.animalRibo));
  var er=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.09,10,40), new THREE.MeshStandardMaterial({color:0x34d399})); er.position.set(-0.6,0.2,-0.7); er.userData.info=INFO.animalER; g.add(er);
  for(var i=0;i<3;i++){ var gg=sphere(0xf472b6,0.5,0.9-i*0.15,0.5-i*0.22,-0.9,INFO.animalGolgi,1.5,0.45,1); g.add(gg); }
  g.add(sphere(0xef4444,0.3,-1.3,-0.2,0.9,INFO.animalLyso)); g.add(sphere(0xef4444,0.26,1.4,0.1,-0.9,INFO.animalLyso));
  makeButtons('animal-btns', Object.keys(INFO).filter(function(k){return k.indexOf('animal')===0;}).map(function(k){return {label:INFO[k].label, info:INFO[k]};}), function(it){ pick(it.info,null); });
  s.scene.userData.tick=function(dt,grp){ grp.rotation.y+=dt*0.12; };
})();
/* ---- 3. Plant cell ---- */
(function(){
  function pick(d){ showInfo('plant-info', d); }
  var s=makeScene('plant-wrap', function(d){ pick(d); }); if(!s) return;
  var g=s.group;
  var wall=new THREE.Mesh(new THREE.BoxGeometry(4.2,3.4,2.2), new THREE.MeshStandardMaterial({color:0x84cc16, transparent:true, opacity:0.18, roughness:0.4}));
  wall.userData.info=INFO.plantWall; g.add(wall);
  var mem=sphere(0x38bdf8,1.6,0,0,0,INFO.plantWall); mem.material.opacity=0.12; mem.scale.set(1.25,1,0.65); g.add(mem);
  g.add(sphere(0x3b82f6,0.95,0,0,0.2,INFO.plantVacuole,1.3,0.9,0.6));
  g.add(sphere(0xa78bfa,0.55,-1.2,0.7,0.5,INFO.plantNucleus));
  g.add(sphere(0x22c55e,0.45,1.2,0.8,0.5,INFO.plantChloro,1.5,0.7,0.7));
  g.add(sphere(0x22c55e,0.45,1.3,-0.8,-0.4,INFO.plantChloro,1.5,0.7,0.7));
  g.add(sphere(0x22c55e,0.45,-1.3,-0.9,0.4,INFO.plantChloro,1.5,0.7,0.7));
  g.add(sphere(0xf97316,0.35,0.9,1.1,-0.5,INFO.plantMito,1.5,0.7,0.7));
  makeButtons('plant-btns', ['plantChloro','plantVacuole','plantWall','plantNucleus','plantMito'].map(function(k){return {label:INFO[k].label, info:INFO[k]};}), function(it){ pick(it.info); });
  s.scene.userData.tick=function(dt,grp){ grp.rotation.y+=dt*0.12; };
})();
/* ---- 4. Beating heart ---- */
(function(){
  function pick(d){ showInfo('heart-info', d); }
  var s=makeScene('heart-wrap', function(d){ pick(d); }); if(!s) return;
  var g=s.group; var beatParts=[];
  function heartPart(color, r, x,y,z, info, sx,sy,sz){ var m=sphere(color,r,x,y,z,info,sx,sy,sz); g.add(m); beatParts.push(m); return m; }
  heartPart(0xef4444,0.85,0.55,-0.5,0,INFO.heartLV,0.95,1.15,0.85);
  heartPart(0xf87171,0.75,-0.55,-0.4,0,INFO.heartRV,0.9,1.05,0.85);
  heartPart(0xfca5a5,0.5,0.45,0.65,0,INFO.heartLA,1,0.7,0.8);
  heartPart(0xfca5a5,0.5,-0.5,0.6,0,INFO.heartRA,1,0.7,0.8);
  var aorta=tube(new THREE.Vector3(0,1.0,0), new THREE.Vector3(0.35,2.0,0), 0xef4444, 0.22); aorta.userData.info=INFO.heartAorta; g.add(aorta);
  var aorta2=tube(new THREE.Vector3(0.35,2.0,0), new THREE.Vector3(0.9,1.9,0), 0xef4444, 0.18); aorta2.userData.info=INFO.heartAorta; g.add(aorta2);
  makeButtons('heart-btns', ['heartRA','heartRV','heartLA','heartLV','heartAorta'].map(function(k){return {label:INFO[k].label, info:INFO[k]};}), function(it){ pick(it.info); });
  var t=0;
  s.scene.userData.tick=function(dt,grp){ t+=dt; var beat=1+0.07*Math.max(0,Math.sin(t*4.5)); beatParts.forEach(function(m){ m.scale.set(m.userData.base?m.userData.base[0]*beat:beat, m.userData.base?m.userData.base[1]*beat:beat, m.userData.base?m.userData.base[2]*beat:beat); }); grp.rotation.y+=dt*0.2; };
  beatParts.forEach(function(m){ m.userData.base=[m.scale.x,m.scale.y,m.scale.z]; });
})();

/* ---- DNA base pairing ---- */
document.querySelectorAll('.pair button').forEach(function(b){
  b.addEventListener('click', function(){
    var p=b.getAttribute('data-pair'); var r=el('pair-result');
    document.querySelectorAll('.pair button').forEach(function(x){x.classList.remove('correct','wrong');});
    if(p==='AT'||p==='GC'){ b.classList.add('correct'); r.textContent = p==='AT' ? '✅ Sahi! A–T me 2 hydrogen bonds hote hain.' : '✅ Sahi! G–C me 3 hydrogen bonds hote hain — isliye G–C zyada strong hota hai.'; }
    else { b.classList.add('wrong'); r.textContent='❌ Galat pair! A hamesha T se, G hamesha C se judta hai. A–G ya T–C kabhi nahi.'; }
  });
});
/* ---- Test 04 checklist ---- */
var CHECKLIST=[
 {id:'c1',t:'Breathing — TV, VC, alveoli, O₂/CO₂ transport'},
 {id:'c2',t:'Body Fluids — blood cells, heart, ECG, double circulation'},
 {id:'c3',t:'Excretory — nephron, GFR, urine formation, ADH'},
 {id:'c4',t:'Plant Kingdom — 5 groups + examples chart'},
 {id:'c5',t:'Cell Cycle — mitosis PMAT + meiosis crossing over'},
 {id:'c6',t:'Biomolecules / Cell — enzymes, organelles table'}
];
(function(){
  var box=el('checklist'); if(!box) return;
  var saved={}; try{ saved=JSON.parse(localStorage.getItem('t04check')||'{}'); }catch(e){}
  function update(){ var done=CHECKLIST.filter(function(c){return saved[c.id];}).length; var p=el('check-progress'); if(p) p.textContent='Progress: '+done+' / '+CHECKLIST.length+' done'; try{ localStorage.setItem('t04check', JSON.stringify(saved)); }catch(e){} }
  CHECKLIST.forEach(function(c){
    var d=document.createElement('div'); d.className='card';
    var lab=document.createElement('label'); lab.style.cursor='pointer';
    var cb=document.createElement('input'); cb.type='checkbox'; cb.checked=!!saved[c.id]; cb.style.marginRight='8px';
    cb.onchange=function(){ saved[c.id]=cb.checked; update(); };
    lab.appendChild(cb); lab.appendChild(document.createTextNode(c.t)); d.appendChild(lab); box.appendChild(d);
  });
  update();
  var cd=el('countdown'); if(cd){ var target=new Date('2026-11-22T09:00:00+05:30'); var diff=Math.ceil((target-new Date())/86400000); cd.textContent = diff>0 ? diff+' days left — Test 04 on 22 Nov 2026' : 'Test 04 day — all the best!'; }
})();
/* ---- Quizzes ---- */
var QUIZ=[
 {q:'Powerhouse of the cell kaun hai?',o:['Nucleus','Mitochondria','Ribosome','Golgi body'],a:1,e:'Mitochondria me ATP banta hai — aerobic respiration yahin hoti hai.'},
 {q:'Photosynthesis kahan hoti hai?',o:['Mitochondria','Chloroplast','Nucleus','Vacuole'],a:1,e:'Chloroplast me chlorophyll hota hai — plant cell ki kitchen.'},
 {q:'DNA me Adenine kis se pair karta hai?',o:['Guanine','Cytosine','Thymine','Uracil'],a:2,e:'A–T (2 H-bonds), G–C (3 H-bonds) — Chargaff rule.'},
 {q:'Protein synthesis kahan hoti hai?',o:['Lysosome','Ribosome','Vacuole','Cell wall'],a:1,e:'Ribosome = protein factory. 70S prokaryote, 80S eukaryote.'},
 {q:'Human heart me kitne chambers hote hain?',o:['2','3','4','5'],a:2,e:'2 atria + 2 ventricles = 4 chambers.'},
 {q:'Suicide bag of the cell?',o:['Golgi body','Lysosome','Nucleus','ER'],a:1,e:'Lysosome me digestive enzymes hote hain.'},
 {q:'Oxygenated blood heart ke kis part se body me jata hai?',o:['Right ventricle','Left ventricle','Right atrium','Left atrium'],a:1,e:'Left ventricle → Aorta → body. Iski wall sabse moti hoti hai.'},
 {q:'Nephron kis organ ki functional unit hai?',o:['Liver','Lung','Kidney','Heart'],a:2,e:'Kidney me ~1 million nephron hote hain.'},
 {q:'Mitosis se kitni identical cells banti hain?',o:['1','2','4','8'],a:1,e:'Mitosis: 2 diploid identical cells. Meiosis: 4 haploid.'},
 {q:'Plant cell me cell wall kis ki bani hoti hai?',o:['Chitin','Cellulose','Peptidoglycan','Lignin'],a:1,e:'Cellulose — plant; chitin — fungi; peptidoglycan — bacteria.'}
];
var TEST04=[
 {c:'Breathing',q:'Tidal volume kitna hota hai?',o:['100 mL','500 mL','1,200 mL','4,600 mL'],a:1,e:'TV = 500 mL, normal breath me andar-bahar hone wali hawa.'},
 {c:'Breathing',q:'Gas exchange kahan hota hai?',o:['Trachea','Bronchi','Alveoli','Larynx'],a:2,e:'Alveoli me diffusion se O₂ blood me aur CO₂ bahar jata hai.'},
 {c:'Breathing',q:'Oxygen ka zyada tar transport kaise hota hai?',o:['Plasma me dissolved','Haemoglobin se (oxyhaemoglobin)','Bicarbonate se','Platelets se'],a:1,e:'97% O₂ haemoglobin se jata hai.'},
 {c:'Breathing',q:'Vital capacity kitni hoti hai?',o:['500 mL','1,200 mL','4,600 mL','5,800 mL'],a:2,e:'VC = TV + IRV + ERV = 4,600 mL.'},
 {c:'Breathing',q:'Emphysema kis se hota hai?',o:['Virus','Cigarette smoking','Bacteria','Allergy'],a:1,e:'Emphysema alveolar wall damage — chronic cigarette smoking.'},
 {c:'Body Fluids',q:'RBC ki life kitni hoti hai?',o:['30 days','60 days','120 days','365 days'],a:2,e:'RBC 120 din, no nucleus, spleen me destroy.'},
 {c:'Body Fluids',q:'Universal donor kaun hai?',o:['AB+','O-','A+','B-'],a:1,e:'O⁻ universal donor, AB⁺ universal recipient.'},
 {c:'Body Fluids',q:'ECG me QRS complex kya dikhata hai?',o:['Atrial depolarisation','Ventricular depolarisation','Ventricular repolarisation','Atrial repolarisation'],a:1,e:'P = atrial depol., QRS = ventricular depol., T = ventricular repol.'},
 {c:'Body Fluids',q:'Heart ka pacemaker kaun hai?',o:['AV node','SA node','Bundle of His','Purkinje fibres'],a:1,e:'SA node right atrium me — pacemaker.'},
 {c:'Body Fluids',q:'Cardiac cycle kitne time ka hota hai?',o:['0.1 sec','0.8 sec','1.5 sec','2 sec'],a:1,e:'0.8 sec — 72 beats/min par.'},
 {c:'Excretory',q:'GFR kitna hota hai?',o:['25 mL/min','125 mL/min','500 mL/min','1 L/min'],a:1,e:'GFR ~125 mL/min, 180 L/day filtrate banta hai.'},
 {c:'Excretory',q:'Glucose ki reabsorption kahan hoti hai?',o:['Loop of Henle','PCT','DCT','Collecting duct'],a:1,e:'PCT me glucose, amino acids aur 70% water reabsorb hote hain.'},
 {c:'Excretory',q:'ADH ka kaam kya hai?',o:['Na⁺ reabsorption','Water reabsorption badhana','Glucose kam karna','Urea banana'],a:1,e:'ADH (vasopressin) water reabsorption badhata hai, urine kam hota hai.'},
 {c:'Excretory',q:'Urea kahan banta hai?',o:['Kidney','Liver (ornithine cycle)','Spleen','Pancreas'],a:1,e:'Urea liver me ornithine cycle se, ammonia se banta hai.'},
 {c:'Excretory',q:'Nephron ka kaunsa part filtration karta hai?',o:['PCT','Glomerulus + Bowman capsule','Loop of Henle','DCT'],a:1,e:'Glomerulus me ultrafiltration hota hai.'},
 {c:'Plant Kingdom',q:'“Amphibians of plant kingdom” kise kehte hain?',o:['Algae','Bryophyta','Pteridophyta','Gymnosperms'],a:1,e:'Bryophyta — fertilisation ke liye paani chahiye.'},
 {c:'Plant Kingdom',q:'First vascular plants kaun hain?',o:['Algae','Bryophyta','Pteridophyta','Angiosperms'],a:2,e:'Pteridophyta (fern) — vascular tissue, no seeds.'},
 {c:'Plant Kingdom',q:'Naked seeds kisme hote hain?',o:['Angiosperms','Gymnosperms','Bryophyta','Algae'],a:1,e:'Gymnosperms — Pinus, Cycas; seeds fruit ke andar nahi.'},
 {c:'Plant Kingdom',q:'Double fertilisation kisme hoti hai?',o:['Gymnosperms','Pteridophyta','Angiosperms','Bryophyta'],a:2,e:'Angiosperms ki pehchan — double fertilisation + fruit.'},
 {c:'Plant Kingdom',q:'Funaria kis group ka example hai?',o:['Algae','Bryophyta (moss)','Pteridophyta','Gymnosperm'],a:1,e:'Funaria moss hai — Bryophyta.'},
 {c:'Cell Cycle',q:'DNA replication kis phase me hoti hai?',o:['G1','S','G2','M'],a:1,e:'S phase (synthesis) — DNA double ho jata hai.'},
 {c:'Cell Cycle',q:'Metaphase me chromosomes kahan hote hain?',o:['Poles par','Equator par','Random','Nucleus ke bahar'],a:1,e:'Metaphase — chromosomes equator (metaphase plate) par line me.'},
 {c:'Cell Cycle',q:'Crossing over kis stage me hota hai?',o:['Prophase I — Pachytene','Metaphase I','Anaphase II','Telophase'],a:0,e:'Prophase I, pachytene stage — homologous chromosomes exchange karte hain.'},
 {c:'Cell Cycle',q:'Meiosis se kitni haploid cells banti hain?',o:['2','4','1','8'],a:1,e:'Meiosis: 4 haploid gametes, variation ke saath.'},
 {c:'Cell Cycle',q:'Sister chromatids kab alag hote hain?',o:['Prophase','Metaphase','Anaphase','Telophase'],a:2,e:'Anaphase — sister chromatids opposite poles ki taraf.'},
 {c:'Biomolecules',q:'Enzyme ka optimum temperature / nature?',o:['Sirf acid me kaam karte hain','Protein hote hain, specific pH/temp par best','Lipid hote hain','DNA hote hain'],a:1,e:'Enzymes protein hote hain (ribozyme exception — RNA), lock & key.'},
 {c:'Biomolecules',q:'Cellulose kis ka polymer hai?',o:['Amino acid','Glucose','Fatty acid','Nucleotide'],a:1,e:'Cellulose glucose ka polymer hai — plant cell wall.'},
 {c:'Cell',q:'Rough ER ka kaam kya hai?',o:['Lipid synthesis','Protein folding / processing','Photosynthesis','ATP banana'],a:1,e:'Rough ER (ribosome wali) protein; Smooth ER lipid + detox.'},
 {c:'Cell',q:'80S ribosome kahan milta hai?',o:['Bacteria','Eukaryotic cell','Virus','Mitochondria only'],a:1,e:'80S eukaryote, 70S prokaryote / mitochondria / chloroplast.'},
 {c:'Cell',q:'Plasma membrane ka model kaun sa hai?',o:['Unit membrane','Fluid mosaic model','Sandwich model','Bilayer only'],a:1,e:'Fluid Mosaic Model — Singer & Nicolson, 1972.'}
];
function renderQuiz(boxId, scoreId, list, titlePrefix){
  var box=el(boxId); if(!box) return; box.innerHTML=''; var score=0, answered=0;
  var sc=el(scoreId); if(sc) sc.style.display='none';
  list.forEach(function(item, idx){
    var d=document.createElement('div'); d.className='q';
    var label = item.c ? '<span class="tag">'+item.c+'</span> ' : '';
    d.innerHTML='<p>'+label+'Q'+(idx+1)+'. '+item.q+'</p>';
    item.o.forEach(function(opt, oi){
      var b=document.createElement('button'); b.className='quiz-opt'; b.type='button'; b.textContent=opt;
      b.onclick=function(){
        if(d.dataset.done) return; d.dataset.done='1'; answered++;
        var expl=d.querySelector('.expl');
        if(oi===item.a){ b.classList.add('correct'); score++; expl.textContent='✅ Sahi! '+item.e; }
        else { b.classList.add('wrong'); d.querySelectorAll('.quiz-opt')[item.a].classList.add('correct'); expl.textContent='❌ Galat. Sahi answer: '+item.o[item.a]+'. '+item.e; }
        expl.classList.add('show');
        if(answered===list.length && sc){ sc.style.display='block'; sc.textContent='🎯 Score: '+score+' / '+list.length+'  '+(score>=list.length*0.8?'— Excellent! 🔥':score>=list.length*0.5?'— Good, revision aur karo 💪':'— Phir se notes padho, phir try karo 📚'); }
      };
      d.appendChild(b);
    });
    var ex=document.createElement('div'); ex.className='expl'; d.appendChild(ex); box.appendChild(d);
  });
}
renderQuiz('quiz-box','quiz-score',QUIZ);
renderQuiz('test04-quiz-box','test04-score',TEST04);
var qr=el('quiz-reset'); if(qr) qr.onclick=function(){ renderQuiz('quiz-box','quiz-score',QUIZ); };
var tr=el('test04-reset'); if(tr) tr.onclick=function(){ renderQuiz('test04-quiz-box','test04-score',TEST04); };
})();

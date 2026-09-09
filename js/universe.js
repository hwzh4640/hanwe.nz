(() => {
  'use strict';
  const canvas = document.getElementById('universe');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motion-toggle');
  let paused = motion.matches, width, height, frame, time = 0, last = 0;
  let pointer = { x: 0, y: 0 };
  let seed = 4640;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({length: 230}, () => ({x: random(), y: random(), r: random() * 1.5 + .25, speed: .3 + random()*.45, blink: random() < .18, phase: random() * 6.28}));
  // Render dense spiral dust once, then animate the cached galaxies.
  function galaxyTexture(color, arms, twist) {
    const texture = document.createElement('canvas');
    texture.width = texture.height = 900;
    const g = texture.getContext('2d');
    g.translate(450,450);
    const halo = g.createRadialGradient(0,0,0,0,0,430);
    halo.addColorStop(0,'rgba(255,232,216,.8)');
    halo.addColorStop(.12,`rgba(${color},.35)`);
    halo.addColorStop(.55,`rgba(${color},.1)`);
    halo.addColorStop(1,`rgba(${color},0)`);
    g.fillStyle=halo; g.fillRect(-450,-450,900,900);
    g.globalCompositeOperation='screen';
    for(let i=0;i<22000;i++) {
      const r=Math.pow(random(),.75)*410;
      const spread=(random()+random()+random()-1.5)*(.22+ .25*r/410);
      const a=r/410*twist+Math.floor(random()*arms)*Math.PI*2/arms+spread;
      const x=Math.cos(a)*r, y=Math.sin(a)*r;
      const size=.35+random()*1.3;
      g.fillStyle=`rgba(${r<65?'255,231,211':random()>.8?'218,228,255':color},${(.12+random()*.5)*(1-r/490)})`;
      g.beginPath();g.arc(x,y,size,0,Math.PI*2);g.fill();
    }
    const core=g.createRadialGradient(0,0,0,0,0,90);
    core.addColorStop(0,'rgba(255,255,245,1)');core.addColorStop(.17,'rgba(255,243,225,.95)');core.addColorStop(.5,'rgba(238,207,255,.45)');core.addColorStop(1,'rgba(220,190,255,0)');
    g.fillStyle=core;g.fillRect(-90,-90,180,180);
    return texture;
  }
  const galaxies = [
    {x:.94,y:.62,r:150,tilt:.6,flat:.48,speed:-.033,texture:galaxyTexture('102,197,255',2,8)}

  ];
  const snippets = ['{ }','await','</>','const','=>','dream()','0x4640','[ ... ]','async','create()','++','return','✨','&&','explore()','import','0101','map()'];
  document.querySelectorAll('.code-fragment').forEach(el=>el.remove());
  const fragments = snippets.map((text,i)=>{
    const el=document.createElement('span'); el.className='code-fragment'; el.textContent=text;
    document.querySelector('.header-bg').appendChild(el);
    const side=i%2;
    const x=side ? .76+random()*.19 : .02+random()*.2;
    const y=.07+random()*.86;
    el.style.left=`${x*100}%`; el.style.top=`${y*100}%`;
    el.style.fontSize=`${11+random()*7}px`; el.style.color=side?'#95dce9':'#cab4ff';
    return {el,phase:random()*6.28,speed:.12+random()*.2,range:15+random()*35,rotation:(random()-.5)*60,spin:i%4===0};
  });
  function glow(x,y,rx,ry,color,alpha) {
    ctx.save(); ctx.translate(x,y); ctx.scale(rx,ry);
    const gradient = ctx.createRadialGradient(0,0,0,0,0,1);
    gradient.addColorStop(0,`rgba(${color},${alpha})`); gradient.addColorStop(.4,`rgba(${color},${alpha * .45})`); gradient.addColorStop(1,`rgba(${color},0)`);
    ctx.fillStyle = gradient; ctx.fillRect(-1,-1,2,2); ctx.restore();
  }
  function draw(now) {
    if (!paused && last) time += Math.min((now-last)/1000,.05);
    last = now;
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = '#040510'; ctx.fillRect(0,0,width,height);
    const drift = Math.sin(time*.07)*35;
    glow(width*.19+drift,height*.28,width*.55,height*.45,'83,33,159',.42);
    glow(width*.78-drift,height*.37,width*.4,height*.48,'13,95,132',.32);
    glow(width*.48,height*.03,width*.42,height*.32,'118,41,164',.3);
    // Diffuse overlapping clouds, without the spiral or bright galactic core.
    ctx.save();
    ctx.translate(width*.12+Math.sin(time*.035)*8,height*.29);
    ctx.rotate(-.4);
    const cloudScale=Math.min(width/900,1.2);
    ctx.scale(cloudScale,cloudScale);
    glow(-65,-22,255,135,'96,58,158',.22);
    glow(24,18,155,105,'149,76,169',.18);
    glow(88,-31,135,65,'65,120,167',.17);
    glow(-45,58,175,64,'126,71,160',.15);
    glow(6,-14,90,38,'168,118,184',.1);
    glow(-20,16,165,25,'7,9,24',.42);
    ctx.restore();
    ctx.save(); ctx.translate(pointer.x*10,pointer.y*10);
    for (const s of stars) {
      const pulse=s.blink ? .12 + ((Math.sin(time*s.speed+s.phase)+1)/2)*.78 : .3;
      const alpha=.12+pulse*.65;
      const x=s.x*width,y=s.y*height;
      ctx.fillStyle = `rgba(218,234,255,${alpha})`;
      ctx.beginPath(); ctx.arc(x,y,s.r*(.75+pulse*.4),0,Math.PI*2); ctx.fill();
      if(s.blink) {
        glow(x,y,s.r*4.5,s.r*4.5,'165,195,255',pulse*.22);
      }
      if(s.blink && s.r>1.55 && pulse>.72) {
        glow(x,y,s.r*6,s.r*6,'155,197,255',pulse*.4);
        ctx.strokeStyle=`rgba(215,234,255,${pulse*.55})`; ctx.lineWidth=.6;
        ctx.beginPath();ctx.moveTo(x-5*pulse,y);ctx.lineTo(x+5*pulse,y);ctx.moveTo(x,y-5*pulse);ctx.lineTo(x,y+5*pulse);ctx.stroke();
      }
    }
    for (const g of galaxies) {
      const r=g.r*Math.min(1,width/1000+.2);
      ctx.save();ctx.translate(width*g.x+Math.sin(time*.09+g.r)*12,height*g.y+Math.cos(time*.07+g.r)*9);
      ctx.rotate(g.tilt);ctx.scale(1,g.flat);ctx.rotate(time*g.speed);
      ctx.globalAlpha=.55;ctx.globalCompositeOperation='screen';ctx.drawImage(g.texture,-r,-r,r*2,r*2);ctx.restore();
    }
    // Quiet planets: a lit crescent, shaded surface, and a thin atmosphere.
    for (const p of [{x:.83,y:.16,r:29,color:'113,150,188'}, {x:.1,y:.8,r:43,color:'167,137,112'}, {x:.75,y:.87,r:13,color:'124,144,168'}]) {
      const x=width*p.x, y=height*p.y+Math.sin(time*.05+p.r)*3;
      const r=p.r*Math.min(1,width/650);
      ctx.save();
      glow(x,y,r*1.18,r*1.18,p.color,.12);
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
      const surface=ctx.createRadialGradient(x-r*.5,y-r*.5,0,x+r*.25,y+r*.2,r*1.4);
      surface.addColorStop(0,`rgba(${p.color},.85)`);surface.addColorStop(.45,`rgba(${p.color},.45)`);surface.addColorStop(.8,'#0c101c');surface.addColorStop(1,'#050713');
      ctx.fillStyle=surface;ctx.fillRect(x-r,y-r,r*2,r*2);
      ctx.strokeStyle='rgba(205,214,235,.035)';ctx.lineWidth=r*.09;
      for(let band=-3;band<4;band++) {ctx.beginPath();ctx.ellipse(x,y+band*r*.22,r*1.1,r*.17,-.25,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
    for(const f of fragments) {
      const t=time*f.speed+f.phase;
      const x=Math.sin(t)*f.range+Math.sin(t*.63)*12;
      const y=Math.cos(t*.79)*f.range;
      const angle=f.rotation+(f.spin?time*3:Math.sin(t*.6)*22);
      f.el.style.transform=`translate(${x}px,${y}px) rotate(${angle}deg)`;
    }
    ctx.restore();
    if (!paused && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = width*dpr; canvas.height = height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cancelAnimationFrame(frame); last = 0; draw(performance.now());
  }
  function sync() {
    document.body.classList.toggle('motion-paused',paused);
    button.textContent = paused ? '▷  Resume motion' : 'Ⅱ  Pause motion';
    button.setAttribute('aria-pressed',String(paused));
    cancelAnimationFrame(frame); last = 0; draw(performance.now());
  }
  button.addEventListener('click',() => {paused = !paused; sync();});
  motion.addEventListener('change',e => {paused = e.matches; sync();});
  document.addEventListener('visibilitychange',() => {cancelAnimationFrame(frame); last=0; if (!document.hidden) draw(performance.now());});
  addEventListener('pointermove',e => {if (!paused) pointer = {x:e.clientX/width-.5,y:e.clientY/height-.5};});
  addEventListener('resize',resize);
  resize(); sync();
})();

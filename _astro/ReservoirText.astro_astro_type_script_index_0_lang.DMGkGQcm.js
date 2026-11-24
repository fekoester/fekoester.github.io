import{c as e,d as t,l as n,r,s as i,t as a,u as o}from"./demo.DMG6YDBM.js";var s=`to be, or not to be, that is the question:
whether 'tis nobler in the mind to suffer
the slings and arrows of outrageous fortune,
or to take arms against a sea of troubles
and by opposing end them. to die: to sleep;
no more; and by a sleep to say we end
the heart-ache and the thousand natural shocks
that flesh is heir to, 'tis a consummation
devoutly to be wish'd. to die, to sleep;
to sleep: perchance to dream: ay, there's the rub;
for in that sleep of death what dreams may come
when we have shuffled off this mortal coil,
must give us pause: there's the respect
that makes calamity of so long life;
for who would bear the whips and scorns of time,
the oppressor's wrong, the proud man's contumely,
the pangs of despised love, the law's delay,
the insolence of office and the spurns
that patient merit of the unworthy takes,
when he himself might his quietus make
with a bare bodkin? who would fardels bear,
to grunt and sweat under a weary life,
but that the dread of something after death,
the undiscover'd country from whose bourn
no traveller returns, puzzles the will
and makes us rather bear those ills we have
than fly to others that we know not of?
thus conscience does make cowards of us all;
and thus the native hue of resolution
is sicklied o'er with the pale cast of thought,
and enterprises of great pith and moment
with this regard their currents turn awry,
and lose the name of action.
tomorrow, and tomorrow, and tomorrow,
creeps in this petty pace from day to day
to the last syllable of recorded time,
and all our yesterdays have lighted fools
the way to dusty death. out, out, brief candle!
life's but a walking shadow, a poor player
that struts and frets his hour upon the stage
and then is heard no more: it is a tale
told by an idiot, full of sound and fury,
signifying nothing.
shall i compare thee to a summer's day?
thou art more lovely and more temperate:
rough winds do shake the darling buds of may,
and summer's lease hath all too short a date:
sometime too hot the eye of heaven shines,
and often is his gold complexion dimm'd;
and every fair from fair sometime declines,
by chance or nature's changing course untrimm'd;
but thy eternal summer shall not fade
nor lose possession of that fair thou owest;
nor shall death brag thou wander'st in his shade,
when in eternal lines to time thou growest:
so long as men can breathe or eyes can see,
so long lives this and this gives life to thee.
all the world's a stage,
and all the men and women merely players:
they have their exits and their entrances;
and one man in his time plays many parts,
his acts being seven ages. at first the infant,
mewling and puking in the nurse's arms.
and then the whining school-boy, with his satchel
and shining morning face, creeping like snail
unwillingly to school. and then the lover,
sighing like furnace, with a woeful ballad
made to his mistress' eyebrow. then a soldier,
full of strange oaths and bearded like the pard,
jealous in honour, sudden and quick in quarrel,
seeking the bubble reputation
even in the cannon's mouth. and then the justice,
in fair round belly with good capon lined,
with eyes severe and beard of formal cut,
full of wise saws and modern instances;
and so he plays his part.
friends, romans, countrymen, lend me your ears;
i come to bury caesar, not to praise him.
the evil that men do lives after them;
the good is oft interred with their bones;
so let it be with caesar. the noble brutus
hath told you caesar was ambitious:
if it were so, it was a grievous fault,
and grievously hath caesar answer'd it.
but, soft! what light through yonder window breaks?
it is the east, and juliet is the sun.
arise, fair sun, and kill the envious moon,
who is already sick and pale with grief,
that thou her maid art far more fair than she.
o romeo, romeo! wherefore art thou romeo?
deny thy father and refuse thy name;
or, if thou wilt not, be but sworn my love,
and i'll no longer be a capulet.
what's in a name? that which we call a rose
by any other name would smell as sweet.
now is the winter of our discontent
made glorious summer by this sun of york;
and all the clouds that lour'd upon our house
in the deep bosom of the ocean buried.
the quality of mercy is not strain'd,
it droppeth as the gentle rain from heaven
upon the place beneath: it is twice blest;
it blesseth him that gives and him that takes.
if music be the food of love, play on;
give me excess of it, that, surfeiting,
the appetite may sicken, and so die.
we are such stuff as dreams are made on,
and our little life is rounded with a sleep.
`;document.querySelectorAll(`[data-demo="reservoir-text"]`).forEach(c=>{let l=s,u=[...new Set(l)].sort(),d=u.length,f=new Map(u.map((e,t)=>[e,t])),p=Int32Array.from(l,e=>f.get(e)),m=p.length,h=Math.floor(m*.85),g=240,_=.9,v=.12,y=null,b=!1,x=e=>c.querySelector(e),S=o(c.querySelector(`.states`),5.2,()=>w()),C=0;function w(){S.ctx.fillStyle=a.bg,S.ctx.fillRect(0,0,S.w,S.h),C=0}function T(e){let{ctx:t,w:n,h:r}=S,i=r/48;if((C+1)*6>n){let e=t.canvas.width/n,r=t.getImageData(Math.round(6*e),0,t.canvas.width-Math.round(6*e),t.canvas.height);t.putImageData(r,0,0),C=Math.floor(n/6)-1}for(let n=0;n<48;n++){let r=Math.max(-1,Math.min(1,e[n]*1.6));t.fillStyle=a.bg,t.fillRect(C*6,n*i,6,i),t.fillStyle=r>=0?`rgba(227,168,87,${r.toFixed(3)})`:`rgba(127,176,216,${(-r).toFixed(3)})`,t.fillRect(C*6+.5,n*i+.5,5,i-1)}C++}function E(e,t,n,r){let{N:i,W:a,Win:o}=e;for(let e=0;e<i;e++){let s=o[e*d+n],c=e*i;for(let e=0;e<i;e++)s+=a[c+e]*t[e];r[e]=s}for(let e=0;e<i;e++)t[e]=.44999999999999996*t[e]+.55*Math.tanh(r[e])}let D=()=>new Promise(e=>setTimeout(e,0));async function O(){if(b)return;b=!0;let t=performance.now(),r=n(7),a=g,o=Float32Array.from(i(a,Math.min(1,12/a),_,r)),s=new Float32Array(a*d).map(()=>(r.next()*2-1)*.9),c=a+d+1,l=new Float64Array(c*c),u=new Float64Array(c*d),f=new Float32Array(a),v=new Float32Array(a),S={N:a,W:o,Win:s,Wout:new Float64Array};x(`.status`).textContent=`reading 0%`;for(let e=0;e<h-1;e++){if(E(S,f,p[e],v),e>=30){let t=p[e],n=p[e+1];for(let e=0;e<a;e++){let r=f[e],i=e*c;for(let t=e;t<a;t++)l[i+t]+=r*f[t];l[i+a+t]+=r,l[i+c-1]+=r,u[e*d+n]+=r}l[(a+t)*c+a+t]+=1,l[(a+t)*c+c-1]+=1,l[(c-1)*c+c-1]+=1,u[(a+t)*d+n]+=1,u[(c-1)*d+n]+=1}e%600==0&&(x(`.status`).textContent=`reading ${Math.round(100*e/h)}%`,await D())}for(let e=0;e<c;e++)for(let t=e+1;t<c;t++)l[t*c+e]=l[e*c+t];x(`.status`).textContent=`solving`,await D();let C=0;for(let e=0;e<c;e++)C+=l[e*c+e];S.Wout=e(l,u,c,d,1e-4*C/c);let w=d+1,T=new Float64Array(w*w),O=new Float64Array(w*d);for(let e=0;e<w;e++){for(let t=0;t<w;t++)T[e*w+t]=l[(a+e)*c+a+t];for(let t=0;t<d;t++)O[e*d+t]=u[(a+e)*d+t]}let k=e(T,O,w,d,1e-4*C/c),A=0,j=0,N=0;for(let e=h-1;e<m-1;e++){E(S,f,p[e],v);let t=p[e],n=-1e9,r=0,i=-1e9,o=0;for(let e=0;e<d;e++){let s=S.Wout[(a+t)*d+e]+S.Wout[(c-1)*d+e];for(let t=0;t<a;t++)s+=f[t]*S.Wout[t*d+e];s>n&&(n=s,r=e);let l=k[t*d+e]+k[d*d+e];l>i&&(i=l,o=e)}r===p[e+1]&&A++,o===p[e+1]&&j++,N++}y=S,x(`.acc-res`).textContent=`${(100*A/N).toFixed(1)} %`,x(`.acc-bi`).textContent=`${(100*j/N).toFixed(1)} %`,x(`.status`).textContent=`done`,x(`.timing`).textContent=`${a} units · ${(performance.now()-t)/1e3<10?((performance.now()-t)/1e3).toFixed(1):`>10`} s on this device`,b=!1,M()}let k=null,A=x(`.p`),j=x(`.g`);function M(){if(!y)return;let e=(c.querySelector(`input[name="prompt"]`).value||`to be`).toLowerCase(),t=new Float32Array(y.N),n=new Float32Array(y.N),r=f.get(` `);for(let i of e){let e=f.get(i);e!==void 0&&(E(y,t,e,n),r=e)}A.textContent=e,j.textContent=``,w(),k={r:t,tmp:n,last:r,left:420}}let N=n(11),P=0;t(c,e=>{if(!(!k||!y||k.left<=0))for(P+=e*45;P>=1&&k.left>0;){--P;let e=y,t=e.N,n=t+d+1,r=new Float64Array(d),i=-1e9;for(let a=0;a<d;a++){let o=e.Wout[(t+k.last)*d+a]+e.Wout[(n-1)*d+a];for(let n=0;n<t;n++)o+=k.r[n]*e.Wout[n*d+a];r[a]=o/v,r[a]>i&&(i=r[a])}let a=0;for(let e=0;e<d;e++)r[e]=Math.exp(r[e]-i),a+=r[e];let o=N.next()*a,s=0;for(;s<d-1&&(o-=r[s])>0;)s++;j.textContent+=u[s],E(e,k.r,s,k.tmp),k.last=s,k.left--,T(k.r)}}),r(c,`n`,e=>String(e),e=>{g=e}),r(c,`rho`,e=>e.toFixed(2),e=>{_=e}),r(c,`temp`,e=>e.toFixed(2),e=>{v=e}),x(`[data-act="train"]`).addEventListener(`click`,O),x(`[data-act="gen"]`).addEventListener(`click`,M),c.querySelector(`input[name="prompt"]`).addEventListener(`keydown`,e=>{e.key===`Enter`&&M()}),new IntersectionObserver((e,t)=>{e[0].isIntersecting&&(t.disconnect(),setTimeout(O,150))}).observe(c)});
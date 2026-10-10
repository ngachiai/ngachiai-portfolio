'use strict';
(() => {
  const films = window.NGACHI_PROJECTS;
  const reel = {id:'opening-reel',title:'The Ngachi.ai Opening Reel',category:'SELECTED WORK · NGACHI.AI',description:'A 21-second journey through jewelry, food, luxury transport and the cat-led Smarter Mealtimes film. Explore the individual projects in the collection.',focus:'A curated introduction to the collection',format:'21 seconds · Landscape · 1280 × 720 · Silent reel',video:'https://ngachiai-portfolio.adangamnwachukwu.chatgpt.site/assets/opening-montage-v2.mp4',poster:'https://ngachiai-portfolio.adangamnwachukwu.chatgpt.site/assets/heart-of-gold.jpg'};
  const byId = new Map([...films,reel].map(f => [f.id,f]));
  const $ = id => document.getElementById(id);
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  function selectFilms({scope='all',category='All',query='',sort='curated'}={}) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const result = films.filter(f => (scope !== 'selected' || f.selected) && (category === 'All' || f.group === category) && terms.every(t => normalize([f.title,f.category,f.group,f.description,f.focus,f.searchTerms].join(' ')).includes(t)));
    if(sort === 'shortest') result.sort((a,b) => a.duration-b.duration);
    if(sort === 'az') result.sort((a,b) => a.title.localeCompare(b.title));
    return result;
  }
  // A small pure catalog API also supports data and behavior verification.
  window.NgachiCatalog = Object.freeze({selectFilms, films});
  const state = {scope:'selected',category:'All',query:'',sort:'curated',limit:9};
  const cards = new Map(Array.from(document.querySelectorAll('[data-project]')).map(card => [card.dataset.project,card]));
  let results = [];
  function renderCatalog() {
    stopPreviews();
    results = selectFilms(state);
    const visible = results.slice(0,state.limit), ids = new Set(visible.map(f => f.id));
    cards.forEach((card,id) => {card.hidden = !ids.has(id);});
    visible.forEach(f => $('film-grid').appendChild(cards.get(f.id)));
    document.querySelectorAll('[data-scope]').forEach(button => {const active=button.dataset.scope===state.scope;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===state.category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $('film-count').textContent = state.scope==='selected' && state.category==='All' && !state.query ? '6 selected films · 23 in the collection' : results.length+' '+(results.length===1?'film':'films')+' found';
    $('empty-state').hidden = results.length !== 0;
    $('clear-search').hidden = !state.query;
    const remaining = results.length-visible.length;
    $('show-more').hidden = remaining <= 0;
    $('show-more').textContent = 'Show '+Math.min(9,remaining)+' more '+(Math.min(9,remaining)===1?'film':'films')+' ↓';
    $('collection-progress').textContent = results.length ? 'Showing '+visible.length+' of '+results.length+' '+(results.length===1?'film':'films')+'.' : '';
    $('browse-all').hidden = state.scope==='all' && state.category==='All' && !state.query;
  }
  function resetCatalog(scope='all') {Object.assign(state,{scope,category:'All',query:'',sort:'curated',limit:9});$('film-search').value='';renderCatalog();}
  document.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click',()=>resetCatalog(button.dataset.scope)));
  $('film-search').addEventListener('input',event=>{state.query=event.target.value;state.scope='all';state.limit=9;renderCatalog();});
  $('clear-search').addEventListener('click',()=>{state.query='';state.limit=9;$('film-search').value='';renderCatalog();$('film-search').focus();});
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.category=button.dataset.filter;state.scope='all';state.limit=9;renderCatalog();}));
  $('show-more').addEventListener('click',()=>{const old=state.limit;state.limit+=9;renderCatalog();cards.get(results[old]?.id)?.querySelector('[data-play]')?.focus({preventScroll:true});});
  $('browse-all').addEventListener('click',()=>{resetCatalog();$('film-search').focus({preventScroll:true});$('films').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});});
  $('reset-filters').addEventListener('click',()=>{resetCatalog();$('film-search').focus();});

  const menu = $('menu-toggle');
  function closeMenu(returnFocus=false) {menu.setAttribute('aria-expanded','false');$('nav-links').classList.remove('is-open');if(returnFocus)menu.focus();}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('nav-links').classList.toggle('is-open',open);});
  $('nav-links').querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')closeMenu(true);});

  const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  let storedMotion;try{storedMotion=localStorage.getItem('ngachi-reduced-motion');}catch{}
  let reduced=storedMotion==null?reducedQuery.matches:storedMotion==='true';
  let backgroundWanted=!reduced&&!navigator.connection?.saveData;
  let heroVisible=true;
  const montage=$('montage'), dialog=$('screening'), player=$('film-player'), artDialog=$('art-viewer');
  const previewTimers=new WeakMap();
  const pointerQuery=window.matchMedia('(hover: hover) and (pointer: fine)');
  function syncBackgroundButton(){const playing=!montage.paused;$('montage-toggle').textContent=playing?'Pause background':'Play background';$('montage-toggle').setAttribute('aria-pressed',String(playing));}
  function pauseBackground(){montage.pause();syncBackgroundButton();}
  async function playBackground(){if(reduced||!backgroundWanted||!heroVisible||dialog.open||artDialog.open||document.hidden)return;if(!montage.getAttribute('src'))montage.src=reel.video;try{await montage.play();}catch{syncBackgroundButton();}}
  montage.addEventListener('playing',()=>{montage.classList.add('is-playing');syncBackgroundButton();});
  montage.addEventListener('pause',syncBackgroundButton);
  montage.addEventListener('error',()=>{montage.classList.remove('is-playing');backgroundWanted=false;syncBackgroundButton();});
  $('montage-toggle').addEventListener('click',()=>{if(!montage.paused){backgroundWanted=false;pauseBackground();}else{if(reduced)setMotion(false);backgroundWanted=true;playBackground();}});
  function stopPreviews(){document.querySelectorAll('.poster video').forEach(v=>{clearTimeout(previewTimers.get(v));v.pause();v.parentElement.classList.remove('previewing');});}
  function syncMotion(){document.documentElement.classList.toggle('reduced',reduced);$('motion-toggle').textContent=reduced?'Enable motion':'Reduce motion';$('motion-toggle').setAttribute('aria-pressed',String(reduced));}
  function setMotion(value){reduced=value;syncMotion();try{localStorage.setItem('ngachi-reduced-motion',String(reduced));}catch{}if(reduced){backgroundWanted=false;pauseBackground();stopPreviews();}else{backgroundWanted=true;playBackground();}}
  $('motion-toggle').addEventListener('click',()=>setMotion(!reduced));
  reducedQuery.addEventListener('change',event=>setMotion(event.matches));
  syncMotion();
  document.querySelectorAll('.poster').forEach(poster=>{
    const v=poster.querySelector('video');let inside=false;
    poster.addEventListener('pointerenter',()=>{inside=true;if(reduced||!pointerQuery.matches||navigator.connection?.saveData||dialog.open||artDialog.open)return;previewTimers.set(v,setTimeout(async()=>{if(!inside||poster.closest('[data-project]').hidden)return;stopPreviews();if(!v.getAttribute('src'))v.src=v.dataset.preview;try{await v.play();if(inside&&!reduced)poster.classList.add('previewing');else v.pause();}catch{}},250));});
    poster.addEventListener('pointerleave',()=>{inside=false;clearTimeout(previewTimers.get(v));v.pause();poster.classList.remove('previewing');});
    v.addEventListener('error',()=>poster.classList.remove('previewing'));
  });
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible)playBackground();else pauseBackground();},{threshold:0});observer.observe($('top'));}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseBackground();stopPreviews();player.pause();}else playBackground();});

  let currentId=null, playbackList=[],lastTrigger=null,returnHash=null,closingFromRoute=false;
  function enquiryUrl(film){return 'mailto:ngachiai3@gmail.com?subject='+encodeURIComponent('Campaign enquiry — '+film.title)+'&body='+encodeURIComponent('Hi Ruth,\n\nI watched '+film.title+' in your portfolio and would like to discuss a project.\n\nMy brand/product:\nWhat I want to create:\nPreferred timeline:\nBudget range:\n\nThank you!');}
  function filmUrl(id){const url=new URL(window.location.href);url.searchParams.set('film',id);return url.href;}
  function updateFilmUrl(id,push=false){history[push?'pushState':'replaceState']({screening:id},'',filmUrl(id));}
  function clearFilmUrl(){const url=new URL(window.location.href);url.searchParams.delete('film');if(returnHash!==null)url.hash=returnHash;history.replaceState(null,'',url.href);returnHash=null;}
  function updatePagination(){const pos=playbackList.findIndex(f=>f.id===currentId);$('player-position').textContent=currentId===reel.id?'Opening reel · Individual films in the collection':'Film '+(pos+1)+' of '+playbackList.length;$('next-film').disabled=playbackList.length<2;$('previous-film').disabled=playbackList.length<2;}
  function loadFilm(id,autoplay=true){const f=byId.get(id);if(!f)return;currentId=id;player.pause();$('video-error').hidden=true;player.poster=f.poster;player.src=f.video;player.muted=false;$('screening-title').textContent=f.title;$('screening-category').textContent=f.category;$('screening-description').textContent=f.description;$('screening-focus').textContent=f.focus;$('screening-format').textContent=f.format;$('screening-enquiry').href=enquiryUrl(f);$('direct-film').href=f.video;$('copy-status').textContent='';$('link-fallback').hidden=true;updatePagination();if(autoplay)player.play().catch(()=>{});}
  function openFilm(id,trigger,fromRoute=false){if(!byId.has(id))return;if(artDialog.open)artDialog.close();lastTrigger=trigger||null;pauseBackground();stopPreviews();playbackList=id===reel.id?[reel]:(results.some(f=>f.id===id)?results.slice():films.slice());if(!dialog.open){if(!fromRoute)returnHash=window.location.hash;dialog.showModal();document.body.classList.add('modal-open');}loadFilm(id,!fromRoute);if(!fromRoute)updateFilmUrl(id,true);}
  document.querySelectorAll('[data-enquiry]').forEach(link=>{link.href=enquiryUrl(byId.get(link.dataset.enquiry));});
  document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();openFilm(button.dataset.play,button);}));
  $('close-player').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();document.body.classList.remove('modal-open');if(!closingFromRoute)clearFilmUrl();closingFromRoute=false;if(lastTrigger?.isConnected&&!lastTrigger.closest('[data-project]')?.hidden)lastTrigger.focus({preventScroll:true});else $('film-search').focus({preventScroll:true});playBackground();});
  function changeFilm(step){if(playbackList.length<2)return;const index=playbackList.findIndex(f=>f.id===currentId);const next=playbackList[(index+step+playbackList.length)%playbackList.length];loadFilm(next.id);updateFilmUrl(next.id);}
  $('next-film').addEventListener('click',()=>changeFilm(1));$('previous-film').addEventListener('click',()=>changeFilm(-1));
  dialog.addEventListener('keydown',event=>{if(event.target.closest('video,input,select'))return;if(event.key==='ArrowLeft'){event.preventDefault();changeFilm(-1);}if(event.key==='ArrowRight'){event.preventDefault();changeFilm(1);}});
  player.addEventListener('error',()=>{if(player.getAttribute('src'))$('video-error').hidden=false;});
  $('copy-project').addEventListener('click',async()=>{const url=filmUrl(currentId);try{if(!navigator.clipboard?.writeText)throw new Error('Unavailable');await navigator.clipboard.writeText(url);$('copy-status').textContent='Project link copied.';}catch{$('link-fallback').value=url;$('link-fallback').hidden=false;$('link-fallback').focus();$('link-fallback').select();$('copy-status').textContent='Select and copy the link below.';}});
  function syncRoute(){const id=new URL(location.href).searchParams.get('film');if(id&&byId.has(id)){if(dialog.open){playbackList=id===reel.id?[reel]:films.slice();loadFilm(id,false);}else openFilm(id,null,true);}else if(dialog.open){closingFromRoute=true;dialog.close();}}
  window.addEventListener('popstate',syncRoute);

  const artworks=Array.from(document.querySelectorAll('[data-image]')).map(button=>({src:button.dataset.image,alt:button.querySelector('img').alt,group:button.dataset.gallery,button}));
  let gallery=[],artIndex=0,artTrigger=null;
  function showArtwork(index){artIndex=(index+gallery.length)%gallery.length;const art=gallery[artIndex];$('art-image').src=art.src;$('art-image').alt=art.alt;$('art-title').textContent=art.alt;$('art-count').textContent=(artIndex+1)+' / '+gallery.length;}
  function openArtwork(art,trigger){gallery=artworks.filter(a=>a.group===art.group);artTrigger=trigger;pauseBackground();stopPreviews();showArtwork(gallery.indexOf(art));artDialog.showModal();document.body.classList.add('modal-open');}
  artworks.forEach(art=>art.button.addEventListener('click',()=>openArtwork(art,art.button)));
  document.querySelector('[data-open-carousel]')?.addEventListener('click',event=>openArtwork(artworks[0],event.currentTarget));
  $('close-art').addEventListener('click',()=>artDialog.close());$('previous-art').addEventListener('click',()=>showArtwork(artIndex-1));$('next-art').addEventListener('click',()=>showArtwork(artIndex+1));
  artDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showArtwork(artIndex-1);}if(event.key==='ArrowRight'){event.preventDefault();showArtwork(artIndex+1);}});
  artDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');artTrigger?.focus({preventScroll:true});playBackground();});
  [dialog,artDialog].forEach(modal=>modal.addEventListener('click',event=>{if(event.target!==modal)return;const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();}));
  renderCatalog();syncRoute();playBackground();
})();

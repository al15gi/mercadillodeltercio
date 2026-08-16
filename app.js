const TELEGRAM_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyLdrFExLgQ6JCQxlV2Pwch736Uo7c7xIW_SV159Sm7W8LQTWy30GMEhU-UhyaHsEdb/exec";
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwbwCPAaHm83HLa119PATjGNv47aF8_5I6Bl8PVzFWfNz8BLe99-VINh3l9AlOP0bTw6A/exec";

let products = [
  {id:1,name:"Pulsera",price:0,emoji:"📿",desc:"Pulseras hechas por nosotros.",stock:10,featured:true,isNew:true,active:true},
  {id:2,name:"Llavero",price:0,emoji:"🔑",desc:"Llaveros originales.",stock:10,featured:false,isNew:true,active:true},
  {id:3,name:"Hamabeads",price:0,emoji:"🧩",desc:"Figuras y diseños hechos con hamabeads.",stock:10,featured:false,isNew:true,active:true},
  {id:4,name:"Más cosas",price:0,emoji:"✨",desc:"Estamos preparando nuevos productos.",stock:10,featured:false,isNew:true,active:true}
];

let cart=JSON.parse(localStorage.getItem("mdt-cart")||"[]");
let favorites=JSON.parse(localStorage.getItem("mdt-favorites")||"[]");

const grid=document.getElementById("productGrid");
const cartEl=document.getElementById("cart");
const favoritesPanel=document.getElementById("favoritesPanel");
const overlay=document.getElementById("overlay");
const dialog=document.getElementById("checkoutDialog");

function money(n){return Number(n).toFixed(2).replace(".",",")+" €";}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb="mdt_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const script=document.createElement("script");
    const timer=setTimeout(()=>{delete window[cb];script.remove();reject(new Error("timeout"));},10000);
    window[cb]=data=>{clearTimeout(timer);delete window[cb];script.remove();resolve(data);};
    script.onerror=()=>{clearTimeout(timer);delete window[cb];script.remove();reject(new Error("connection"));};
    script.src=url+(url.includes("?")?"&":"?")+"callback="+cb;
    document.body.appendChild(script);
  });
}

function save(){
  localStorage.setItem("mdt-cart",JSON.stringify(cart));
  localStorage.setItem("mdt-favorites",JSON.stringify(favorites));
  document.getElementById("cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("favoritesCount").textContent=favorites.length;
}

function openCart(){cartEl.classList.add("open");overlay.classList.add("show");}
function openFavorites(){favoritesPanel.classList.add("open");overlay.classList.add("show");renderFavorites();}
function closePanels(){cartEl.classList.remove("open");favoritesPanel.classList.remove("open");overlay.classList.remove("show");}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  if(!p||p.stock<=0)return;
  const item=cart.find(i=>i.id===id);
  if(item)item.qty++;else cart.push({id,qty:1});
  save();renderCart();openCart();
}
function changeQty(id,d){
  const item=cart.find(i=>i.id===id);if(!item)return;
  const p=products.find(x=>x.id===id);
  const next=item.qty+d;
  if(p&&next>p.stock)return;
  if(next<=0)cart=cart.filter(i=>i.id!==id);else item.qty=next;
  save();renderCart();
}
function toggleFavorite(id){
  favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];
  save();renderProducts();renderFavorites();
}
function filteredProducts(){
  const q=(document.getElementById("searchProducts")?.value||"").trim().toLowerCase();
  const only=document.getElementById("showFavorites")?.dataset.only==="true";
  return products.filter(p=>p.active!==false&&(!only||favorites.includes(p.id))&&(!q||(p.name+" "+p.desc).toLowerCase().includes(q)));
}
function renderProducts(){
  const list=filteredProducts();
  grid.innerHTML=list.map(p=>`
    <article class="card">
      ${p.featured?'<span class="badge">⭐ Destacado</span>':''}
      ${p.isNew?'<span class="badge-new">🆕 Nuevo</span>':''}
      <button class="favorite-toggle ${favorites.includes(p.id)?"active":""}" onclick="toggleFavorite(${p.id})">${favorites.includes(p.id)?"♥":"♡"}</button>
      <div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:esc(p.emoji)}</div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p>
        <div class="price-row"><span class="price">${money(p.price)}<br><small>${p.stock<=2?"⚠️ Quedan "+p.stock:"✅ Disponible"}</small></span>
        <button class="add" ${p.stock<=0?"disabled":""} onclick="addToCart(${p.id})">${p.stock<=0?"Agotado":"Añadir"}</button></div>
      </div>
    </article>`).join("")||'<div class="empty">No encontramos productos.</div>';
}
function renderCart(){
  document.getElementById("cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cartItems").innerHTML=cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);return `<div class="cart-line"><div><strong>${esc(p.name)}</strong><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div><strong>${money(p.price*i.qty)}</strong></div>`;}).join(""):'<div class="empty">Tu carrito está vacío.<br>¡Añade algún producto!</div>';
  document.getElementById("cartTotal").textContent=money(cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0));
}
function renderFavorites(){
  document.getElementById("favoriteItems").innerHTML=favorites.length?products.filter(p=>favorites.includes(p.id)).map(p=>`<div class="favorite-line"><div><strong>${esc(p.name)}</strong><div class="small">${money(p.price)}</div></div><div><button class="small-btn" onclick="addToCart(${p.id})">🛒</button><button class="small-btn" onclick="toggleFavorite(${p.id})">♥</button></div></div>`).join(""):'<div class="empty">Todavía no tienes favoritos.</div>';
}

document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closePanels;
document.getElementById("favoritesBtn").onclick=openFavorites;
document.getElementById("closeFavorites").onclick=closePanels;
overlay.onclick=closePanels;

document.getElementById("showFavorites").onclick=()=>{
  const btn=document.getElementById("showFavorites");
  const active=btn.dataset.only==="true";
  btn.dataset.only=String(!active);
  btn.textContent=active?"❤️ Favoritos":"❤️ Ver todos";
  renderProducts();
};
document.getElementById("searchProducts")?.addEventListener("input",renderProducts);

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){alert("Añade algún producto al carrito.");return;}
  dialog.showModal();
};

document.getElementById("checkoutForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const order={
    name:document.getElementById("name").value.trim(),
    phone:document.getElementById("phone").value.trim(),
    address:document.getElementById("address").value.trim(),
    notes:document.getElementById("notes").value.trim(),
    items:cart.map(i=>{const p=products.find(x=>x.id===i.id);return {id:i.id,qty:i.qty,name:p.name,subtotal:p.price*i.qty};}),
    total:cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0)
  };
  try{
    await fetch(TELEGRAM_WEBAPP_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(order)});
    cart=[];save();renderCart();dialog.close();closePanels();
    alert("¡Pedido enviado! 🎉\n\nOs llegará por Telegram.");
  }catch(err){alert("No se ha podido enviar el pedido.");}
});

document.getElementById("clubBtn").onclick=()=>document.getElementById("clubDialog").showModal();

document.getElementById("clubForm").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const response=await fetch(BACKEND_URL+"?action=club&phone="+encodeURIComponent(document.getElementById("clubPhone").value.trim()));
    const data=await response.json();
    document.getElementById("clubResult").innerHTML=data.ok?`<strong>${data.points} puntos ⭐</strong><br><span class="small">Te faltan ${data.nextReward} puntos para el próximo premio.</span>`:"No se pudo consultar.";
  }catch(_){document.getElementById("clubResult").textContent="No se pudo consultar.";}
});

async function loadCatalog(){
  try{
    const data=await jsonp(BACKEND_URL+"?action=list");
    if(data.ok&&Array.isArray(data.products)){
      products=data.products.map(p=>({...p,stock:Number(p.stock||0)}));
      favorites=favorites.filter(id=>products.some(p=>p.id===id));
      save();renderProducts();renderCart();renderFavorites();
    }
  }catch(err){console.log("Se mantienen los productos iniciales.",err);}
}
save();renderProducts();renderCart();renderFavorites();loadCatalog();

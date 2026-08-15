const API_URL = "https://script.google.com/macros/s/AKfycbxXR3guyd9YLeo1UPDFA3syw6b1BJJ5-S1z3oITFcbf0hVLE_Gau5ZacugayS6QREeXeA/exec";
let products = [];
let cart = JSON.parse(localStorage.getItem("mdt-cart") || "[]");

const grid = document.getElementById("productGrid");
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const dialog = document.getElementById("checkoutDialog");

function money(n){return Number(n).toFixed(2).replace(".",",")+" €"}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function jsonp(url){return new Promise((resolve,reject)=>{const cb="cb_"+Date.now();const s=document.createElement("script");window[cb]=d=>{delete window[cb];s.remove();resolve(d)};s.onerror=()=>{delete window[cb];s.remove();reject(Error("Conexión fallida"))};s.src=url+(url.includes("?")?"&":"?")+"callback="+cb;document.body.appendChild(s)})}

function filtered(){const q=document.getElementById("search").value.trim().toLowerCase();const c=document.getElementById("categoryFilter").value;const s=document.getElementById("sort").value;let a=products.filter(p=>p.active!==false&&(!c||p.category===c)&&(!q||[p.name,p.desc,p.category].join(" ").toLowerCase().includes(q)));if(s==="priceAsc")a.sort((x,y)=>x.price-y.price);if(s==="priceDesc")a.sort((x,y)=>y.price-x.price);if(s==="name")a.sort((x,y)=>x.name.localeCompare(y.name));if(s==="featured")a.sort((x,y)=>Number(y.featured)-Number(x.featured));return a}
function categories(){const el=document.getElementById("categoryFilter");const now=el.value;const c=[...new Set(products.map(p=>p.category).filter(Boolean))].sort();el.innerHTML='<option value="">Todas las categorías</option>'+c.map(x=>'<option>'+esc(x)+'</option>').join("");if(c.includes(now))el.value=now}
function render(){const a=filtered();const f=a.find(p=>p.featured&&p.stock>0);document.getElementById("featuredWrap").innerHTML=f?`<div class="featured"><div><small>⭐ DESTACADO</small><h3>${esc(f.name)}</h3><p>${esc(f.desc||"")}</p></div><strong>${money(f.price)}</strong></div>`:"";grid.innerHTML=a.length?a.map(p=>`<article class="card">${p.featured?'<span class="badge">⭐ Destacado</span>':""}<div class="product-image">${p.image?`<img src="${esc(p.image)}">`:esc(p.emoji||"🛍️")}</div><div class="card-body"><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc||"")}</p><div class="price-row"><span><span class="price">${money(p.price)}</span><br><small>${p.stock>0?(p.stock<=2?"⚠️ Quedan "+p.stock:"✅ Disponible"):"❌ Agotado"}</small></span><button class="add" ${p.stock<=0?"disabled":""} onclick="addToCart(${p.id})">${p.stock<=0?"Agotado":"Añadir"}</button></div></div></article>`).join(""):'<div class="noresults">No encontramos productos.</div>';renderCart()}
function save(){localStorage.setItem("mdt-cart",JSON.stringify(cart));renderCart()}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return;const x=cart.find(i=>i.id===id);if((x?x.qty:0)>=p.stock)return alert("No hay más unidades disponibles.");if(x)x.qty++;else cart.push({id,qty:1});save();openCart()}
function changeQty(id,d){const x=cart.find(i=>i.id===id);const p=products.find(i=>i.id===id);if(!x||!p)return;const n=x.qty+d;if(n>p.stock)return;if(n<=0)cart=cart.filter(i=>i.id!==id);else x.qty=n;save()}
function renderCart(){cart=cart.filter(i=>products.some(p=>p.id===i.id));document.getElementById("cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);document.getElementById("cartItems").innerHTML=cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);return `<div class="cart-line"><div><strong>${esc(p.name)}</strong><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div><strong>${money(p.price*i.qty)}</strong></div>`}).join(""):'<div class="empty">Tu carrito está vacío.</div>';document.getElementById("cartTotal").textContent=money(cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0))}
async function load(){try{const d=await jsonp(API_URL+"?action=list");if(d.ok){products=d.products||[];categories();render()}}catch(e){console.error(e)}}

function openCart(){cartEl.classList.add("open");overlay.classList.add("show")}function closeCart(){cartEl.classList.remove("open");overlay.classList.remove("show")}
openCart;document.getElementById("openCart").onclick=openCart;document.getElementById("closeCart").onclick=closeCart;overlay.onclick=closeCart;
["search","categoryFilter","sort"].forEach(id=>document.getElementById(id).addEventListener("input",render));

document.getElementById("checkoutBtn").onclick=()=>{if(!cart.length)return alert("Añade algún producto.");dialog.showModal()};

document.getElementById("checkoutForm").addEventListener("submit",async e=>{e.preventDefault();const order={action:"order",orderId:"MT-"+Date.now(),name:document.getElementById("name").value.trim(),phone:document.getElementById("phone").value.trim(),address:document.getElementById("address").value.trim(),notes:document.getElementById("notes").value.trim(),items:cart.map(i=>({id:i.id,qty:i.qty}))};try{await fetch(API_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(order)});cart=[];save();dialog.close();closeCart();alert("¡Pedido enviado! 🎉\n\nOs llegará por Telegram.");setTimeout(load,1500)}catch(err){alert("No se ha podido enviar el pedido.")}});
renderCart();load();

const TELEGRAM_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyLdrFExLgQ6JCQxlV2Pwch736Uo7c7xIW_SV159Sm7W8LQTWy30GMEhU-UhyaHsEdb/exec";
const CATALOG_API_URL = "https://script.google.com/macros/s/AKfycbwJmvBHqixA1fkUvnNBQ8rXnM7CRcYJ802AEFhWXggvoaXebTP5Omq7TfZXn13n59EY/exec";

let products = [];
let cart = JSON.parse(localStorage.getItem("mdt-cart") || "[]");

const grid = document.getElementById("productGrid");
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const dialog = document.getElementById("checkoutDialog");

function money(n){return Number(n).toFixed(2).replace(".",",")+" €"}

function renderProducts(){
  grid.innerHTML = products.length ? products.map(p=>`
    <article class="card">
      <div class="product-image">${p.image ? `<img src="${escapeAttr(p.image)}" alt="">` : (p.emoji || "🛍️")}</div>
      <div class="card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p class="desc">${escapeHtml(p.desc || "")}</p>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          <button class="add" onclick="addToCart(${p.id})">Añadir</button>
        </div>
      </div>
    </article>`).join("") : `<p class="muted">Cargando productos…</p>`;
}

function save(){localStorage.setItem("mdt-cart",JSON.stringify(cart));renderCart()}
function addToCart(id){const x=cart.find(i=>i.id===id);if(x)x.qty++;else cart.push({id,qty:1});save();openCart()}
function changeQty(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save()}

function renderCart(){
  const count=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cartCount").textContent=count;
  if(!cart.length){
    document.getElementById("cartItems").innerHTML='<div class="empty">Tu carrito está vacío.<br>¡Añade algún producto!</div>';
  }else{
    document.getElementById("cartItems").innerHTML=cart.map(i=>{
      const p=products.find(x=>x.id===i.id);
      if(!p) return "";
      return `<div class="cart-line"><div><strong>${escapeHtml(p.name)}</strong><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div><strong>${money(p.price*i.qty)}</strong></div>`
    }).join("");
  }
  document.getElementById("cartTotal").textContent=money(cart.reduce((s,i)=>{const p=products.find(p=>p.id===i.id);return s+(p?Number(p.price)*i.qty:0)},0));
}

function jsonp(url){
  return new Promise((resolve,reject)=>{
    const cb="mdt_catalog_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const script=document.createElement("script");
    window[cb]=data=>{delete window[cb];script.remove();resolve(data)};
    script.onerror=()=>{delete window[cb];script.remove();reject(new Error("No se pudo cargar el catálogo"))};
    script.src=url+(url.includes("?")?"&":"?")+"callback="+cb;
    document.body.appendChild(script);
  });
}

async function loadCatalog(){
  try{
    const data=await jsonp(CATALOG_API_URL+"?action=list");
    if(data.ok && Array.isArray(data.products)){
      products=data.products;
      cart=cart.filter(i=>products.some(p=>p.id===i.id));
      save();
      renderProducts();
    }
  }catch(e){
    console.error(e);
    products=[];
    renderProducts();
  }
}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function escapeAttr(s){return escapeHtml(s)}

function openCart(){cartEl.classList.add("open");overlay.classList.add("show")}
function closeCart(){cartEl.classList.remove("open");overlay.classList.remove("show")}
document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=closeCart;

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){alert("Añade algún producto al carrito.");return}
  dialog.showModal();
};

document.getElementById("checkoutForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const address=document.getElementById("address").value.trim();
  const notes=document.getElementById("notes").value.trim();

  const lines=cart.map(i=>{
    const p=products.find(x=>x.id===i.id);
    return p ? `• ${i.qty} × ${p.name} — ${money(p.price*i.qty)}` : "";
  }).filter(Boolean).join("\n");

  const total=money(cart.reduce((s,i)=>{const p=products.find(p=>p.id===i.id);return s+(p?Number(p.price)*i.qty:0)},0));
  const pedido={name,phone,address,items:lines,total,notes};

  try{
    await fetch(TELEGRAM_WEBAPP_URL,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(pedido)
    });
    cart=[];save();dialog.close();closeCart();
    alert("¡Pedido enviado! 🎉\n\nOs llegará por Telegram.");
  }catch(error){
    console.error(error);
    alert("No se ha podido enviar el pedido. Inténtalo de nuevo.");
  }
});

renderCart();
loadCatalog();

const products = [
  {id:1,name:"Pulsera",price:0,emoji:"📿",desc:"Pulseras hechas por nosotros. Elige tu favorita."},
  {id:2,name:"Llavero",price:0,emoji:"🔑",desc:"Llaveros originales para llevar contigo."},
  {id:3,name:"Hamabeads",price:0,emoji:"🧩",desc:"Figuras y diseños hechos con hamabeads."},
  {id:4,name:"Más cosas",price:0,emoji:"✨",desc:"Estamos preparando nuevos productos."}
];

let cart = JSON.parse(localStorage.getItem("mdt-cart") || "[]");

const grid = document.getElementById("productGrid");
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const dialog = document.getElementById("checkoutDialog");

function money(n){return n.toFixed(2).replace(".",",")+" €"}

function renderProducts(){
  grid.innerHTML = products.map(p=>`
    <article class="card">
      <div class="product-image">${p.emoji}</div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          <button class="add" onclick="addToCart(${p.id})">Añadir</button>
        </div>
      </div>
    </article>`).join("");
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
      return `<div class="cart-line"><div><strong>${p.name}</strong><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div><strong>${money(p.price*i.qty)}</strong></div>`
    }).join("");
  }
  document.getElementById("cartTotal").textContent=money(cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0));
}
function openCart(){cartEl.classList.add("open");overlay.classList.add("show")}
function closeCart(){cartEl.classList.remove("open");overlay.classList.remove("show")}
document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=closeCart;

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){alert("Añade algún producto al carrito.");return}
  dialog.showModal();
};

document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const address=document.getElementById("address").value.trim();
  const notes=document.getElementById("notes").value.trim();
  const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `• ${i.qty} × ${p.name} — ${money(p.price*i.qty)}`}).join("\n");
  const total=money(cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0));
  const message=`🛍️ NUEVO PEDIDO — Mercadillo del Tercio\n\n👤 ${name}\n📞 ${phone}\n📍 ${address}\n\n${lines}\n\n💶 Total: ${total}${notes?`\n\n📝 Notas: ${notes}`:""}\n\n⚠️ Pedido preparado desde la web.`;

  // Sustituye este usuario por vuestro usuario de Telegram (sin @).
  const TELEGRAM_USERNAME = "PON_AQUI_VUESTRO_USUARIO";
  if(TELEGRAM_USERNAME==="PON_AQUI_VUESTRO_USUARIO"){
    alert("La web está lista. Para enviar pedidos por Telegram, hay que configurar vuestro usuario/bot de Telegram en app.js.");
    return;
  }
  window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`,"_blank");
});

renderProducts();
renderCart();
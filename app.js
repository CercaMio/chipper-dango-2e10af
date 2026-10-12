// Configuración pública de Supabase para CercaMío.
// La clave publishable está pensada para uso en el navegador; la seguridad real
// depende de las políticas RLS configuradas en Supabase.
const SUPABASE_URL = "https://rjxotndexckhfwqwkdgs.supabase.co";
const SUPABASE_KEY = "sb_publishable_Vt-rPW3pY3gtI4Shv2_5GA_Lne1U9GV";
const CATEGORIES = [
  {name:"Todos", icon:"✦"}, {name:"Almacén y kiosco", icon:"🛒"}, {name:"Comida", icon:"🍽️"},
  {name:"Servicios", icon:"🛠️"}, {name:"Belleza", icon:"✂️"}, {name:"Hogar", icon:"🏠"},
  {name:"Indumentaria", icon:"👕"}, {name:"Salud", icon:"🩺"}, {name:"Otros", icon:"✨"}
];
let businesses = [];
let selectedCategory = "Todos";
let deferredInstallPrompt = null;
let loadFailed = false;
const $ = (selector) => document.querySelector(selector);
const categoryList = $("#categoryList");
const businessList = $("#businessList");
const offerList = $("#offerList");
const searchInput = $("#searchInput");
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
function escapeHTML(value="") { return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function iconFor(category) { return (CATEGORIES.find(c => c.name === category) || {icon:"✨"}).icon; }
async function api(path, options={}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: {...headers, ...(options.headers||{})} });
  if (!response.ok) { const message = await response.text(); throw new Error(message || `Error ${response.status}`); }
  if (response.status === 204) return null;
  return response.json();
}
async function loadBusinesses() {
  try {
    businesses = await api("businesses?select=*&is_active=eq.true&order=created_at.desc");
    loadFailed = false;
  } catch (error) {
    console.error("No se pudieron cargar los comercios:", error);
    businesses = [];
    loadFailed = true;
  }
  renderBusinesses(); renderOffers();
  if (loadFailed) showToast("No se pudieron cargar los comercios. Revisá la conexión y las políticas de Supabase.");
}
function renderCategories() {
  categoryList.innerHTML = CATEGORIES.map(c => `<button class="category ${selectedCategory===c.name?"active":""}" data-category="${escapeHTML(c.name)}" type="button"><span class="category-icon">${c.icon}</span><span>${escapeHTML(c.name)}</span></button>`).join("");
  categoryList.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => { selectedCategory=button.dataset.category; renderCategories(); renderBusinesses(); $("#businessSection").scrollIntoView({behavior:"smooth",block:"start"}); }));
}
function filteredBusinesses() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  return businesses.filter(b => {
    const categoryMatch = selectedCategory === "Todos" || b.category === selectedCategory;
    const searchable = `${b.name} ${b.category} ${b.description||""} ${b.address||""} ${b.offer||""}`.toLocaleLowerCase("es");
    return categoryMatch && (!query || searchable.includes(query));
  });
}
function renderBusinesses() {
  const items = filteredBusinesses();
  $("#resultCount").textContent = `${items.length} ${items.length===1?"resultado":"resultados"}`;
  businessList.innerHTML = items.map(b => `<article class="business-card"><div class="business-top"><div class="business-icon">${escapeHTML(b.icon||iconFor(b.category))}</div><div><h3>${escapeHTML(b.name)}</h3><div class="category-label">${escapeHTML(b.category)}</div></div></div><p>${escapeHTML(b.description||"")}</p>${b.offer?`<span class="business-offer">✦ ${escapeHTML(b.offer)}</span>`:""}<div class="card-footer"><span>⌖ ${escapeHTML(b.address||"Zona local")}</span><button class="text-button" data-open="${escapeHTML(b.id)}" type="button">Ver ficha →</button></div></article>`).join("");
  businessList.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openBusiness(button.dataset.open)));
  $("#emptyState").classList.toggle("hidden", items.length!==0); businessList.classList.toggle("hidden", items.length===0);
  const emptyTitle = $("#emptyState h3"); const emptyText = $("#emptyState p");
  if (loadFailed) { emptyTitle.textContent="No pudimos cargar los comercios"; emptyText.textContent="Revisá la conexión y la configuración de Supabase."; }
  else { emptyTitle.textContent="Todavía no hay comercios publicados"; emptyText.textContent="Sé de los primeros en sumarse: registrá un negocio para que lo revise el administrador."; }
}
function renderOffers() {
  const featured = businesses.filter(b=>b.offer).slice(0,3);
  if (!featured.length) {
    offerList.innerHTML = `<article class="offer-card"><div><span class="offer-kicker">CERCAMÍO</span><h3>Las ofertas de tu ciudad, más cerca</h3><p>Pronto vas a encontrar promociones de los comercios locales.</p></div><span class="offer-link">Descubrí <span>→</span></span></article>`;
    return;
  }
  offerList.innerHTML = featured.map(b=>`<article class="offer-card"><div><span class="offer-kicker">${escapeHTML(b.category)}</span><h3>${escapeHTML(b.offer)}</h3><p>${escapeHTML(b.name)} · ${escapeHTML(b.description||"")}</p></div><span class="offer-link">Consultá en el negocio <span>→</span></span></article>`).join("");
}
function openBusiness(id) {
  const b=businesses.find(item=>String(item.id)===String(id)); if(!b)return;
  $("#dialogIcon").textContent=b.icon||iconFor(b.category); $("#dialogCategory").textContent=b.category; $("#dialogName").textContent=b.name;
  $("#dialogDescription").textContent=b.description||""; $("#dialogAddress").textContent=b.address?`⌖ ${b.address}`:"";
  const offer=$("#dialogOffer"); offer.textContent=b.offer||""; offer.classList.toggle("hidden",!b.offer);
  const phone=(b.phone||"").replace(/\D/g,""); const link=$("#whatsappLink");
  if(phone.length>=8){link.href=`https://wa.me/${phone}?text=${encodeURIComponent("Hola, vi tu negocio en CercaMío y quisiera hacer una consulta.")}`;link.classList.remove("hidden");link.textContent="Consultar por WhatsApp";} else {link.href="#";link.classList.add("hidden");}
  $("#businessDialog").showModal();
}
function populateCategorySelect(){ $("#newCategory").innerHTML=CATEGORIES.filter(c=>c.name!=="Todos").map(c=>`<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`).join(""); }
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");window.setTimeout(()=>toast.classList.remove("show"),3500);}
async function saveBusiness(event){
  event.preventDefault(); const form=new FormData(event.currentTarget);
  const business={name:String(form.get("name")).trim(),category:String(form.get("category")),phone:String(form.get("phone")).trim(),description:String(form.get("description")).trim(),address:String(form.get("address")).trim(),offer:String(form.get("offer")).trim(),icon:iconFor(String(form.get("category"))),is_active:false};
  if(!business.name||!business.phone||!business.description)return;
  const submit=event.currentTarget.querySelector('button[type="submit"]'); submit.disabled=true; submit.textContent="Enviando…";
  try{
    await api("businesses",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(business)});
    event.currentTarget.reset(); $("#formMessage").textContent="¡Solicitud recibida! El negocio quedó pendiente de revisión y aparecerá cuando sea aprobado.";
    showToast("Solicitud enviada para revisión");
  }catch(error){
    console.error("No se pudo enviar la ficha:",error);
    $("#formMessage").textContent="No se pudo enviar. Revisá que la tabla y las políticas de Supabase estén configuradas correctamente.";
  }finally{submit.disabled=false;submit.textContent="Enviar negocio para revisión";}
}
$("#businessForm").addEventListener("submit",saveBusiness);
$("#openBusinessForm").addEventListener("click",()=>{$("#businessFormSection").classList.remove("hidden");$("#businessFormSection").scrollIntoView({behavior:"smooth",block:"start"});});
$("#closeBusinessForm").addEventListener("click",()=>$("#businessFormSection").classList.add("hidden"));
$("#closeDialog").addEventListener("click",()=>$("#businessDialog").close());
$("#businessDialog").addEventListener("click",e=>{if(e.target===$("#businessDialog"))$("#businessDialog").close();});
searchInput.addEventListener("input",renderBusinesses);
$("#clearSearch").addEventListener("click",()=>{searchInput.value="";renderBusinesses();searchInput.focus();});
$("#resetFilters").addEventListener("click",()=>{searchInput.value="";selectedCategory="Todos";renderCategories();renderBusinesses();});
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;$("#installBtn").classList.remove("hidden");});
$("#installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt){showToast("Usá el menú del navegador y elegí ‘Instalar app’ o ‘Agregar a pantalla principal’. ");return;}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#installBtn").classList.add("hidden");});
if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
renderCategories(); populateCategorySelect(); renderOffers(); loadBusinesses();

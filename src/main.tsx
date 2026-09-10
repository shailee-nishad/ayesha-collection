
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, ChevronRight,
  Star, SlidersHorizontal, ArrowRight, Minus, Plus, Trash2, MapPin,
  Truck, CreditCard, CheckCircle2, Package, Instagram,
  LogOut, ShieldCheck, LayoutDashboard, Boxes, Users, Settings, Image,
  Tag, ShoppingCart, SearchX, Check, Sparkles
} from "lucide-react";
import "./styles.css";
import { adminLogin, adminLogout, getAdminSession, loadProductsFromDb, createProduct, updateProduct, deleteProduct, uploadProductImage } from "./backend";

export type Product = {
  id: number; name: string; brand: string; category: "Women"|"Men"|"Kids";
  subcategory: string; price: number; mrp: number; discount: number;
  rating: number; reviewCount: number; images: string[]; colors: string[];
  sizes: string[]; fit: string; stock: number; description: string; tags: string[];
};

type CartItem = { product: Product; size: string; color: string; qty: number };
type SavedAddress = { name:string; phone:string; address:string; city:string; state:string; pin:string };
type Order = { id: string; date: string; items: CartItem[]; total: number; status: string; payment: string; address?: SavedAddress };

const ACCENT = "#c9115b";
const soft = "#fff1f6";

/** Aayesha Collection — transparent logo recreated in SVG from the supplied reference. */
function AayeshaLogo({className="", compact=false}:{className?:string;compact?:boolean}){
  return <svg
    className={className}
    viewBox="0 0 360 170"
    role="img"
    aria-label="Aayesha Collection"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    style={{display:"block",width:"100%",height:"100%",color:ACCENT,overflow:"visible"}}
  >
    <text
      x="180"
      y={compact ? "88" : "92"}
      textAnchor="middle"
      fill="currentColor"
      fontFamily="'Snell Roundhand','Segoe Script','Brush Script MT','URW Chancery L',cursive"
      fontSize={compact ? "67" : "84"}
      fontWeight="500"
      letterSpacing="-2.5"
    >Aayesha</text>
    <text
      x="180"
      y={compact ? "137" : "145"}
      textAnchor="middle"
      fill="currentColor"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize={compact ? "12" : "14"}
      fontWeight="600"
      letterSpacing={compact ? "7" : "8.5"}
    >COLLECTION</text>
  </svg>;
}

const imgs = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1506629905607-d9a8c7b6b2b2?auto=format&fit=crop&w=900&q=85"
];

const names = [
  ["Women's Oversized Basic T-Shirt","Women","T-Shirts","OVERSIZED FIT"],
  ["Women's Blue Washed Baggy Jeans","Women","Jeans","WIDE LEG FIT"],
  ["Women's Ribbed Top","Women","Tops","REGULAR FIT"],
  ["Women's Floral Summer Dress","Women","Dresses","RELAXED FIT"],
  ["Women's Wide Leg Jeans","Women","Jeans","WIDE LEG FIT"],
  ["Women's Co-ord Set","Women","Co-ords","RELAXED FIT"],
  ["Women's Printed Kurti","Women","Kurtis","REGULAR FIT"],
  ["Women's Casual Shirt","Women","Shirts","RELAXED FIT"],
  ["Women's Linen Jumpsuit","Women","Jumpsuits","RELAXED FIT"],
  ["Women's Everyday Tote","Women","Accessories","REGULAR FIT"],
  ["Men's Classic Oversized T-Shirt","Men","T-Shirts","OVERSIZED FIT"],
  ["Men's Relaxed Fit Shirt","Men","Shirts","RELAXED FIT"],
  ["Men's Cargo Trousers","Men","Trousers","WIDE LEG FIT"],
  ["Men's Straight Fit Jeans","Men","Jeans","STRAIGHT FIT"],
  ["Men's Everyday Hoodie","Men","Hoodies","OVERSIZED FIT"],
  ["Men's Casual Shirt","Men","Shirts","REGULAR FIT"],
  ["Men's Polo T-Shirt","Men","T-Shirts","REGULAR FIT"],
  ["Men's Utility Jacket","Men","Jackets","RELAXED FIT"],
  ["Men's Cotton Shorts","Men","Shorts","REGULAR FIT"],
  ["Men's Kurta Set","Men","Ethnic Wear","RELAXED FIT"],
  ["Kids Printed Cotton T-Shirt","Kids","T-Shirts","REGULAR FIT"],
  ["Girls Floral Dress","Kids","Dresses","RELAXED FIT"],
  ["Kids Denim Jeans","Kids","Jeans","STRAIGHT FIT"],
  ["Boys Casual Shirt","Kids","Shirts","REGULAR FIT"],
  ["Kids Co-ord Set","Kids","Sets","RELAXED FIT"],
  ["Kids Hoodie","Kids","Hoodies","OVERSIZED FIT"],
  ["Kids Party Dress","Kids","Party Wear","RELAXED FIT"],
  ["Kids Cotton Shorts Set","Kids","Sets","REGULAR FIT"],
  ["Boys Printed Tee","Kids","T-Shirts","REGULAR FIT"],
  ["Girls Everyday Kurti","Kids","Dresses","REGULAR FIT"],
  ["Women's Soft Knit Cardigan","Women","Tops","RELAXED FIT"],
  ["Women's Satin Occasion Dress","Women","Dresses","REGULAR FIT"],
  ["Women's Straight Trousers","Women","Trousers","STRAIGHT FIT"],
  ["Men's Premium Knit Polo","Men","T-Shirts","REGULAR FIT"],
  ["Men's Overshirt","Men","Shirts","OVERSIZED FIT"],
  ["Men's Straight Chinos","Men","Trousers","STRAIGHT FIT"],
  ["Kids Printed Hoodie","Kids","Hoodies","OVERSIZED FIT"],
  ["Girls Denim Dress","Kids","Dresses","REGULAR FIT"],
  ["Women's Minimal Shoulder Bag","Women","Accessories","REGULAR FIT"],
  ["Men's Everyday Cap","Men","Accessories","REGULAR FIT"],
  ["Women's Flowing Palazzos","Women","Palazzos","WIDE LEG FIT"],
  ["Women's Classic Suit Set","Women","Suits","RELAXED FIT"],
  ["Women's Pleated Skirt","Women","Skirts","RELAXED FIT"],
  ["Men's Slim Fit Suit","Men","Suits","REGULAR FIT"],
  ["Men's Cargo Jeans","Men","Cargo","RELAXED FIT"],
  ["Men's Classic Kurta","Men","Kurtas","REGULAR FIT"],
  ["Kids Denim Shorts","Kids","Shorts","REGULAR FIT"],
  ["Kids Festive Kurta Set","Kids","Ethnic Wear","RELAXED FIT"],
  ["Girls Party Co-ord Set","Kids","Sets","RELAXED FIT"]
];

const demoProducts: Product[] = names.map((n, i) => {
  const price = [699,1499,799,1299,1599,1399,899,1199,1699,999,699,1299,1599,1799,1499,1199,899,1999,799,1699,599,1199,999,899,1099,999,1399,799,599,899,1399,1899,1299,1199,1599,1399,1099,1299,899,699,1299,1999,1199,3999,1899,1499,1099,1599,1299,999][i];
  const mrp = Math.round(price / (1 - [0.3,0.6,0.35,0.35,0.4][i%5]));
  return {
    id:i+1, name:n[0], brand:"AAYESHA®", category:n[1] as Product["category"],
    subcategory:n[2], price, mrp, discount:Math.round((1-price/mrp)*100),
    rating:Number((4.2+(i%8)/10).toFixed(1)), reviewCount:38+i*7,
    images:[imgs[i%imgs.length],imgs[(i+3)%imgs.length],imgs[(i+6)%imgs.length]],
    colors:(n[1]==="Women"
      ? ["#171717","#e8c5cf","#ffffff","#d8c3a5","#1d4ed8","#7b1e2b"]
      : n[1]==="Men"
        ? ["#171717","#ffffff","#1f3a5f","#6b7280","#8b5e3c","#16a34a"]
        : ["#1d4ed8","#f4c2c2","#ffffff","#f59e0b","#16a34a","#ef4444"]
    ).slice(0,3+(i%3)),
    sizes:n[1]==="Kids"
      ? ["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y","12-13Y"]
      : n[1]==="Men"
        ? ["S","M","L","XL","XXL","XXXL"]
        : ["XS","S","M","L","XL","XXL"],
    fit:n[3], stock:12+(i%20),
    description:"Thoughtfully designed for effortless everyday style. Soft hand-feel, versatile styling and a comfortable silhouette make this an easy wardrobe favourite.",
    tags:[n[1].toLowerCase(),n[2].toLowerCase(),"everyday","ayesha"]
  };
});

// Extra demo products so every Women / Men / Kids subcategory has at least 2 products.
const additionalNames: [string,string,string,string][] = [
  ["Women's Everyday Tee","Women","T-Shirts","REGULAR FIT"],
  ["Women's Relaxed Button Tee","Women","T-Shirts","RELAXED FIT"],
  ["Women's Relaxed Cotton Shirt","Women","Shirts","RELAXED FIT"],
  ["Women's Tailored Straight Trousers","Women","Trousers","STRAIGHT FIT"],
  ["Women's Flowing Wide Palazzos","Women","Palazzos","WIDE LEG FIT"],
  ["Women's Tailored Blazer Suit Set","Women","Suits","RELAXED FIT"],
  ["Women's Everyday Co-ord Set","Women","Co-ords","RELAXED FIT"],
  ["Women's Embroidered Kurti","Women","Kurtis","REGULAR FIT"],
  ["Women's Festive Anarkali Set","Women","Ethnic Wear","RELAXED FIT"],
  ["Women's Classic Ethnic Kurta Set","Women","Ethnic Wear","REGULAR FIT"],
  ["Women's Relaxed Linen Jumpsuit","Women","Jumpsuits","RELAXED FIT"],
  ["Women's Pleated Midi Skirt","Women","Skirts","RELAXED FIT"],
  ["Women's Lightweight Shrug","Women","Shrugs","RELAXED FIT"],
  ["Women's Longline Knit Shrug","Women","Shrugs","RELAXED FIT"],
  ["Women's Soft Rib Cardigan","Women","Cardigans","RELAXED FIT"],
  ["Women's Button Front Cardigan","Women","Cardigans","REGULAR FIT"],
  ["Women's Cotton Everyday Shorts","Women","Shorts","REGULAR FIT"],
  ["Women's Relaxed Lounge Shorts","Women","Shorts","RELAXED FIT"],
  ["Men's Classic Straight Jeans","Men","Jeans","STRAIGHT FIT"],
  ["Men's Relaxed Cargo Jeans","Men","Cargo","RELAXED FIT"],
  ["Men's Everyday Zip Hoodie","Men","Hoodies","OVERSIZED FIT"],
  ["Men's Lightweight Casual Jacket","Men","Jackets","RELAXED FIT"],
  ["Men's Everyday Cotton Shorts","Men","Shorts","REGULAR FIT"],
  ["Men's Classic Formal Suit","Men","Suits","REGULAR FIT"],
  ["Men's Festive Kurta","Men","Kurtas","REGULAR FIT"],
  ["Men's Cotton Ethnic Kurta Set","Men","Ethnic Wear","RELAXED FIT"],
  ["Men's Textured Ethnic Kurta Set","Men","Ethnic Wear","REGULAR FIT"],
  ["Men's Everyday Co-ord Set","Men","Co-ords","RELAXED FIT"],
  ["Men's Relaxed Travel Co-ord","Men","Co-ords","RELAXED FIT"],
  ["Men's Brushed Cotton Sweatshirt","Men","Sweatshirts","OVERSIZED FIT"],
  ["Men's Classic Crew Sweatshirt","Men","Sweatshirts","REGULAR FIT"],
  ["Men's Utility Overshirt","Men","Overshirts","RELAXED FIT"],
  ["Men's Checked Casual Overshirt","Men","Overshirts","OVERSIZED FIT"],
  ["Men's Minimal Everyday Cap","Men","Accessories","REGULAR FIT"],
  ["Kids Printed Casual Shirt","Kids","Shirts","REGULAR FIT"],
  ["Kids Stretch Denim Jeans","Kids","Jeans","STRAIGHT FIT"],
  ["Kids Everyday Cotton Shorts","Kids","Shorts","REGULAR FIT"],
  ["Kids Lightweight Jacket","Kids","Jackets","RELAXED FIT"],
  ["Kids Denim Casual Jacket","Kids","Jackets","REGULAR FIT"],
  ["Kids Festive Party Dress","Kids","Party Wear","RELAXED FIT"],
  ["Kids Traditional Kurta Set","Kids","Ethnic Wear","REGULAR FIT"],
  ["Kids Comfortable Festive Set","Kids","Ethnic Wear","RELAXED FIT"],
  ["Kids Cotton Kurta Set","Kids","Kurtas","REGULAR FIT"],
  ["Kids Festive Kurta","Kids","Kurtas","RELAXED FIT"],
  ["Kids Printed Skirt","Kids","Skirts","REGULAR FIT"],
  ["Kids Denim Skirt","Kids","Skirts","RELAXED FIT"],
  ["Kids Everyday Accessories Set","Kids","Accessories","REGULAR FIT"],
  ["Kids Cute Hair Accessories Set","Kids","Accessories","REGULAR FIT"],
];

const additionalProducts: Product[] = additionalNames.map((n, i) => {
  const price = [749,799,1299,1399,1499,2499,1299,999,1799,1599,1799,899,799,999,1499,1599,699,749,1899,1699,1599,1799,699,2999,1399,1899,1699,1399,1499,1299,1199,1299,499,999,1099,699,1499,1399,1199,999,899,799,699,499,599][i];
  const mrp = Math.round(price / (1 - [0.25,0.3,0.35,0.4,0.45][i%5]));
  const category = n[1] as Product["category"];
  return {
    id: demoProducts.length + i + 1, name:n[0], brand:"AAYESHA®", category, subcategory:n[2],
    price, mrp, discount:Math.round((1-price/mrp)*100),
    rating:Number((4.3+(i%6)/10).toFixed(1)), reviewCount:24+i*5,
    images:[imgs[(i+2)%imgs.length],imgs[(i+5)%imgs.length],imgs[(i+8)%imgs.length]],
    colors: category==="Women"
      ? ["#171717","#e8c5cf","#ffffff","#d8c3a5"]
      : category==="Men"
        ? ["#171717","#ffffff","#1f3a5f","#6b7280"]
        : ["#1d4ed8","#f4c2c2","#ffffff","#f59e0b"],
    sizes: category==="Kids"
      ? ["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y","12-13Y"]
      : category==="Men"
        ? ["S","M","L","XL","XXL","XXXL"]
        : ["XS","S","M","L","XL","XXL"],
    fit:n[3], stock:10+(i%18),
    description:"Thoughtfully designed for effortless everyday style. Soft hand-feel, versatile styling and a comfortable silhouette make this an easy wardrobe favourite.",
    tags:[n[1].toLowerCase(),n[2].toLowerCase(),"everyday","ayesha"]
  };
});

const allDemoProducts = [...demoProducts, ...additionalProducts];

const shopCategories = [
  {name:"WOMEN", image:imgs[3], path:"/women"},
  {name:"MEN", image:imgs[1], path:"/men"},
  {name:"KIDS", image:imgs[10], path:"/kids"}
];

const categoryHierarchy: Record<string,string[]> = {
  Women:["T-Shirts","Tops","Shirts","Jeans","Trousers","Palazzos","Dresses","Suits","Co-ords","Kurtis","Ethnic Wear","Jumpsuits","Skirts","Shrugs","Cardigans","Shorts","Accessories"],
  Men:["T-Shirts","Shirts","Jeans","Cargo","Trousers","Hoodies","Jackets","Shorts","Suits","Kurtas","Ethnic Wear","Co-ords","Sweatshirts","Overshirts","Accessories"],
  Kids:["T-Shirts","Shirts","Jeans","Dresses","Shorts","Sets","Hoodies","Jackets","Party Wear","Ethnic Wear","Kurtas","Skirts","Accessories"]
};

const popular = [
  ["T-SHIRTS",imgs[0]],["SHIRTS",imgs[1]],["JEANS",imgs[2]],["DRESSES",imgs[3]],
  ["TOPS",imgs[5]],["TROUSERS",imgs[6]],["HOODIES",imgs[8]],["ETHNIC WEAR",imgs[9]]
];

function money(n:number){return "₹"+n.toLocaleString("en-IN")}
function useLocal<T>(key:string, initial:T){
  const [value,setValue]=useState<T>(()=>{try{return JSON.parse(localStorage.getItem(key)||"null") ?? initial}catch{return initial}});
  useEffect(()=>localStorage.setItem(key,JSON.stringify(value)),[key,value]);
  return [value,setValue] as const;
}

function App(){
  const [products,setProducts]=useState<Product[]>(allDemoProducts);
  const [dataLoading,setDataLoading]=useState(true);
  const [adminUser,setAdminUser]=useState<any>(null);
  const [adminChecking,setAdminChecking]=useState(true);
  const [cart,setCart]=useLocal<CartItem[]>("ayesha-cart",[]);
  const [wishlist,setWishlist]=useLocal<number[]>("aayesha-wishlist-v2",[]);
  const [orders,setOrders]=useLocal<Order[]>("ayesha-orders-v3",[]);
  const [savedAddress,setSavedAddress]=useLocal<SavedAddress[]>("ayesha-saved-addresses-v1",[]);
  useEffect(()=>{try{localStorage.removeItem("ayesha-orders");localStorage.removeItem("ayesha-orders-v2")}catch{}},[]);
  const [toast,setToast]=useState("");
  const [cartOpen,setCartOpen]=useState(()=>window.location.pathname==="/cart");
  const [menuOpen,setMenuOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [filterOpen,setFilterOpen]=useState(false);
  const [selectedCategory,setSelectedCategory]=useState("All");
  const [selectedSize,setSelectedSize]=useState("All");
  const [selectedColor,setSelectedColor]=useState("All");
  const [priceMin,setPriceMin]=useState(0);
  const [priceMax,setPriceMax]=useState(5000);
  const [sort,setSort]=useState("Sort By");
  const [page,setPage]=useState(window.location.pathname);
  const [detailId,setDetailId]=useState<number|null>(null);
  const [checkout,setCheckout]=useState(false);

  useEffect(()=>{
    const fn=()=>{
      const path=window.location.pathname;
      setPage(path);
      setCartOpen(path==="/cart");
      if(!path.startsWith("/product/")) setDetailId(null);
    };
    window.addEventListener("popstate",fn);
    return ()=>window.removeEventListener("popstate",fn);
  },[]);
  useEffect(()=>{
    let alive=true;
    (async()=>{
      const session=await getAdminSession();
      if(alive) { setAdminUser(session?.user ?? null); setAdminChecking(false); }
      try {
        const remote=await loadProductsFromDb();
        if(alive && remote !== null) setProducts(remote);
      } catch(e) { console.warn("Using demo products; database not configured or unavailable.",e); }
      if(alive) setDataLoading(false);
    })();
    return ()=>{alive=false};
  },[]);

  const refreshProducts=async()=>{
    const remote=await loadProductsFromDb();
    if(remote) setProducts(remote);
  };
  useEffect(()=>{
    if(!dataLoading) setWishlist(w=>w.filter(id=>products.some(p=>p.id===id)));
  },[dataLoading,products]);

  const go=(path:string)=>{
    // Keep the custom router and cart drawer in sync. In particular, pushing
    // /cart while already on /cart must still reopen the drawer.
    history.pushState({}, "", path);
    setPage(path);
    setMenuOpen(false);
    setSearchOpen(false);
    setCheckout(false);
    setCartOpen(path==="/cart");
    if(path.startsWith("/categories/") || path==="/wishlist") setSelectedCategory("All");
    if(!path.startsWith("/product/")) setDetailId(null);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const closeCart=()=>{
    setCartOpen(false);
    if(page==="/cart") go("/");
  };
  const notify=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),2200)};
  const toggleWish=(id:number)=>{
    setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
    notify(wishlist.includes(id)?"Removed from wishlist":"Added to wishlist ♡");
  };
  const add=(p:Product,size=p.sizes[Math.min(1,p.sizes.length-1)],color=p.colors[0])=>{
    setCart(c=>{const hit=c.find(x=>x.product.id===p.id&&x.size===size&&x.color===color);return hit?c.map(x=>x===hit?{...x,qty:x.qty+1}:x):[...c,{product:p,size,color,qty:1}]});
    notify("Added to cart ✓"); go("/cart");
  };
  const removeCart=(idx:number)=>{setCart(c=>c.filter((_,i)=>i!==idx));notify("Product removed from cart")};
  const cartCount=cart.reduce((a,b)=>a+b.qty,0);
  const subtotal=cart.reduce((a,b)=>a+b.product.price*b.qty,0);
  const discount=cart.reduce((a,b)=>a+(b.product.mrp-b.product.price)*b.qty,0);
  const total=subtotal;

  const filtered=useMemo(()=>{
    let list=products.filter(p=>{
      const q=query.trim().toLowerCase();
      const matchQ=!q||[p.name,p.brand,p.category,p.subcategory,...p.tags].join(" ").toLowerCase().includes(q);

      const categoryParts=page.split("/").filter(Boolean);
      const topLevelGender=["women","men","kids"].includes(categoryParts[0]||"")
        ? (categoryParts[0][0].toUpperCase()+categoryParts[0].slice(1))
        : null;
      const routeGender=categoryParts[0]==="categories"&&categoryParts[1]
        ? categoryParts[1][0].toUpperCase()+categoryParts[1].slice(1)
        : topLevelGender;
      const routeSub=categoryParts[0]==="categories"&&categoryParts[2]
        ? categoryParts[2].replace(/-/g," ").toLowerCase()
        : null;

      const matchGender=routeGender?p.category===routeGender:true;
      const matchSub=routeSub?p.subcategory.toLowerCase()===routeSub:true;
      // Filter CATEGORY means clothing type (Jeans, Shirts, T-Shirts, Palazo, Suit, etc.),
      // not the department (Women / Men / Kids).
      const matchCat=selectedCategory==="All"||p.subcategory.toLowerCase()===selectedCategory.toLowerCase();
      const matchSize=selectedSize==="All"||p.sizes.includes(selectedSize);
      const matchColor=selectedColor==="All"||p.colors.includes(selectedColor);
      const matchPrice=p.price>=priceMin && p.price<=priceMax;

      return matchQ&&matchCat&&matchGender&&matchSub&&matchSize&&matchColor&&matchPrice;
    });

    if(sort==="Price: Low to High") list.sort((a,b)=>a.price-b.price);
    if(sort==="Price: High to Low") list.sort((a,b)=>b.price-a.price);
    if(sort==="Customer Rating") list.sort((a,b)=>b.rating-a.rating);
    if(sort==="Newest") list=list.slice().reverse();
    return list;
  },[products,page,query,selectedCategory,selectedSize,selectedColor,priceMin,priceMax,sort]);

  const showProducts=(title:string, list=filtered)=><section className="section products-section">
    <div className="section-head"><div><p className="eyebrow">CURATED FOR YOU</p><h2>{title}</h2></div><button className="text-btn" onClick={()=>go("/new-arrivals")}>VIEW ALL <ArrowRight size={16}/></button></div>
    <div className="product-grid">{list.slice(0,8).map(p=><ProductCard key={p.id} p={p} wish={wishlist.includes(p.id)} onWish={()=>toggleWish(p.id)} onAdd={()=>add(p)} onOpen={()=>setDetailId(p.id)}/>)}</div>
  </section>;

  if(page.startsWith("/admin")) {
    if(adminChecking) return <div className="admin-loading">Loading admin…</div>;
    if(!adminUser) return <AdminLogin onLogin={(u)=>setAdminUser(u)} go={go}/>;
    return <Admin orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} refreshProducts={refreshProducts} user={adminUser} onLogout={async()=>{await adminLogout();setAdminUser(null);go("/")}} go={go}/>;
  }

  const productRoute = page.match(/^\/product\/(\d+)/);
  const routedProduct = productRoute ? products.find(x => x.id === Number(productRoute[1])) : null;
  if(productRoute && routedProduct && detailId !== routedProduct.id) setDetailId(routedProduct.id);
  if(page==="/account" || page==="/orders") return <><Header {...{go,cartCount,setCartOpen,setMenuOpen,setSearchOpen,wishlist}}/><MobileLayoutFix/><ReferenceFilterStyles/><AccountPage orders={orders} setOrders={setOrders} savedAddress={savedAddress} setSavedAddress={setSavedAddress} wishlist={wishlist} go={go} page={page}/><Footer go={go}/><MobileNav go={go} cartCount={cartCount} currentPath={page}/></>;

  if(detailId) {
    const p=products.find(x=>x.id===detailId)!;
    return <><Header {...{go,cartCount,setCartOpen,setMenuOpen,setSearchOpen,wishlist}}/><MobileLayoutFix/><ReferenceFilterStyles/><ProductDetail p={p} onAdd={add} wish={wishlist.includes(p.id)} onWish={()=>toggleWish(p.id)} onBack={()=>setDetailId(null)}/><Footer go={go}/><CartDrawer open={cartOpen} setOpen={closeCart} cart={cart} setCart={setCart} subtotal={subtotal} discount={discount} total={total} remove={removeCart} onCheckout={()=>{setCartOpen(false);setCheckout(true)}}/>{checkout&&<Checkout cart={cart} total={total} orders={orders} setOrders={setOrders} savedAddress={savedAddress} setSavedAddress={setSavedAddress} onClose={()=>setCheckout(false)} onClear={()=>setCart([])} onTrack={()=>{setCheckout(false);go("/orders")}}/>}<MobileNav go={go} cartCount={cartCount} currentPath={page}/><Toast text={toast}/></>;
  }

  if(checkout) return <><Header {...{go,cartCount,setCartOpen,setMenuOpen,setSearchOpen,wishlist}}/><MobileLayoutFix/><ReferenceFilterStyles/><Checkout cart={cart} total={total} orders={orders} setOrders={setOrders} savedAddress={savedAddress} setSavedAddress={setSavedAddress} onClose={()=>setCheckout(false)} onClear={()=>setCart([])} onTrack={()=>{setCheckout(false);go("/orders")}}/><Footer go={go}/></>;

  return <div>
    <Header {...{go,cartCount,setCartOpen,setMenuOpen,setSearchOpen,wishlist}}/>
    <MobileLayoutFix/><ReferenceFilterStyles/>
    {menuOpen&&<MobileDrawer close={()=>setMenuOpen(false)} go={go}/>}
    {searchOpen&&<SearchOverlay products={products} query={query} setQuery={setQuery} close={()=>setSearchOpen(false)} go={go}/>}
    <main>
      {page==="/" && <>
        <Hero go={go}/>
        <CategoryCards go={go}/>
        <PopularCategories go={go}/>
        <Reviews/>
        <Newsletter/>
      </>}
      {page==="/categories" && <CategoriesPage go={go}/>}
      {page.match(/^\/categories\/(women|men|kids)$/) && <CategorySubpage gender={page.split("/")[2]} go={go}/>}
      {page!=="/" && page!=="/categories" && !page.match(/^\/categories\/(women|men|kids)$/) && <CatalogPage products={products} title={pageTitle(page)} list={filtered} query={query} setQuery={setQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} sort={sort} setSort={setSort} setFilterOpen={setFilterOpen}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          priceMin={priceMin}
          priceMax={priceMax}
          setPriceMin={setPriceMin}
          setPriceMax={setPriceMax}
          wish={wishlist} onWish={toggleWish} onAdd={add} onOpen={setDetailId} go={go}/>}
    </main>
    <Footer go={go}/>
    <CartDrawer open={cartOpen} setOpen={closeCart} cart={cart} setCart={setCart} subtotal={subtotal} discount={discount} total={total} remove={removeCart} onCheckout={()=>{setCartOpen(false);setCheckout(true)}}/>
    {filterOpen&&<FilterDrawer
      close={()=>setFilterOpen(false)}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedSize={selectedSize}
      setSelectedSize={setSelectedSize}
      selectedColor={selectedColor}
      setSelectedColor={setSelectedColor}
      priceMin={priceMin}
      priceMax={priceMax}
      setPriceMin={setPriceMin}
      setPriceMax={setPriceMax}
      products={products}
    />}
    <MobileNav go={go} cartCount={cartCount} currentPath={page}/>
    <Toast text={toast}/>
  </div>
}

function pageTitle(path:string){
  if(path==="/wishlist")return"WISHLIST";
  if(path==="/categories")return"CATEGORIES";
  if(path==="/women")return"WOMEN";
  if(path==="/men")return"MEN";
  if(path==="/kids")return"KIDS";
  if(path==="/new-arrivals")return"NEW ARRIVALS";
  const parts=path.split("/").filter(Boolean);
  return parts.length>1?parts[parts.length-1].replace(/-/g," ").toUpperCase():"SHOP";
}

function Header({go,cartCount,setCartOpen,setMenuOpen,setSearchOpen}:{go:(p:string)=>void;cartCount:number;setCartOpen:(x:boolean)=>void;setMenuOpen:(x:boolean)=>void;setSearchOpen:(x:boolean)=>void;wishlist:number[]}){
 return <header className="header">
  <div className="desktop-nav">
    <button className="brand" onClick={()=>go("/")} aria-label="Aayesha Collection home"><AayeshaLogo/></button>
    <nav><button onClick={()=>go("/")}>HOME</button><button onClick={()=>go("/men")}>MEN</button><button onClick={()=>go("/women")}>WOMEN</button><button onClick={()=>go("/kids")}>KIDS</button><button onClick={()=>go("/new-arrivals")}>NEW ARRIVALS</button></nav>
    <div className="head-actions">
      <button onClick={()=>setSearchOpen(true)} aria-label="Search"><Search/></button>
      <button onClick={()=>go("/wishlist")} aria-label="Wishlist"><Heart/></button>
      <button onClick={()=>go("/account")} aria-label="Account"><User/></button>
      <button onClick={()=>go("/cart")} className="cart-icon" aria-label="Cart"><ShoppingBag/><b>{cartCount}</b></button>
    </div>
  </div>
  <div className="mobile-nav" style={{justifyContent:"flex-start"}}>
    <button onClick={()=>setMenuOpen(true)} aria-label="Open menu"><Menu/></button>
    <button className="mobile-logo" style={{width:"142px",height:"54px",padding:0,marginLeft:"-8px"}} onClick={()=>go("/")} aria-label="Aayesha Collection home"><AayeshaLogo compact/></button>
    <div style={{marginLeft:"auto"}}><button onClick={()=>setSearchOpen(true)} aria-label="Search"><Search/></button><button onClick={()=>go("/wishlist")} aria-label="Wishlist"><Heart/></button><button className="cart-icon" onClick={()=>go("/cart")} aria-label="Cart"><ShoppingBag/><b>{cartCount}</b></button></div>
  </div>
 </header>
}

function Hero({go}:{go:(p:string)=>void}){return <section className="hero">
 <div className="hero-copy"><p className="eyebrow">ESTD 2026 · AAYESHA COLLECTION</p><h1>Style that<br/><em>feels like you.</em></h1><p>Discover effortless everyday fashion for women, men and kids.</p><div className="hero-btns"><button className="btn primary" onClick={()=>go("/women")}>WOMEN</button><button className="btn outline" onClick={()=>go("/men")}>MEN</button><button className="btn ghost" onClick={()=>go("/kids")}>KIDS</button></div></div>
 <div className="hero-image"><img src={imgs[5]} alt="Fashion editorial"/></div>
 </section>}

function CategoryCards({go}:{go:(p:string)=>void}){return <section className="section"><div className="section-head"><div><p className="eyebrow">EXPLORE</p><h2>SHOP BY CATEGORY</h2></div></div><div className="category-cards">{shopCategories.map(c=><button className="category-card" key={c.name} onClick={()=>go(c.path)}><img src={c.image} alt={c.name}/><span><strong>{c.name}</strong><small>SHOP NOW <ArrowRight size={15}/></small></span></button>)}</div></section>}

function PopularCategories({go}:{go:(p:string)=>void}){return <section className="section soft-section"><div className="section-head"><div><p className="eyebrow">EVERYDAY ESSENTIALS</p><h2>POPULAR CATEGORIES</h2></div></div><div className="popular-grid">{popular.map(([n,img])=><button key={n} onClick={()=>go("/"+(n==="ETHNIC WEAR"?"women":n.toLowerCase().replace(" ","-")))}><img src={img}/><span>{n}</span></button>)}</div></section>}

function ProductCard({p,wish,onWish,onAdd,onOpen}:{p:Product;wish:boolean;onWish:()=>void;onAdd:()=>void;onOpen:()=>void;key?:React.Key}){return <article className="product-card">
 <div className="product-image" onClick={onOpen}><img src={p.images[0]} alt={p.name}/><span className="fit">{p.fit}</span><button className={"wish "+(wish?"active":"")} onClick={e=>{e.stopPropagation();onWish()}} aria-label="Wishlist"><Heart size={18} fill={wish?"currentColor":"none"}/></button><span className="rating"><Star size={12} fill="currentColor"/> {p.rating}</span><span className="swatches">{p.colors.map((c,i)=><i key={i} style={{background:c}}/>)}{p.colors.length>2&&<small>+2</small>}</span></div>
 <div className="product-info"><small>{p.brand}</small><h3 onClick={onOpen}>{p.name}</h3><div className="price"><b>{money(p.price)}</b><del>{money(p.mrp)}</del><span>{p.discount}% OFF</span></div><p className="offer">{p.id%3===0?"Buy 3 get 10% off":""}</p><button className="add-btn" onClick={onAdd}>ADD TO CART</button></div>
 </article>}

function Editorial({title,copy,image,reverse}:{title:string;copy:string;image:string;reverse:boolean}){return <section className={"editorial "+(reverse?"reverse":"")}><div><p className="eyebrow">THE AAYESHA EDIT</p><h2>{title}</h2><p>{copy}</p><button className="text-btn">DISCOVER COLLECTION <ArrowRight size={16}/></button></div><img src={image} alt={title}/></section>}

function Reviews(){return <section className="section"><div className="section-head centered"><div><p className="eyebrow">LOVED BY YOU</p><h2>WHAT OUR CUSTOMERS SAY</h2></div></div><div className="reviews">{[
 ["★★★★★","Riya S.","The fit feels considered and the quality is lovely. My new everyday favourite.","Women's Blue Washed Baggy Jeans"],
 ["★★★★★","Ananya M.","Beautiful packaging, quick delivery and the dress looks even better in person.","Women's Floral Summer Dress"],
 ["★★★★★","Arjun K.","Clean design, comfortable fabric and exactly what I wanted for everyday wear.","Men's Relaxed Fit Shirt"],
 ["★★★★★","Kavya P.","My little one loved the set. Super easy to style.","Kids Co-ord Set"]
].map(r=><div className="review" key={r[1]}><b>{r[0]}</b><p>“{r[2]}”</p><strong>{r[1]}</strong><small>{r[3]}</small></div>)}</div></section>}
function Newsletter(){const [email,setEmail]=useState("");return <section className="newsletter"><div><p className="eyebrow">STAY CONNECTED</p><h2>Stay in the style loop.</h2><p>Get updates on new arrivals and collections.</p></div><div className="email"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email"/><button>SUBSCRIBE</button></div></section>}

function CategoriesPage({go}:{go:(x:string)=>void}){
  return <section className="categories-page section">
    <div className="breadcrumbs"><button onClick={()=>go("/")}>Home</button><ChevronRight size={13}/><span>Categories</span></div>
    <div className="section-head categories-intro"><div><p className="eyebrow">SHOP BY DEPARTMENT</p></div></div>
    <div className="category-hierarchy">
      {(["Women","Men","Kids"] as const).map(g=><div className="category-department" key={g}>
        <button className="department-title" onClick={()=>go("/categories/"+g.toLowerCase())}><div><p className="eyebrow">SHOP</p><h2>{g}</h2></div><ChevronRight/></button>
        <div className="subcategory-list">
          {categoryHierarchy[g].map(sub=><button key={sub} onClick={()=>go("/categories/"+g.toLowerCase()+"/"+sub.toLowerCase().replace(/\s+/g,"-"))}>{sub}<ChevronRight size={15}/></button>)}
        </div>
      </div>)}
    </div>
  </section>
}

function CategorySubpage({gender,go}:{gender:string;go:(x:string)=>void}){
  const label=gender[0].toUpperCase()+gender.slice(1);
  const subs=categoryHierarchy[label]||[];
  return <section className="categories-page section">
    <div className="breadcrumbs"><button onClick={()=>go("/")}>Home</button><ChevronRight size={13}/><button onClick={()=>go("/categories")}>Categories</button><ChevronRight size={13}/><span>{label}</span></div>
    <div className="section-head"><div><p className="eyebrow">{label.toUpperCase()}</p><h1>{label} Categories</h1><p>Choose a category to view products.</p></div></div>
    <div className="subcategory-list category-subpage-list">
      {subs.map(sub=><button key={sub} onClick={()=>go("/categories/"+gender+"/"+sub.toLowerCase().replace(/\s+/g,"-"))}><span>{sub}</span><ChevronRight size={17}/></button>)}
    </div>
  </section>
}

function CatalogPage({
  products,title,list,query,setQuery,selectedCategory,setSelectedCategory,sort,setSort,setFilterOpen,
  selectedSize,setSelectedSize,selectedColor,setSelectedColor,priceMin,priceMax,setPriceMin,setPriceMax,
  wish,onWish,onAdd,onOpen,go
}:{
  products:Product[];
  title:string;
  list:Product[];
  query:string;
  setQuery:(x:string)=>void;
  selectedCategory:string;
  setSelectedCategory:(x:string)=>void;
  sort:string;
  setSort:(x:string)=>void;
  setFilterOpen:(x:boolean)=>void;
  selectedSize:string;
  setSelectedSize:(x:string)=>void;
  selectedColor:string;
  setSelectedColor:(x:string)=>void;
  priceMin:number;
  priceMax:number;
  setPriceMin:(x:number)=>void;
  setPriceMax:(x:number)=>void;
  wish:number[];
  onWish:(id:number)=>void;
  onAdd:(p:Product)=>void;
  onOpen:(id:number)=>void;
  go:(x:string)=>void;
}){
  const isWish=title==="WISHLIST";
  const currentPath=typeof window!=="undefined"?window.location.pathname:"";
  const isDepartmentPage=/^\/(women|men|kids)$/.test(currentPath);
  const isCategorySubpage=/^\/categories\/(women|men|kids)\/[^/]+$/.test(currentPath);
  const visible=isWish?products.filter(p=>wish.includes(p.id)):list;
  const path=typeof window!=="undefined"?window.location.pathname:"";
  const routeParts=path.split("/").filter(Boolean);
  const routeGender=routeParts[0]==="categories"&&routeParts[1]?routeParts[1][0].toUpperCase()+routeParts[1].slice(1):"";
  const routeSub=routeParts[0]==="categories"&&routeParts[2]?routeParts[2].replace(/-/g," "):"";
  const [sortOpen,setSortOpen]=useState(false);
  const sortRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const handleOutside=(e:MouseEvent)=>{
      if(sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    const handleEscape=(e:KeyboardEvent)=>{if(e.key==="Escape") setSortOpen(false);};
    document.addEventListener("mousedown",handleOutside);
    document.addEventListener("keydown",handleEscape);
    return ()=>{
      document.removeEventListener("mousedown",handleOutside);
      document.removeEventListener("keydown",handleEscape);
    };
  },[]);

  const sortOptions=["Popularity","Newest","Price: Low to High","Price: High to Low","Customer Rating"];

  return <section className="catalog section">
    <div className="breadcrumbs">
      <button onClick={()=>go("/")}>Home</button><ChevronRight size={13}/>
      {isCategorySubpage
        ? <><button onClick={()=>go("/categories")}>Categories</button><ChevronRight size={13}/>
          <button onClick={()=>go(`/categories/${routeGender.toLowerCase()}`)}>{routeGender}</button>
          <ChevronRight size={13}/><span>{routeSub}</span></>
        : <span>{isDepartmentPage?title:title}</span>}
    </div>

    <div className="catalog-head">
      <div>
        <p className="eyebrow">AAYESHA COLLECTION</p>
        <h1>{isWish?"YOUR WISHLIST":title}</h1>
        <span>{visible.length} {visible.length===1?"product":"products"}</span>
      </div>
      {!isWish&&<div className="catalog-actions">
        <button className="filter-btn catalog-control" onClick={()=>setFilterOpen(true)}>
          <SlidersHorizontal size={16}/><span>FILTER</span>
        </button>
        <div className="sort-control-wrap" ref={sortRef}>
          <button
            className={"sort-control catalog-control "+(sortOpen?"open":"")}
            onClick={()=>setSortOpen(v=>!v)}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            <span className={"sort-control-text "+(sort==="Sort By"?"placeholder":"")}>{sort}</span>
            <ChevronDown size={16} className="sort-chevron"/>
          </button>
          {sortOpen&&<div className="sort-menu" role="listbox" aria-label="Sort products">
            {sortOptions.map(option=><button
              key={option}
              className={sort===option?"selected":""}
              onClick={()=>{setSort(option);setSortOpen(false)}}
              role="option"
              aria-selected={sort===option}
            >
              <span>{option}</span>
              {sort===option&&<Check size={15}/>}
            </button>)}
          </div>}
        </div>
      </div>}
    </div>

    {!isWish&&(title==="SHOP"||title==="SEARCH")
      ? <div className="catalog-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands or categories"/></div>
      : null}

    {visible.length
      ? <div className="product-grid">{visible.map(p=>
          <ProductCard key={p.id} p={p} wish={wish.includes(p.id)}
            onWish={()=>onWish(p.id)} onAdd={()=>onAdd(p)} onOpen={()=>onOpen(p.id)}/>
        )}</div>
      : <Empty title={isWish?"Your wishlist is empty":"No products found"}
          copy={isWish?"Save pieces you love and find them here.":"Try another search or clear your filters."}
          action="CONTINUE SHOPPING" onClick={()=>go("/")}/>}
  </section>
}

function ProductDetail({p,onAdd,wish,onWish,onBack}:{p:Product;onAdd:(p:Product,s?:string,c?:string)=>void;wish:boolean;onWish:()=>void;onBack:()=>void}){
 const [image,setImage]=useState(0),[size,setSize]=useState(p.sizes[1]||p.sizes[0]),[color,setColor]=useState(p.colors[0]),[qty,setQty]=useState(1),[tab,setTab]=useState("Description");
 return <section className="detail section"><button className="back" onClick={onBack}>← Back</button><div className="detail-grid"><div className="gallery"><div className="thumbs">{p.images.map((im,i)=><button className={image===i?"active":""} onClick={()=>setImage(i)} key={im}><img src={im}/></button>)}</div><div className="main-gallery"><img src={p.images[image]} alt={p.name}/><button className={"wish detail-wish "+(wish?"active":"")} onClick={onWish}><Heart fill={wish?"currentColor":"none"}/></button></div></div>
 <div className="detail-copy"><small>{p.brand}</small><h1>{p.name}</h1><div className="detail-rating"><span><Star size={14} fill="currentColor"/> {p.rating}</span> {p.reviewCount} reviews</div><div className="detail-price"><b>{money(p.price)}</b><del>{money(p.mrp)}</del><span>{p.discount}% OFF</span></div><p className="tax">MRP incl. of all taxes</p><hr/><label>COLOR <b>{color===p.colors[0]?"Black":"Rose"}</b></label><div className="color-pick">{p.colors.map(c=><button key={c} className={color===c?"selected":""} style={{background:c}} onClick={()=>setColor(c)}/>)}</div><label>SIZE <button className="size-guide">Size Guide</button></label><div className="sizes">{p.sizes.map(s=><button className={size===s?"selected":""} key={s} onClick={()=>setSize(s)}>{s}</button>)}</div><div className="delivery"><MapPin/><div><b>Check delivery to your pincode</b><div><input placeholder="Enter Pincode"/><button>CHECK</button></div><small>Demo: Delivery available · 3–5 days</small></div></div><div className="buy-row"><div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus/></button><b>{qty}</b><button onClick={()=>setQty(qty+1)}><Plus/></button></div><button className="btn primary big" onClick={()=>Array.from({length:qty}).forEach(()=>onAdd(p,size,color))}>ADD TO CART</button><button className="btn outline big" onClick={()=>onAdd(p,size,color)}>BUY NOW</button></div></div></div>
 <div className="detail-tabs">{["Description","Size Guide","Delivery Information","Return Policy","Customer Reviews"].map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div><div className="tab-content"><h3>{tab}</h3><p>{tab==="Description"?p.description:tab==="Customer Reviews"?`★★★★★  ${p.rating} average from ${p.reviewCount} reviews. Customers love the fit, finish and easy styling.`:"Comfortable shopping, simple returns and clear delivery updates — designed around an easy Aayesha experience."}</p></div>
 </section>
}

function CartDrawer({open,setOpen,cart,setCart,subtotal,discount,total,remove,onCheckout}:{open:boolean;setOpen:()=>void;cart:CartItem[];setCart:(f:any)=>void;subtotal:number;discount:number;total:number;remove:(i:number)=>void;onCheckout:()=>void}){
  if(!open)return null;
  return <div className="overlay cart-overlay" onClick={setOpen}>
    <aside className="drawer cart-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head">
        <h2>YOUR CART <span>{cart.reduce((a,b)=>a+b.qty,0)}</span></h2>
        <button onClick={setOpen} aria-label="Close cart"><X/></button>
      </div>
      {cart.length
        ? <>
          <div className="cart-items">{cart.map((x,i)=>
            <div className="cart-item" key={`${x.product.id}-${x.size}-${x.color}-${i}`}>
              <img src={x.product.images[0]} alt={x.product.name}/>
              <div>
                <small>{x.product.brand}</small><h4>{x.product.name}</h4>
                <p>Size {x.size} · {x.color==="#171717"?"Black":x.color==="#e8c5cf"?"Rose":"White"}</p>
                <b>{money(x.product.price)}</b>
                <div className="cart-controls">
                  <button onClick={()=>setCart((c:CartItem[])=>c.map((it,j)=>j===i?{...it,qty:Math.max(1,it.qty-1)}:it))}>−</button>
                  <span>{x.qty}</span>
                  <button onClick={()=>setCart((c:CartItem[])=>c.map((it,j)=>j===i?{...it,qty:it.qty+1}:it))}>+</button>
                  <button className="remove" onClick={()=>remove(i)} aria-label="Remove item"><Trash2 size={15}/></button>
                </div>
              </div>
            </div>)}
          </div>
          <div className="coupon"><input placeholder="Coupon code"/><button>APPLY</button></div>
          <div className="summary">
            <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div><span>Discount</span><b className="green">−{money(discount)}</b></div>
            <div><span>Delivery</span><b>FREE</b></div>
            <div className="total"><span>Total</span><b>{money(total)}</b></div>
            <button className="btn primary full" onClick={onCheckout}>PROCEED TO CHECKOUT</button>
          </div>
        </>
        : <Empty title="Your cart is empty" copy="Find something you love." action="START SHOPPING" onClick={setOpen}/>}
    </aside>
  </div>
}

function Checkout({cart,total,orders,setOrders,savedAddress,setSavedAddress,onClose,onClear,onTrack}:{cart:CartItem[];total:number;orders:Order[];setOrders:(o:Order[])=>void;savedAddress:SavedAddress[];setSavedAddress:(o:SavedAddress[])=>void;onClose:()=>void;onClear:()=>void;onTrack:()=>void}){
  const [step,setStep]=useState(1);
  const [done,setDone]=useState(false);
  const [orderId,setOrderId]=useState("");
  const [pay,setPay]=useState("UPI");
  const [form,setForm]=useState({name:"",phone:"+91 ",address:"",city:"",state:"",pin:""});
  const [errors,setErrors]=useState<Record<string,string>>({});
  useEffect(()=>{
    const last=savedAddress[0];
    if(last) setForm(last);
  },[]);

  const states=[
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh"
  ];
  const cities = [
    "Raipur", "Bhilai", "Durg", "Bilaspur", "Korba", "Rajnandgaon",
    "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari", "Mahasamund", "Kanker",
    "Kawardha", "Kondagaon", "Bhatapara", "Baloda Bazar", "Janjgir", "Champa",
    "Mungeli", "Gariaband", "Bemetara", "Balod", "Sakti", "Sarangarh",
    "Dantewada", "Bijapur", "Sukma", "Narayanpur", "Surajpur", "Balrampur",
    "Jashpur Nagar", "Manendragarh", "Chirmiri", "Pendra Road", "Visakhapatnam", "Vijayawada",
    "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada",
    "Kadapa", "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Srikakulam",
    "Chittoor", "Itanagar", "Naharlagun", "Tawang", "Pasighat", "Bomdila",
    "Ziro", "Aalo", "Tezu", "Namsai", "Roing", "Guwahati",
    "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur",
    "Bongaigaon", "Dhubri", "Sivasagar", "Diphu", "North Lakhimpur", "Barpeta",
    "Goalpara", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
    "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra",
    "Bettiah", "Sasaram", "Hajipur", "Siwan", "Panaji", "Vasco da Gama",
    "Margao", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Canacona",
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Junagadh", "Gandhinagar", "Anand", "Bharuch", "Navsari", "Vapi",
    "Mehsana", "Morbi", "Nadiad", "Palanpur", "Porbandar", "Bhuj",
    "Godhra", "Dahod", "Gurugram", "Faridabad", "Panipat", "Ambala",
    "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Sirsa", "Rewari", "Fatehabad", "Kaithal", "Shimla",
    "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Hamirpur",
    "Una", "Chamba", "Nahan", "Kangra", "Baddi", "Ranchi",
    "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih",
    "Ramgarh", "Phusro", "Medininagar", "Chaibasa", "Dumka", "Sahibganj",
    "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi",
    "Kalaburagi", "Davangere", "Ballari", "Shivamogga", "Tumakuru", "Udupi",
    "Hassan", "Mandya", "Raichur", "Vijayapura", "Bidar", "Chikkamagaluru",
    "Kolar", "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram", "Kasaragod",
    "Pathanamthitta", "Idukki", "Bhopal", "Indore", "Jabalpur", "Gwalior",
    "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Katni", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara",
    "Morena", "Shivpuri", "Vidisha", "Mandsaur", "Mumbai", "Pune",
    "Nagpur", "Nashik", "Thane", "Chhatrapati Sambhajinagar", "Navi Mumbai", "Solapur",
    "Kolhapur", "Amravati", "Nanded", "Sangli", "Jalgaon", "Akola",
    "Latur", "Ahmednagar", "Dhule", "Satara", "Chandrapur", "Ratnagiri",
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri",
    "Balasore", "Baripada", "Jharsuguda", "Bargarh", "Bhadrak", "Dhenkanal",
    "Angul", "Koraput", "Rayagada", "Ludhiana", "Amritsar", "Jalandhar",
    "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Moga",
    "Batala", "Abohar", "Khanna", "Firozpur", "Kapurthala", "Jaipur",
    "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara",
    "Alwar", "Sikar", "Bharatpur", "Sri Ganganagar", "Pali", "Tonk",
    "Barmer", "Churu", "Bundi", "Kishangarh", "Chennai", "Coimbatore",
    "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Tirunelveli",
    "Thoothukudi", "Vellore", "Dindigul", "Thanjavur", "Nagercoil", "Kanchipuram",
    "Karur", "Hosur", "Hyderabad", "Warangal", "Nizamabad", "Karimnagar",
    "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Siddipet",
    "Suryapet", "Jagtial", "Lucknow", "Kanpur", "Ghaziabad", "Agra",
    "Varanasi", "Prayagraj", "Meerut", "Noida", "Bareilly", "Aligarh",
    "Moradabad", "Saharanpur", "Gorakhpur", "Mathura", "Firozabad", "Jhansi",
    "Muzaffarnagar", "Ayodhya", "Rampur", "Hapur", "Dehradun", "Haridwar",
    "Haldwani", "Rishikesh", "Roorkee", "Rudrapur", "Kashipur", "Nainital",
    "Almora", "Pithoragarh", "Srinagar", "Mussoorie", "Kolkata", "Howrah",
    "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur",
    "Haldia", "Berhampore", "Jalpaiguri", "Darjeeling", "Raiganj", "Krishnanagar",
    "New Delhi", "Delhi", "Chandigarh", "Jammu", "Anantnag", "Baramulla",
    "Kathua", "Udhampur", "Leh", "Kargil", "Puducherry", "Karaikal",
    "Mahe", "Yanam", "Port Blair", "Daman", "Diu", "Silvassa",
    "Kavaratti", "Agatti", "Andrott",
  ];



  const capitalizeWords=(value:string)=>value.replace(/\s+/g," ").replace(/(^|\s)([a-zA-Z])/g,(_,space,letter)=>space+letter.toUpperCase());

  const setField=(key:keyof typeof form,value:string)=>{
    let next=value;
    if(key==="name" || key==="address" || key==="city" || key==="state") next=capitalizeWords(value);
    if(key==="phone"){
      const raw=value.trim();
      const digits=raw.replace(/^\+91\s*/,"").replace(/\D/g,"").slice(0,10);
      next=`+91 ${digits}`;
    }
    if(key==="pin") next=value.replace(/\D/g,"").slice(0,6);
    setForm(f=>({...f,[key]:next}));
    setErrors(e=>({...e,[key]:""}));
  };

  const handlePincodeChange=async(value:string)=>{
    const pin=value.replace(/\D/g,"").slice(0,6);
    setForm(f=>({...f,pin}));
    setErrors(e=>({...e,pin:""}));
    if(pin.length!==6) return;

    try{
      const response=await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if(!response.ok) throw new Error("Pincode lookup failed");
      const data=await response.json();
      const result=data?.[0];
      const office=result?.PostOffice?.[0];
      if(result?.Status==="Success" && office){
        setForm(f=>({...f,city:office.District || office.Block || f.city,state:office.State || f.state,pin}));
        setErrors(e=>({...e,pin:"",city:"",state:""}));
      }else{
        setErrors(e=>({...e,pin:"Pincode not found. Please check and try again."}));
      }
    }catch{
      setErrors(e=>({...e,pin:"Unable to verify pincode right now. You can enter city and state manually."}));
    }
  };

  const validateAddress=()=>{
    const e:Record<string,string>={};
    if(form.name.trim().length<2) e.name="Please enter your full name.";
    if(!/^\+91\s\d{10}$/.test(form.phone)) e.phone="Enter a valid 10-digit mobile number after +91.";
    if(form.address.trim().length<8) e.address="Please enter your complete address.";
    if(form.city.trim().length<2) e.city="Please enter your city.";
    if(form.state.trim().length<2) e.state="Please enter your state.";
    if(!/^\d{6}$/.test(form.pin)) e.pin="Enter a valid 6-digit pincode.";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const nextFromAddress=()=>{ if(validateAddress()) setStep(2); };
  const place=()=>{
    const id="AY"+Date.now().toString().slice(-8);
    const address:SavedAddress={...form};
    setSavedAddress([address,...savedAddress.filter(a=>JSON.stringify(a)!==JSON.stringify(address))]);
    setOrders([{id,date:new Date().toLocaleDateString("en-IN"),items:cart,total,status:"Confirmed",payment:pay,address},...orders]);
    setOrderId(id);
    onClear();
    setDone(true);
  };

  if(done)return <section className="confirmation section"><CheckCircle2 size={62}/><p className="eyebrow">THANK YOU</p><h1>Order Placed Successfully</h1><p>Your order has been confirmed. We’ll keep you updated as it moves.</p><div className="order-confirm"><b>Order ID</b><span>{orderId}</span><b>Expected Delivery</b><span>3–5 business days</span></div><div className="confirmation-actions"><button className="btn primary" onClick={onTrack}>TRACK ORDER</button><button className="btn outline" onClick={onClose}>CONTINUE SHOPPING</button></div></section>;

  const input=(key:keyof typeof form,label:string,placeholder="",extra?:React.ReactNode)=> <label key={key}>{label}<input value={form[key]} onChange={e=>key==="pin"?handlePincodeChange(e.target.value):setField(key,e.target.value)} placeholder={placeholder} {...(key==="phone"?{type:"tel",inputMode:"numeric",maxLength:14,pattern:"\\+91 \\d{10}",autoComplete:"tel"}:key==="pin"?{inputMode:"numeric",maxLength:6,autoComplete:"postal-code"}:{})}/>{extra}{errors[key]&&<small className="field-error">{errors[key]}</small>}</label>;

  return <section className="checkout section">
    <div className="checkout-top"><button className="back" onClick={onClose}>← Back to shopping</button><h1>CHECKOUT</h1></div>
    <div className="steps">{["ADDRESS","ORDER SUMMARY","PAYMENT","CONFIRM"].map((s,i)=><div className={step>=i+1?"active":""} key={s}><span>{i+1}</span>{s}</div>)}</div>
    <div className="checkout-grid">
      <div className="checkout-main">
        {step===1&&<div className="panel">
          <h2>Delivery address</h2>
          <div className="form-grid">
            {input("name","FULL NAME","Enter your full name")}
            {input("phone","PHONE NUMBER","+91 9876543210")}
            {input("address","ADDRESS","House / Flat, Street, Area")}
            {input("city","CITY","Type here")}
            {input("state","STATE","Type here")}
            {input("pin","PINCODE","6-digit pincode")}
          </div>
          <button className="btn primary" onClick={nextFromAddress}>CONTINUE</button>
        </div>}

        {step===2&&<div className="panel order-summary-step">
          <div className="panel-heading-row"><div><p className="eyebrow">STEP 2</p><h2>Order Summary</h2></div><span className="summary-count">{cart.reduce((a,b)=>a+b.qty,0)} items</span></div>
          <div className="summary-products">{cart.map((x,i)=><div className="summary-product" key={`${x.product.id}-${i}`}><img src={x.product.images[0]} alt={x.product.name}/><div><b>{x.product.name}</b><small>{x.product.brand} · Size {x.size} · Qty {x.qty}</small></div><strong>{money(x.product.price*x.qty)}</strong></div>)}</div>
          <div className="summary-totals"><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Delivery</span><b>FREE</b></div><div className="grand"><span>Total</span><strong>{money(total)}</strong></div></div>
          <button className="btn primary" onClick={()=>setStep(3)}>CONTINUE TO PAYMENT</button>
        </div>}

        {step===3&&<div className="panel">
          <h2>Payment method</h2>
          {['UPI','Credit Card','Debit Card','Net Banking','Cash on Delivery'].map(x=><button type="button" className={"pay-option "+(pay===x?"active":"")} onClick={()=>setPay(x)} key={x}><CreditCard size={18}/>{x}<Check size={17}/></button>)}
          <p className="secure"><ShieldCheck size={17}/> Your payment selection is saved with this order.</p>
          <button className="btn primary" onClick={()=>setStep(4)}>REVIEW ORDER</button>
        </div>}

        {step===4&&<div className="panel">
          <h2>Review & place order</h2>
          <div className="review-box"><div><span>Deliver to</span><b>{form.name}</b><p>{form.address}, {form.city}, {form.state} - {form.pin}</p><p>{form.phone}</p></div><button className="text-btn" onClick={()=>setStep(1)}>EDIT</button></div>
          <div className="review-box"><div><span>Payment</span><b>{pay}</b></div><button className="text-btn" onClick={()=>setStep(3)}>EDIT</button></div>
          <div className="review-total"><span>Order Total</span><strong>{money(total)}</strong></div>
          <button className="btn primary" onClick={place}>PLACE ORDER</button>
        </div>}
      </div>

      <aside className="checkout-summary"><h3>ORDER SUMMARY</h3>{cart.map((x,i)=><div key={i}><img src={x.product.images[0]}/><span>{x.product.name}<small>Qty {x.qty}</small></span><b>{money(x.product.price*x.qty)}</b></div>)}<hr/><div><span>Total</span><strong>{money(total)}</strong></div></aside>
    </div>
  </section>
}
function MobileDrawer({close,go}:{close:()=>void;go:(p:string)=>void}){return <div className="drawer-overlay" onClick={close}><aside className="menu-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div style={{width:"145px",height:"72px"}}><AayeshaLogo compact/></div><button onClick={close}><X/></button></div>{[
 ["HOME","/"],["MEN","/men"],["WOMEN","/women"],["KIDS","/kids"],["NEW ARRIVALS","/new-arrivals"]
].map(([a,p])=><button className="menu-link" onClick={()=>go(p)} key={a}>{a}<ChevronRight size={16}/></button>)}<div className="menu-groups"><b>MEN</b>{["T-Shirts","Shirts","Jeans","Trousers","Hoodies","Jackets","Accessories"].map(x=><span key={x}>{x}</span>)}<b>WOMEN</b>{["T-Shirts","Tops","Dresses","Jeans","Trousers","Co-ords","Kurtis","Ethnic Wear","Accessories"].map(x=><span key={x}>{x}</span>)}<b>KIDS</b>{["Boys","Girls","T-Shirts","Dresses","Bottom Wear","Sets","Accessories"].map(x=><span key={x}>{x}</span>)}</div></aside></div>}

function SearchOverlay({products,query,setQuery,close,go}:{products:Product[];query:string;setQuery:(x:string)=>void;close:()=>void;go:(x:string)=>void}){const results=products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,5);return <div className="search-overlay"><div className="search-box"><div><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands or categories"/><button onClick={close}><X/></button></div>{query&&results.map(p=><button onClick={()=>{go("/product/"+p.id);close()}} key={p.id}><img src={p.images[0]}/><span>{p.name}<small>{money(p.price)}</small></span><ArrowRight/></button>)}{query&&!results.length&&<div className="no-search"><SearchX/><span>No products found</span></div>}</div></div>}

function FilterDrawer({
  close,selectedCategory,setSelectedCategory,selectedSize,setSelectedSize,
  selectedColor,setSelectedColor,priceMin,priceMax,setPriceMin,setPriceMax,products
}:{
  close:()=>void;
  selectedCategory:string;
  setSelectedCategory:(x:string)=>void;
  selectedSize:string;
  setSelectedSize:(x:string)=>void;
  selectedColor:string;
  setSelectedColor:(x:string)=>void;
  priceMin:number;
  priceMax:number;
  setPriceMin:(x:number)=>void;
  setPriceMax:(x:number)=>void;
  products:Product[];
}){
  const path=window.location.pathname;
  const parts=path.split("/").filter(Boolean);
  const genderSlug=parts[0]==="women"||parts[0]==="men"||parts[0]==="kids"
    ? parts[0]
    : parts[0]==="categories" ? parts[1] : "";
  const routeGender=genderSlug ? genderSlug[0].toUpperCase()+genderSlug.slice(1) : null;
  const routeSub=parts[0]==="categories"&&parts[2] ? parts[2].replace(/-/g," ").toLowerCase() : null;

  // CATEGORY means the actual clothing type — never Women / Men / Kids.
  const scopedProducts=routeGender ? products.filter(p=>p.category===routeGender) : products;
  const availableCategorySet=new Set(scopedProducts.map(p=>p.subcategory));
  const categoryOptions=routeGender
    ? (categoryHierarchy[routeGender]||[])
    : Array.from(new Set(products.map(p=>p.subcategory))).sort((a,b)=>a.localeCompare(b));

  // Keep department sizes separate so Kids age sizes can never leak into Women / Men.
  const sizeOptions:Record<string,string[]>= {
    Women:["XS","S","M","L","XL","XXL"],
    Men:["S","M","L","XL","XXL","XXXL"],
    Kids:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y","12-13Y"]
  };
  const sizes=routeGender ? (sizeOptions[routeGender]||[]) : Array.from(new Set(products.flatMap(p=>p.sizes))).sort((a,b)=>{
    const order=["XS","S","M","L","XL","XXL","XXXL","2-3Y","4-5Y","6-7Y","8-9Y","10-11Y","12-13Y"];
    return order.indexOf(a)-order.indexOf(b);
  });

  const colorNames:Record<string,string>={
    "#171717":"Black","#e8c5cf":"Rose","#ffffff":"White","#1f3a5f":"Navy",
    "#6b7280":"Grey","#8b5e3c":"Brown","#d8c3a5":"Beige","#7b1e2b":"Maroon",
    "#1d4ed8":"Blue","#16a34a":"Green","#f4c2c2":"Pink","#f59e0b":"Mustard",
    "#7c3aed":"Purple","#ef4444":"Red","#111827":"Charcoal"
  };
  const colors=Array.from(new Set(scopedProducts.flatMap(p=>p.colors)));
  const colorMeta=(c:string)=>({name:colorNames[c]||c,swatch:c});

  const activeCategory=categoryOptions.includes(selectedCategory)?selectedCategory:"All";
  const activeSize=sizes.includes(selectedSize)?selectedSize:"All";
  const activeColor=colors.includes(selectedColor)?selectedColor:"All";
  const selectedCount=[activeCategory!=="All",activeSize!=="All",activeColor!=="All",priceMin>0||priceMax<5000].filter(Boolean).length;

  const clearAll=()=>{
    setSelectedCategory("All");
    setSelectedSize("All");
    setSelectedColor("All");
    setPriceMin(0);
    setPriceMax(5000);
  };

  const sections=[
    {id:"category",label:"Category"},
    {id:"size",label:"Size"},
    {id:"color",label:"Color"},
    {id:"price",label:"Price"}
  ];
  const [activeSection,setActiveSection]=useState("category");

  const renderCategory=()=> <div className="filter-panel-section">
    <div className="filter-panel-heading"><span>CATEGORY</span><small>Choose what you want to wear</small></div>
    <div className="filter-check-list">
      <button className={activeCategory==="All"?"checked":""} onClick={()=>setSelectedCategory("All")}><span>All categories</span><i>{activeCategory==="All"?"✓":""}</i></button>
      {categoryOptions.map(x=><button key={x} className={activeCategory===x?"checked":""} onClick={()=>setSelectedCategory(x)}><span>{x}</span><i>{activeCategory===x?"✓":""}</i></button>)}
    </div>
  </div>;

  const renderSize=()=> <div className="filter-panel-section">
    <div className="filter-panel-heading"><span>SIZE</span><small>{routeGender==="Kids"?"Kids age sizes":"Sizes available for this department"}</small></div>
    <div className="filter-size-grid">
      <button className={activeSize==="All"?"checked":""} onClick={()=>setSelectedSize("All")}>All</button>
      {sizes.map(x=><button key={x} className={activeSize===x?"checked":""} onClick={()=>setSelectedSize(x)}>{x}</button>)}
    </div>
  </div>;

  const renderColor=()=> <div className="filter-panel-section">
    <div className="filter-panel-heading"><span>COLOR</span><small>Select your preferred shade</small></div>
    <div className="filter-color-list">
      <button className={activeColor==="All"?"checked":""} onClick={()=>setSelectedColor("All")}><i className="filter-multi-swatch"/><span>All colors</span><b>{activeColor==="All"?"✓":""}</b></button>
      {colors.map(c=>{const m=colorMeta(c);return <button key={c} className={activeColor===c?"checked":""} onClick={()=>setSelectedColor(c)}><i className="filter-color-dot" style={{background:m.swatch}}/><span>{m.name}</span><b>{activeColor===c?"✓":""}</b></button>})}
    </div>
  </div>;

  const renderPrice=()=> <div className="filter-panel-section">
    <div className="filter-panel-heading"><span>PRICE</span><small>Set your preferred price range</small></div>
    <div className="filter-price-box">
      <label><span>MIN</span><div><b>₹</b><input type="number" min={0} max={priceMax} value={priceMin} onChange={e=>setPriceMin(Math.max(0,Math.min(Number(e.target.value)||0,priceMax)))}/></div></label>
      <span className="filter-price-dash">—</span>
      <label><span>MAX</span><div><b>₹</b><input type="number" min={priceMin} max={5000} value={priceMax} onChange={e=>setPriceMax(Math.min(5000,Math.max(Number(e.target.value)||0,priceMin)))}/></div></label>
    </div>
    <div className="filter-price-summary"><span>Your range</span><strong>{money(priceMin)} — {money(priceMax)}</strong></div>
  </div>;

  return <div className="overlay filter-overlay" onClick={close}>
    <aside className="filter-drawer reference-filter" onClick={e=>e.stopPropagation()}>
      <div className="filter-handle"/>
      <div className="reference-filter-head">
        <div><p className="eyebrow">REFINE YOUR LOOK</p><h2>Filters</h2></div>
        <button className="filter-close" onClick={close} aria-label="Close filters"><X size={19}/></button>
      </div>
      <div className="filter-current"><span>{routeGender||"ALL PRODUCTS"}</span>{selectedCount>0&&<b>{selectedCount} selected</b>}</div>

      <div className="reference-filter-body">
        <div className="filter-section-nav">
          {sections.map((s,i)=><button key={s.id} className={activeSection===s.id?"active":""} onClick={()=>setActiveSection(s.id)}><span>{String(i+1).padStart(2,"0")}</span>{s.label}</button>)}
        </div>
        <div className="filter-section-content">
          {activeSection==="category"&&renderCategory()}
          {activeSection==="size"&&renderSize()}
          {activeSection==="color"&&renderColor()}
          {activeSection==="price"&&renderPrice()}
        </div>
      </div>

      <div className="reference-filter-footer">
        <button className="clear-filter" onClick={clearAll}>CLEAR ALL</button>
        <button className="btn primary apply-filter" onClick={close}>SHOW PRODUCTS{selectedCount>0?` · ${selectedCount}`:""}<ArrowRight size={16}/></button>
      </div>
    </aside>
  </div>
}
function ReferenceFilterStyles(){return <style>{`
.filter-overlay{background:rgba(22,27,24,.42)!important;backdrop-filter:blur(4px)!important;z-index:1000!important;align-items:center!important;justify-content:flex-end!important;}
.reference-filter{width:min(520px,94vw)!important;max-width:520px!important;height:min(760px,94dvh)!important;background:#fff!important;border-radius:24px 0 0 24px!important;box-shadow:-24px 0 60px rgba(24,34,28,.18)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;}
.filter-handle{display:none;}
.reference-filter-head{display:flex;align-items:center;justify-content:space-between;padding:24px 26px 16px;border-bottom:1px solid #edf0ec;flex:none;}
.reference-filter-head .eyebrow{margin:0 0 5px!important;font-size:8px!important;letter-spacing:1.8px!important;}
.reference-filter-head h2{margin:0!important;font-size:26px!important;line-height:1.05!important;text-transform:uppercase!important;letter-spacing:-.5px!important;}
.filter-close{width:38px;height:38px;border:1px solid #e5e9e4;border-radius:50%;background:#fff;display:grid;place-items:center;cursor:pointer;color:inherit;}
.filter-current{margin:14px 26px 0;padding:10px 12px;background:#f6f8f4;border-radius:9px;display:flex;align-items:center;justify-content:space-between;font-size:9px;letter-spacing:1.2px;color:#778078;font-weight:700;flex:none;}
.filter-current b{letter-spacing:0;font-size:10px;color:#c9115b;}
.reference-filter-body{display:grid;grid-template-columns:126px minmax(0,1fr);flex:1;min-height:0;margin-top:14px;}
.filter-section-nav{border-right:1px solid #edf0ec;background:#fafbf9;padding:6px 0;overflow-y:auto;}
.filter-section-nav button{width:100%;border:0;border-left:3px solid transparent;background:transparent;padding:16px 15px 16px 18px;display:flex;align-items:center;gap:9px;text-align:left;font-size:11px;color:#6e776f;cursor:pointer;}
.filter-section-nav button span{font-size:8px;color:#a2aaa3;min-width:15px;}
.filter-section-nav button.active{background:#fff;border-left-color:#c9115b;color:#c9115b;font-weight:700;}
.filter-section-nav button.active span{color:#c9115b;}
.filter-section-content{overflow-y:auto;padding:25px 24px 28px;min-width:0;}
.filter-panel-heading{margin-bottom:20px;}
.filter-panel-heading span{display:block;font-size:13px;letter-spacing:1.8px;font-weight:800;color:#263029;}
.filter-panel-heading small{display:block;margin-top:5px;color:#89918b;font-size:10px;line-height:1.5;}
.filter-check-list{display:grid;gap:0;border-top:1px solid #edf0ec;}
.filter-check-list button{min-height:45px;padding:10px 3px;border:0;border-bottom:1px solid #edf0ec;background:#fff;display:flex;align-items:center;justify-content:space-between;text-align:left;color:#424a44;font-size:12px;cursor:pointer;}
.filter-check-list button i{width:19px;height:19px;border:1px solid #cfd6cf;border-radius:4px;display:grid;place-items:center;font-style:normal;font-size:12px;color:#fff;background:#fff;}
.filter-check-list button.checked{color:#c9115b;font-weight:700;}
.filter-check-list button.checked i{background:#c9115b;border-color:#c9115b;}
.filter-size-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}
.filter-size-grid button{height:42px;border:1px solid #dfe5df;border-radius:8px;background:#fff;color:#424a44;font-size:11px;font-weight:600;cursor:pointer;}
.filter-size-grid button.checked{border-color:#c9115b;background:#fff1f6;color:#c9115b;box-shadow:0 4px 10px rgba(201,17,91,.08);}
.filter-color-list{display:grid;gap:0;border-top:1px solid #edf0ec;}
.filter-color-list button{min-height:48px;border:0;border-bottom:1px solid #edf0ec;background:#fff;display:flex;align-items:center;gap:11px;padding:8px 3px;text-align:left;color:#424a44;font-size:12px;cursor:pointer;}
.filter-color-list button b{margin-left:auto;font-size:13px;color:#c9115b;}
.filter-color-dot,.filter-multi-swatch{width:23px;height:23px;border-radius:50%;display:block;border:1px solid #d7ddd7;flex:none;}
.filter-multi-swatch{background:conic-gradient(#171717 0 25%,#e8c5cf 25% 50%,#fff 50% 75%,#b7c5b9 75% 100%);}
.filter-color-list button.checked span{color:#c9115b;font-weight:700;}
.filter-price-box{display:grid;grid-template-columns:1fr 18px 1fr;align-items:end;gap:8px;}
.filter-price-box label>span{display:block;font-size:8px;letter-spacing:1px;color:#8a918c;font-weight:700;margin-bottom:6px;}
.filter-price-box label>div{height:43px;border:1px solid #dfe5df;border-radius:8px;display:flex;align-items:center;padding:0 10px;background:#fff;}
.filter-price-box label>div:focus-within{border-color:#c9115b;}
.filter-price-box b{font-size:12px;color:#7a817c;margin-right:5px;}
.filter-price-box input{border:0!important;outline:0!important;width:100%!important;min-width:0!important;height:100%!important;padding:0!important;background:transparent!important;font-size:12px!important;color:#263029!important;}
.filter-price-dash{padding-bottom:13px;text-align:center;color:#9aa19b;}
.filter-price-summary{margin-top:16px;padding:12px 13px;border-radius:8px;background:#f6f8f4;display:flex;justify-content:space-between;gap:12px;font-size:10px;color:#818981;}
.filter-price-summary strong{color:#303932;font-size:11px;}
.reference-filter-footer{display:flex;align-items:center;gap:14px;padding:15px 24px calc(18px + env(safe-area-inset-bottom));border-top:1px solid #edf0ec;background:#fff;box-shadow:0 -8px 22px rgba(25,35,28,.05);flex:none;}
.reference-filter-footer .clear-filter{border:0;background:transparent;color:#6f776f;font-size:9px;font-weight:800;letter-spacing:1.2px;cursor:pointer;padding:12px 2px;white-space:nowrap;}
.reference-filter-footer .apply-filter{flex:1;min-height:46px!important;border-radius:9px!important;display:flex!important;align-items:center;justify-content:center;gap:7px!important;font-size:10px!important;letter-spacing:.7px!important;}
@media(max-width:768px){
 .filter-overlay{align-items:flex-end!important;justify-content:center!important;}
 .reference-filter{width:100%!important;max-width:none!important;height:min(78dvh,700px)!important;border-radius:24px 24px 0 0!important;}
 .filter-handle{display:block;width:42px;height:4px;border-radius:99px;background:#cfd5cf;margin:9px auto 0;flex:none;}
 .reference-filter-head{padding:15px 18px 13px;}
 .reference-filter-head h2{font-size:22px!important;}
 .filter-close{width:34px;height:34px;}
 .filter-current{margin:11px 18px 0;}
 .reference-filter-body{grid-template-columns:92px minmax(0,1fr);margin-top:10px;}
 .filter-section-nav button{padding:15px 9px 15px 12px;font-size:10px;gap:7px;}
 .filter-section-content{padding:20px 16px 24px;}
 .filter-panel-heading{margin-bottom:16px;}
 .filter-check-list button{min-height:42px;font-size:11px;}
 .filter-size-grid{grid-template-columns:repeat(3,1fr);gap:7px;}
 .filter-size-grid button{height:40px;font-size:10px;}
 .reference-filter-footer{padding-left:18px;padding-right:18px;}
}
@media(max-width:360px){
 .reference-filter{height:82dvh!important;}
 .reference-filter-body{grid-template-columns:84px minmax(0,1fr);}
 .filter-section-nav button{font-size:9px;padding-left:9px;}
 .filter-section-content{padding-left:13px;padding-right:13px;}
}
/* Home desktop alignment + subtle checkout field focus */
@media(min-width:769px){
  main{margin-top:0!important;}
  .hero{margin-top:0!important;padding-top:28px!important;}
  .hero-copy{padding-top:0!important;}
}
.checkout label input:focus{outline:none!important;background:#fffafb!important;border-color:#d9cfd4!important;box-shadow:0 0 0 2px rgba(201,17,91,.045)!important;}
.checkout label input:focus-visible{outline:none!important;}

/* Home popular categories */
.soft-section{background:transparent!important;}

/* Refined footer + policy modal */
.site-footer{position:relative!important;margin-top:0!important;border-top:1px solid #e8ede8!important;background:#fbfcfa!important;color:#29322d!important;}
.site-footer .footer-main{width:100%!important;max-width:1180px!important;box-sizing:border-box!important;margin:0 auto!important;padding:50px 24px 38px!important;display:grid!important;grid-template-columns:1.35fr .75fr 1fr 1fr!important;gap:34px!important;align-items:start!important;overflow:visible!important;}
.site-footer .footer-brand{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;min-width:0!important;text-align:center!important;}
.site-footer .footer-logo{display:block!important;width:170px!important;height:auto!important;margin:0 auto 18px!important;}
.footer-connect{display:flex;flex-direction:column;gap:10px;}
.footer-connect>span{font-size:9px;letter-spacing:1.8px;font-weight:800;color:#8a918c;}
.site-footer .socials{display:flex!important;align-items:center!important;gap:9px!important;}
.site-footer .socials a{width:38px!important;height:38px!important;border:1px solid #dfe6df!important;border-radius:50%!important;background:#fff!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;color:#3e4941!important;text-decoration:none!important;transition:.2s ease!important;}
.site-footer .socials a:hover{border-color:#c9115b!important;color:#c9115b!important;transform:translateY(-2px)!important;}
.site-footer .socials svg{width:17px!important;height:17px!important;}
.site-footer .socials .social-icon{width:17px!important;height:17px!important;}
.site-footer .footer-column{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:11px!important;}
.site-footer .footer-column>b{font-size:10px!important;letter-spacing:1.6px!important;color:#29322d!important;margin:0 0 5px!important;}
.site-footer .footer-column button{border:1px solid transparent!important;background:transparent!important;padding:6px 9px!important;margin:-2px -9px!important;border-radius:8px!important;box-sizing:border-box!important;color:#737b75!important;font-size:11px!important;line-height:1.5!important;text-align:left!important;cursor:pointer!important;transition:background .18s ease,border-color .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease!important;}
.site-footer .footer-column button:hover,.site-footer .footer-column button:focus-visible{background:transparent!important;border-color:transparent!important;color:#737b75!important;transform:none!important;box-shadow:none!important;outline:none!important;}
.site-footer .footer-bottom{max-width:1180px!important;margin:0 auto!important;padding:16px 34px 19px!important;border-top:1px solid #e8ede8!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#8a918c!important;font-size:10px!important;line-height:1.5!important;}
.policy-modal-overlay{position:fixed!important;inset:0!important;background:rgba(25,35,28,.42)!important;backdrop-filter:blur(5px)!important;-webkit-backdrop-filter:blur(5px)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;z-index:200!important;}
.policy-modal{width:min(560px,100%)!important;max-height:min(78vh,620px)!important;overflow:hidden!important;background:#fff!important;border:1px solid #e4e9e4!important;border-radius:18px!important;box-shadow:0 24px 70px rgba(25,35,28,.22)!important;display:flex!important;flex-direction:column!important;animation:policyModalIn .18s ease-out!important;}
.policy-modal-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:20px!important;padding:25px 26px 18px!important;border-bottom:1px solid #edf0ec!important;}
.policy-modal-head .eyebrow{margin:0 0 7px!important;}
.policy-modal-head h2{margin:0!important;font-size:20px!important;line-height:1.2!important;letter-spacing:.3px!important;color:#29322d!important;}
.policy-close{width:36px!important;height:36px!important;border:1px solid #e1e6e1!important;background:#fbfcfa!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#5d665f!important;cursor:pointer!important;flex:none!important;}
.policy-close:hover{border-color:#c9115b!important;color:#c9115b!important;background:#fff7fa!important;}
.policy-modal-body{padding:22px 26px!important;overflow:auto!important;color:#687169!important;font-size:12px!important;line-height:1.75!important;}
.policy-modal-body p{margin:0 0 14px!important;}
.policy-modal-body p:last-child{margin-bottom:0!important;}
.policy-modal-actions{padding:15px 26px 20px!important;border-top:1px solid #edf0ec!important;display:flex!important;justify-content:flex-end!important;}
.policy-modal-actions .btn{min-width:110px!important;}
@keyframes policyModalIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:1200px) and (min-width:769px){
 .site-footer .footer-main{max-width:1080px!important;padding-left:24px!important;padding-right:24px!important;grid-template-columns:minmax(220px,1.25fr) minmax(120px,.7fr) minmax(170px,1fr) minmax(170px,1fr)!important;gap:22px!important;}
 .site-footer .footer-logo{width:160px!important;margin-left:0!important;}
}
@media(max-width:768px){
 .site-footer .footer-main{padding:38px 18px 30px!important;grid-template-columns:1fr 1fr!important;gap:28px 22px!important;}
 .site-footer .footer-brand{grid-column:1 / -1!important;align-items:center!important;text-align:center!important;padding-bottom:2px!important;}
 .site-footer .footer-logo{width:160px!important;margin:0 auto 16px!important;}
 .footer-connect{align-items:center!important;}
 .site-footer .footer-column{gap:9px!important;}
 .site-footer .footer-column>b{font-size:9px!important;}
 .site-footer .footer-column button{font-size:10.5px!important;}
 .site-footer .footer-bottom{padding:14px 18px 17px!important;font-size:9.5px!important;}
 .policy-modal{border-radius:16px!important;max-height:82vh!important;}
 .policy-modal-head{padding:21px 19px 16px!important;}
 .policy-modal-head h2{font-size:17px!important;}
 .policy-modal-body{padding:18px 19px!important;font-size:11.5px!important;}
 .policy-modal-actions{padding:13px 19px 17px!important;}
}
@media(max-width:390px){
 .site-footer .footer-main{padding-left:14px!important;padding-right:14px!important;gap:25px 14px!important;}
 .site-footer .footer-column button{font-size:10px!important;}
 .site-footer .footer-bottom{font-size:9px!important;}
}
.saved-address{position:relative;display:flex;align-items:flex-start;gap:14px;padding:18px;border:1px solid #edf0ec;border-radius:12px;background:#fff;margin-top:12px}.saved-address>svg{width:20px;height:20px;flex:none;color:#c9115b}.saved-address>div{flex:1;min-width:0}.saved-address b{display:block;font-size:13px}.saved-address p{margin:5px 0 0;font-size:11px;line-height:1.5;color:#777}.saved-address .text-btn{margin-left:auto;flex:none}

`}
</style>}

function Footer({go}:{go:(p:string)=>void}){
  const [policy,setPolicy]=useState<string|null>(null);
  const policyContent:Record<string,{title:string;copy:string[]}>={
    "About Us":{
      title:"ABOUT AAYESHA COLLECTION",
      copy:[
        "Aayesha Collection brings together thoughtfully selected fashion for women, men and kids.",
        "Our focus is simple: stylish pieces, comfortable fits and an easy shopping experience for everyday wear."
      ]
    },
    "Privacy Policy":{
      title:"PRIVACY POLICY",
      copy:[
        "We respect your privacy and use the information you provide only to process orders, communicate with you and improve your shopping experience.",
        "We do not sell your personal information. Payment details are handled securely by the applicable payment service."
      ]
    },
    "Terms & Conditions":{
      title:"TERMS & CONDITIONS",
      copy:[
        "By using Aayesha Collection, you agree to provide accurate information and use the website for lawful shopping purposes.",
        "Product availability, pricing and offers may change without prior notice. Orders are subject to confirmation and availability."
      ]
    },
    "Shopping Policy":{
      title:"SHOPPING POLICY",
      copy:[
        "Orders are processed after confirmation and are shipped to the delivery details provided at checkout.",
        "Returns or exchanges are accepted only according to the applicable product and order conditions. Please contact customer support with your order details for assistance."
      ]
    }
  };
  const openPolicy=(name:string)=>setPolicy(name);
  return <>
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <AayeshaLogo className="footer-logo"/>
          <div className="footer-connect"><span>STAY CONNECTED</span><div className="socials">
            <a href="https://wa.me/919111990941" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon whatsapp-icon"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.59 5.96L.1 24l6.28-1.64a11.86 11.86 0 0 0 5.69 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.43ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.73.97 1-3.64-.23-.37a9.88 9.88 0 0 1-1.51-5.27C2.21 6.44 6.64 2 12.09 2a9.83 9.83 0 0 1 7 2.91 9.93 9.93 0 0 1 2.9 7c0 5.45-4.44 9.89-9.91 9.89Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
            </a>
            <a href="https://www.instagram.com/collection_aaysha/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><Instagram/></a>
          </div></div>
        </div>
        <div className="footer-column"><b>SHOP</b><button onClick={()=>go("/women")}>Women</button><button onClick={()=>go("/men")}>Men</button><button onClick={()=>go("/kids")}>Kids</button><button onClick={()=>go("/new-arrivals")}>New Arrivals</button></div>
        <div className="footer-column"><b>CUSTOMER CARE</b><button onClick={()=>go("/contact")}>Contact Us</button><button onClick={()=>go("/orders")}>Track Order</button><button onClick={()=>openPolicy("Shopping Policy")}>Returns &amp; Exchanges</button><button onClick={()=>openPolicy("Shopping Policy")}>Size Guide</button></div>
        <div className="footer-column"><b>HELP &amp; POLICIES</b><button onClick={()=>openPolicy("About Us")}>About Us</button><button onClick={()=>openPolicy("Privacy Policy")}>Privacy Policy</button><button onClick={()=>openPolicy("Terms & Conditions")}>Terms &amp; Conditions</button><button onClick={()=>openPolicy("Shopping Policy")}>Shopping Policy</button></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Aayesha Collection</span></div>
    </footer>
    {policy&&<div className="policy-modal-overlay" onClick={()=>setPolicy(null)}>
      <div className="policy-modal" onClick={e=>e.stopPropagation()}>
        <div className="policy-modal-head"><div><p className="eyebrow">AAYESHA COLLECTION</p><h2>{policyContent[policy].title}</h2></div><button className="policy-close" onClick={()=>setPolicy(null)} aria-label="Close policy"><X size={20}/></button></div>
        <div className="policy-modal-body">{policyContent[policy].copy.map((text,i)=><p key={i}>{text}</p>)}</div>
        <div className="policy-modal-actions"><button className="btn primary" onClick={()=>setPolicy(null)}>CLOSE</button></div>
      </div>
    </div>}
  </>
}
function MobileNav({go,cartCount,currentPath}:{go:(p:string)=>void;cartCount:number;currentPath:string}){
  const path=currentPath;
  const isCategory=path==="/categories"||path.startsWith("/categories/")||["/women","/men","/kids","/new-arrivals"].includes(path);
  return <nav className="bottom-nav mobile-bottom-nav" aria-label="Mobile navigation">
    <button className={path==="/"?"active":""} onClick={()=>go("/")}><LayoutDashboard/><span>HOME</span></button>
    <button className={isCategory?"active":""} onClick={()=>go("/categories")}><Boxes/><span>CATEGORIES</span></button>
    <button className={path==="/account"||path==="/orders"?"active":""} onClick={()=>go("/account")}><User/><span>ACCOUNT</span></button>
    <button className={path==="/cart"?"active bottom-cart":"bottom-cart"} onClick={()=>go("/cart")}><span className="bottom-cart-icon"><ShoppingBag/><b>{cartCount}</b></span><span>CART</span></button>
  </nav>
}
function Empty({title,copy,action,onClick}:{title:string;copy:string;action:string;onClick:()=>void}){return <div className="empty"><ShoppingBag size={42}/><h2>{title}</h2><p>{copy}</p><button className="btn primary" onClick={onClick}>{action}</button></div>}
function Toast({text}:{text:string}){return text?<div className="toast"><CheckCircle2 size={17}/>{text}</div>:null}



function MobileLayoutFix(){return <style>{`
/* Premium filter drawer */
.filter-overlay{background:rgba(22,27,24,.38)!important;backdrop-filter:blur(3px);z-index:1000!important;}
.premium-filter-drawer{width:min(430px,92vw)!important;max-width:430px!important;height:100dvh!important;background:#fff!important;box-shadow:-18px 0 50px rgba(24,34,28,.16)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;}
.filter-topbar{display:flex;align-items:center;justify-content:space-between;padding:28px 28px 20px;border-bottom:1px solid #edf0ec;}
.filter-topbar h2{margin:4px 0 0;font-size:25px;letter-spacing:-.5px;}
.filter-kicker{font-size:9px;letter-spacing:2px;color:#7a817c;font-weight:700;}
.filter-close{width:38px;height:38px;border:1px solid #e5e9e4;border-radius:50%;background:#fff;display:grid;place-items:center;cursor:pointer;}
.filter-context{margin:18px 28px 0;padding:12px 14px;background:#f5f7f3;border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.filter-context span{font-size:9px;letter-spacing:1.4px;color:#7a817c;font-weight:700;}
.filter-context b{font-size:12px;text-align:right;color:#253028;}
.premium-filter-content{padding:4px 28px 24px!important;overflow:auto!important;flex:1;scrollbar-width:thin;}
.premium-group{padding:22px 0!important;border-bottom:1px solid #edf0ec;}
.filter-group-title{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}
.filter-group-title>div{display:flex;align-items:center;gap:9px;}
.filter-group-title>div>span{font-size:9px;color:#a0a7a1;font-weight:700;letter-spacing:1px;}
.filter-group-title b{font-size:12px;letter-spacing:1.5px;}
.filter-group-title small{font-size:10px;color:#8a918c;}
.category-options{display:grid!important;grid-template-columns:1fr 1fr;gap:7px!important;}
.category-options button{min-height:42px!important;padding:10px 12px!important;border:1px solid #e5e9e4!important;border-radius:9px!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:space-between!important;text-align:left!important;font-size:12px!important;color:#39413b!important;transition:.2s ease;}
.category-options button:hover{border-color:#c7d0c8!important;background:#fafcf9!important;}
.category-options button.selected{border-color:#c9115b!important;background:#fff5f8!important;color:#c9115b!important;font-weight:700;}
.category-options button i{font-style:normal;font-size:13px;}
.premium-chips{display:flex!important;flex-wrap:wrap!important;gap:8px!important;}
.premium-chips button{min-width:48px!important;height:38px!important;padding:0 13px!important;border:1px solid #e3e7e2!important;border-radius:9px!important;background:#fff!important;font-size:11px!important;font-weight:600!important;color:#3d453f!important;}
.premium-chips button.selected{border-color:#c9115b!important;background:#c9115b!important;color:#fff!important;box-shadow:0 5px 12px rgba(201,17,91,.14);}
.color-filter-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.color-choice{min-height:44px;border:1px solid #e3e7e2;border-radius:9px;background:#fff;display:flex;align-items:center;gap:9px;padding:8px 10px;font-size:11px;color:#3d453f;cursor:pointer;text-align:left;}
.color-choice.selected{border-color:#c9115b;background:#fff5f8;color:#c9115b;font-weight:700;}
.color-swatch,.multi-swatch{width:22px;height:22px;min-width:22px;border-radius:50%;border:1px solid #d8ddd7;display:block;}
.multi-swatch{background:conic-gradient(#171717 0 25%,#e8c5cf 25% 50%,#fff 50% 75%,#b7c5b9 75% 100%);}
.color-choice svg{margin-left:auto;}
.price-inputs{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:10px;}
.price-inputs label>span{display:block;font-size:8px;letter-spacing:1.1px;color:#8a918c;font-weight:700;margin-bottom:6px;}
.price-inputs label>div{height:42px;border:1px solid #e3e7e2;border-radius:9px;display:flex;align-items:center;padding:0 10px;background:#fff;}
.price-inputs label>div:focus-within{border-color:#c9115b;}
.price-inputs b{font-size:12px;color:#7a817c;margin-right:5px;}
.price-inputs input{border:0!important;outline:0!important;width:100%!important;min-width:0!important;height:100%!important;padding:0!important;font-size:12px!important;background:transparent!important;color:#29322d!important;}
.price-dash{padding-bottom:13px;color:#a2a8a3;}
.price-display{margin-top:13px;padding:10px 12px;border-radius:8px;background:#f7f8f6;display:flex;justify-content:space-between;gap:12px;font-size:10px;color:#818881;}
.price-display b{color:#343c36;font-size:11px;}
.premium-filter-footer{display:flex!important;align-items:center!important;gap:12px!important;padding:16px 28px 22px!important;border-top:1px solid #edf0ec!important;background:#fff!important;box-shadow:0 -8px 20px rgba(25,35,28,.04);}
.clear-filter{border:0;background:transparent;color:#6f776f;font-size:10px;font-weight:700;letter-spacing:1.2px;cursor:pointer;padding:12px 4px;}
.apply-filter{flex:1;display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:46px!important;border-radius:10px!important;}
.mobile-bottom-nav>button/* Page rhythm / spacing */
main{width:100%;}
.section{box-sizing:border-box;}
.categories-page,.catalog,.detail,.checkout,.account{max-width:1280px;margin:0 auto;}
.categories-page{padding-top:30px!important;padding-bottom:72px!important;}
.categories-page .breadcrumbs{margin-bottom:22px!important;}
.categories-page .section-head{margin:0 0 28px!important;}
.categories-page .categories-intro{min-height:0!important;}
.categories-page .section-head .eyebrow{margin:0!important;}
.catalog{padding-top:28px!important;padding-bottom:72px!important;}
.catalog .breadcrumbs{margin-bottom:22px!important;}
.catalog-head{margin-bottom:24px!important;gap:24px!important;align-items:flex-end!important;}
.catalog-search{margin:0 0 28px!important;}
.product-grid{row-gap:34px!important;}
.detail{padding-top:28px!important;padding-bottom:72px!important;}
.checkout{padding-top:28px!important;padding-bottom:72px!important;}
.account{padding-top:28px!important;padding-bottom:72px!important;}
.categories-page .category-hierarchy{margin-top:0!important;}
.category-hierarchy{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;}
.category-department{border:1px solid #eadfe4;background:#fff;border-radius:18px;padding:22px;}
.department-title{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left;background:none;border:0;padding:0;cursor:pointer;color:inherit;}
.department-title h2{margin:4px 0 0;}
.subcategory-list{display:grid;gap:2px;margin-top:16px;padding-top:12px;border-top:1px solid #eee;}
.subcategory-list button{display:flex;align-items:center;justify-content:space-between;background:none;border:0;padding:11px 2px;text-align:left;cursor:pointer;color:inherit;}
.filter-content{overflow-y:auto;padding:4px 22px 18px;}
.filter-group{padding:18px 0!important;border-bottom:1px solid #eee;}
.filter-group>b{display:block;margin-bottom:12px;}
.filter-options{display:grid;gap:6px;}
.filter-options button{display:flex;align-items:center;justify-content:space-between;background:none;border:0;border-radius:10px;padding:9px 10px;text-align:left;cursor:pointer;color:inherit;}
.filter-options button.selected{background:#fff1f6;color:#c9115b;font-weight:700;}
.filter-options.chips{display:flex;flex-wrap:wrap;gap:7px;}
.filter-options.chips button{border:1px solid #e7dfe3;padding:8px 11px;background:#fff;}
.filter-options.chips button.selected{border-color:#c9115b;background:#fff1f6;}
.price-range>div{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.price-range label{font-size:10px;letter-spacing:.08em;font-weight:700;}
.price-range input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border:1px solid #e3dce0;border-radius:8px;background:#fff;}
.price-range small{display:block;margin-top:10px;}
.cart-drawer{max-height:100dvh;display:flex;flex-direction:column;}
.cart-items{overflow-y:auto;flex:1;min-height:0;}
.cart-overlay .drawer-head{flex:0 0 auto;}
.cart-overlay .summary{flex:0 0 auto;}
.cart-overlay .empty{margin:auto 0;padding:40px 24px;}

.catalog-actions{width:min(50%,430px);margin-left:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:10px;position:relative;z-index:20;}
.catalog-control{height:46px!important;box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;gap:9px;border:1px solid #dfe5df!important;border-radius:12px!important;background:#fff!important;color:#29322d!important;box-shadow:0 5px 18px rgba(35,47,40,.06)!important;font-size:10px!important;font-weight:800!important;letter-spacing:1.25px!important;cursor:pointer;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease,background .2s ease;}
.catalog-control:hover{border-color:#c8d1ca!important;box-shadow:0 8px 22px rgba(35,47,40,.09)!important;transform:translateY(-1px);}
.filter-btn.catalog-control{width:100%;min-width:0;padding:0 16px!important;}
.filter-btn.catalog-control svg{color:#c9115b;stroke-width:2.2;}
.sort-control-wrap{position:relative;width:100%;min-width:0;}
.sort-control{width:100%;padding:0 13px 0 15px!important;justify-content:space-between!important;gap:10px!important;}
.sort-control-text{font-size:10px;color:#29322d;font-weight:700;letter-spacing:.65px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;text-align:left;}
.sort-control-text.placeholder{color:#7b837d;font-size:10px;letter-spacing:1.05px;text-transform:uppercase;font-weight:800;}
.sort-control.open{border-color:#c9115b!important;box-shadow:0 8px 24px rgba(201,17,91,.11)!important;background:#fffafb!important;}
.sort-chevron{color:#6e776f;flex:none;transition:transform .2s ease;}
.sort-control.open .sort-chevron{transform:rotate(180deg);color:#c9115b;}
.sort-menu{position:absolute;top:calc(100% + 8px);right:0;width:100%;padding:7px;background:#fff;border:1px solid #e4e8e4;border-radius:14px;box-shadow:0 18px 40px rgba(26,37,30,.14);z-index:50;animation:sortMenuIn .16s ease-out;}
.sort-menu button{width:100%;min-height:42px;border:0;background:transparent;border-radius:9px;padding:0 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;color:#4b554e;font-size:11px;font-weight:600;cursor:pointer;transition:background .16s ease,color .16s ease;}
.sort-menu button:hover{background:#f7f9f7;color:#29322d;}
.sort-menu button.selected{background:#fff1f6;color:#c9115b;font-weight:800;}
.sort-menu button svg{flex:none;}
@keyframes sortMenuIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* Keep every product card and ADD TO CART button perfectly aligned */
.product-grid{align-items:stretch!important;}
.product-card{height:100%!important;min-height:0!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;}
.product-card .product-image{width:100%!important;aspect-ratio:3 / 4!important;flex:none!important;overflow:hidden!important;}
.product-card .product-image img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;}
.product-card .product-info{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;}
.product-card .product-info h3{min-height:38px!important;margin-bottom:8px!important;line-height:1.35!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;}
.product-card .product-info .price{min-height:24px!important;display:flex!important;align-items:center!important;flex-wrap:wrap!important;}
.product-card .product-info .offer{min-height:18px!important;margin:7px 0 10px!important;line-height:18px!important;}
.product-card .add-btn{width:100%!important;height:42px!important;min-height:42px!important;margin-top:auto!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:none!important;}
.product-card .product-info{padding-bottom:0!important;}
.product-card .add-btn{align-self:stretch!important;margin-left:0!important;margin-right:0!important;border-radius:9px!important;line-height:1!important;}
.product-card .product-info > .offer{visibility:visible!important;}
.product-card .product-info > .offer:empty{display:block!important;}
.product-grid{grid-auto-rows:1fr!important;align-items:stretch!important;}

@media(max-width:768px){
 .product-card .product-info h3{min-height:36px!important;font-size:12px!important;line-height:1.35!important;}
 .product-card .product-info .offer{min-height:17px!important;margin:6px 0 9px!important;line-height:17px!important;}
 .product-card .add-btn{height:40px!important;min-height:40px!important;}
}

.mobile-bottom-nav{grid-template-columns:repeat(4,minmax(0,1fr))!important;}
.mobile-bottom-nav>button{width:100%!important;min-width:0!important;}
@media (max-width:768px){
  .categories-page,.catalog,.detail,.checkout,.account{width:100%;padding-left:16px!important;padding-right:16px!important;}
  .categories-page{padding-top:20px!important;padding-bottom:54px!important;}
  .categories-page .breadcrumbs,.catalog .breadcrumbs{margin-bottom:16px!important;}
  .categories-page .section-head{margin-bottom:20px!important;}
  .category-hierarchy{grid-template-columns:1fr;gap:14px;}
  .category-department{padding:18px;border-radius:14px;}
  .subcategory-list{grid-template-columns:1fr 1fr;column-gap:14px;}
  .catalog{padding-top:20px!important;padding-bottom:50px!important;}
  .catalog-head{margin-bottom:18px!important;gap:14px!important;align-items:flex-start!important;}
  .catalog-actions{width:100%;margin-left:0;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px!important;align-items:stretch!important;}
  .catalog-control{height:44px!important;border-radius:11px!important;}
  .filter-btn.catalog-control{min-width:0!important;width:100%!important;padding:0 10px!important;}
  .sort-control-wrap{min-width:0;width:100%;} 
  .sort-control{padding:0 11px!important;gap:7px!important;}
  .sort-control-text{font-size:10px;letter-spacing:.45px;}
  .sort-control-text.placeholder{font-size:9px;letter-spacing:.95px;}
  .sort-menu{top:calc(100% + 6px);border-radius:12px;}
  .catalog-search{margin-bottom:20px!important;}
  .product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:26px 10px!important;}
  .detail{padding-top:20px!important;padding-bottom:50px!important;}
  .checkout{padding-top:20px!important;padding-bottom:50px!important;}
  .account{padding-top:20px!important;padding-bottom:50px!important;}
  .hero-btns{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px!important;width:100%;}
  .hero-btns .btn{width:100%;min-width:0!important;padding:12px 8px!important;font-size:11px!important;white-space:nowrap;}
  .filter-content{padding-left:18px;padding-right:18px;}
  footer{padding:36px 18px 70px!important;overflow:hidden!important;}
  .footer-main{display:grid!important;grid-template-columns:1fr 1fr!important;gap:30px 24px!important;align-items:start!important;width:100%!important;}
  .footer-main>div{min-width:0!important;}
  .footer-main>div:first-child{grid-column:1 / -1!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;}
  .footer-logo{width:165px!important;height:auto!important;margin:0 auto 6px!important;}
  .footer-main>div:first-child>p{margin:2px 0 12px!important;}
  .footer-main .socials{justify-content:center!important;}
  .socials a{display:inline-flex;align-items:center;justify-content:center;color:inherit;text-decoration:none;}
  .socials .social-icon{width:20px;height:20px;display:block;}
  .footer-main>div:nth-child(2),.footer-main>div:nth-child(4){display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important;}
  .footer-main>div:nth-child(3){display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important;}
  .footer-main button{display:block!important;text-align:left!important;width:auto!important;line-height:1.45!important;padding:5px 8px!important;margin:-1px -8px!important;border-radius:7px!important;}
  .footer-main b{margin-bottom:5px!important;}
  .footer-bottom{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;gap:5px!important;line-height:1.4!important;padding:12px 8px 0!important;margin-top:20px!important;margin-bottom:0!important;}
  .footer-bottom span{display:block!important;}
  .mobile-bottom-nav{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;align-items:center!important;justify-items:center!important;width:100%!important;box-sizing:border-box!important;}
  .mobile-bottom-nav>button{height:64px!important;padding:7px 2px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;box-sizing:border-box!important;font-size:9px!important;line-height:1!important;white-space:nowrap!important;}
  .mobile-bottom-nav>button svg{width:19px!important;height:19px!important;flex:none!important;}
  .mobile-bottom-nav>button.active{color:#c9115b!important;}
  .mobile-bottom-nav>button.active svg{color:#c9115b!important;stroke:#c9115b!important;}
  .mobile-bottom-nav>button.active span{color:#c9115b!important;font-weight:700!important;}
  .mobile-bottom-nav .bottom-cart-icon{position:relative!important;display:flex!important;height:20px!important;align-items:center!important;justify-content:center!important;}
  .mobile-bottom-nav .bottom-cart-icon b{position:absolute!important;top:-7px!important;right:-9px!important;font-size:8px!important;min-width:14px!important;height:14px!important;line-height:14px!important;text-align:center!important;border-radius:50%!important;}
}
@media (max-width:768px){
  .premium-filter-drawer{width:100%!important;max-width:none!important;}
  .filter-topbar{padding:22px 20px 16px;}
  .filter-context{margin-left:20px;margin-right:20px;}
  .premium-filter-content{padding-left:20px!important;padding-right:20px!important;}
  .premium-filter-footer{padding-left:20px!important;padding-right:20px!important;padding-bottom:calc(18px + env(safe-area-inset-bottom))!important;}
}
@media (max-width:390px){
  .hero-btns{gap:6px!important;}
  .hero-btns .btn{font-size:10px!important;padding:11px 5px!important;}
  footer{padding-left:14px!important;padding-right:14px!important;padding-bottom:68px!important;}
  .footer-main{gap:26px 14px!important;}
  .footer-main button{font-size:11px!important;}
  .footer-bottom{font-size:9px!important;margin-top:0!important;margin-bottom:0!important;padding:14px 8px 17px!important;gap:0!important;}
  .footer-bottom span{display:block!important;}
  .mobile-bottom-nav>button{font-size:8px!important;}
}
/* Final footer spacing overrides */
@media(max-width:768px){
  .site-footer{margin-top:0!important;}
  .site-footer .footer-main{padding-top:34px!important;padding-bottom:26px!important;}
  .site-footer .footer-main>div:first-child>p{display:none!important;}
  .site-footer .footer-bottom{margin-top:0!important;margin-bottom:0!important;padding-top:14px!important;padding-bottom:16px!important;min-height:0!important;}
}

.order-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.cancel-order-btn{color:#b4233d!important}.cancel-order-btn:hover,.cancel-order-btn:focus-visible{color:#a01831!important;background:#fff4f6!important;border-color:#efc5cf!important}.order-status.cancelled{color:#b4233d!important}.admin-order-list{display:flex;flex-direction:column;gap:10px}.admin-order-card{display:grid;grid-template-columns:1.5fr auto minmax(170px,220px);align-items:center;gap:20px;padding:16px;border:1px solid #e8ece8;border-radius:12px;background:#fff}.admin-order-info{display:flex;flex-direction:column;gap:4px}.admin-order-info span{font-size:11px;color:#7b827d}.admin-order-card label{display:flex;flex-direction:column;gap:5px}.admin-order-card label small{font-size:9px;letter-spacing:1px;color:#8a918c;font-weight:800}.admin-order-card select{height:38px;border:1px solid #dfe6df;border-radius:8px;padding:0 10px;background:#fff;color:#313a34;font-size:12px;outline:none}.admin-order-card select:focus{border-color:#c9115b;box-shadow:0 0 0 3px rgba(201,17,91,.08)}@media(max-width:700px){.admin-order-card{grid-template-columns:1fr;gap:12px}.admin-order-card strong{font-size:15px}.order-actions{gap:10px}}
.order-card-head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:18px}.order-items{margin-top:16px;border-top:1px solid #edf0ec}.order-items-title{padding:12px 0 8px;font-size:9px;letter-spacing:1.4px;font-weight:800;color:#8a918c}.order-item{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:center;padding:12px 0;border-top:1px solid #f0f2ef}.order-item img{width:64px;height:78px;object-fit:cover;border-radius:8px;background:#f6f7f5}.order-item-info{display:flex;flex-direction:column;gap:4px;min-width:0}.order-item-info b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.order-item-info small{font-size:10px;color:#777}.order-item>strong{font-size:12px;white-space:nowrap}.confirmation-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px}.tracking-panel{grid-column:1 / -1;width:100%;margin-top:14px;padding:14px 16px;border:1px solid #e7ece7;border-radius:12px;background:#fafcf9}.tracking-panel>b{font-size:10px;letter-spacing:1.4px}.tracking-steps{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.tracking-steps span{font-size:10px;padding:7px 9px;border:1px solid #dfe6df;border-radius:999px;color:#7a817c}.tracking-steps span.done{border-color:#c9115b;color:#c9115b;background:#fff5f8;font-weight:700}@media(max-width:700px){.order-card-head{grid-template-columns:1fr auto;gap:8px}.order-card-head .order-status{grid-column:1 / -1}.order-item{grid-template-columns:52px 1fr auto;gap:10px}.order-item img{width:52px;height:66px}.order-item-info b{font-size:12px}.order-item-info small{font-size:9px}.order-item>strong{font-size:11px}.confirmation-actions .btn{width:100%;max-width:260px}.tracking-panel{margin-top:12px}}.field-error{display:block;margin-top:6px;color:#c62828;font-size:12px}.checkout-note{display:flex;align-items:center;gap:8px;margin:14px 0;color:#777;font-size:13px}.panel-heading-row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.summary-count{font-size:13px;color:#777}.summary-products{border-top:1px solid #eee;margin-top:18px}.summary-product{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #eee}.summary-product img{width:64px;height:78px;object-fit:cover;border-radius:8px}.summary-product div{display:flex;flex-direction:column;gap:4px}.summary-product small{color:#777}.summary-totals{margin:18px 0}.summary-totals>div,.review-total{display:flex;justify-content:space-between;padding:7px 0}.summary-totals .grand{border-top:1px solid #ddd;margin-top:8px;padding-top:14px;font-size:17px}.review-box{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid #eee}.review-box div{display:flex;flex-direction:column;gap:5px}.review-box span{font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.08em}.review-box p{margin:0;color:#555;line-height:1.5}.review-total{margin:18px 0;font-size:18px}@media(max-width:700px){.summary-product{grid-template-columns:52px 1fr auto}.summary-product img{width:52px;height:66px}.panel-heading-row{align-items:center}}
`}
</style>}

function AccountPage({orders,setOrders,savedAddress,setSavedAddress,wishlist,go,page}:{orders:Order[];setOrders:React.Dispatch<React.SetStateAction<Order[]>>;savedAddress:SavedAddress[];setSavedAddress:React.Dispatch<React.SetStateAction<SavedAddress[]>>;wishlist:number[];go:(x:string)=>void;page:string}){
  const [tab,setTab]=useState(page==="/orders"?"orders":"profile");
  const [trackedId,setTrackedId]=useState<string|null>(null);
  return <section className="account section">
    <div className="account-head"><p className="eyebrow">AAYESHA ACCOUNT</p><h1>{tab==="orders"?"MY ORDERS":"MY PROFILE"}</h1><p>Manage your profile, saved pieces and orders.</p></div>
    <div className="account-grid">
      <aside className="account-side">
        {["profile","orders","wishlist","addresses"].map(x=><button className={tab===x?"active":""} onClick={()=>x==="wishlist"?go("/wishlist"):setTab(x)} key={x}>{x==="profile"?"My Profile":x==="orders"?"My Orders":x==="wishlist"?"Wishlist":"Saved Addresses"}<ChevronRight size={15}/></button>)}
        <button onClick={()=>go("/")}><LogOut size={15}/> Back to store</button>
      </aside>
      <div className="account-panel">
        {tab==="profile"&&<><h2>Hello, fashion lover.</h2><div className="profile-card"><div className="avatar">A</div><div><b>Aayesha Customer</b><p>Demo account · localStorage session</p></div></div><div className="saved-address"><MapPin/><div><b>Saved Addresses</b><p>Add your delivery address during checkout.</p></div></div></>}
        {tab==="orders"&&<><h2>MY ORDERS</h2>{orders.length?orders.map(o=>{const trackingSteps=["Confirmed","Processing","Packed","Shipped","Out for Delivery","Delivered"];const currentIndex=trackingSteps.indexOf(o.status);const canCancel=["Confirmed","Processing","Packed"].includes(o.status);return <div className="order-card" key={o.id}><div className="order-card-head"><div><b>{o.id}</b><small>{o.date} · {o.payment}</small></div><strong>{money(o.total)}</strong><span className={o.status==="Cancelled"?"order-status cancelled":"order-status"}>{o.status}</span></div><div className="order-items"><div className="order-items-title">PRODUCT DETAILS</div>{o.items.map((item,i)=><div className="order-item" key={`${o.id}-${item.product.id}-${i}`}><img src={item.product.images[0]||imgs[0]} alt={item.product.name}/><div className="order-item-info"><b>{item.product.name}</b><small>{item.product.brand} · {item.product.category}</small><small>SIZE: {item.size} · QTY: {item.qty}</small>{item.color&&<small>COLOR: {item.color}</small>}</div><strong>{money(item.product.price*item.qty)}</strong></div>)}</div><div className="order-actions"><button className="text-btn" onClick={()=>setTrackedId(trackedId===o.id?null:o.id)}>TRACK <ArrowRight size={14}/></button>{canCancel&&<button className="text-btn cancel-order-btn" onClick={()=>{if(confirm("Cancel this order?"))setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:"Cancelled"}:x))}}>CANCEL ORDER <X size={14}/></button>}</div>{trackedId===o.id&&<div className="tracking-panel"><b>ORDER TRACKING</b><div className="tracking-steps">{trackingSteps.map((step,i)=><span key={step} className={o.status!=="Cancelled"&&i<=currentIndex?"done":""}>{step}</span>)}</div><small>Current status: {o.status}. {o.status==="Cancelled"?"This order has been cancelled.":"Tracking updates will appear here."}</small></div>}</div>;}):<Empty title="No orders yet" copy="Your placed orders will appear here." action="START SHOPPING" onClick={()=>go("/")}/>}</>}
        {tab==="addresses"&&<><h2>SAVED ADDRESSES</h2>{savedAddress.length?savedAddress.map((a,i)=><div className="saved-address" key={`${a.phone}-${a.pin}-${i}`}><MapPin/><div><b>{a.name}</b><p>{a.address}, {a.city}, {a.state} - {a.pin}</p><p>{a.phone}</p></div><button className="text-btn" onClick={()=>setSavedAddress(prev=>prev.filter((_,index)=>index!==i))}>REMOVE</button></div>):<div className="saved-address"><MapPin/><div><b>No saved address</b><p>Your first address can be saved at checkout.</p></div></div>}</>}
      </div>
    </div>
  </section>
}

function AdminLogin({onLogin,go}:{onLogin:(u:any)=>void;go:(x:string)=>void}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{const session=await adminLogin(email,password);onLogin(session.user)}catch(err:any){setError(err.message||"Unable to sign in")}finally{setBusy(false)}};
 return <div className="admin-login"><div className="admin-login-card"><button className="admin-login-logo" onClick={()=>go("/")}><AayeshaLogo/></button><p className="eyebrow">PRIVATE ACCESS</p><h1>Admin Login</h1><p>Manage Aayesha Collection products securely.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>{error&&<div className="admin-error">{error}</div>}<button className="btn primary full" disabled={busy}>{busy?"SIGNING IN…":"SIGN IN"}</button></form><button className="text-btn center-btn" onClick={()=>go("/")}>← Back to store</button></div></div>
}

function Admin({orders,setOrders,products,setProducts,refreshProducts,user,onLogout,go}:{orders:Order[];setOrders:React.Dispatch<React.SetStateAction<Order[]>>;products:Product[];setProducts:React.Dispatch<React.SetStateAction<Product[]>>;refreshProducts:()=>Promise<void>;user:any;onLogout:()=>Promise<void>;go:(x:string)=>void}){
 const [tab,setTab]=useState("Dashboard"); const [editing,setEditing]=useState<Product|null>(null); const [adding,setAdding]=useState(false); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
 const stats=[["Total Orders",orders.length],["Total Sales",money(orders.reduce((a,b)=>a+b.total,0))],["Products",products.length],["Customers",Math.max(24,orders.length*3)],["Pending Orders",orders.filter(o=>o.status!=="Delivered").length]];
 const remove=async(id:number)=>{if(!confirm("Delete this product? This cannot be undone."))return;setError("");try{await deleteProduct(id);setProducts(p=>p.filter(x=>x.id!==id))}catch(e:any){setError(e.message||"Delete failed")}};
 const save=async(form:ProductDraft)=>{setSaving(true);setError("");try{if(form.id){const updated=await updateProduct(form.id,form);setProducts(p=>p.map(x=>x.id===updated.id?updated:x));}else{const created=await createProduct(form);setProducts(p=>[created,...p]);}setEditing(null);setAdding(false)}catch(e:any){setError(e.message||"Save failed")}finally{setSaving(false)}};
 const importDemo=async()=>{if(!confirm("Import the 40 demo products into your MySQL catalog?"))return;setSaving(true);setError("");try{for(const p of demoProducts) await createProduct(p); await refreshProducts();}catch(e:any){setError(e.message||"Demo import failed")}finally{setSaving(false)}};
 return <div className="admin"><aside><button className="admin-brand" onClick={()=>go("/")}><AayeshaLogo/></button><div className="admin-user"><div>{(user.email||"A")[0].toUpperCase()}</div><span>{user.email}<small>Administrator</small></span></div>{["Dashboard","Products","Categories","Orders","Customers","Inventory","Banners","Coupons","Settings"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x==="Dashboard"?<LayoutDashboard/>:x==="Products"?<Boxes/>:x==="Orders"?<Package/>:x==="Customers"?<Users/>:x==="Inventory"?<Tag/>:x==="Banners"?<Image/>:x==="Settings"?<Settings/>:<Sparkles/>}{x}</button>)}<button className="admin-exit" onClick={()=>go("/")}>VIEW STORE</button><button className="admin-exit" onClick={onLogout}><LogOut size={15}/> LOG OUT</button></aside><main><div className="admin-top"><div><p className="eyebrow">AAYESHA COLLECTION · ADMIN</p><h1>{tab}</h1></div><div className="admin-top-actions"><span className="admin-online"><i/> Secure</span><button onClick={onLogout}><LogOut size={17}/> Logout</button></div></div>{error&&<div className="admin-error wide">{error}</div>}{tab==="Dashboard"&&<><div className="stats">{stats.map(s=><div key={s[0]}><span>{s[0]}</span><strong>{s[1]}</strong></div>)}</div><div className="admin-panel"><div className="panel-head"><h2>Recent Orders</h2><button className="text-btn" onClick={()=>setTab("Orders")}>VIEW ALL <ArrowRight size={15}/></button></div>{orders.length?orders.slice(0,8).map(o=><div className="admin-row" key={o.id}><b>{o.id}</b><span>{o.date}</span><span>{o.payment}</span><span>{o.status}</span><strong>{money(o.total)}</strong></div>):<Empty title="No orders yet" copy="Orders will appear here." action="VIEW STORE" onClick={()=>go("/")}/>}</div></>}{tab==="Products"&&<div className="admin-panel"><div className="panel-head"><div><h2>Products</h2><p className="muted">Add, edit, delete and manage live catalog items.</p></div><div className="panel-buttons"><button className="btn outline" onClick={importDemo} disabled={saving}>IMPORT 40 DEMO</button><button className="btn primary" onClick={()=>{setAdding(true);setEditing(null)}}>ADD PRODUCT</button></div></div><div className="admin-product-table">{products.map(p=><div className="admin-product-row" key={p.id}><img src={p.images[0]} alt=""/><div><b>{p.name}</b><span>{p.brand} · {p.category} / {p.subcategory}</span></div><strong>{money(p.price)}</strong><span className={p.stock<5?"low-stock":"stock"}>{p.stock} in stock</span><div className="admin-row-actions"><button onClick={()=>{setEditing(p);setAdding(false)}} aria-label="Edit product"><Settings size={16}/></button><button onClick={()=>remove(p.id)} aria-label="Delete product"><Trash2 size={16}/></button></div></div>)}</div></div>}{tab==="Orders"&&<div className="admin-panel"><div className="panel-head"><div><h2>Orders</h2><p className="muted">Manage order status. Customers can cancel only before shipping.</p></div></div>{orders.length?<div className="admin-order-list">{orders.map(o=><div className="admin-order-card" key={o.id}><div className="admin-order-info"><b>{o.id}</b><span>{o.date} · {o.payment}</span><span>{o.items.length} item{o.items.length===1?"":"s"}</span></div><strong>{money(o.total)}</strong><label><small>STATUS</small><select value={o.status} onChange={e=>setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}>{(["Confirmed","Processing","Packed","Shipped","Out for Delivery","Delivered","Cancelled"].filter(status=>{const order=["Confirmed","Processing","Packed","Shipped","Out for Delivery","Delivered","Cancelled"];const current=order.indexOf(o.status);const next=order.indexOf(status);return o.status==="Cancelled"?status==="Cancelled":current>=3?next>=current:status!=="Cancelled"||current<3})) .map(status=><option key={status}>{status}</option>)}</select></label></div>)}</div>:<Empty title="No orders yet" copy="Orders will appear here." action="VIEW STORE" onClick={()=>go("/")}/>}</div>}{!['Dashboard','Products','Orders'].includes(tab)&&<div className="admin-panel"><h2>{tab}</h2><p className="muted">This module is structured for backend expansion. Product management is live through MySQL.</p><div className="admin-feature-grid"><div><CheckCircle2/> Secure authentication</div><div><CheckCircle2/> Row-level security</div><div><CheckCircle2/> Live product CRUD</div><div><CheckCircle2/> Image upload support</div></div></div>}</main>{(adding||editing)&&<ProductEditor product={editing} saving={saving} onClose={()=>{setAdding(false);setEditing(null)}} onSave={save}/>}</div>
}

type ProductDraft=Omit<Product,"id"> & {id?:number};
function ProductEditor({product,saving,onClose,onSave}:{product:Product|null;saving:boolean;onClose:()=>void;onSave:(p:ProductDraft)=>Promise<void>}){
 const [form,setForm]=useState<ProductDraft>(product?{...product}:{name:"",brand:"AAYESHA®",category:"Women",subcategory:"T-Shirts",price:999,mrp:1499,discount:33,rating:4.5,reviewCount:0,images:[imgs[0]],colors:["#171717","#e8c5cf"],sizes:["XS","S","M","L","XL","XXL"],fit:"REGULAR FIT",stock:10,description:"",tags:["everyday","ayesha"]});
 const [imageUrl,setImageUrl]=useState(form.images.join("\n")); const [files,setFiles]=useState<File[]>([]); const [uploading,setUploading]=useState(false);
 const update=(key:keyof ProductDraft,value:any)=>setForm(f=>({...f,[key]:value}));
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setUploading(true);try{const uploaded=files.length?await Promise.all(files.map(uploadProductImage)):[];const images=[...imageUrl.split(/\n|,/).map(x=>x.trim()).filter(Boolean),...uploaded];const discount=Math.max(0,Math.round((1-form.price/form.mrp)*100));await onSave({...form,images,discount});}finally{setUploading(false)}};
 return <div className="overlay"><aside className="product-editor" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">CATALOG</p><h2>{product?"EDIT PRODUCT":"ADD PRODUCT"}</h2></div><button onClick={onClose}><X/></button></div><form onSubmit={submit} className="editor-form"><label>Product Name<input required value={form.name} onChange={e=>update("name",e.target.value)}/></label><div className="form-two"><label>Brand<input value={form.brand} onChange={e=>update("brand",e.target.value)}/></label><label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}><option>Women</option><option>Men</option><option>Kids</option></select></label></div><div className="form-two"><label>Subcategory<input required value={form.subcategory} onChange={e=>update("subcategory",e.target.value)}/></label><label>Fit<input value={form.fit} onChange={e=>update("fit",e.target.value)}/></label></div><div className="form-three"><label>Price<input type="number" min="0" required value={form.price} onChange={e=>update("price",Number(e.target.value))}/></label><label>MRP<input type="number" min="0" required value={form.mrp} onChange={e=>update("mrp",Number(e.target.value))}/></label><label>Stock<input type="number" min="0" required value={form.stock} onChange={e=>update("stock",Number(e.target.value))}/></label></div><label>Product Images <small>URLs, one per line, or upload files</small><textarea rows={4} value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://…"/><input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/>{files.length>0&&<small>{files.length} image(s) selected{uploading?" · uploading…":""}</small>}</label><div className="form-two"><label>Sizes <small>comma separated</small><input value={form.sizes.join(", ")} onChange={e=>update("sizes",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/></label><label>Colors <small>hex values, comma separated</small><input value={form.colors.join(", ")} onChange={e=>update("colors",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/></label></div><label>Description<textarea rows={5} value={form.description} onChange={e=>update("description",e.target.value)}/></label><label>Tags <small>comma separated</small><input value={form.tags.join(", ")} onChange={e=>update("tags",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}/></label><div className="editor-actions"><button type="button" className="btn outline" onClick={onClose}>CANCEL</button><button className="btn primary" disabled={saving}>{saving||uploading?"SAVING…":product?"UPDATE PRODUCT":"CREATE PRODUCT"}</button></div></form></aside></div>
}

createRoot(document.getElementById("root")!).render(<App/>);

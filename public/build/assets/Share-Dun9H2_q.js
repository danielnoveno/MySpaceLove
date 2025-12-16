import{r as a,j as e,H as u}from"./app-CVMCL4yv.js";import{L as m,M as h,T as k,b as f,P as b}from"./TileLayer-CsDeqR5Y.js";import"./index-hjF8uBHy.js";const g=()=>m.divIcon({className:"custom-leaflet-marker-share",html:`
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            ">
                <span style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 46px;
                    height: 46px;
                    border-radius: 9999px;
                    background: #ffffff;
                    border: 4px solid #ec4899;
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="#db2777"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </span>
                <span style="
                    width: 10px;
                    height: 10px;
                    border-radius: 9999px;
                    background: #ec4899;
                    opacity: 0.85;
                    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.25);
                "></span>
            </div>
        `,iconSize:[46,60],iconAnchor:[23,56],popupAnchor:[0,-50]});function w({latitude:r,longitude:l}){const[o,c]=a.useState(!1),[d,x]=a.useState(null);a.useEffect(()=>{c(!0),x(g())},[]);const s=a.useMemo(()=>{if(r==null)return null;const i=Number(r);return Number.isFinite(i)?i:null},[r]),n=a.useMemo(()=>{if(l==null)return null;const i=Number(l);return Number.isFinite(i)?i:null},[l]),t=s!==null&&n!==null,p=a.useMemo(()=>t?[s,n]:[-2.5489,118.0149],[t,s,n]);return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col items-center justify-center px-4 py-12",children:[e.jsx(u,{title:"Lokasi Cinta"}),e.jsxs("div",{className:"w-full max-w-3xl rounded-3xl bg-white/80 backdrop-blur p-8 shadow-xl border border-pink-100",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-pink-600",children:"Lokasi Spesial ??"}),e.jsx("p",{className:"mt-2 text-sm text-gray-500",children:t?"Kami menandai titik cintamu di peta.":"Lokasi tidak ditemukan. Pastikan link yang kamu buka lengkap."})]}),e.jsx("div",{className:"rounded-2xl border border-pink-100 bg-white shadow-inner",children:e.jsx("div",{className:"h-[420px] overflow-hidden rounded-2xl",children:o?t?e.jsxs(h,{center:p,zoom:14,className:"h-full w-full",scrollWheelZoom:!0,children:[e.jsx(k,{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}),e.jsx(f,{position:[s,n],icon:d??void 0,children:e.jsx(b,{autoClose:!1,closeButton:!1,closeOnClick:!1,autoPan:!1,children:e.jsx("span",{className:"font-semibold text-pink-500",children:"Di sinilah cintamu berada !!"})})})]}):e.jsx("div",{className:"flex h-full items-center justify-center text-sm text-gray-500",children:"Lokasi tidak valid."}):e.jsx("div",{className:"flex h-full items-center justify-center text-sm text-gray-500",children:"Memuat peta..."})})}),t&&e.jsxs("div",{className:"mt-6 rounded-2xl bg-pink-50 px-6 py-4 text-center text-sm text-pink-600",children:[e.jsxs("p",{children:["Koordinat dibagikan untukmu:"," ",s?.toFixed(5),","," ",n?.toFixed(5)]}),e.jsx("p",{className:"mt-1 text-xs text-pink-400",children:"Link ini dapat diakses tanpa login selama kamu membagikannya."})]}),!t&&e.jsx("div",{className:"mt-6 rounded-2xl bg-yellow-50 px-6 py-4 text-center text-sm text-yellow-700",children:e.jsx("p",{children:"Tidak ada titik yang dapat ditampilkan. Hubungi pasanganmu untuk meminta link terbaru."})})]}),e.jsx("p",{className:"mt-8 text-xs text-gray-400",children:"Dibuat dengan penuh cinta oleh MySpaceLove"})]})}export{w as default};

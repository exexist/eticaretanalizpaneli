// Doğrulama Bilgileri (İstediğin kullanıcı adı/e-posta ve şifre)
const AUTH_CREDENTIALS = {
    username: "emir2026",
    email: "emir.danismant@gmail.com", // E-posta ile de giriş yapılabilmesi için eklendi
    password: "140206"
};

// --- SUPABASE BAĞLANTI BİLGİLERİ ---
const SUPABASE_URL = "https://btscrtgkyqtkwybcuafw.supabase.co";
// Not: Aşağıdaki anon key kısmına Supabase panelindeki Project Settings > API kısmından aldığın "anon public" anahtarını yapıştırmalısın.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c2NydGdreXF0a3d5YmN1YWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDg5MDEsImV4cCI6MjEwODc4NDkwMX0.EV36CnjazQSK20RjJxEHZYTcNZxB53aa0Ia88KpLY68";

// Supabase İstemcisini Başlatma
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let activeCategory = 'all';

// DOM Elementleri
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginCard = document.querySelector('.login-card');
const logoutBtn = document.getElementById('logoutBtn');

const tableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- GİRİŞ / MANTIKSAL SİSTEM ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Sayfanın yenilenmesini kesin olarak engeller
    
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value.trim();

    const isUserValid = (userVal === AUTH_CREDENTIALS.username || userVal === AUTH_CREDENTIALS.email);
    const isPassValid = (passVal === AUTH_CREDENTIALS.password);

    if (isUserValid && isPassValid) {
        loginError.classList.add('hidden');
        
        // Oturumu hafızaya kaydet
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Giriş kartını yumuşakça gizle
        loginOverlay.classList.add('hidden');
        
        // Verileri yükle
        fetchProductsFromSupabase();
    } else {
        loginError.classList.remove('hidden');
        loginCard.classList.add('shake');
        
        setTimeout(() => {
            loginCard.classList.remove('shake');
        }, 400);
    }
});

// Çıkış Yap Butonu
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    loginError.classList.add('hidden');
    loginOverlay.classList.remove('hidden');
});

// --- SUPABASE'DEN CANLI ÜRÜNLERİ ÇEKME ---
async function fetchProductsFromSupabase(categoryFilter = 'all', searchTerm = '') {
    try {
        let query = supabaseClient.from('products').select('*');

        // Kategori filtresi
        if (categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Veri çekme hatası:", error.message);
            return;
        }

        // Arama filtresi (Frontend tarafında uygulama)
        let filteredData = data;
        if (searchTerm) {
            filteredData = data.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.category.toLowerCase().includes(searchTerm)
            );
        }

        renderTable(filteredData);

    } catch (err) {
        console.error("Bağlantı hatası:", err);
    }
}

// Tabloyu Render Eden Fonksiyon
function renderTable(data) {
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    Veritabanında ürün bulunamadı. (Önce veri eklemelisin!)
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;

        row.innerHTML = `
            <td>
                <div class="product-cell">
                    <div class="product-tag">TR</div>
                    <span>${item.name}</span>
                </div>
            </td>
            <td style="color: var(--text-muted);">${item.category}</td>
            <td style="font-weight: 700;">${item.price}</td>
            <td><span class="badge badge-success">${item.velocity || 'Yüksek'}</span></td>
            <td style="color: var(--primary); font-size: 0.85rem; font-weight: 600;">
                <i class="fa-solid fa-arrow-trend-up" style="margin-right: 4px;"></i> ${item.trend || 'Trend'}
            </td>
            <td class="text-right">
                <span class="badge badge-${item.status_type || 'success'}">${item.status || 'Normal'}</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Kategori Buton Etkinlikleri
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        activeCategory = e.target.getAttribute('data-category');
        const searchTerm = searchInput.value.toLowerCase().trim();
        fetchProductsFromSupabase(activeCategory, searchTerm);
    });
});

// Arama Girişi Etkinliği
let timeout = null;
searchInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        fetchProductsFromSupabase(activeCategory, searchTerm);
    }, 200);
});

// Oturum Kontrolü ve Yükleme
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
        loginOverlay.classList.add('hidden');
        fetchProductsFromSupabase();
    } else {
        loginOverlay.classList.remove('hidden');
    }
});
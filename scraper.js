import { createClient } from '@supabase/supabase-js';

// GitHub Secrets üzerinden güvenli bir şekilde alınacak değişkenler
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase bağlantı bilgileri eksik!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateEcommerceData() {
    console.log("Anlık e-ticaret veri botu çalıştırılıyor...");

    // Türkiye e-ticaretinde o an trend olabilecek örnek dinamik ürünler havuzu
    const trendingPool = [
        { name: "Kablosuz Dikey Şarj İstasyonu", category: "Elektronik", price: "899 ₺", velocity: "Çok Yüksek", trend: "Son 1 Saatte +%42 Talep", status: "Hızlı Tükeniyor", status_type: "warning" },
        { name: "Termos Bardak 750ml", category: "Yaşam", price: "450 ₺", velocity: "Yüksek", trend: "Viral Ürün", status: "Normal", status_type: "success" },
        { name: "Yüksek Bel Sporcu Taytı", category: "Giyim", price: "320 ₺", velocity: "Çok Yüksek", trend: "Trend Ürün", status: "Kritik Stok", status_type: "danger" },
        { name: "Matlaştırıcı Yüz Temizleme Jeli", category: "Kozmetik", price: "275 ₺", velocity: "Orta-Yüksek", trend: "Yükselişte", status: "Normal", status_type: "success" }
    ];

    // Rastgele bir ürün seçelim
    const randomProduct = trendingPool[Math.floor(Math.random() * trendingPool.length)];

    // Supabase veritabanına ekle
    const { data, error } = await supabase
        .from('products')
        .insert([randomProduct]);

    if (error) {
        console.error("Veritabanına ekleme hatası:", error.message);
    } else {
        console.log("Yeni trend ürün başarıyla sisteme eklendi:", randomProduct.name);
    }
}

updateEcommerceData();
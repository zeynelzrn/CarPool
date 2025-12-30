# 🚗 Carpool - Üniversite Araç Paylaşım Platformu

Web Programming (SE 3355) dersi için geliştirilmiş Full-Stack Bitirme Projesi.
Öğrencilerin güvenli, ekonomik ve kolay bir şekilde yolculuk paylaşmasını sağlar.

## 🛠 Teknoloji Yığını (Tech Stack)
* **Frontend:** React (Vite), Tailwind CSS, React-Leaflet (Harita)
* **Backend:** Node.js, Express.js, JWT Auth
* **Veritabanı:** MongoDB Atlas (Cloud)
* **Versiyon Kontrol:** Git & GitHub

## ✨ Özellikler
* 🔐 **Kimlik Doğrulama:** Sürücü ve Yolcu giriş/kayıt sistemi (JWT).
* 🗺 **İlan Yönetimi:** Sürücüler harita destekli yolculuk ilanı oluşturabilir, düzenleyebilir ve silebilir (Tam CRUD).
* 🔍 **Arama & Filtreleme:** Yolcular güzergaha göre ilan arayabilir.
* 📅 **Rezervasyon:** Yolcular ilanlara rezervasyon isteği gönderebilir.
* 📱 **Responsive Tasarım:** Mobil uyumlu modern arayüz.

## 🚀 Kurulum ve Çalıştırma (Installation)

Projeyi bilgisayarınıza indirdikten sonra şu adımları izleyin:

### 1. Bağımlılıkları Yükleyin
Ana dizinde şu komutu çalıştırarak hem Frontend hem Backend paketlerini kurun:
```bash
npm run install-all
# Veya manuel olarak:
# cd client && npm install
# cd server && npm install
```

### 2. Çevresel Değişkenler (.env)

`server` klasörünün içine `.env` adında bir dosya oluşturun ve şu bilgileri girin:

```env
PORT=5001
MONGO_URI=mongodb+srv://<kullanici>:<sifre>@cluster... (Kendi Atlas Linkiniz)
JWT_SECRET=gizli_anahtar
JWT_EXPIRE=7d
```

### 3. Uygulamayı Başlatın

Ana dizinde:

```bash
npm run dev
```

**Frontend:** http://localhost:5173

**Backend:** http://localhost:5001

## 👥 Takım Üyeleri
* Zeynel Zeren
* Melisa Demirbaş
* Esra Ece Güngüney

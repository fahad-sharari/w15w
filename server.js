const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ================= إعدادات XVLR الرسمية الكاملة =================
const WEBHOOK_URL = "https://discordapp.com/api/webhooks/1496540596834271335/i8UVZiT-YuSva5A_crAsMGl6kUszSUapWJ9-dT-lY7MGiZoGGAc51B7zx1XpPcpvCxfJ";
const BASE_URL = "https://w15w.onrender.com";
const DISCORD_SUPPORT = "https://discord.gg/yE4mkzv4yx";

// روابط الصور من مركز رعد
const LOGO_URL = "https://www.raed.net/img?id=1538408"; 
const BANNER_URL = "https://www.raed.net/img?id=1538410";
// =============================================================

// حل مشكلة حذف المجلدات في Render - التأكد من وجود المجلد بشكل دائم ومستمر
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

let expiryData = {}; 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // إعادة إنشاء المجلد فوراً لو حذفه الرستارت أثناء عملية الرفع
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const shortId = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.originalname);
        cb(null, `XVLR-${shortId}${ext}`);
    },
});

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 1024 } });

app.use(express.static(uploadDir));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("ngrok-skip-browser-warning", "true");
    next();
});

// --- واجهة الرفع الرئيسية ---
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XVLR | مركز الرفع السحابي المتطور 🛡️</title>
        <meta name="description" content="XVLR هو أسرع مركز لرفع الملفات ومشاركتها بروابط مباشرة وآمنة مدى الحياة.">
        <link rel="icon" href="${LOGO_URL}" type="image/x-icon">
        <style>
            body { background: #0a0a0a; color: #fff; font-family: sans-serif; margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
            .banner { width: 100%; max-height: 200px; object-fit: cover; border-bottom: 2px solid #ff0000; }
            .container { background: #141414; padding: 40px; border-radius: 20px; border: 1px solid #333; width: 90%; max-width: 480px; text-align: center; margin-top: -50px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-top: 4px solid #ff0000; }
            .logo { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #ff0000; margin-bottom: 15px; object-fit: cover; }
            h1 { color: #fff; font-size: 28px; margin: 10px 0; letter-spacing: 2px; }
            p { color: #888; font-size: 14px; margin-bottom: 20px; }
            input[type="file"] { width: 100%; padding: 15px; margin: 10px 0; border-radius: 10px; border: 1px solid #333; background: #000; color: #fff; cursor: pointer; }
            select { width: 100%; padding: 15px; margin: 10px 0; border-radius: 10px; border: 1px solid #333; background: #000; color: #fff; }
            .btn-upload { background: linear-gradient(90deg, #ff0000, #990000); color: white; border: none; padding: 18px; width: 100%; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 18px; transition: 0.3s; margin-top: 10px; }
            .btn-upload:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(255,0,0,0.4); }
            #status { margin-top: 20px; color: #ff0; font-weight: bold; }
            .footer-link { display: inline-block; margin-top: 25px; color: #5865F2; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <img src="${BANNER_URL}" class="banner">
        <div class="container">
            <img src="${LOGO_URL}" class="logo">
            <h1>مركز رفع XVLR</h1>
            <p>تم رفع مستوى الحماية.. ارفع ملفك الآن واحصل على رابطك</p>
            <input type="file" id="fileInput" required />
            <select id="durationInput">
                <option value="999999999999" selected>تخزين دائم (مدى الحياة)</option>
                <option value="86400000">يوم واحد</option>
                <option value="2592000000">شهر واحد</option>
            </select>
            <button onclick="uploadFile()" id="uploadBtn" class="btn-upload">رفع الملف الآن 📤</button>
            <div id="status"></div>
            <a href="${DISCORD_SUPPORT}" target="_blank" class="footer-link">الدعم الفني عبر ديسكورد</a>
        </div>
        <script>
            async function uploadFile() {
                const fileInput = document.getElementById('fileInput');
                const duration = document.getElementById('durationInput').value;
                const status = document.getElementById('status');
                if (!fileInput.files[0]) return alert("يرجى اختيار ملف أولاً!");
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('duration', duration);
                
                status.innerText = "جاري معالجة الملف وتأمين الرابط.. ⏳";
                try {
                    const response = await fetch('/upload', { method: 'POST', body: formData });
                    const resultHtml = await response.text();
                    document.open();
                    document.write(resultHtml);
                    document.close();
                } catch (e) { status.innerText = "❌ حدث خطأ غير متوقع"; }
            }
        </script>
    </body>
    </html>
    `);
});

// --- صفحة النجاح (بعد الرفع) ---
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("error");
    
    const fileId = req.file.filename;
    expiryData[fileId] = Date.now() + parseInt(req.body.duration);
    const fileUrl = BASE_URL + "/" + fileId;

    try {
        await axios.post(WEBHOOK_URL, {
            embeds: [{
                title: "📥 تم رفع ملف جديد في مركز XVLR",
                color: 16711680, 
                fields: [
                    { name: "📄 اسم الملف", value: `\`${req.file.originalname}\``, inline: true },
                    { name: "🔗 رابط التحميل", value: `[اضغط هنا لفتح الرابط](${fileUrl})`, inline: false },
                    { name: "⏳ مدة التخزين", value: req.body.duration === "999999999999" ? "مدى الحياة" : "مؤقت", inline: true }
                ],
                footer: { text: "نظام حماية XVLR الرسمي 🛡️" },
                timestamp: new Date()
            }]
        });
    } catch (error) {
        console.error("خطأ في إرسال الويب هوك:", error.message);
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XVLR | تم الرفع بنجاح ✅</title>
        <style>
            body { background: #0a0a0a; color: white; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
            .banner-container { width: 100%; overflow: hidden; border-bottom: 2px solid #ff0000; }
            .banner { width: 100%; height: auto; max-height: 220px; object-fit: contain; display: block; }
            .main-content { display: flex; flex-direction: column; align-items: center; width: 100%; padding: 20px; box-sizing: border-box; margin-top: -60px; }
            .logo-success { width: 110px; height: 110px; border-radius: 50%; border: 3px solid #ff0000; object-fit: cover; z-index: 2; box-shadow: 0 0 15px rgba(255, 0, 0, 0.4); margin-bottom: -55px; }
            .card { background: #111; padding: 75px 30px 30px 30px; border-radius: 15px; border: 1px solid #0f0; text-align: center; max-width: 530px; width: 95%; box-shadow: 0 0 20px rgba(0, 255, 0, 0.2); position: relative; z-index: 1; }
            h2 { margin-top: 25px; font-size: 24px; color: #0f0; text-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
            .success-text { color: #bbb; line-height: 1.7; margin: 20px 0; font-size: 15px; padding: 0 15px; }
            .url-box { background: #000; padding: 18px; border-radius: 8px; margin: 25px 0; word-break: break-all; border: 1px dashed #444; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; }
            @media (min-width: 600px) { .url-box { flex-direction: row; justify-content: space-between; text-align: left; gap: 15px; } }
            .copy-btn { background: #0f0; color: #000; border: none; padding: 10px 22px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.2s; white-space: nowrap; }
            .copy-btn:hover { background: #0c0; transform: scale(1.05); }
            .discord-support { margin-top: 30px; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
            .discord-support a { color: #0056b3; text-decoration: none; font-weight: bold; transition: 0.2s; text-shadow: 0 0 8px rgba(0, 86, 179, 0.4); }
            .discord-support a:hover { color: #007bff; text-shadow: 0 0 12px rgba(0, 123, 255, 0.6); }
            .back-link { margin-top: 15px; display: inline-block; }
            .back-link a { color: #888; text-decoration: none; font-size: 0.9em; transition: 0.2s; }
            .back-link a:hover { color: #fff; text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="banner-container">
            <img src="${BANNER_URL}" class="banner" alt="XVLR Banner">
        </div>
        <div class="main-content">
            <img src="${LOGO_URL}" class="logo-success" alt="XVLR Logo">
            <div class="card">
                <h2>تم رفع الملف بنجاح ✅</h2>
                <p class="success-text">الف مبروك يقلبي الكود طلعلك شارك الملف مع الي تبيه واذا صار مشكله في الموقع حياك دسكورد 🛡️</p>
                <div class="url-box">
                    <span id="linkValue" style="color: #0f0; font-family: monospace; font-size: 13px;">${fileUrl}</span>
                    <button class="copy-btn" onclick="copyLink()">نسخ</button>
                </div>
                <div class="discord-support">
                    <a href="${DISCORD_SUPPORT}" target="_blank">الدعم الفني عبر ديسكورد</a>
                    <span style="color: #0056b3;">🛡️</span>
                </div>
                <div class="back-link">
                    <a href="/">← العودة للرئيسية</a>
                </div>
            </div>
        </div>
        <script>
            function copyLink() {
                const text = document.getElementById('linkValue').innerText;
                if (!navigator.clipboard) { alert("المتصفح لا يدعم النسخ التلقائي"); return; }
                navigator.clipboard.writeText(text).then(() => {
                    const btn = document.querySelector('.copy-btn');
                    btn.innerText = "تم النسخ!";
                    btn.style.background = "#5865F2"; btn.style.color = "#fff";
                    setTimeout(() => { btn.innerText = "نسخ"; btn.style.background = "#0f0"; btn.style.color = "#000"; }, 2000);
                });
            }
        </script>
    </body>
    </html>
    `);
});

// --- صفحة تحميل الملف ---
app.get("/:file", (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
        if (req.headers['user-agent'] && (req.headers['user-agent'].includes("Discordbot") || !req.query.download)) {
            return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>XVLR | تحميل الملف 📥</title>
                <meta property="og:title" content="مركز XVLR - ملف جاهز للتحميل">
                <meta property="og:description" content="مركز الرفع السحابي المتطور - اضغط للتحميل المباشر والآمن.">
                <meta property="og:image" content="${LOGO_URL}">
                <link rel="icon" href="${LOGO_URL}" type="image/x-icon">
                <style>
                    body { background: #0a0a0a; color: white; text-align: center; padding-top: 100px; font-family: sans-serif; }
                    .dl-btn { background: #ff0000; color: white; padding: 18px 45px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 20px; display: inline-block; transition: 0.3s; border: none; cursor: pointer; }
                    .dl-btn:hover { transform: scale(1.05); background: #cc0000; }
                </style>
            </head>
            <body>
                <img src="${LOGO_URL}" style="width:120px; border-radius:50%; border:3px solid #ff0000; margin-bottom: 20px;">
                <h1>تحميل الملف الآمن</h1>
                <p style="color:#888;">اسم الملف: <span style="color:#0f0;">${fileName}</span></p>
                <br>
                <a href="/${fileName}?download=true" class="dl-btn">بدء التحميل المباشر 📥</a>
            </body>
            </html>
            `);
        }
        res.download(filePath);
    } else {
        res.status(404).send("الملف غير موجود أو تم حذفه بسبب إعادة تشغيل خوادم Render المؤقتة.");
    }
});

app.listen(PORT, "0.0.0.0", () => console.log("XVLR OFFICIAL SYSTEM READY"));
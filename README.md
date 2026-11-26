# محاكي المعلم — ELMOALEM SIMULATOR
**تطوير VORTEXweblab**

حزمة كاملة جاهزة للرفع على **GitHub** والتشغيل أونلاين مع أصحابك (حتى ٤ لاعبين في نفس الغرفة عبر WebSockets) **بدون Firebase وبدون أي قاعدة بيانات خارجية**.

---

## ١. مميزات الحزمة الجاهزة
- **لعب جماعي أونلاين مدمج (بدون Firebase):** سيرفر `Express + WebSocket (/ws)` مدمج داخل `server.ts` ينشئ الغرف ويرسل روابط الدعوة ويزامن حركة الـ ٤ لاعبين والأنيميشن والشات لحظياً.
- **حفظ تلقائي للغرف:** يحفظ السيرفر حالة الغرفة تلقائياً في `/tmp/elmoalem-rooms-v2.json` دون حاجة لأي إعدادات أو حسابات سحابية.
- **إنترو VORTEXweblab + أغاني حمو المرشدي المتواصلة + حصر الإدارة والمدينة للمعلم محمد حامد فقط.**

---

## ٢. كيف ترفع المشروع على GitHub وتلعب أونلاين مجاناً مع أصحابك؟

> **ملاحظة مهمة:** خدمة **GitHub Pages** تستضيف ملفات ثابتة فقط ولا تدعم سيرفر Node/WebSockets للعب الجماعي. لتلعب أونلاين مع أصحابك، ارفع المشروع على **GitHub** ثم اربطه بأي استضافة مجانية لـ Node.js (مثل **Render** أو **Railway** أو **Koyeb**) باستخدام الملفات الجاهزة داخل الحزمة (`render.yaml` و `Dockerfile`).

### الخطوة 1: رفع الملفات على GitHub
1. حمّل ملفات المشروع كاملة (`Download` من AI Studio أو فك الضغط في مجلد على جهازك).
2. أنشئ مستودعاً جديداً (**New Repository**) على حسابك في GitHub.
3. ارفع كل الملفات والمجلدات (`src/` و `public/` و `server.ts` و `package.json` و `render.yaml` و `Dockerfile` و `vite.config.ts` و `index.html`) عبر واجهة GitHub أو عبر الأوامر:
```bash
git init
git add .
git commit -m "Elmoalem Simulator online package by VORTEXweblab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/elmoalem-simulator.git
git push -u origin main
```

### الخطوة 2: تشغيل اللينك أونلاين مجاناً (مثال: Render)
1. افتح [https://render.com](https://render.com) وسجل دخول بحساب **GitHub**.
2. اضغط **New +** ← **Blueprint** (أو **Web Service**) واختر المستودع الذي رفعته.
3. سيتعرف تلقائياً على ملف `render.yaml` ويشغّل:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (`node server.ts` على Node 22)
   - **Health Check:** `/api/health`
4. بعد دقيقتين سيعطيك رابطاً مباشراً مثل:
   `https://elmoalem-simulator.onrender.com`
5. افتح الرابط بحساب **المعلم محمد حامد**، اضغط **«إنشاء غرفة + رابط دعوة»**، وانسخ الرابط لأصحابك ليدخل كل واحد بشخصيته (أحمد / علي / محمود) وتلعبوا أونلاين فوراً!

---

## ٣. التشغيل على جهازك أو VPS (محلي / Docker)

يتطلب **Node.js 22.18+** (أو Docker):

```bash
npm install
npm run build
npm start
```

أو بوضع التطوير:
```bash
npm install
npm run dev
```

ثم افتح المتصفح على `http://localhost:3000`.

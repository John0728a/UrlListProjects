# 🔗 URL LIST

> 建立精美的連結清單，透過一個網址分享給任何人。

**線上體驗** → [modular-hulling-462013-m3.web.app](https://modular-hulling-462013-m3.web.app)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

---

## ✨ 功能特色

| 功能 | 說明 |
|------|------|
| 🔗 **快速建立清單** | 在首頁貼上第一個連結，立即開始編輯你的清單 |
| 🖼️ **自動 OG 預覽** | 貼上網址後自動擷取 Open Graph 標題、描述與圖片 |
| ✏️ **自訂內容** | 可自由編輯每個連結的標題與描述 |
| 🔀 **拖曳排序** | 透過拖放直覺地重新排列連結順序 |
| 🌐 **專屬短網址** | 為清單設定獨一無二的自訂網址（如 `/l/my-list`） |
| 📤 **一鍵發布** | 發布後即可透過短網址公開分享 |
| 📋 **我的連結** | 集中管理所有清單，隨時編輯或刪除 |
| 🔐 **Google 登入** | 使用 Google 帳號一鍵登入，安全又方便 |

---

## 🛠️ 技術架構

### 前端

```
React 19 + TypeScript + Vite 6 + Tailwind CSS 4
```

- **React 19** — 使用函式元件 + Hooks 模式
- **TypeScript** — 全專案強型別，確保程式碼品質
- **Vite 6** — 極速開發伺服器與建置工具
- **Tailwind CSS v4** — 使用 CSS `@theme` 設定自訂 HARU 暖色系調色盤
- **React Router v7** — SPA 路由管理
- **@dnd-kit** — 拖曳排序功能（`@dnd-kit/core` + `@dnd-kit/sortable`）

### 後端（Firebase）

- **Firebase Authentication** — Google OAuth 2.0 登入
- **Cloud Firestore** — NoSQL 文件資料庫，儲存清單與連結資料
- **Firebase Hosting** — 靜態網站託管與 CDN

### OG 資訊擷取

由於 Cloud Functions 需要 Blaze 方案，目前使用客戶端三層備援機制：
1. Firebase Cloud Functions（如可用）
2. [allorigins.win](https://allorigins.win/) CORS 代理 + DOMParser 解析
3. 從 URL 提取主機名稱作為預設標題

---

## 📁 專案結構

```
UrlListProjects/
├── public/                    # 靜態資源
├── src/
│   ├── components/
│   │   ├── Layout.tsx         # 應用外殼（導覽列 + 頁尾）
│   │   ├── ProtectedRoute.tsx # 需登入的路由守衛
│   │   └── SortableLinkCard.tsx # 可拖曳的連結卡片元件
│   ├── hooks/
│   │   └── useAuth.tsx        # Firebase Auth Context + Google 登入
│   ├── lib/
│   │   ├── firebase.ts        # Firebase 初始化與設定
│   │   └── og.ts              # Open Graph 資訊擷取（三層備援）
│   ├── pages/
│   │   ├── LandingPage.tsx    # 首頁（Hero + 功能介紹）
│   │   ├── EditorPage.tsx     # 清單編輯器（新增/排序/發布）
│   │   ├── MyLinksPage.tsx    # 我的連結管理頁
│   │   └── PublicListPage.tsx # 公開清單檢視頁
│   ├── types/
│   │   └── index.ts           # TypeScript 型別定義
│   ├── App.tsx                # 路由設定
│   ├── main.tsx               # 應用程式進入點
│   └── index.css              # Tailwind 主題與全域樣式
├── firebase.json              # Firebase Hosting 設定
├── firestore.rules            # Firestore 安全規則
├── firestore.indexes.json     # Firestore 索引設定
├── vite.config.ts             # Vite 建置設定
├── tsconfig.json              # TypeScript 設定
└── package.json               # 依賴與腳本
```

---

## 📊 資料模型（Firestore）

### `lists/{listId}`

| 欄位 | 型別 | 說明 |
|------|------|------|
| `ownerId` | `string` | 擁有者的 Firebase Auth UID |
| `slug` | `string` | 自訂短網址（唯一） |
| `title` | `string` | 清單標題 |
| `description` | `string` | 清單描述 |
| `items` | `LinkItem[]` | 連結項目陣列 |
| `published` | `boolean` | 是否已發布 |
| `createdAt` | `Timestamp` | 建立時間 |
| `updatedAt` | `Timestamp` | 最後更新時間 |

### `LinkItem`（內嵌於 items 陣列）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | 唯一識別碼（UUID） |
| `url` | `string` | 連結網址 |
| `ogTitle` | `string` | 自動擷取的 OG 標題 |
| `ogDescription` | `string` | 自動擷取的 OG 描述 |
| `ogImage` | `string` | 自動擷取的 OG 圖片 |
| `customTitle` | `string \| null` | 使用者自訂標題 |
| `customDescription` | `string \| null` | 使用者自訂描述 |
| `order` | `number` | 排序順序 |

### `slugs/{slug}`

| 欄位 | 型別 | 說明 |
|------|------|------|
| `listId` | `string` | 對應的清單 ID |

---

## 🎨 設計風格

採用 **HARU 暖色系調色盤**，營造溫暖舒適的視覺體驗：

| 色票 | Hex | 用途 |
|------|-----|------|
| 🟡 Cream | `#F2DFBB` | 背景、邊框 |
| 🟠 Orange | `#F2A649` | 主色調、按鈕、強調 |
| 🟤 Burnt | `#BF5A1F` | 懸停狀態、漸層 |
| 🟫 Brown | `#734429` | 文字、深色元素 |
| 🔴 Red | `#A6270A` | 警告、刪除操作 |

---

## 🔒 安全規則

Firestore 安全規則確保：

- ✅ 使用者只能讀寫**自己的**清單
- ✅ 已發布的清單**任何人**都可以閱讀
- ✅ 建立清單時 `ownerId` 必須與登入身份一致
- ✅ Slug 建立/更新時會驗證對應清單的擁有權
- ✅ Slug 查詢對所有人開放（用於公開連結存取）

---

## 🚀 快速開始

### 前置需求

- Node.js 18+
- Firebase CLI（`npm install -g firebase-tools`）
- Firebase 專案（已啟用 Authentication 和 Firestore）

### 安裝與開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 型別檢查
npx tsc -b --noEmit

# 建置生產版本
npm run build

# 部署到 Firebase Hosting
npx firebase deploy --only hosting
```

### Firebase 設定

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 啟用 **Authentication** → Google 登入
3. 建立 **Firestore** 資料庫
4. 將 Firebase 設定填入 `src/lib/firebase.ts`
5. 部署安全規則：`npx firebase deploy --only firestore:rules`

---

## 📝 路由

| 路徑 | 頁面 | 需登入 |
|------|------|--------|
| `/` | 首頁（Landing） | ❌ |
| `/edit/:listId` | 清單編輯器 | ✅ |
| `/my-links` | 我的連結 | ✅ |
| `/l/:slug` | 公開清單 | ❌ |

---

## 📄 授權

此專案僅供個人使用與學習參考。

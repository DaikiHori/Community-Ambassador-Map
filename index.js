require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = 3000;

// データベースファイルの絶対パスを指定
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const client = createClient({ 
    url: `file:${dbPath}` 
});
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction, 
    cookie: {
        secure: isProduction, 
        sameSite: isProduction ? 'lax' : 'none', 
        maxAge: 24 * 60 * 60 * 1000 // 1日
    }
}));

if (isProduction) {
    app.set('trust proxy', 1);
}

app.use(passport.initialize());
app.use(passport.session());

// シリアライズ（セッションへの保存設定）
passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser(async (email, done) => {
    const result = await client.execute({
        sql: 'SELECT * FROM User WHERE email = ?',
        args: [email]
    });
    done(null, result.rows[0]);
});

// Google認証ロジック
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;

    try {
        // 1. ホワイトリスト（Userテーブル）に存在し、isActiveであるか確認
        const result = await client.execute({
            sql: 'SELECT * FROM User WHERE email = ? AND isActive = 1',
            args: [email]
        });

        const user = result.rows[0];

        if (user) {
            // 2. ログイン時刻を更新
            await client.execute({
                sql: 'UPDATE User SET lastLoginAt = CURRENT_TIMESTAMP WHERE email = ?',
                args: [email]
            });
            return done(null, user);
        } else {
            // ホワイトリストにない、または isActive = 0 の場合
            return done(null, false, { message: 'Access Denied' });
        }
    } catch (err) {
        return done(err);
    }
}));

// --- 認証用ルーティング ---

// ログイン開始
app.post('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
app.use(express.urlencoded({ extended: true }));
// Googleからのコールバック
const googleCallbackHandler = passport.authenticate('google', { 
    failureRedirect: '/login-page', // 失敗した時の飛ばし先
    successRedirect: '/'           // 成功した時の飛ばし先（ここを明示的に書くのが安全）
});

// GETとPOSTの両方に同じハンドラーをセット
app.get('/auth/google/callback', googleCallbackHandler);
app.post('/auth/google/callback', googleCallbackHandler);


// ログアウト
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login-page');
    });
});

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    // ログインページへリダイレクト
    res.redirect('/login-page');
};

// Map表示（index.html）へのアクセスを制限
app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ログインページを表示するルート
app.get('/login-page', (req, res) => {
    // login.htmlを読み込み、プレースホルダーを置換して返す
    const fs = require('fs');
    const path = require('path');
    let html = fs.readFileSync(path.join(__dirname, 'public', 'login.html'), 'utf8');
    
    // サーバー側の設定値を埋め込む
    html = html.replace('{{GOOGLE_CLIENT_ID}}', process.env.GOOGLE_CLIENT_ID);
    html = html.replace('{{CALLBACK_URL}}', `${process.env.BASE_URL}/auth/google/callback`);
    
    res.send(html);
});

// 静的ファイルの提供（publicフォルダ）
app.use(express.static('public'));

/**
 * 1. 地点一覧を取得するAPI
 * 地図の初期読み込み時に使用（ピンを立てるための最小限のデータ）
 */
app.get('/api/locations', ensureAuthenticated, async (req, res) => {
    try {
        // 全地点を取得。リーダー情報はここでは含めない（軽量化）
        const result = await client.execute('SELECT * FROM LocationGroup WHERE isActive = 1');
        res.json(result.rows);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "地点データの取得に失敗しました" });
    }
});

/**
 * 2. 特定の地点のリーダー詳細を取得するAPI
 * ピンがクリックされた瞬間に呼び出される（オンデマンド取得）
 */
app.get('/api/locations/:id', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        // 指定されたlocationGroupIdに紐づくリーダーをすべて取得
        const query = `
            SELECT nickname, trainerName, imageUrl, comment 
            FROM LeaderDetail 
            WHERE locationGroupId = ?
        `;
        const result = await client.execute({
            sql: query,
            args: [id]
        });
        
        res.json(result.rows);
    } catch (error) {
        console.error("Detail Fetch Error:", error);
        res.status(500).json({ error: "リーダー情報の取得に失敗しました" });
    }
});

app.get('/api/map-config', ensureAuthenticated, (req, res) => {
    res.json({
        lat: parseFloat(process.env.MAP_INIT_LAT) || 35.6812,
        lng: parseFloat(process.env.MAP_INIT_LNG) || 139.7671,
        zoom: parseFloat(process.env.MAP_INIT_ZOOM) || 7
    });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`DB Path: ${dbPath}`);
    console.log(`=========================================`);
});


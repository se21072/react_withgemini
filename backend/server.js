// backend/server.js

require('dotenv').config(); // .env ファイルから環境変数を読み込む

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; // 環境変数からポート番号を取得、なければ5000番

// CORSを有効にする (Reactアプリからのアクセスを許可)
app.use(cors());

// JSON形式のリクエストボディを解析するミドルウェア
app.use(express.json());

// PostgreSQL データベース接続設定
// 環境変数からデータベース情報を取得する
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// データベース接続テスト (オプション)
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database!');
    release(); // クライアントをプールに戻す
});

// ログイン認証のエンドポイント
app.post('/api/login', async (req, res) => {
    const { loginId, password } = req.body;

    // 入力値の簡易バリデーション
    if (!loginId || !password) {
        return res.status(400).json({ message: 'ログインIDとパスワードは必須です。' });
    }

    try {
        // データベースからユーザーを検索
        const result = await pool.query('SELECT * FROM users WHERE login_id = $1', [loginId]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            // パスワードの比較 (※注意: 実際のアプリケーションではハッシュ化して比較します)
            if (user.password === password) {
                // 認証成功
                return res.status(200).json({ message: 'ログイン成功！', userId: user.id, loginId: user.login_id, role: user.role });
            } else {
                // パスワードが一致しない
                return res.status(401).json({ message: 'パスワードが違います。' });
            }
        } else {
            // ユーザーが見つからない
            return res.status(401).json({ message: 'ログインIDが見つかりません。' });
        }
    } catch (error) {
        console.error('ログイン処理中にエラーが発生しました:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。', error: error.message });
    }
});

// バイトの予定給料を取得するAPIエンドポイント (全ユーザーの給料取得用、社長用)
// クエリパラメータで特定のユーザーIDを指定することも可能
app.get('/api/salaries', async (req, res) => {
    try {
        // オプションで user_id を指定して特定のユーザーの給料を取得
        const { user_id } = req.query;
        let query = 'SELECT s.year, s.expected_salary, u.login_id, u.id as user_id, u.role FROM salaries s JOIN users u ON s.user_id = u.id';
        const queryParams = [];

        if (user_id) {
            query += ' WHERE s.user_id = $1';
            queryParams.push(user_id);
        }
        query += ' ORDER BY u.login_id, s.year DESC'; // ソートを追加

        const result = await pool.query(query, queryParams);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('給料データの取得中にエラーが発生しました:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。', error: error.message });
    }
});

// バイトの予定給料を更新するAPIエンドポイント (社長用)
app.put('/api/salaries/update', async (req, res) => {
    const { user_id, year, expected_salary } = req.body;

    // 入力値の簡易バリデーション
    if (!user_id || !year || expected_salary === undefined) {
        return res.status(400).json({ message: 'ユーザーID、年、予定給料は必須です。' });
    }
    if (isNaN(expected_salary) || expected_salary < 0) {
        return res.status(400).json({ message: '予定給料は有効な数値でなければなりません。' });
    }

    try {
        // 指定された user_id と year のエントリを更新、存在しない場合は挿入
        const result = await pool.query(
            `INSERT INTO salaries (user_id, year, expected_salary)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, year) DO UPDATE SET expected_salary = EXCLUDED.expected_salary
             RETURNING *`, // 更新/挿入された行を返す
            [user_id, year, expected_salary]
        );
        return res.status(200).json({ message: '給料データが正常に更新されました。', data: result.rows[0] });
    } catch (error) {
        console.error('給料データの更新中にエラーが発生しました:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。', error: error.message });
    }
});

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Access the login endpoint at http://localhost:${port}/api/login`);
});

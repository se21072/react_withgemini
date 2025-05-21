// frontend/src/App.jsx

import React, { useState, useEffect } from 'react'; // useEffect を追加
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// ページコンポーネントのインポート
import LoginPage from './LoginPage';
import ParttimePage from './ParttimePage';
import PresidentPage from './PresidentPage';
import GeneralPage from './GeneralPage';

// ルートアプリケーションのコンポーネント
function App() {
  return (
    <div className="App">
      {/* Router を使用してルーティングを有効にする */}
      <Router>
        {/* MainAppContent が全ての認証ロジックとルーティングロジックを管理 */}
        <MainAppContent />
      </Router>
    </div>
  );
}

// navigate や認証ロジックを管理するメインのコンポーネント
function MainAppContent() {
  const navigate = useNavigate(); // ここで useNavigate を使用

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null); // 追加: ログインしたユーザーのIDを保持
  const [message, setMessage] = useState(''); // ログインフォームとメッセージを共有

  // ログイン成功時に呼ばれるコールバック
  // userId を引数に追加しました
  const handleLoginSuccess = (role, loginId, userId) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setLoggedInUser(loginId);
    setLoggedInUserId(userId); // ここで userId をセット
    setMessage('ログイン成功！'); // 成功メッセージをセット

    // ロールに応じて異なるパスに遷移
    if (role === 'parttime') {
      navigate('/parttime');
    } else if (role === 'president') {
      navigate('/president');
    } else {
      navigate('/general'); // デフォルトまたは一般ユーザー
    }
  };

  // ログアウト機能
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setLoggedInUser(null);
    setLoggedInUserId(null); // ログアウト時に userId もクリア
    setMessage('ログアウトしました。');
    navigate('/'); // ログアウトしたらログインページへ
  };

  // ログイン状態が変わったらメッセージをクリアするなど、必要に応じて処理
  useEffect(() => {
    if (!isLoggedIn) {
      setMessage(''); // ログアウト時にメッセージをクリア
    }
  }, [isLoggedIn]);


  return (
    <>
      {/* ログイン中の場合のみログアウトボタンを表示 */}
      {isLoggedIn && (
        <button onClick={handleLogout} style={{ marginBottom: '20px' }}>ログアウト</button>
      )}

      {/* メッセージ表示エリア */}
      {message && <p className="message">{message}</p>}

      {/* Routes コンポーネントでルーティングルールを定義 */}
      <Routes>
        {/* ログインページ: パスが '/' の場合に LoginPage を表示 */}
        <Route path="/" element={
          <LoginPage
            onLoginSuccess={handleLoginSuccess} // handleLoginSuccess を直接渡す
            message={message}
            setMessage={setMessage}
          />
        } />
        {/* バイト用ページ: ParttimePage に userId を渡すように変更 */}
        <Route path="/parttime" element={
          isLoggedIn ? <ParttimePage loginId={loggedInUser} userId={loggedInUserId} /> : <LoginPage onLoginSuccess={handleLoginSuccess} message={message} setMessage={setMessage} />
        } />
        {/* 社長用ページ: PresidentPage は userId が不要なのでそのまま */}
        <Route path="/president" element={
          isLoggedIn ? <PresidentPage loginId={loggedInUser} /> : <LoginPage onLoginSuccess={handleLoginSuccess} message={message} setMessage={setMessage} />
        } />
        {/* 一般ユーザー用ページ */}
        <Route path="/general" element={
          isLoggedIn ? <GeneralPage loginId={loggedInUser} /> : <LoginPage onLoginSuccess={handleLoginSuccess} message={message} setMessage={setMessage} />
        } />
        {/* 404 Not Found ページ (オプション) */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </>
  );
}

export default App;
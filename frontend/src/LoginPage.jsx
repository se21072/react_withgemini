// frontend/src/LoginPage.jsx

import React, { useState } from 'react';

function LoginPage({ onLoginSuccess, message, setMessage }) {
	const [loginId, setLoginId] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		setMessage('ログイン中...');

		try {
			const response = await fetch('http://localhost:5000/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ loginId, password }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message);
				// ログイン成功時に親コンポーネントにロールとユーザー情報、そして userId を伝える
				onLoginSuccess(data.role, data.loginId, data.userId); // userId を追加！

				// フォームをクリア
				setLoginId('');
				setPassword('');
			} else {
				setMessage(`ログイン失敗: ${data.message}`);
				console.error('ログイン失敗:', data.message);
			}
		} catch (error) {
			console.error('ネットワークエラーまたはAPIリクエスト中にエラーが発生しました:', error);
			setMessage('ネットワークエラーが発生しました。サーバーが起動しているか確認してください。');
		}
	};

	return (
		<>
			<h1>ログイン</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="loginId">ログインID:</label>
					<input
						type="text"
						id="loginId"
						value={loginId}
						onChange={(e) => setLoginId(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="password">パスワード:</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit">送信</button>
			</form>
		</>
	);
}

export default LoginPage;
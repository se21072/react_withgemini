// frontend/src/ParttimePage.jsx
import React, { useState, useEffect } from 'react';

function ParttimePage({ loginId, userId }) { // userId をプロップスとして受け取る
	const [salaryData, setSalaryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchSalary = async () => {
			try {
				// 自分の user_id に紐づく給料データを取得
				// サーバーの /api/salaries エンドポイントに user_id をクエリパラメータで渡す
				const response = await fetch(`http://localhost:5000/api/salaries?user_id=${userId}`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				if (data.length > 0) {
					setSalaryData(data[0]); // 最初のデータ（今回は一つしかない想定）
				} else {
					setSalaryData(null); // データがない場合
				}
			} catch (err) {
				console.error("給料データの取得に失敗しました:", err);
				setError("給料データの取得に失敗しました。");
			} finally {
				setLoading(false);
			}
		};

		if (userId) { // userId が存在する場合のみフェッチ
			fetchSalary();
		}
	}, [userId]); // userId が変更されたときに再実行

	if (loading) return <p>給料データを読み込み中...</p>;
	if (error) return <p style={{ color: 'red' }}>{error}</p>;

	return (
		<div className="role-page">
			<h2>ようこそ、バイトの {loginId} さん！</h2>
			<p>シフトを確認し、業務を開始してください。</p>
			{salaryData ? (
				<div className="salary-info">
					<h3>{salaryData.year}年の予定給料:</h3>
					<p className="amount">¥{salaryData.expected_salary ? parseFloat(salaryData.expected_salary).toLocaleString() : '---'}</p>
				</div>
			) : (
				<p>まだ給料データが登録されていません。</p>
			)}
		</div>
	);
}

export default ParttimePage;
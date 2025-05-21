// frontend/src/PresidentPage.jsx
import React, { useState, useEffect } from 'react';

function PresidentPage({ loginId }) {
	const [allSalaries, setAllSalaries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [editingSalary, setEditingSalary] = useState(null); // 編集中の給料データ
	const [newExpectedSalary, setNewExpectedSalary] = useState('');

	const fetchAllSalaries = async () => {
		setLoading(true);
		setError(null);
		try {
			// 全ユーザーの給料データを取得
			const response = await fetch('http://localhost:5000/api/salaries');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setAllSalaries(data);
		} catch (err) {
			console.error("全給料データの取得に失敗しました:", err);
			setError("全給料データの取得に失敗しました。");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllSalaries();
	}, []);

	const handleEditClick = (salary) => {
		setEditingSalary(salary);
		setNewExpectedSalary(salary.expected_salary.toString());
	};

	const handleCancelEdit = () => {
		setEditingSalary(null);
		setNewExpectedSalary('');
	};

	const handleSaveSalary = async () => {
		if (!editingSalary || isNaN(parseFloat(newExpectedSalary))) {
			alert('有効な数値を入力してください。');
			return;
		}

		try {
			const response = await fetch('http://localhost:5000/api/salaries/update', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: editingSalary.user_id,
					year: editingSalary.year,
					expected_salary: parseFloat(newExpectedSalary),
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			console.log('給料更新成功:', result);
			setEditingSalary(null); // 編集モードを終了
			fetchAllSalaries(); // 最新のデータを再取得
			alert('給料が正常に更新されました！');
		} catch (err) {
			console.error("給料の更新に失敗しました:", err);
			setError("給料の更新に失敗しました。");
			alert("給料の更新に失敗しました。");
		}
	};

	if (loading) return <p>給料データを読み込み中...</p>;
	if (error) return <p style={{ color: 'red' }}>{error}</p>;

	return (
		<div className="role-page">
			<h2>ようこそ、社長の {loginId} 様！</h2>
			<p>本日の経営状況と戦略を立案しましょう。</p>

			<h3>バイトの予定給料一覧</h3>
			{allSalaries.length > 0 ? (
				<table>
					<thead>
						<tr>
							<th>ログインID</th>
							<th>年</th>
							<th>予定給料</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						{allSalaries.map((salary) => (
							<tr key={`<span class="math-inline">\{salary\.user\_id\}\-</span>{salary.year}`}>
								<td>{salary.login_id}</td>
								<td>{salary.year}</td>
								<td>
									{editingSalary && editingSalary.user_id === salary.user_id && editingSalary.year === salary.year ? (
										<input
											type="number"
											value={newExpectedSalary}
											onChange={(e) => setNewExpectedSalary(e.target.value)}
										/>
									) : (
										`¥${parseFloat(salary.expected_salary).toLocaleString()}`
									)}
								</td>
								<td>
									{editingSalary && editingSalary.user_id === salary.user_id && editingSalary.year === salary.year ? (
										<>
											<button onClick={handleSaveSalary} style={{ marginRight: '5px', backgroundColor: '#28a745' }}>保存</button>
											<button onClick={handleCancelEdit} style={{ backgroundColor: '#dc3545' }}>キャンセル</button>
										</>
									) : (
										<button onClick={() => handleEditClick(salary)} style={{ backgroundColor: '#ffc107', color: '#333' }}>編集</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<p>登録されている給料データはありません。</p>
			)}
		</div>
	);
}

export default PresidentPage;
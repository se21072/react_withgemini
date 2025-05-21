// frontend/src/GeneralPage.jsx
import React from 'react';

function GeneralPage({ loginId }) {
	return (
		<div className="role-page">
			<h2>ようこそ、一般ユーザーの {loginId} さん！</h2>
			<p>通常のサービスをご利用いただけます。</p>
		</div>
	);
}

export default GeneralPage;
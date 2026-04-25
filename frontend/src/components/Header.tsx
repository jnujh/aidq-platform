import { Link, useNavigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = authStore.isAuthenticated();

  const handleLogout = () => {
    authStore.removeToken();
    navigate('/login');
  };

  return (
    <header style={{ padding: '16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/jobs" style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
        Scorecard
      </Link>
      <nav style={{ display: 'flex', gap: '16px' }}>
        {isLoggedIn ? (
          <>
            <Link to="/jobs">작업 목록</Link>
            <Link to="/jobs/upload">파일 업로드</Link>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}

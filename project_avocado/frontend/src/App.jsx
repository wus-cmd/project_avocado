import './App.css';

function App() {
  return (
    <div className="page-container">
      
      <header className="header">
        <div className="logo">
          <span>ACOVADO</span>
        </div>
        <button className="cta-button-secondary">회원가입</button>
      </header>

      <main className="hero-section">
        <h1>ACOVADO</h1>
        <p>Ai VOice CommnicAtion Development tOol</p>
        <button className="cta-button-primary">로그인</button>
        <a href="#" className="info-link">서비스 소개서가 필요하신가요?</a>
      </main>

      <div className="background-text">ACOVADO</div>

    </div>
  );
}

export default App;
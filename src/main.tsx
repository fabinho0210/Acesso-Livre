import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#facc15', 
    fontFamily: 'sans-serif',
    textAlign: 'center',
    padding: '20px'
  }}>
    <h1 style={{ fontWeight: '900', fontSize: '3rem', border: '5px solid black', padding: '10px 20px', boxShadow: '10px 10px 0px black' }}>ACESSO LIVRE</h1>
    <p style={{ fontWeight: 'bold', marginTop: '20px' }}>PROJETO MIGRADO PARA ANDROID NATIVO (KOTLIN)</p>
    <p>O código-fonte completo agora está nas pastas do projeto Android.</p>
    <button style={{ 
      marginTop: '20px', 
      padding: '15px 30px', 
      backgroundColor: 'black', 
      color: 'white', 
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer'
    }}>BAIXAR PROJETO NO MENU</button>
  </div>
);

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}

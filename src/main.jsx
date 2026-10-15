import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

class ErrorBoundary extends React.Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  render(){return this.state.error?<main className="fatal"><h1>页面暂时遇到了一点问题</h1><p>你的本机草稿不会因此清除。可以先刷新重试。</p><button onClick={()=>location.reload()}>重新加载</button></main>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);

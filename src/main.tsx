import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AppProviders } from '@/components/providers/AppProviders'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { seedDemoData } from './db/seedData'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

// 异步初始化预设账号与测试数据（不阻塞渲染）
seedDemoData().catch((err) => {
  console.warn('[seed] 预设数据初始化失败：', err)
})

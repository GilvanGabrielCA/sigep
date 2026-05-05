import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import styles from './app-layout.module.css'

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

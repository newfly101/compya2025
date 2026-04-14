// src/app/wrapper/mobile/parts/TopBar.jsx
import { Link } from 'react-router-dom'
import { useTopBar } from '@/app/provider/TopBarProvider'
import styles from './TopBar.module.scss'

const TopBar = () => {
  const { config } = useTopBar()
  const { variant, title, rightAction, onBack, onBurger } = config

  if (variant === 'page') {
    return (
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
          <span className={styles.backIcon}>‹</span>
        </button>
        {title && <span className={styles.pageTitle}>{title}</span>}
        {rightAction && <div className={styles.rightAction}>{rightAction}</div>}
      </header>
    )
  }

  return (
    <header className={styles.topBar}>
      <button className={styles.burger} onClick={onBurger} aria-label="메뉴">
        <span /><span /><span />
      </button>

      <Link to="/" className={styles.logo}>
        ⚾&nbsp;&nbsp;컴프야펀
      </Link>
    </header>
  )
}

export default TopBar

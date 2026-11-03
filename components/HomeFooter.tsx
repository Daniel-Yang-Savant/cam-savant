import Link from 'next/link'
import styles from './HomeSurface.module.css'

export default function HomeFooter() {
  return (
    <footer className={`${styles.surface} ${styles.footer}`} aria-label="網站頁尾">
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/">CAM SAVANT</Link>
            <p>
              整合醫學知識平台，深入探索復健醫學、運動醫學與功能醫學，
              並整理 FSM 頻率特異性微電流的臨床實證。
            </p>
          </div>
          <nav className={styles.footerNav} aria-label="網站連結">
            <h2>網站</h2>
            <ul>
              <li><Link href="/rehab-resources" prefetch={false}>補助與援助</Link></li>
              <li><Link href="/locations">看診資訊</Link></li>
              <li>
                <a
                  href="https://members.camsavant.com/login?returnTo=%2Fworkspace"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  會員專區
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>
            © {new Date().getFullYear()} CAM Savant 醫療團隊 · 臨床實證內容供醫療專業人員參考；圖解運動專區亦提供一般民眾健康教育。所有內容均不構成個別診療建議，未經書面授權禁止轉載、複製或商業使用。
          </p>
          <div className={styles.legal}>
            <Link href="/privacy">隱私權政策</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms">使用條款</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

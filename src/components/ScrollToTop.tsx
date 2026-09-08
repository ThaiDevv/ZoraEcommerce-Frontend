import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Tự động cuộn lên đầu trang mỗi khi chuyển route (chuyển trang)
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Nếu có hash (#id), cuộn đến phần tử đó; nếu không, cuộn ngay lên đầu trang (top: 0)
    if (!hash) {
      window.scrollTo(0, 0)
    } else {
      const element = document.getElementById(hash.replace("#", ""))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      } else {
        window.scrollTo(0, 0)
      }
    }
  }, [pathname, hash])

  return null
}

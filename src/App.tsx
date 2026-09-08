export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-[#ee4d2d] mb-2">ZoraEcommerce</h1>
        <p className="text-slate-600 mb-6">
          Dự án Frontend mới đã sẵn sàng. Bạn có thể bắt đầu xây dựng các component và trang giao diện tại đây!
        </p>
        <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 text-left font-mono">
          <div>📁 src/api - Các hàm gọi API Backend</div>
          <div>📁 src/types - TypeScript interfaces</div>
          <div>📁 src/utils - Hàm tiện ích format</div>
          <div>📁 src/components - Thư mục components</div>
          <div>📁 src/pages - Thư mục pages</div>
        </div>
      </div>
    </main>
  )
}

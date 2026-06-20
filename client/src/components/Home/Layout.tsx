import { MenuIcon } from "lucide-react"
import { useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import { useAuth } from "../../context/AuthContext"

const pageConfig: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview of your social media performance and analytics"
  },
  "/accounts": {
    title: "Social Accounts",
    description: "Manage and connect your social media platforms"
  },
  "/schedule": {
    title: "Post Scheduler",
    description: "Take command of your social media automatically"
  },
  "/ai-composer": {
    title: "AI Composer",
    description: "Generate engaging content with artificial intelligence"
  },
}

const Layout = () => {
  const {isAuthenticated, isLoading} = useAuth()

  const location = useLocation()
  const currentPage = pageConfig[location.pathname] || {
    title: "socialAI",
    description: "Take command of your social media automatically"
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if(isLoading){
    return(
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if(!isAuthenticated){
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 gap-4">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="size-6" />
          </button>
          <div>
            <h1 className="text-slate-900 text-xl font-semibold">{currentPage.title}</h1>
            <p className="text-sm text-slate-400 hidden sm:block">
              {currentPage.description}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 xl:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
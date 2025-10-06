import { Plus, X, Search } from "lucide-react"

export default function BlogSearchBar({onChange, onClick, searchTerm, showAddForm}) {
  return (
   <>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={onClick}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
            >
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
              {showAddForm ? "Close" : "Add Blog"}
            </button>
          </div>
        </div>
   </>
  )
}

import { Image, FileText, CircleMinus, Calendar } from 'lucide-react'

export default function BlogStatsCards({blogs}) {
  return (
    <>
       <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:scale-102 transition ease-linear">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Blogs
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {blogs.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:scale-102 transition ease-linear">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Assigned Blog/s
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {blogs.filter((b) => b.imageUrl).length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Image className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Unassigned Blogs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:scale-102 transition ease-linear">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Unassigned Blog/s
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {blogs.filter((b) => b.section === 0).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <CircleMinus className="w-6 h-6 text-red-300" />
              </div>
            </div>
          </div>

          {/* End Of Unassigned */}


          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:scale-102 transition ease-linear">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Month</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {
                    blogs.filter(
                      (b) =>
                        new Date(b.createdAt).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
    </>
  )
}

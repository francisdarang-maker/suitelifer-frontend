import { Calendar, Pencil, Trash2, Image } from "lucide-react";
import FSLogo from '../../../assets/logos/logo-fs.svg'

function BlogContentCard({ blog, onEdit, onDelete }) {
  const isUnassigned = blog.section === 0;
  const imageUrl = blog.imageUrl ? blog.imageUrl : FSLogo

  return (
    <div
      key={blog.blogId}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-2xl transition-all hover:-translate-y-1 group ${
        isUnassigned ? "opacity-80 grayscale hover:opacity-100 hover:grayscale-0" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
      
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        <div
          className={`absolute top-3 right-3 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium ${
            isUnassigned
              ? "bg-red-100 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          Section: {isUnassigned ? "Unassigned" : blog.section}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-slate-600 text-sm mb-4 line-clamp-3" dangerouslySetInnerHTML={{__html: blog.article}}/>
        

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Calendar className="w-4 h-4" />
          {new Date(blog.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <button
            onClick={() => onEdit(blog)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(blog.blogId, blog.imageUrl)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-all font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        {/* Blog ID */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            ID: {(blog.blogId || 0) + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BlogContentCard;

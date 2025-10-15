
import BlogCard from "../../components/blog/BlogCard";
import Loader from '../../components/loader/Loading'
import { useState, useEffect } from "react";
import api from "../../utils/axios";
import { RefreshCcw } from "lucide-react";
import BlogDeleteDialog from "../../components/blog/admin/BlogDeleteDialog";

const EmployeeMyBlogs = () => {

  const [myBlogs, setMyBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchEmployeeBlogs = async () => {
  setIsLoading(true)

  const blogs = await api.get(`api/employee-blog`)
  setMyBlogs(blogs.data)

  console.log(blogs)

  setIsLoading(false)
}

useEffect( () => {
  fetchEmployeeBlogs()
},[])


  return (
    <>
    <section className="mb-50">
      <div className="p-2 xl:p-3 ">
        <main>
          {isLoading && (
              <Loader/>
            )}
            {myBlogs.length > 0 ? (
              myBlogs.map((blog, index) => (
                <div key={index} className="mb-5">
                  <BlogCard blog={blog} isMine={true} />
                </div>
              ))
            ) : (
              !isLoading &&
              <div className="flex flex-col items-center justify-center mt-20 text-center">
                <div className="bg-gray-50 rounded-2xl p-8 shadow-sm max-w-sm">
                  <h3 className="text-xl font-avenir-black text-gray-700 mb-2">
                    No Blog Posts Yet
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    It looks a bit quiet here. Check back later for new stories and updates from your team.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-white font-avenir-medium text-sm hover:bg-primary/90 transition-all duration-300"
                  >
                    <RefreshCcw className="w-4 h-4 animate-spin-slow"/>
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>
    </section>
    </>
  );
};

export default EmployeeMyBlogs;

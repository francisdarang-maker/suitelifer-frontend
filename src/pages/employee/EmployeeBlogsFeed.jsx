import BlogCard from "../../components/blog/BlogCard";
import { Outlet, useParams } from "react-router-dom";
import { TicketIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axios";
import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import Loader from '../../components/loader/Loading'

const EmployeeBlogsFeed = () => {
  
  const { id } = useParams();
  const [eBlogs, setEmployeeblogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

const fetchEmployeeBlogs = async () => {
  setIsLoading(true)

  const employeeBlogs = await api.get('api/all-employee-blog')
  
  setEmployeeblogs(employeeBlogs.data)
  setIsLoading(false)
  
}

useEffect( () => {
  fetchEmployeeBlogs()
},[])


  return (
    <section className="p-2 xl:p-3 mb-50">
      {id ? (
        <Outlet />
      ) : (
        <>
          <div className="bg-primary rounded-md p-3 flex justify-between mb-5 lg:hidden">
            <div className="flex gap-2">
              <TicketIcon className="w-5 h-5 text-white" />
              <span className="text-white text-sm">3 events today</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-white text-xss">See all</span>
              <ChevronRightIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          <main>
            {isLoading && (
              <Loader/>
            )}
            {eBlogs.length > 0 ? (
              eBlogs.map((blog, index) => (
                <div key={index} className="mb-5">
                  <BlogCard blog={blog} />
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
        </>
      )}
    </section>
  );
};

export default EmployeeBlogsFeed;

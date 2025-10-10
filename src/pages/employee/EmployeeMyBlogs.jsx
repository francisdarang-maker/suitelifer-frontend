
import BlogCard from "../../components/blog/BlogCard";
import Loader from '../../components/loader/Loading'
import { useState, useEffect } from "react";

// fetch here

const blogFeeds = [
  {
    id: 1,
    userPic:
      "http://sa.kapamilya.com/absnews/abscbnnews/media/2020/tvpatrol/06/01/james-reid.jpg",
    firstName: "Hernani",
    lastName: "Domingo",
    title: "Lost in the beauty of Palawan!",
    description:
      "Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise. Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise. Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise.",
    commentCount: 10,
    likeCount: 25,
    date: "2025-02-26 14:30:00",
    images: [
      "https://plus.unsplash.com/premium_photo-1697729414037-e2a59823d9d9?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1583685173048-342a162bb888?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1531761535209-180857e963b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
  },
  {
    id: 2,
    userPic:
      "http://sa.kapamilya.com/absnews/abscbnnews/media/2020/tvpatrol/06/01/james-reid.jpg",
    firstName: "Hernani",
    lastName: "Domingo",
    title: "Lost in the beauty of Palawan!",
    description:
      "Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise. Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise. Lost in the beauty of Palawan! 🌊🏝️ From stunning lagoons to white sandy beaches, every moment feels like a dream. ✨🌅 #IslandParadise.",
    commentCount: 10,
    likeCount: 25,
    date: "2025-02-26 14:30:00",
    images: [
      "https://plus.unsplash.com/premium_photo-1697729414037-e2a59823d9d9?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1583685173048-342a162bb888?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1531761535209-180857e963b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
  },
];

const EmployeeMyBlogs = () => {

  // const { id } = useParams();
  const [myBlogs, setMyBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchEmployeeBlogs = async () => {
  // setIsLoading(true)

  // const blogs = await api.get(`api/employee-blog/${userId}`)
  // setMyBlogs(blogs.data)

  // console.log(blogs.data)

  // setIsLoading(false)
}

useEffect( () => {
  fetchEmployeeBlogs()
},[])


  return (
    <section className="mb-50">
      <div className="p-2 xl:p-3 ">
        <main>
          {isLoading && (
              <Loader/>
            )}
            {blogFeeds.length > 0 ? (
              blogFeeds.map((blog, index) => (
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
      </div>
    </section>
  );
};

export default EmployeeMyBlogs;

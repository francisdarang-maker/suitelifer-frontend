import { useState, useEffect } from "react";
import PageMeta from "../../components/layout/PageMeta";
import { useLocation } from "react-router-dom";
import DesktopNav from "../../components/home/DesktopNav";
import TabletNav from "../../components/home/TabletNav";
import MobileNav from "../../components/home/MobileNav";
import BlogHeader from "../../components/blog/guest/BlogHeader";
import MotionUp from "../../components/animated/MotionUp";
import api from "../../utils/axios";
import BlogGrid from "../guest/BlogsGrid";

function Blogs() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [isError, setIsError] = useState(false);

  const fetchBlogs = async () => {
    try {
      const getBlogs = await api.get("/api/blogs");
      if (!getBlogs) {
        return isError(true);
      }
      setBlogs(getBlogs.data["data"]);
    } catch (error) {
      setIsError(true);
      console.log(error);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <section
      className="gap-4 overflow-hidden min-h-screen flex flex-col bg-gray-50"
      style={{
        maxWidth: "2000px",
        margin: "0 auto",
        paddingInline: "100px",
        paddingBottom: "20px",
      }}
    >
      <PageMeta
        title="Home | Empowering Careers & Opportunities - Suitelifer"
        desc="Discover career opportunities, company insights, and the latest updates at FullSuite. Your journey to success starts here."
        isDefer={false}
        url={location.pathname}
      />

      {/* NAVIGATION */}
      <div className="sm:hidden">
        <MobileNav />
      </div>
      <div className="tablet-nav">
        <TabletNav />
      </div>
      <div className="desktop-nav">
        <DesktopNav />
      </div>

      {/* HEADER */}
      <section className="relative lg:mt-5 mb-6">
        <MotionUp>
          <BlogHeader />
        </MotionUp>
      </section>

      {/* BLOG GRID (Dynamic) */}
      <BlogGrid blogs={blogs} />
    </section>
  );
}

export default Blogs;

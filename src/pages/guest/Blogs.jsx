import { useState, useEffect } from "react";
import PageMeta from "../../components/layout/PageMeta";
import { useLocation } from "react-router-dom";
import DesktopNav from "../../components/home/DesktopNav";
import TabletNav from "../../components/home/TabletNav";
import MobileNav from "../../components/home/MobileNav";
import BlogHeader from "../../components/blog/guest/BlogHeader";
import MotionUp from "../../components/animated/MotionUp";
import api from '../../utils/axios'
import BlogGrid from "../guest/BlogsGrid";

function Blogs() {
  const location = useLocation();
  const [blogs, setBlogs] = useState([])
  const [isError, setIsError] = useState(false)

  const fetchBlogs = async() => {
    try {
      const getBlogs = await api.get('/api/blogs');
      if(!getBlogs){
        return isError(true)
      }
      setBlogs(getBlogs.data['data'])
    } catch (error) {
      setIsError(true)
      console.log(error)
    }
  }
  useEffect(()=>{
    fetchBlogs()
  }, [])

  const blogss = [
     {
      image: "https://picsum.photos/1000/600",
      title: "Guardians of the Pride: The Urgency of Lion Conservation Efforts",
      description:
        "Exploring the fascinating realm of lions and the urgent call for conservation of these majestic species. Lions face numerous challenges in the wild, from habitat loss to poaching, and urgent conservation action is needed to protect them for future generations.",
      tag: "Read more",
    },
    {
      image: "https://picsum.photos/200/120?1",
      title: "Unveiling the Enigmatic World of Giant Pandas",
      description:
        "Unveiling the enigmatic world of giant pandas and conservation challenges.",
      tag: "Read More",
    },
    {
      image: "https://picsum.photos/200/120?2",
      title: "Protecting the Unique and Threatened Seas",
      description:
        "Fauna & Flora has been using collective knowledge to protect our seas.",
      tag: "Read More",
    },
    {
      image: "https://picsum.photos/1000/600",
      title: "Guardians of the Pride: The Urgency of Lion Conservation Efforts",
      description:
        "Exploring the fascinating realm of lions and the urgent call for conservation of these majestic species. Lions face numerous challenges in the wild, from habitat loss to poaching, and urgent conservation action is needed to protect them for future generations.",
      tag: "Read More",
    },
    {
      image: "https://picsum.photos/200/120?1",
      title: "Unveiling the Enigmatic World of Giant Pandas",
      description:
        "Unveiling the enigmatic world of giant pandas and conservation challenges.",
      tag: "Read More",
    },
    {
      image: "https://picsum.photos/200/120?2",
      title: "Protecting the Unique and Threatened Seas",
      description:
        "Fauna & Flora has been using collective knowledge to protect our seas.",
      tag: "Read More",
    },
    {
      image: "https://picsum.photos/200/120?3",
      title: "Exploring the Fascinating Realm of Birds",
      description:
        "Discover the ecological significance of birds across ecosystems.",
      tag: "Read More",
    },
  ];

  return (
    <section
      className="gap-4 overflow-hidden min-h-screen flex flex-col bg-gray-50"
      style={{ maxWidth: "2000px", margin: "0 auto", paddingInline: "100px", paddingBottom: '20px'}}
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

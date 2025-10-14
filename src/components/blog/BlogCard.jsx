import React, { useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { toSlug } from "../../utils/slugUrl";
import ModalFullImages from "../modals/ModalFullImages";
import { DeleteIcon, Heart, Trash2Icon } from "lucide-react";
import api from "../../utils/axios";

const BlogCard = ({ blog, isMine = false }) => {
  const [isFullImages, setIsFullImages] = useState(false);
  const [isHeart, setIsHeart] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const handleViewImages = () => {
    setIsFullImages((prev) => !prev);
  };

  const handleHeartClick = async () => {
    const newState = !isHeart;
    setIsHeart(newState);
    blog.likeCount += newState ? 1 : -1;

    try {
      await api.post(`/api/${blog.eblogId}/like`);
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsHeart(!newState);
      blog.likeCount += newState ? -1 : 1;
    }
  };

  const handleDeleteAction = async() => {
    try {
      console.log(blog.eblogId)
      await api.delete(`/api/delete-employee-blog/${blog.eblogId}`)
    } catch (error) {
      console.error(error)
    }
  }


  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const { data } = await api.get(`/api/${blog.eblogId}/is-liked`);
        setIsHeart(data.liked);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };
    fetchLikeStatus();
  }, [blog.eblogId]);


  return (
    <section className="rounded-lg p-5 xl:p-8 flex flex-col gap-6 border border-gray-100">
      <ModalFullImages
        viewFull={isFullImages}
        handleViewFull={handleViewImages}
        images={blog.images}
      />
      <section className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12">
            <img
              src={blog.userPic}
              alt={blog.firstName}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <p className="font-avenir-black">
              {blog.firstName} {blog.lastName}
            </p>
            <span className="text-xss text-gray-500">{blog.date}</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
         {isMine ? (<Trash2Icon className="w-5 h-5 text-red-600 cursor-pointer mx-2" onClick={handleDeleteAction}/>): null} 
          <Link
          to={`blog/${blog.eblogId}/${toSlug(blog.title)}`}
          state={{ previousPage: location.pathname }}
        >
          <ArrowUpRightIcon className="w-7 h-7 text-primary cursor-pointer" />
        </Link>
        
        </div>
        
      </section>
      <section>
        <h3 className="font-avenir-black">{blog.title}</h3>
        <p dangerouslySetInnerHTML={{ __html: blog.description}}/>
      </section>
      <section className="grid grid-cols-4 grid-row grid-rows-2 gap-4">

        <div className="col-start-1 col-end-3 row-start-1 row-end-3">
          <img
            src={blog.images[0]}
            className="w-full h-full object-cover rounded-md cursor-pointer"
            onClick={handleViewImages}
          />
        </div>
        <div className="col-start-3 col-end-4 row-start-1 row-end-2">
          <img
            src={blog.images[1]}
            className="w-full h-full object-cover rounded-md"
            onClick={handleViewImages}
          />
        </div>
        <div className="ol-start-3 col-end-4 row-start-2 row-end-3 cursor-pointer">
          <img
            src={blog.images[2]}
            className="w-full h-full object-cover rounded-md"
            onClick={handleViewImages}
          />
        </div>
        <div className="grid-start-4 grid-end-5 row-start-1 row-end-3">
          <img
            src={blog.images[3]}
            className="w-full h-full object-cover rounded-md cursor-pointer"
            onClick={handleViewImages}
          />
        </div>
      </section>
      <section className="flex gap-3">
        <button className="flex gap-3 cursor-pointer" onClick={handleHeartClick}>
          {
            isHeart ? 
            <HeartIcon className="w-5 h-5 text-red-400 "/>
            :
            <Heart className="w-5 h-5 text-gray-400 " />
          }
          
          <span className="text-gray-500">{blog.likeCount}</span>
        </button>
          <Link
          to={`blog/${blog.eblogId}/${toSlug(blog.title)}`}
          state={{ previousPage: location.pathname }}
          className="flex gap-3 cursor-pointer no-underline "
        >
           <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500 ">{blog.commentCount}</span>
        </Link>
         
      </section>
    </section>
  );
};

export default BlogCard;

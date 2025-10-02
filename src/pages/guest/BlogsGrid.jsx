import React from "react";
import { useNavigate } from "react-router-dom";
import MotionUp from "../../components/animated/MotionUp";
import BigTile from "../../components/blog/guest/BigTile";
import SmallTile from "../../components/blog/guest/SmallTile";
import ComingSoon from "../admin/ComingSoon";

// Wrapper ensures consistent padding across layouts
const Wrapper = ({ children }) => (
  <div className="px-4 md:px-8 lg:px-16 xl:px-24 mb-12">{children}</div>
);

// 1 Blog Layout
const SingleLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <MotionUp>
      <BigTile {...blogs[0]} onClick={onBlogClick} />
    </MotionUp>
  </Wrapper>
);

// 2 Blogs Layout
const TwoLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {blogs.map((b, i) => (
        <MotionUp key={b.blogId || i}>
          <BigTile {...b} onClick={onBlogClick} />
        </MotionUp>
      ))}
    </div>
  </Wrapper>
);

// 3 Blogs Layout
const ThreeLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} onClick={onBlogClick} />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 4 Blogs Layout
const FourLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} onClick={onBlogClick} />
      </MotionUp>
      <div className="flex flex-col gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 5 Blogs Layout - Simplified
const FiveLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} onClick={onBlogClick} />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 6 Blogs Layout - Simplified Grid
const SixLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(0, 2).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <BigTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.slice(2).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 7 Blogs Layout - Clean Magazine Style
const SevenLayout = ({ blogs, onBlogClick }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} onClick={onBlogClick} />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} onClick={onBlogClick} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// BlogGrid Wrapper - Layout based on total count, section for positioning
const BlogGrid = ({ blogs }) => {
  const navigate = useNavigate();

  const handleBlogClick = (blogId) => {
    console.log("Navigating to blog:", blogId);
    navigate(`/blog/${blogId}`);
  };

  if (!blogs || blogs.length === 0) {
    return <ComingSoon />;
  }

  // Filter out hidden blogs (section = -1) and sort by section
  const visibleBlogs = blogs
    .filter(blog => (blog.section ?? 0) !== -1)
    .sort((a, b) => {
      const sectionA = a.section ?? 0;
      const sectionB = b.section ?? 0;
      return sectionA - sectionB;
    });

  if (visibleBlogs.length === 0) {
    return <ComingSoon />;
  }

  const totalCount = visibleBlogs.length;

  switch (totalCount) {
    case 1:
      return <SingleLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 2:
      return <TwoLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 3:
      return <ThreeLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 4:
      return <FourLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 5:
      return <FiveLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 6:
      return <SixLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    case 7:
      return <SevenLayout blogs={visibleBlogs} onBlogClick={handleBlogClick} />;
    default:
      return <ComingSoon />;
  }
};

export default BlogGrid;
import React from "react";
import MotionUp from "../../components/animated/MotionUp";
import BigTile from "../../components/blog/guest/BigTile";
import SmallTile from "../../components/blog/guest/SmallTile";
import ComingSoon from "../admin/ComingSoon";

// Wrapper ensures consistent padding across layouts
const Wrapper = ({ children }) => (
  <div className="px-4 md:px-8 lg:px-16 xl:px-24">{children}</div>
);

// 1 Blog Layout
const SingleLayout = ({ blogs }) => (
  <Wrapper>``
    <MotionUp>
      <BigTile {...blogs[0]} />
    </MotionUp>
  </Wrapper>
);

// 2 Blogs Layout
const TwoLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {blogs.map((b, i) => (
        <MotionUp key={i}>
          <BigTile {...b} />
        </MotionUp>
      ))}
    </div>
  </Wrapper>
);

// 3 Blogs Layout
const ThreeLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 4 Blogs Layout
const FourLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} />
      </MotionUp>
      <div className="flex flex-col gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 5 Blogs Layout
const FiveLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left BigTile */}
      <div className="lg:col-span-2">
        <MotionUp>
          <BigTile {...blogs[0]} />
        </MotionUp>
      </div>

      {/* Right 2 SmallTiles */}
      <div className="flex flex-col gap-6">
        {blogs.slice(1, 3).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>

      {/* Bottom row */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(3).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 6 Blogs Layout
const SixLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left BigTile */}
      <div className="lg:col-span-2">
        <MotionUp>
          <BigTile {...blogs[0]} />
        </MotionUp>
      </div>

      {/* Right 2 SmallTiles */}
      <div className="flex flex-col gap-6">
        {blogs.slice(1, 3).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>

      {/* Bottom row */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.slice(3).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 7 Blogs Layout
const SevenLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-6">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BigTile spans 2 columns */}
        <div className="lg:col-span-2">
          <MotionUp>
            <BigTile {...blogs[0]} />
          </MotionUp>
        </div>

        {/* Right column with 3 SmallTiles stacked */}
        <div className="grid grid-rows-3 gap-6">
          {blogs.slice(1, 4).map((b, i) => (
            <MotionUp key={i}>
              <SmallTile {...b} />
            </MotionUp>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {blogs.slice(4).map((b, i) => (
          <MotionUp key={i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// BlogGrid Wrapper
const BlogGrid = ({ blogs }) => {
  console.log("Rendering BlogGrid with blogs:", blogs);
  switch (blogs.length) {
    case 1:
      return <SingleLayout blogs={blogs} />;
    case 2:
      return <TwoLayout blogs={blogs} />;
    case 3:
      return <ThreeLayout blogs={blogs} />;
    case 4:
      return <FourLayout blogs={blogs} />;
    case 5:
      return <FiveLayout blogs={blogs} />;
    case 6:
      return <SixLayout blogs={blogs} />;
    case 7:
      return <SevenLayout blogs={blogs} />;
    default:
      return <ComingSoon />;
  }
};

export default BlogGrid;

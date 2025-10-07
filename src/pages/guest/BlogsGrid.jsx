
import MotionUp from "../../components/animated/MotionUp";
import BigTile from "../../components/blog/guest/BigTile";
import SmallTile from "../../components/blog/guest/SmallTile";

// Wrapper ensures consistent padding across layouts
const Wrapper = ({ children }) => (
  <div className="px-4 md:px-8 lg:px-16 xl:px-24 mb-12">{children}</div>
);

// 1 Blog Layout
const SingleLayout = ({ blogs }) => (
  <Wrapper>
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
        <MotionUp key={b.blogId || i}>
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
        <BigTile {...blogs[0]}  />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b}  />
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
        <BigTile {...blogs[0]}  />
      </MotionUp>
      <div className="flex flex-col gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 5 Blogs Layout - Simplified
const FiveLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]} />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 6 Blogs Layout - Simplified Grid
const SixLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.slice(0, 2).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <BigTile {...b}  />
          </MotionUp>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.slice(2).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b}  />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

// 7 Blogs Layout - Clean Magazine Style
const SevenLayout = ({ blogs }) => (
  <Wrapper>
    <div className="grid grid-cols-1 gap-8">
      <MotionUp>
        <BigTile {...blogs[0]}  />
      </MotionUp>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.slice(1).map((b, i) => (
          <MotionUp key={b.blogId || i}>
            <SmallTile {...b} />
          </MotionUp>
        ))}
      </div>
    </div>
  </Wrapper>
);

const BlogGrid = ({ blogs }) => {

  const visibleBlogs = blogs
    .filter(blog => (blog.section ?? 0) !== -1)
    .sort((a, b) => {
      const sectionA = a.section ?? 0;
      const sectionB = b.section ?? 0;
      return sectionA - sectionB;
    });

  const totalCount = visibleBlogs.length;

  switch (totalCount) {
    case 1:
      return <SingleLayout blogs={visibleBlogs} />;
    case 2:
      return <TwoLayout blogs={visibleBlogs}  />;
    case 3:
      return <ThreeLayout blogs={visibleBlogs}  />;
    case 4:
      return <FourLayout blogs={visibleBlogs}  />;
    case 5:
      return <FiveLayout blogs={visibleBlogs} />;
    case 6:
      return <SixLayout blogs={visibleBlogs}  />;
    case 7:
      return <SevenLayout blogs={visibleBlogs} />;
    default:
      // return <ComingSoon />;
  }
};

export default BlogGrid;
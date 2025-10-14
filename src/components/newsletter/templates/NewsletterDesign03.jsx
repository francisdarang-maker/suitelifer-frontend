import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ArticleViewDesign from "../ArticleViewDesign";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";
import MotionUp from "../../animated/MotionUp";
import NewsLetterComingSoon from "../NewsLetterComingSoon";

//

import {
  Fallback_article,
  Coming_soon_title,
  Reading_speed,
} from "../Constants";

import useNewsletterData from "../hooks/useNewsletterData";
//
const NewsletterDesign03 = () => {
  const { newsletterContent, isLoading } = useNewsletterData();

  const getArticleBySection = (articles, sectionNumber) =>
    articles.find((article) => article.section === sectionNumber) ||
    Fallback_article;

  const isValidSection = (section) =>
    (section?.title ?? "").toLowerCase() !== Coming_soon_title;

  const formatSectionProps = (section) => ({
    ...section,
    image: section.images?.[0],
    readTime: readingTime(removeHtmlTags(section.article ?? ""), Reading_speed)
      .text,
    datePublished: formatTimestamp(section.createdAt).fullDate,
    author: section.pseudonym,
  });

  const RenderSection = ({ section, clamp }) => {
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;

    return (
      <MotionUp>
        <ArticleViewDesign {...formatSectionProps(section)} lineclamp={clamp} />
        <div className="mt-5">
          <ReadMoreBtn title={section.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const RenderMainSection = ({ section }) => {
    if (!isValidSection(section)) return null;

    return (
      <div className="grid gap-10 mb-12">
        <MotionUp>
          <div>
            <LargeViewDesign01
              {...formatSectionProps(section)}
              article={section.article}
            />
            <div className="mt-5" />
            <ReadMoreBtn title={section.title} id={section.newsletterId} />
          </div>
        </MotionUp>
      </div>
    );
  };

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const sections = [1, 2, 3].map((n) => getArticleBySection(articles, n));
  const [section1, section2, section3] = sections;

  const showContent =
    newsletterContent.currentIssue?.assigned >= 3 &&
    sections.some(isValidSection);

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="pb-[4%]"></div>
        <section className="px-[5%] md:px-[10%]">
          {/* Loading skeleton for 3-article layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* Main featured article */}
            <div className="lg:col-span-2">
              <Skeleton className="w-full aspect-video mb-4" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-24 mb-6" />
            </div>

            {/* Secondary articles */}
            <div>
              <Skeleton className="w-full aspect-[4/3] mb-4" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-10 w-20 mt-4" />
            </div>

            <div>
              <Skeleton className="w-full aspect-[4/3] mb-4" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-10 w-20 mt-4" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!showContent) return <NewsLetterComingSoon />;

  return (
    <section>
      <MotionUp>
        <NewsletterHeader month={currentIssue.month} year={currentIssue.year} />
      </MotionUp>
      <div className="pb-[4%]" />
      <section className="px-[5%] md:px-[10%] xl:w-[80%] xl:mx-auto">
        {/* Section 1 - Main */}
        {isValidSection(section1) && <RenderMainSection section={section1} />}

        {/* Section 2 & 3 - Grid */}
        <div
          className={`gap-10 ${
            isValidSection(section2) && isValidSection(section3)
              ? "grid xl:grid-cols-2"
              : ""
          }`}
        >
          <RenderSection section={section2} clamp="line-clamp-6" />
          <RenderSection section={section3} clamp="line-clamp-6" />
        </div>
      </section>
    </section>
  );
};
export default NewsletterDesign03;

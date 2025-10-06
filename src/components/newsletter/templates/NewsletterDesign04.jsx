import NewsletterHeader from "../NewsletterHeader";
import ArticleViewDesign from "../ArticleViewDesign";
import LargeViewDesign01 from "../LargeViewDesign01";
import ColoredArticleViewDesign from "../ColoredArticleViewDesign";
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
const NewsletterDesign04 = () => {
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

  const RenderColoredSection = ({ section }) => {
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <ColoredArticleViewDesign
          {...formatted}
          article={section.article}
          lineclamp="line-clamp-17 "
        />
        <div className="mt-5" />
        <div className="px-[5%] md:px-0">
          <ReadMoreBtn title={section.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const sections = [1, 2, 3, 4].map((n) => getArticleBySection(articles, n));
  const [section1, section2, section3, section4] = sections;

  const showContent =
    newsletterContent.currentIssue?.assigned >= 4 &&
    sections.some(isValidSection);

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="pb-[4%]"></div>
        <section className="px-[5%] md:px-[10%]">
          {/* Loading skeleton for 4-article layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* 1st row  */}
            <div>
              <Skeleton className="w-full aspect-[4/3] mb-4" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
            </div>
            <div>
              <Skeleton className="w-full aspect-[4/3] mb-4" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
            </div>
            {/*  2nd row*/}
            <div>
              <Skeleton className="w-full aspect-[4/3] mb-4" />
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
            </div>

            <div>
              <Skeleton className="w-full aspect-[10/10] mb-4" />
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

      <section className="px-[5%] md:px-[10%]">
        <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-10 mb-12 xl:w-[80%] xl:mx-auto">
          {[section1, section2, section3].map((section, index) => (
            <div key={index} className="w-full">
              <RenderSection section={section} clamp="line-clamp-6" />
            </div>
          ))}

          {isValidSection(section4) && (
            <div
              className={`w-full ${
                !isValidSection(section3) ? "xl:col-span-2" : "xl:col-span-1"
              }`}
            >
              <RenderColoredSection section={section4} />
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default NewsletterDesign04;

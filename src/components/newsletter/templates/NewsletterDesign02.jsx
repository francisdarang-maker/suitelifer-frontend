import NewsletterHeader from "../NewsletterHeader";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";
import MotionUp from "../../animated/MotionUp";
import ArticleViewDesign from "../ArticleViewDesign";
import NewsLetterComingSoon from "../NewsLetterComingSoon";
//

import {
  Fallback_article,
  Coming_soon_title,
  Reading_speed,
} from "../Constants";

import useNewsletterData from "../hooks/useNewsletterData";
//

//

const NewsletterDesign02 = () => {
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
  //

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const section1 = getArticleBySection(articles, 1);
  const section2 = getArticleBySection(articles, 2);

  const showContent =
    newsletterContent.currentIssue?.assigned >= 2 &&
    (isValidSection(section1) || isValidSection(section2));

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="pb-[4%]" />

        <section className="px-[5%] md:px-[10%]">
          <div className="md:flex md:gap-10 mb-10">
            {/* Main Article */}
            <div className="md:w-[66%]">
              <Skeleton className="w-full aspect-video mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-24 mt-4" />
            </div>
            <div className="md:w-[66%]">
              <Skeleton className="w-full aspect-video mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-24 mt-4" />
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

      <section
        className={`mb-10 grid gap-10 px-[5%] xl:px-[10%] ${
          isValidSection(section2) ? "xl:grid-cols-2" : "xl:grid-cols-1"
        }`}
      >
        <RenderSection section={section1} />
        <RenderSection section={section2} clamp="line-clamp-6" />
      </section>
    </section>
  );
};

export default NewsletterDesign02;

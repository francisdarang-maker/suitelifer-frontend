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
  Coming_soon_title,
  Fallback_article,
  Reading_speed,
} from "../Constants";
import useNewsletterData from "../hooks/useNewsletterData";

const NewsletterDesign01 = () => {
  //

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

  //

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
  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};
  const section1 = getArticleBySection(articles, 1);

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="pb-[4%]" />
        <MotionUp>
          <section className="px-[5%] md:px-[10%]">
            <div className="md:w-[66%] mx-auto">
              <Skeleton className="w-full aspect-video mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-24 mt-6" />
            </div>
          </section>
        </MotionUp>
      </div>
    );
  }

  if (
    newsletterContent.currentIssue?.assigned !== 1 ||
    !isValidSection(section1)
  ) {
    return <NewsLetterComingSoon />;
  }

  return (
    <section>
      <MotionUp>
        <NewsletterHeader month={currentIssue.month} year={currentIssue.year} />
      </MotionUp>
      <div className="pb-[4%]" />
      <section className="md:flex md:gap-30 md:px-[5%] md:justify-center xl:flex xl:flex-row xl:px-[10%] mb-10">
        <div className="px-[5%] md:px-0 md:w-[66%]">
          <RenderSection section={section1} />
        </div>
      </section>
    </section>
  );
};

export default NewsletterDesign01;

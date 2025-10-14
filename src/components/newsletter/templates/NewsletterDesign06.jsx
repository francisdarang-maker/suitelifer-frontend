import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ArticleViewDesign from "../ArticleViewDesign";
import ColoredArticleViewDesign from "../ColoredArticleViewDesign";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import Divider from "../Divider";
import MotionUp from "../../animated/MotionUp";
import ArticlePreviewWithHyphenation from "../ArticlePreviewWithHyphenation";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";

//
import {
  Fallback_article,
  Coming_soon_title,
  Reading_speed,
} from "../Constants";

import useNewsletterData from "../hooks/useNewsletterData";
import NewsLetterComingSoon from "../NewsLetterComingSoon";
//
const NewsletterDesign06 = () => {
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

  const RenderHeroSection = ({ section }) => {
    if (!isValidSection(section)) return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <LargeViewDesign01 {...formatted} article={section.article} />
        <div className="mt-5" />
        <ReadMoreBtn title={section.title} id={section.newsletterId} />
      </MotionUp>
    );
  };

  const RenderStackedArticle = ({
    section,
    clamp = "line-clamp-6",
    withDivider = false,
  }) => {
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <div className="w-[90%]">
          {withDivider && <Divider />}
          <ArticleViewDesign
            {...formatted}
            article={section.article}
            lineclamp={clamp}
          />
          <div className="mt-5" />
          <ReadMoreBtn title={section.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const RenderSidebarPreview = ({ section }) => {
    if (!isValidSection(section)) return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <div className="mb-10">
          <p className="font-avenir-black text-h6 line-clamp-2">
            {formatted.title}
          </p>
          <p className="text-small pb-3 pt-1">
            <span className="text-primary">{formatted.author}</span>
            <span className="text-gray-400">&nbsp; |</span>
            <span className="text-primary">
              &nbsp;&nbsp;{formatted.readTime}
            </span>
            <span className="text-gray-400">&nbsp; |</span>
            <span className="text-primary">
              &nbsp;&nbsp;{formatted.datePublished}
            </span>
          </p>
          <div className="line-clamp-10 text-body text-justify text-gray-500">
            <ArticlePreviewWithHyphenation content={section.article} />
          </div>
          <div className="mt-5" />
          <ReadMoreBtn title={formatted.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const RenderColoredSidebar = ({ section, clamp = "line-clamp-12" }) => {
    if (!isValidSection(section)) return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <ColoredArticleViewDesign
          {...formatted}
          article={section.article}
          lineclamp={clamp}
        />
        <div className="mt-5" />
        <ReadMoreBtn title={section.title} id={section.newsletterId} />
      </MotionUp>
    );
  };

  const RenderFinalSidebarArticle = ({ section, clamp = "line-clamp-8" }) => {
    if (!isValidSection(section)) return null;

    const formatted = formatSectionProps(section);

    return (
      <MotionUp>
        <div className="mt-10">
          <Divider />
          <ArticleViewDesign
            {...formatted}
            article={section.article}
            lineclamp={clamp}
          />
          <div className="mt-5" />
          <ReadMoreBtn title={section.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const sections = [1, 2, 3, 4, 5, 6].map((n) =>
    getArticleBySection(articles, n)
  );
  const [section1, section2, section3, section4, section5, section6] = sections;
  const showContent =
    newsletterContent.currentIssue?.assigned >= 6 &&
    sections.some(isValidSection);

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="px-[5%] md:px-[10%]">
          <Skeleton className="w-full aspect-video mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-10 w-24 mb-6" />
        </div>
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

      <section className="md:flex md:gap-10 md:px-[10%] xl:px-[10%] mb-10">
        {/* LEFT COLUMN */}
        <div className="px-[5%] md:px-0 md:w-[66%]">
          <MotionUp>
            {/* HERO STORY */}
            <RenderHeroSection section={section1} />

            {/* TWO ARTICLES SIDE-BY-SIDE */}
            <div className="md:flex gap-5 mt-10">
              <RenderStackedArticle section={section2} withDivider />
              <RenderStackedArticle section={section3} clamp="line-clamp-7" />
            </div>
          </MotionUp>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="pt-10 px-[5%] md:w-[34%] md:p-0">
          {/* Article 4 */}
          <RenderSidebarPreview section={section4} />

          {/* Article 5 */}
          <RenderColoredSidebar section={section5} />

          {/* Article 6 */}
          <RenderFinalSidebarArticle section={section6} />
        </div>
      </section>
    </section>
  );
};

export default NewsletterDesign06;

import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ArticleViewDesign from "../ArticleViewDesign";
import ColoredArticleViewDesign from "../ColoredArticleViewDesign";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import Divider from "../Divider";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";
import MotionUp from "../../animated/MotionUp";
import ArticlePreviewWithHyphenation from "../ArticlePreviewWithHyphenation";

//
import useNewsletterData from "../hooks/useNewsletterData";

import {
  Fallback_article,
  Coming_soon_title,
  Reading_speed,
} from "../Constants";
//
const NewsletterDesign07 = () => {
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
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;
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
        <div className="flex-1">
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
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;
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
          <div className="line-clamp-17 text-body text-justify text-gray-500">
            <ArticlePreviewWithHyphenation content={section.article} />
          </div>
          <div className="mt-5" />
          <ReadMoreBtn title={formatted.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const RenderColoredSidebar = ({
    section,
    clamp = "md:line-clamp-17 lg:line-clamp-17 xl:line-clamp-25",
  }) => {
    if (!section || (section?.title ?? "").toLowerCase() === Coming_soon_title)
      return null;
    const formatted = formatSectionProps(section);
    return (
      <MotionUp>
        <ColoredArticleViewDesign
          {...formatted}
          article={section.article}
          lineclamp={clamp}
        />
        <div className="mt-5" />
        <div className="px-[5%] md:px-0">
          <ReadMoreBtn title={section.title} id={section.newsletterId} />
        </div>
      </MotionUp>
    );
  };

  const RenderSplitArticlePair = ({ leftSection, rightSection }) => {
    if (!leftSection || !rightSection) return null;
    const left = formatSectionProps(leftSection);
    const right = formatSectionProps(rightSection);
    return (
      <section className="mt-[4%]">
        <div className="px-[5%] md:px-[10%] xl:px-[10%]">
          <MotionUp>
            <div className="w-full h-full flex flex-col md:flex-row justify-end bg-primary/15 rounded-lg p-[5%] lg:p-[3%]">
              <div className="flex flex-col md:flex-row gap-4 md:gap-10 xl:w-[60%]">
                {left.image && (
                  <img
                    className="size-[242px] hidden w-full xl:block aspect-video xl:aspect-square object-cover rounded-lg"
                    src={left.image}
                    alt=""
                  />
                )}
                <div>
                  <p className="font-avenir-black text-h6 line-clamp-2">
                    {left.title}
                  </p>
                  <p className="text-small pb-3 pt-1">
                    <span className="text-primary">{left.author}</span>
                    <span className="text-gray-400">&nbsp; |</span>
                    <span className="text-primary">
                      &nbsp;&nbsp;{left.readTime}
                    </span>
                    <span className="text-gray-400">&nbsp; |</span>
                    <span className="text-primary">
                      &nbsp;&nbsp;{left.datePublished}
                    </span>
                  </p>
                  <div className="line-clamp-4 text-body text-justify text-gray-500">
                    <ArticlePreviewWithHyphenation
                      content={leftSection.article}
                    />
                  </div>
                  <div className="mt-5" />
                  <ReadMoreBtn
                    title={left.title}
                    id={leftSection.newsletterId}
                  />
                </div>
              </div>
              <div className="md:hidden">
                <Divider />
              </div>
              <div className="hidden md:block">
                <div className="px-10 h-full flex flex-col items-center">
                  <div className="size-[1.3vh] bg-primary rounded-full" />
                  <div className="bg-primary h-full w-[0.25vh]" />
                  <div className="size-[1.3vh] bg-primary rounded-full" />
                </div>
              </div>
              <div className="xl:w-[40%]">
                <p className="font-avenir-black text-h6 line-clamp-2">
                  {right.title}
                </p>
                <p className="text-small pb-3 pt-1">
                  <span className="text-primary">{right.author}</span>
                  <span className="text-gray-400">&nbsp; |</span>
                  <span className="text-primary">
                    &nbsp;&nbsp;{right.readTime}
                  </span>
                  <span className="text-gray-400">&nbsp; |</span>
                  <span className="text-primary">
                    &nbsp;&nbsp;{right.datePublished}
                  </span>
                </p>
                <div className="line-clamp-4 text-body text-justify text-gray-500">
                  <ArticlePreviewWithHyphenation
                    content={rightSection.article}
                  />
                </div>
                <div className="mt-5" />
                <ReadMoreBtn
                  title={right.title}
                  id={rightSection.newsletterId}
                />
              </div>
            </div>
          </MotionUp>
        </div>
      </section>
    );
  };

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const sections = [1, 2, 3, 4, 5, 6, 7].map((n) =>
    getArticleBySection(articles, n)
  );
  const [section1, section2, section3, section4, section5, section6, section7] =
    sections;
  const showContent =
    newsletterContent.currentIssue?.assigned == 7 &&
    sections.some(isValidSection);

  if (isLoading) {
    return (
      <div>
        <NewsletterHeader />
        <div className="pb-[4%]"></div>
        <section className="px-[5%] md:px-[10%]">
          <div className="md:flex md:gap-10 mb-10">
            <div className="md:w-[66%]">
              <Skeleton className="w-full aspect-video mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-24 mb-6" />
              <div className="md:flex gap-10">
                <div className="md:w-[50%]">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-10 w-20 mt-4" />
                </div>
                <div className="mt-10 md:mt-0 md:w-[50%]">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-10 w-20 mt-4" />
                </div>
              </div>
            </div>
            <div className="md:w-[34%]">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-10 w-20 mt-4" />
              <div className="my-5" />
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="h-10 w-20 mt-4" />
              <Skeleton className="h-150 w-full rounded-lg mt-10" />
            </div>
          </div>
          <div className="w-full  rounded-lg p-5 flex flex-col md:flex-row gap-6">
            <Skeleton className="w-[242px] h-[242px] rounded-lg hidden xl:block" />
            <div className="flex-1">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-10 w-20 mt-4" />
            </div>
            <div className="hidden md:block h-full w-px bg-primary" />
            <div className="flex-1">
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

  return (
    <section>
      <MotionUp>
        <NewsletterHeader month={currentIssue.month} year={currentIssue.year} />
      </MotionUp>
      <div className="pb-[4%]" />

      <section className="md:flex md:gap-10 md:px-[10%] xl:px-[10%] mb-10">
        {/* LEFT COLUMN */}
        <div className="px-[5%] md:px-0 md:w-[66%]">
          <RenderHeroSection section={section1} />
          <div className="md:flex gap-10 mt-10">
            <RenderStackedArticle section={section2} withDivider />
            <RenderStackedArticle section={section3} clamp="line-clamp-7" />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="pt-10 px-[5%] md:w-[34%] md:p-0">
          <RenderSidebarPreview section={section4} />
          <RenderColoredSidebar section={section5} />
        </div>
      </section>

      {/* SPLIT ARTICLE PAIR */}
      <RenderSplitArticlePair leftSection={section6} rightSection={section7} />
    </section>
  );
};

export default NewsletterDesign07;

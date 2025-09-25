import { useEffect } from "react";
import api from "../../../utils/axios";
import newsletterStore from "../../../store/stores/newsletterStore";
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

const NewsletterDesign06 = () => {
  const { newsletterContent, setNewsletterContent, isLoading, setIsLoading } =
    newsletterStore();

  useEffect(() => {
    const fetchIssueAndArticles = async () => {
      try {
        const issueRes = await api.get("api/issues/current");
        const current = issueRes.data?.currentIssue ?? null;

        if (!current) {
          setNewsletterContent({ articles: [], currentIssue: null });
          return;
        }

        const articlesRes = await api.get(
          `/api/newsletter?issueId=${current.issueId}`
        );

        setNewsletterContent({
          articles: articlesRes.data?.newsletters ?? [],
          currentIssue: current,
        });
      } catch (error) {
        console.error("Error fetching issue/articles:", error.message);
        setNewsletterContent({ articles: [], currentIssue: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueAndArticles();
  }, [setNewsletterContent, setIsLoading]);

  const getArticleBySection = (articles, sectionNumber) => {
    return (
      articles.find((article) => article.section === sectionNumber) || {
        title: "Coming Soon",
        article: "This section is being prepared. Stay tuned!",
        pseudonym: "FullSuite Team",
        createdAt: new Date().toISOString(),
        newsletterId: "",
        images: [],
      }
    );
  };

  const articles = newsletterContent.articles || [];
  const currentIssue = newsletterContent.currentIssue || {};

  const section1 = getArticleBySection(articles, 1);
  const section2 = getArticleBySection(articles, 2);
  const section3 = getArticleBySection(articles, 3);
  const section4 = getArticleBySection(articles, 4);
  const section5 = getArticleBySection(articles, 5);
  const section6 = getArticleBySection(articles, 6);

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

  return (
    <section>
      <MotionUp>
        <NewsletterHeader
          month={currentIssue.month}
          year={currentIssue.year}
        />
      </MotionUp>
      <div className="pb-[4%]"></div>

      <section className="md:flex md:gap-10 md:px-[10%] xl:px-[10%] mb-10">
        {/* LEFT COLUMN */}
        <div className="px-[5%] md:px-0 md:w-[66%]">
          <MotionUp>
            {/* HERO STORY */}
            <LargeViewDesign01
              image={section1.images[0]}
              title={section1.title}
              author={section1.pseudonym}
              readTime={
                readingTime(removeHtmlTags(section1.article ?? ""), 238).text
              }
              datePublished={formatTimestamp(section1.createdAt).fullDate}
              article={section1.article}
            />
            <div className="mt-5"></div>
            <ReadMoreBtn
              href={""}
              title={section1.title}
              id={section1.newsletterId}
            />

            {/* TWO ARTICLES SIDE-BY-SIDE */}
            <div className="md:flex gap-10 mt-10">
              <div className="md:w-[50%]">
                <Divider />
                <ArticleViewDesign
                  image={section2.images[0]}
                  title={section2.title}
                  author={section2.pseudonym}
                  readTime={
                    readingTime(removeHtmlTags(section2.article ?? ""), 238).text
                  }
                  datePublished={formatTimestamp(section2.createdAt).fullDate}
                  article={section2.article}
                  lineclamp="line-clamp-6"
                />
                <div className="mt-5"></div>
                <ReadMoreBtn
                  href={""}
                  title={section2.title}
                  id={section2.newsletterId}
                />
              </div>

              <div className="mt-10 md:mt-0 md:w-[50%]">
                <ArticleViewDesign
                  image={section3.images[0]}
                  title={section3.title}
                  author={section3.pseudonym}
                  readTime={
                    readingTime(removeHtmlTags(section3.article ?? ""), 238).text
                  }
                  datePublished={formatTimestamp(section3.createdAt).fullDate}
                  article={section3.article}
                  lineclamp="line-clamp-7"
                />
                <div className="mt-5"></div>
                <ReadMoreBtn
                  href={""}
                  title={section3.title}
                  id={section3.newsletterId}
                />
              </div>
            </div>
          </MotionUp>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="pt-10 px-[5%] md:w-[34%] md:p-0">
          {/* Article 4 */}
          <MotionUp>
            <div className="mb-10">
              <p className="font-avenir-black text-h6 line-clamp-2">
                {section4.title}
              </p>
              <p className="text-small pb-3 pt-1">
                <span className="text-primary">{section4.pseudonym}</span>
                <span className="text-gray-400">&nbsp; |</span>
                <span className="text-primary">
                  &nbsp;&nbsp;
                  {readingTime(removeHtmlTags(section4.article ?? ""), 238).text}
                </span>
                <span className="text-gray-400">&nbsp; |</span>
                <span className="text-primary">
                  &nbsp;&nbsp;{formatTimestamp(section4.createdAt).fullDate}
                </span>
              </p>
              <div className="line-clamp-10 text-body text-justify text-gray-500">
                <ArticlePreviewWithHyphenation content={section4.article} />
              </div>
              <div className="mt-5"></div>
              <ReadMoreBtn
                href={""}
                title={section4.title}
                id={section4.newsletterId}
              />
            </div>
          </MotionUp>

          {/* Article 5 */}
          <MotionUp>
            <ColoredArticleViewDesign
              title={section5.title}
              author={section5.pseudonym}
              readTime={
                readingTime(removeHtmlTags(section5.article ?? ""), 238).text
              }
              datePublished={formatTimestamp(section5.createdAt).fullDate}
              article={section5.article}
              lineclamp="line-clamp-12"
            />
            <div className="mt-5"></div>
            <ReadMoreBtn
              href={""}
              title={section5.title}
              id={section5.newsletterId}
            />
          </MotionUp>

          {/* Article 6 */}
          <MotionUp>
            <div className="mt-10">
              <Divider />
              <ArticleViewDesign
                image={section6.images[0]}
                title={section6.title}
                author={section6.pseudonym}
                readTime={
                  readingTime(removeHtmlTags(section6.article ?? ""), 238).text
                }
                datePublished={formatTimestamp(section6.createdAt).fullDate}
                article={section6.article}
                lineclamp="line-clamp-8"
              />
              <div className="mt-5"></div>
              <ReadMoreBtn
                href={""}
                title={section6.title}
                id={section6.newsletterId}
              />
            </div>
          </MotionUp>
        </div>
      </section>
    </section>
  );
};

export default NewsletterDesign06;

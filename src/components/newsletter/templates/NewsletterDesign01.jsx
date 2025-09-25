import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import { useEffect } from "react";
import api from "../../../utils/axios";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";
import newsletterStore from "../../../store/stores/newsletterStore";
import MotionUp from "../../animated/MotionUp";

const NewsletterDesign01 = () => {
  const { newsletterContent, setNewsletterContent, isLoading, setIsLoading } =
    newsletterStore();

  useEffect(() => {
    const fetchIssueAndArticles = async () => {
      try {
        const issueRes = await api.get("api/issues/current");
        const current = issueRes.data?.currentIssue ?? null;

        console.log("Current Issue:", current);

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
        setNewsletterContent({ articles: [], currentIssue: null }); // fallback
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

  return (
    <div>
      {isLoading ? (
        <div>
          {" "}
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
            <div className="w-full bg-primary/10 rounded-lg p-5 flex flex-col md:flex-row gap-6">
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
      ) : newsletterContent.currentIssue?.assigned === 1 ? (
        <section>
          <MotionUp>
            <NewsletterHeader
              month={currentIssue.month}
              year={currentIssue.year}
            />
          </MotionUp>
          <div className="pb-[4%]"></div>

          {/* Contents */}
          <section className="md:flex md:gap-10 md:px-[10%] xl:px-[10%] mb-10">
            <div className="px-[5%] md:px-0 md:w-[66%]">
              <MotionUp>
                <div className="w-[100%]">
                  {/* MAIN */}
                  <LargeViewDesign01
                    image={section1.images[0]}
                    title={section1.title}
                    author={section1.pseudonym}
                    readTime={
                      readingTime(
                        removeHtmlTags(section1.article ?? "article"),
                        238
                      ).text
                    }
                    datePublished={formatTimestamp(section1.createdAt).fullDate}
                    article={section1.article}
                  />
                  <div className="mt-5 md:m-0"></div>
                  <ReadMoreBtn
                    href={""}
                    title={section1.title}
                    id={section1.newsletterId}
                  />
                  <div className="md:mb-5"></div>
                </div>
              </MotionUp>
            </div>
          </section>
        </section>
      ) : null}
    </div>
  )
}

export default NewsletterDesign01

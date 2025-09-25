import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ArticleViewDesign from "../ArticleViewDesign";
import ColoredArticleViewDesign from "../ColoredArticleViewDesign";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import NewsletterArticles from "../NewsletterArticles";
import Divider from "../Divider";
import { useState, useEffect } from "react";
import api from "../../../utils/axios";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import TwoCirclesLoader from "../../../assets/loaders/TwoCirclesLoader";
import Skeleton from "react-loading-skeleton";
import newsletterStore from "../../../store/stores/newsletterStore";
import MotionUp from "../../animated/MotionUp";
import ArticlePreviewWithHyphenation from "../ArticlePreviewWithHyphenation";

const NewsletterDesign03 = () => {
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
  const section2 = getArticleBySection(articles, 2);
  const section3 = getArticleBySection(articles, 3);

  return (
    <div>
      {isLoading ? (
        <div>
          <NewsletterHeader />
          <div className="pb-[4%]"></div>
          <section className="px-[5%] md:px-[10%]">
            {/* Loading skeleton for 4-article layout */}
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

            {/* Fourth article in colored section */}
            <div className="w-full bg-primary/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="md:col-span-2">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-10 w-20 mt-4" />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : newsletterContent.currentIssue?.assigned >= 3 ? (
        <section>
          <MotionUp>
            <NewsletterHeader
              month={currentIssue.month}
              year={currentIssue.year}
            />
          </MotionUp>
          <div className="pb-[4%]"></div>

          {/* Main Content Grid - Optimized for 4 Articles */}
          <section className="px-[5%] md:px-[10%]">
            <div className="grid grid-cols-1 gap-10 mb-12">
              {/* Featured Article - Full Width */}
              <MotionUp>
                <div>
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
                  <div className="mt-5"></div>
                  <ReadMoreBtn
                    href={""}
                    title={section1.title}
                    id={section1.newsletterId}
                  />
                </div>
              </MotionUp>
            </div>

            {/* Second Article */}
            <div className="grid grid-cols-1 lg:grid-cols-2 col-span-2 gap-10">
              <MotionUp>
                <div>
                  <ArticleViewDesign
                    title={section2.title}
                    author={section2.pseudonym}
                    image={section2.images[0]}
                    readTime={
                      readingTime(
                        removeHtmlTags(section2.article ?? "article"),
                        238
                      ).text
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
              </MotionUp>

              {/* Third Article */}
              <MotionUp>
                <div>
                  <ArticleViewDesign
                    image={section3.images[0]}
                    title={section3.title}
                    author={section3.pseudonym}
                    readTime={
                      readingTime(
                        removeHtmlTags(section3.article ?? "article"),
                        238
                      ).text
                    }
                    datePublished={formatTimestamp(section3.createdAt).fullDate}
                    article={section3.article}
                    lineclamp="line-clamp-6"
                  />
                  <div className="mt-5"></div>
                  <ReadMoreBtn
                    href={""}
                    title={section3.title}
                    id={section3.newsletterId}
                  />
                </div>
              </MotionUp>
            </div>
          </section>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 min-h-[60vh]">
          <h1 className="text-3xl md:text-5xl font-avenir-black mb-4">
            📬 Your Next Big Read Is On Its Way!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl">
            We're putting the final touches on something special. Fresh stories,
            insights, and updates will be landing here very soon —{" "}
            <span className="font-avenir-black text-primary">
              stay excited!
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsletterDesign03;

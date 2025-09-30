import NewsletterHeader from "../NewsletterHeader";
import LargeViewDesign01 from "../LargeViewDesign01";
import ArticleViewDesign from "../ArticleViewDesign";
import ColoredArticleViewDesign from "../ColoredArticleViewDesign";
import ReadMoreBtn from "../../buttons/ReadMoreBtn";
import { useState, useEffect } from "react";
import api from "../../../utils/axios";
import { readingTime } from "reading-time-estimator";
import { removeHtmlTags } from "../../../utils/removeHTMLTags";
import formatTimestamp from "../../../utils/formatTimestamp";
import Skeleton from "react-loading-skeleton";
import newsletterStore from "../../../store/stores/newsletterStore";
import MotionUp from "../../animated/MotionUp";

const NewsletterDesign04 = () => {
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
  const section4 = getArticleBySection(articles, 4);

  const titles = [
    section1?.title,
    section2?.title,
    section3?.title,
    section4?.title,
  ].filter(Boolean);

  const allComingSoon = titles.every((title) => title === "Coming Soon");

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
      ) : newsletterContent.currentIssue?.assigned >= 4 && !allComingSoon ? (
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
            <div className=" grid lg:grid-cols-2 xl:grid-cols-2 gap-10 mb-12 w-[80%] mx-auto">
              {/* Featured Article - Full Width */}

              {section1.title !== "Coming Soon" && (
                <MotionUp>
                  <div className={`lg:col-span-2 w-full`}>
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
                      datePublished={
                        formatTimestamp(section1.createdAt).fullDate
                      }
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
              )}
              {/* Second Article */}
              {section2.title !== "Coming Soon" && (
                <MotionUp>
                  <div
                    className={`w-full ${
                      section1.title === "Coming Soon"
                        ? "xl:col-span-2"
                        : "xl:col-span-1"
                    }`}
                  >
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
                      datePublished={
                        formatTimestamp(section2.createdAt).fullDate
                      }
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
              )}

              {/* Third Article */}
              {section3.title !== "Coming Soon" && (
                <div
                  className={`w-full ${
                    section4.title === "Coming Soon"
                      ? "xl:col-span-2"
                      : "xl:col-span-1"
                  }`}
                >
                  <MotionUp>
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
                      datePublished={
                        formatTimestamp(section3.createdAt).fullDate
                      }
                      article={section3.article}
                      lineclamp="line-clamp-6"
                    />
                    <div className="mt-5"></div>
                    <ReadMoreBtn
                      href={""}
                      title={section3.title}
                      id={section3.newsletterId}
                    />
                  </MotionUp>{" "}
                </div>
              )}
              {/* COLORED ARTICLE */}
              {section4.title !== "Coming Soon" && (
                <div
                  className={`w-full  ${
                    section3.title === "Coming Soon"
                      ? "xl:col-span-2"
                      : "xl:col-span-1"
                  }`}
                >
                  <MotionUp>
                    <ColoredArticleViewDesign
                      title={section4.title}
                      author={section4.pseudonym}
                      readTime={
                        readingTime(
                          removeHtmlTags(section4.article ?? "article"),
                          238
                        ).text
                      }
                      datePublished={
                        formatTimestamp(section4.createdAt).fullDate
                      }
                      article={section4.article}
                      lineclamp="md:line-clamp-17 lg:line-clamp-17 xl:line-clamp-25"
                    />
                    <div className="mt-5"></div>
                    <div className="px-[5%] md:px-0">
                      <ReadMoreBtn
                        href={""}
                        title={section4.title}
                        id={section4.newsletterId}
                      />
                    </div>
                  </MotionUp>
                </div>
              )}
            </div>
          </section>
        </section>
      ) : (
        <NewsLetterComingSoon />
      )}
    </div>
  );
};

export default NewsletterDesign04;

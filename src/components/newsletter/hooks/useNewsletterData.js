import { useEffect } from "react";
import api from "../../../utils/axios";
import newsletterStore from "../../../store/stores/newsletterStore";

const useNewsletterData = () => {
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
        setNewsletterContent({ articles: [], currentIssue: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueAndArticles();
  }, [setNewsletterContent, setIsLoading]);

  return { newsletterContent, isLoading };
};

export default useNewsletterData;

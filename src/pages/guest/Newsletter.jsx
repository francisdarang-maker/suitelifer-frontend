import MobileNav from "../../components/home/MobileNav";
import TabletNav from "../../components/home/TabletNav";
import DesktopNav from "../../components/home/DesktopNav";
import Footer from "../../components/footer/Footer";
import BackToTop from "../../components/buttons/BackToTop";

import NewsletterDesign07 from "../../components/newsletter/templates/NewsletterDesign07";
import NewsletterDesign01 from "../../components/newsletter/templates/NewsletterDesign01";
import NewsletterDesign02 from "../../components/newsletter/templates/NewsletterDesign02";
import NewsletterDesign03 from "../../components/newsletter/templates/NewsletterDesign03";
import NewsletterDesign04 from "../../components/newsletter/templates/NewsletterDesign04";
import NewsletterDesign05 from "../../components/newsletter/templates/NewsletterDesign05";
import NewsletterDesign06 from "../../components/newsletter/templates/NewsletterDesign06";
import NewsletterDesign07 from "../../components/newsletter/templates/NewsletterDesign07";

import PageMeta from "../../components/layout/PageMeta";

import { useLocation } from "react-router-dom";

//added for conditional rendering
import newsletterStore from "../../store/stores/newsletterStore";
import NoNewsletter from "../../components/newsletter/NoNewsletter";

const Newsletter = () => {
  const location = useLocation();
  const { newsletterContent } = newsletterStore();

  const assigned = newsletterContent.currentIssue?.assigned ?? 1;

  // map assigned number to the corresponding template
  const templates = {
    1: <NewsletterDesign01 />,
    2: <NewsletterDesign02 />,
    3: <NewsletterDesign03 />,
    4: <NewsletterDesign04 />,
    5: <NewsletterDesign05 />,
    6: <NewsletterDesign06 />,
    7: <NewsletterDesign07 />,
  };

  // fallback if assigned is missing or >7
  const SelectedTemplate = templates[assigned] || <NoNewsletter />;

  return (
    <section
      className="gap-4 h-dvh"
      style={{ maxWidth: "2000px", margin: "0 auto", padding: "0 0rem" }}
    >
      <PageMeta
        title="Newsletter - Suitelifer"
        desc="Stay informed with company news, product launches, and industry insights from Fullsuite."
        isDefer={false}
        url={location.pathname}
      />

      {/* NAVS */}
      <div className="sm:hidden">
        <MobileNav />
      </div>
      <div className="tablet-nav">
        <TabletNav />
      </div>
      <div className="desktop-nav">
        <DesktopNav />
      </div>

      <main className="lg:my-20 mb-20">
        {SelectedTemplate}
      </main>

      <BackToTop />
      <Footer />
    </section>
  );
};

export default Newsletter;

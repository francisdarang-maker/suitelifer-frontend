// Refactored Podcast.jsx - Much cleaner and more maintainable!

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

// Layout Components
import MobileNav from "../../components/home/MobileNav";
import TabletNav from "../../components/home/TabletNav";
import DesktopNav from "../../components/home/DesktopNav";
import Footer from "../../components/footer/Footer";
import BackToTop from "../../components/buttons/BackToTop";
import PageMeta from "../../components/layout/PageMeta";

// Reusable Components
import PageHero from "../../components/podcast/PageHero";
import ContactInfoCard from "../../components/podcast/ContactInfoCard";
import ContactForm from "../../components/podcast/ContactForm";
import EpisodesModal from "../../components/podcast/EpisodesModal";
import EpisodesGrid from "../../components/podcast/EpisodesGrid";
import PlaylistsSection from "../../components/podcast/PlaylistsSection";

// Loaders
import LoadingLargeSpotify from "../../components/loader/LoadingLargeSpotify";
import LoadingSmallSpotify from "../../components/loader/LoadingSmallSpotify";

// Assets
import bgBlogs from "../../assets/images/blogs-text-bg.svg";
import ComingSoon from "../../assets/images/coming-soon.gif";

// Utils
import api from "../../utils/axios";

const Podcast = () => {
  const location = useLocation();

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal and Sorting States
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [isLoadingAllEpisodes, setIsLoadingAllEpisodes] = useState(false);

  // Content States
  const [isSpotifyLoading, setSpotifyIsLoading] = useState(true);
  const [spotifyEpisodes, setEpisodes] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    websiteEmail: "",
    websiteTel: "",
    websitePhone: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Form Handlers
  const resetForm = () => {
    setFullName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!fullName || !email || !subject || !message) {
        toast.error("Please fill in all fields.");
        return;
      }

      const receiver_email = contactDetails.websiteEmail;
      const response = await api.post("/api/send-inquiry-email", {
        fullName,
        receiver_email,
        sender_email: email,
        subject,
        message,
        type: "podcast",
      });

      if (response?.data?.isSuccess) {
        resetForm();
        toast.success("Message sent successfully!");
      } else {
        toast.error(
          response?.data?.message || "Something went wrong. Try again."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send message. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Functions
  const fetchThreeLatestEpisodes = async () => {
    try {
      setSpotifyIsLoading(true);
      const response = await api.get("/api/spotify/latest-three");

      if (
        response.data.threeLatestEpisodes &&
        response.data.threeLatestEpisodes.length > 0
      ) {
        setEpisodes(response.data.threeLatestEpisodes);
      } else {
        setEpisodes([]);
      }
    } catch (err) {
      console.error("Error fetching episodes:", err);
      setEpisodes([]);
    } finally {
      setSpotifyIsLoading(false);
    }
  };

  const fetchAllEpisodes = async () => {
    try {
      setIsLoadingAllEpisodes(true);
      const response = await api.get("/api/spotify/episodes?embedType=EPISODE");
      const episodesData = response.data.data || response.data.episodes || [];
      setAllEpisodes(episodesData);
    } catch (err) {
      console.error("Error fetching all episodes:", err);
      setAllEpisodes(spotifyEpisodes);
    } finally {
      setIsLoadingAllEpisodes(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/api/spotify/playlists");

      if (response.data.playlists && response.data.playlists.length > 0) {
        setPlaylists(response.data.playlists);
      } else {
        setPlaylists([]);
      }
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setPlaylists([]);
    }
  };

  const fetchContact = async () => {
    try {
      const response = await api.get("/api/contact");
      setContactDetails(response.data.contact);
    } catch (err) {
      console.log("Unable to fetch Contacts", err);
    }
  };

  // Modal Handlers
  const handleViewAllEpisodes = async () => {
    setShowModal(true);
    await fetchAllEpisodes();
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  // Sorted Episodes for Modal
  const sortedAllEpisodes = [...allEpisodes].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0);
    const dateB = new Date(b.created_at || b.createdAt || 0);

    if (sortOrder === "latest") {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  // Effects
  useEffect(() => {
    fetchThreeLatestEpisodes();
    fetchPlaylists();
    fetchContact();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <section className="gap-4" style={{ maxWidth: "2000px", margin: "0 auto" }}>
      <PageMeta
        title="Podcast - Suitelifer"
        desc="Tune in to engaging stories, startup insights, and career talk on the Suitelifer Podcast."
        isDefer={false}
        url={location.pathname}
      />

      {/* Navigation */}
      <div className="sm:hidden">
        <MobileNav />
      </div>
      <div className="tablet-nav">
        <TabletNav />
      </div>
      <div className="desktop-nav">
        <DesktopNav />
      </div>

      {/* Hero Section */}
      <PageHero
        title1="the suite"
        title2="spot"
        subtitle="where ideas spark and stories thrive."
        bgImage={bgBlogs}
      />

      {/* Podcast Content */}
      <main className="px-[5%] md:px-[10%] xl:px-[15%]">
        {isLoaded && (
          <section className="mt-15">
            {/* Loading State */}
            {isSpotifyLoading ? (
              <section className="px-[5%] md:px-[10%] lg:px-[15%]">
                <div className="sm:hidden flex flex-col gap-4">
                  <LoadingLargeSpotify />
                  <LoadingSmallSpotify />
                  <LoadingSmallSpotify />
                </div>
                <div className="hidden sm:flex gap-4">
                  <div className="w-1/2">
                    <LoadingLargeSpotify />
                  </div>
                  <div className="w-1/2 flex flex-col justify-center gap-4">
                    <LoadingSmallSpotify />
                    <LoadingSmallSpotify />
                  </div>
                </div>
              </section>
            ) : (
              <>
                {/* Episodes Section */}
                {spotifyEpisodes.length > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <p className="text-2xl font-avenir-black text-primary">
                        {spotifyEpisodes.length === 1
                          ? "Latest Podcast Episode"
                          : "Latest Podcast Episodes"}
                      </p>
                      <button
                        onClick={handleViewAllEpisodes}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-avenir-black text-sm"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                        View All Episodes
                      </button>
                    </div>

                    <EpisodesGrid spotifyEpisodes={spotifyEpisodes} />
                  </>
                ) : (
                  <>
                    {isLoaded &&
                      spotifyEpisodes.length < 1 &&
                      playlists.length < 1 && (
                        <div className="flex justify-center pt-20">
                          <img
                            src={ComingSoon}
                            alt="coming soon gif"
                            className="pointer-events-none"
                          />
                        </div>
                      )}
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* Playlists Section */}
        <PlaylistsSection playlists={playlists} />
      </main>

      {/* Episodes Modal */}
      <EpisodesModal
        showModal={showModal}
        setShowModal={setShowModal}
        isLoadingAllEpisodes={isLoadingAllEpisodes}
        sortedAllEpisodes={sortedAllEpisodes}
        sortOrder={sortOrder}
        toggleSortOrder={toggleSortOrder}
      />

      {/* Contact Section */}
      <section id="inquiry">
        <div className="h-30"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <ContactInfoCard
            contactDetails={contactDetails}
            fadeInUp={fadeInUp}
            isLoaded={isLoaded}
          />
          <ContactForm
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            subject={subject}
            setSubject={setSubject}
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
            loading={loading}
            fadeInUp={fadeInUp}
            isLoaded={isLoaded}
          />
        </div>
      </section>

      <div className="h-30"></div>
      <BackToTop />
      <Footer />
    </section>
  );
};

export default Podcast;

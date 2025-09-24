import React, { useState, useEffect, useRef } from "react";
import "./style.css";

// Import images
import eventsTitle from "./img/events-title.png";
import firesideTitle from "./img/fireside-title.png";
import chairs from "./img/Chairs.png";
import drjerry from "./img/drjerry.png";
import alex from "./img/alex.png";
import fb from "./img/fb.png";
import ig from "./img/ig.png";
import spotify from "./img/spotify.png";
import linkedin from "./img/linkedin.png";
import web from "./img/web.png";

import MotionUp from "../../../components/animated/MotionUp";
import { ChevronDown, ChevronUp } from "lucide-react";

const FirechatEvent = () => {
    const [countdown, setCountdown] = useState("00d 00h 00m 00s");
    const [currentSection, setCurrentSection] = useState(0);

    // 🔹 Refs for all sections
    const topRef = useRef(null);
    const countdownRef = useRef(null);
    const speakersRef = useRef(null);
    const socialRef = useRef(null);

    const sections = [topRef, countdownRef, speakersRef, socialRef];

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const targetTime = new Date(`${currentYear}-10-10T16:00:00`).getTime();

        let timerInterval;

        function updateCountDown() {
            const now = new Date().getTime();
            const distance = targetTime - now;

            if (distance <= 0) {
                setCountdown("00d 00h 00m 00s");
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown(
                `${String(days).padStart(2, "0")}d ${String(hours).padStart(
                    2,
                    "0"
                )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
            );
        }

        updateCountDown();
        timerInterval = setInterval(updateCountDown, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    const handleRegisterClick = () => {
        window.open(
            "https://docs.google.com/forms/d/e/1FAIpQLSfhlCvbRQ9yRT5lMyLSuisEmn9EymPcg3bQ6o7CEGoBEMp1Ww/viewform?usp=header",
            "_blank",
            "noopener,noreferrer"
        );
    };

    // 🔹 Smooth scroll
    const scrollToSection = (index) => {
        sections[index]?.current?.scrollIntoView({ behavior: "smooth" });
        setCurrentSection(index);
    };

    // 🔹 Handle button click
    const handleScrollClick = () => {
        if (currentSection < sections.length - 1) {
            scrollToSection(currentSection + 1);
        } else {
            scrollToSection(0); // loop back to top
        }
    };

    return (
        <div className="firechat-event" ref={topRef}>
            <MotionUp delay={0.1}>
                <img src={eventsTitle} alt="Events Title" className="events-title-img" draggable="false" />
            </MotionUp>

            <MotionUp delay={0.2}>
                <h2>PRESENTS</h2>
            </MotionUp>

            <MotionUp delay={0.3}>
                <div className="fireside-title-container">
                    <img src={firesideTitle} alt="Event Logo" className="event-logo" draggable="false" />
                </div>
            </MotionUp>

            <>
                <button
                    className="register-btn animate-[fancyBounce_0.6s_ease-out_1] delay-[800ms]"
                    onClick={handleRegisterClick}
                >
                    Register Here
                </button>
            </>

            <MotionUp delay={0.3}>
                <div className="chairs-container">
                    <img src={chairs} alt="Event Logo" className="event-logo" draggable="false" />
                </div>
            </MotionUp>

            <div className="orangebg"></div>
            <div className="greenbg"></div>

            <div ref={countdownRef}>
                <MotionUp delay={0.2}>
                    <h2>EVENT STARTS IN</h2>
                </MotionUp>

                <MotionUp delay={0.3}>
                    <h1 className="event-countDown">{countdown}</h1>
                </MotionUp>

                <MotionUp delay={0.4}>
                    <h2 className="event-date">October 10, 2025</h2>
                </MotionUp>
            </div>

            <MotionUp delay={0.5}>
                <div className="divider">
                    <div className="circle opacity-16"></div>
                    <div className="circle opacity-40"></div>
                    <div className="circle opacity-77"></div>
                    <div className="center-bar"></div>
                    <div className="circle opacity-77"></div>
                    <div className="circle opacity-40"></div>
                    <div className="circle opacity-16"></div>
                </div>
            </MotionUp>

            <div ref={speakersRef}>
                <MotionUp delay={0.2}>
                    <h1>Keynote Speakers</h1>
                </MotionUp>

                <MotionUp delay={0.8}>
                    <div className="speaker-container">
                        <img src={drjerry} alt="Speaker" className="speaker-img" draggable="false" />
                        <div className="speaker-info">
                            <MotionUp delay={0.3}>
                                <h3 className="speaker-name">
                                    <span className="speaker-orange">Dr. Jerry</span> Talton
                                </h3>
                            </MotionUp>
                            <MotionUp delay={0.3}>
                                <h6 className="speaker-title">
                                    CTO (Carta), Machine Learning Lead (Slack), Former Founder (Apropose)
                                </h6>
                            </MotionUp>
                            <MotionUp delay={0.4}>
                                <p className="speaker-bio">
                                    Talton is a Research Assistant Professor at the Siebel School of Computing and Data Science,
                                    specializing in machine learning and human-computer interaction. Previously, he was CTO at Carta,
                                    leading their engineering team and driving data and machine learning initiatives.
                                    Before that, he was the first Engineering Manager for Search, Learning, & Intelligence
                                    at Slack and founded Apropose, a VC-backed data-driven design startup.
                                </p>
                            </MotionUp>
                        </div>
                    </div>
                </MotionUp>

                <MotionUp delay={1.0}>
                    <div className="speaker-container-right">
                        <img src={alex} alt="Speaker" className="speaker-img-right" draggable="false" />
                        <div className="speaker-info-right">
                            <MotionUp delay={0.3}>
                                <h3 className="speaker-name-right">
                                    <span className="speaker-orange-right">Alex</span> Owen-Baird
                                </h3>
                            </MotionUp>
                            <MotionUp delay={0.3}>
                                <h6 className="speaker-title-right">
                                    Head of Bus Dev (Aumni), VP Digital Private Market (JP Morgan), Head of GTM
                                    (Lumonic), Investmen Analyst (Epic Ventures)
                                </h6>
                            </MotionUp>
                            <MotionUp delay={0.4}>
                                <p className="speaker-bio-right">
                                    Baird is a growth leader currently driving AI and operations at FullSuite,
                                    specializing in Human-in-the-Loop data services. He has strong experience in sales
                                    and digital private markets, with past roles at J.P. Morgan, Aumni, and Lumonic.
                                    Baird’s background also includes venture capital and finance,
                                    including leadership at EPIC Ventures and analyst roles at Wells Fargo.
                                </p>
                            </MotionUp>
                        </div>
                    </div>
                </MotionUp>
            </div>

            <div ref={socialRef}>
                <MotionUp delay={0.2}>
                    <h2>Curious about us?</h2>
                </MotionUp>

                <div className="social-row">
                    <MotionUp delay={0.6}>
                        <a href="https://www.facebook.com/thefullsuitepod" target="_blank" rel="noopener noreferrer">
                            <img src={fb} alt="Facebook" className="social-icon" draggable="false" />
                        </a>
                    </MotionUp>
                    <MotionUp delay={0.8}>
                        <a href="https://www.instagram.com/thefullsuitepod/" target="_blank" rel="noopener noreferrer">
                            <img src={ig} alt="Instagram" className="social-icon" draggable="false" />
                        </a>
                    </MotionUp>
                    <MotionUp delay={1}>
                        <a href="https://open.spotify.com/show/4RkvO7uRfuCow52vKjutPj?si=2ac49945fdd14152" target="_blank" rel="noopener noreferrer">
                            <img src={spotify} alt="Spotify" className="social-icon" draggable="false" />
                        </a>
                    </MotionUp>
                    <MotionUp delay={1.2}>
                        <a href="https://www.linkedin.com/company/fullsuite" target="_blank" rel="noopener noreferrer">
                            <img src={linkedin} alt="LinkedIn" className="social-icon" draggable="false" />
                        </a>
                    </MotionUp>
                    <MotionUp delay={1.4}>
                        <a href="https://getfullsuite.com/" target="_blank" rel="noopener noreferrer">
                            <img src={web} alt="Web" className="social-icon" draggable="false" />
                        </a>
                    </MotionUp>
                </div>
            </div>

            {/* 🔹 Floating scroll button */}
            <button className="scroll-toggle-btn" onClick={handleScrollClick}>
                {currentSection < sections.length - 1 ? (
                    <ChevronDown size={32} />
                ) : (
                    <ChevronUp size={32} />
                )}
            </button>
        </div>
    );
};

export default FirechatEvent;

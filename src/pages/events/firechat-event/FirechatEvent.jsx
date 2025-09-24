import React, { useEffect } from "react";
import "./style.css";
// Import images
import bg from "./img/bg.jpg";
import firesideTitle from "./img/fireside-title.png";
import eventsTitle from "./img/events-title.png";
import divider from "./img/divider.png";
import alex from "./img/alex.png";
import drjerry from "./img/drjerry.png";
import scalable from "./img/scalable.png";
import from0to100 from "./img/From 0 to 100_.png";
import howToBuild from "./img/How to build an investable startup.png";
import fb from "./img/fb.png";
import ig from "./img/ig.png";
import linkedin from "./img/linkedin.png";
import spotify from "./img/spotify.png";
import rectangle21 from "./img/Rectangle 21.png";
import rectangle22 from "./img/Rectangle 22.png";
import chairs from "./img/Chairs.png";

// If countDown.js contains logic for a countdown, refactor as a hook or inline logic here
// For now, placeholder for countdown

const FirechatEvent = () => {
  useEffect(() => {
    // TODO: Implement countdown logic from countDown.js here
  }, []);

  return (
    <div className="firechat-event-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="firechat-event-container">
        <img src={firesideTitle} alt="Fireside Title" className="fireside-title" />
        <img src={eventsTitle} alt="Events Title" className="events-title" />
        <img src={divider} alt="Divider" className="divider" />
        {/* Speakers Section */}
        <div className="speakers">
          <div className="speaker">
            <img src={alex} alt="Alex" />
            <div className="speaker-info">
              <h3>Alex</h3>
              {/* Add more info as needed */}
            </div>
          </div>
          <div className="speaker">
            <img src={drjerry} alt="Dr Jerry" />
            <div className="speaker-info">
              <h3>Dr Jerry</h3>
              {/* Add more info as needed */}
            </div>
          </div>
        </div>
        {/* Topics Section */}
        <div className="topics">
          <img src={scalable} alt="Scalable" />
          <img src={from0to100} alt="From 0 to 100" />
          <img src={howToBuild} alt="How to build an investable startup" />
        </div>
        {/* Social Links */}
        <div className="social-links">
          <a href="#"><img src={fb} alt="Facebook" /></a>
          <a href="#"><img src={ig} alt="Instagram" /></a>
          <a href="#"><img src={linkedin} alt="LinkedIn" /></a>
          <a href="#"><img src={spotify} alt="Spotify" /></a>
        </div>
        {/* Decorative Images */}
        <img src={rectangle21} alt="Rectangle 21" className="rectangle" />
        <img src={rectangle22} alt="Rectangle 22" className="rectangle" />
        <img src={chairs} alt="Chairs" className="chairs" />
        {/* Countdown placeholder */}
        <div className="countdown">
          {/* Countdown logic will go here */}
        </div>
      </div>
    </div>
  );
};

export default FirechatEvent;

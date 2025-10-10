// ContactInfoCard.jsx - Original Theme
import React from 'react';
import emailicon from '../../assets/icons/envelope.svg';
import tphoneicon from '../../assets/icons/mobile-button.svg';
import phoneicon from '../../assets/icons/phone-flip.svg';

const ContactInfoCard = ({ contactDetails }) => {
  return (
    <div
      className="relative p-8 pr-8 md:pr-16 rounded-tr-xl rounded-br-xl text-white mr-4 md:min-h-[500px] justify-center items-center flex flex-col 
              w-[98%] md:w-[60%] lg:w-[60%] xl:w-[50%] max-w-[90%] xl:max-w-[60%]"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-secondary rounded-tr-xl rounded-br-xl"></div>
      <div className="relative z-10">
        <p className="font-avenir-black text-white-300 text-h3">
          Join in on the conversation.
          <br />
          Reach out to us!
        </p>
        <p className="text-white text-body"></p>

        <div className="group mt-6 space-y-5 text-white font-avenir-back text-body">
          <p className="flex items-center gap-4">
            <img
              src={emailicon}
              alt="Email"
              className="w-5 h-5 mb-1 filter invert"
            />
            <div className="flex">
              <a
                href={`mailto:${contactDetails.websiteEmail}`}
                className="hover:text-accent-2 transition-colors no-underline!"
              >
                {contactDetails.websiteEmail}
              </a>
            </div>
          </p>
          <p className="flex items-center gap-4">
            <img
              src={phoneicon}
              alt="Phone"
              className="w-5 h-5 mb-1 filter invert"
            />
            <a
              href={`tel:${contactDetails.websiteTel}`}
              className="hover:text-accent-2 transition-colors no-underline!"
            >
              {contactDetails.websiteTel}
            </a>
          </p>
          <p className="flex items-center gap-4">
            <img
              src={tphoneicon}
              alt="Mobile"
              className="w-5 h-5 mb-1 filter invert"
            />
            <a
              href={`tel:${contactDetails.websitePhone}`}
              className="hover:text-accent-2 transition-colors no-underline!"
            >
              {contactDetails.websitePhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
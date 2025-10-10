// ContactForm.jsx - Original Theme
import React from 'react';
import TwoCirclesLoader from '../../assets/loaders/TwoCirclesLoader';

const ContactForm = ({
  fullName,
  setFullName,
  email,
  setEmail,
  subject,
  setSubject,
  message,
  setMessage,
  handleSubmit,
  loading
}) => {
  return (
    <div className="p-8 w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-small">
            Full Name<span className="text-primary">*</span>
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            type="text"
            className="text-accent-2 w-full p-3 border-none rounded-md bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-small">
            Email Address<span className="text-primary">*</span>
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="text-accent-2 w-full p-3 border-none rounded-md bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-small">
            Subject<span className="text-primary">*</span>
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            type="text"
            className="text-accent-2 w-full p-3 border-none rounded-md bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-small">
            Message<span className="text-primary">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="4"
            className="w-full p-3 border-none rounded-md bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-secondary placeholder-accent-2/50 text-accent-2"
            placeholder="Type your message here"
          ></textarea>
        </div>
        <button
          disabled={loading}
          className={`w-full font-avenir-black text-small text-white py-3 rounded-md transition bg-secondary 
             ${
               loading
                 ? "cursor-not-allowed"
                 : "hover:bg-secondary/90 cursor-pointer"
             }`}
          type="submit"
        >
          {loading ? (
            <div className="mx-auto w-fit">
              <TwoCirclesLoader
                bg={"transparent"}
                color1={"#0097B2"}
                color2={"#ffffff"}
                width={"135"}
                height={"24"}
              />
            </div>
          ) : (
            "SEND MESSAGE"
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
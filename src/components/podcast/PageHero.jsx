import React from 'react';
import { motion } from 'framer-motion';
import AnimatedText from '../guest-blogs/AnimatedText';

const PageHero = ({ title1, title2, subtitle, bgImage }) => {
  return (
    <section className="pt-[10%] xl:pt-[8%] relative">
      {bgImage && (
        <img
          className="hidden -z-50 absolute w-[90%] transform translate-y-5 -translate-x-6 lg:-translate-y-10 xl:-translate-y-15 lg:-translate-x-15 xl:-translate-x-40 opacity-90"
          src={bgImage}
          alt=""
        />
      )}
      <div className="grid grid-cols-2 items-center">
        <div className="flex items-center justify-end">
          <div
            className="absolute bg-primary h-15 md:h-25 w-[49.7%] rounded-br-2xl rounded-tr-2xl"
            style={{
              animation: "slideInFromLeft 0.8s ease-out forwards",
              left: 0,
            }}
          ></div>
          <AnimatedText text={title1} color="white" />
        </div>
        <AnimatedText text={title2} color="black" />
      </div>

      {subtitle && (
        <div className="text-center mt-3 md:mt-5">
          <p className="text-gray-400 text-small">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear", delay: 1 }}
              className="overflow-hidden whitespace-nowrap inline-block"
            >
              {subtitle}
            </motion.span>
          </p>
        </div>
      )}
    </section>
  );
};

export default PageHero;
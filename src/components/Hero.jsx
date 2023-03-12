import React from 'react';

const Hero = ({ title, description, children, className }) => {
  return (
    <div className={`section-hero ${className}`}>
      <div className="shell">
        <div className="section-hero__content">
          { title && <h1 className="section-hero__title">{ title }</h1> }

          { description && <div className="section-hero__entry">{ description }</div> }

          { children && <div className="section-hero__actions">{ children }</div> }
        </div>
      </div>
    </div>
  );
};

export default Hero;

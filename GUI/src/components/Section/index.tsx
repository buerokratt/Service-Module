import React, { forwardRef, PropsWithChildren } from 'react';

import './Section.scss';

const Section = forwardRef<HTMLElement, PropsWithChildren>(({ children }, ref) => {
  return (
    <section ref={ref} className="section">
      {children}
    </section>
  );
});

Section.displayName = 'section';

export default Section;

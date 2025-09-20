
import React from 'react';

interface PageFooterProps {
  pageNumber: string | number;
}

const PageFooter: React.FC<PageFooterProps> = ({ pageNumber }) => {
  return (
    <div className="absolute bottom-4 right-8 font-serif text-sm text-text-secondary">
      {pageNumber}
    </div>
  );
};

export default PageFooter;
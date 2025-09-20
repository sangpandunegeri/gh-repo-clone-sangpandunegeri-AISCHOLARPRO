import React from 'react';

const SaveIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-4 4-4-4H8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
    </svg>
);

export default SaveIcon;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-space-lg text-center my-auto min-h-[50vh]">
      <div className="w-16 h-16 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary mb-space-md">
        <span className="material-symbols-outlined text-[36px]">search_off</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-primary font-bold">Page Not Found</h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2 mb-space-lg">
        The destination you are looking for has been diverted or relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

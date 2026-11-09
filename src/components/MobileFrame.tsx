import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileFrame?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-screen bg-[#07090E] flex items-center justify-center overflow-hidden">
      {/* Real app viewport container */}
      <div className="w-full h-full sm:max-w-[460px] sm:h-[94vh] bg-[#0B0E14] sm:rounded-3xl sm:border sm:border-white/10 flex flex-col overflow-hidden relative shadow-2xl">
        {children}
      </div>
    </div>
  );
};

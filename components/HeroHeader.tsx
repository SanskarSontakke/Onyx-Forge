import React from 'react';

export const HeroHeader: React.FC = () => {
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl border border-indigo-500">
            A
          </div>
          <h1 className="text-xl font-bold text-white">
            AdGenius Pro
          </h1>
        </div>
        <div className="text-sm text-gray-400 hidden sm:block">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </header>
  );
};
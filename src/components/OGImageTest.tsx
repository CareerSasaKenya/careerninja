"use client";

import React, { useState } from 'react';

const OGImageTest: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const generateImage = () => {
    if (jobId) {
      const url = `/api/og/job/${jobId}`;
      setImageUrl(url);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OG Image Test</h1>
      
      <div className="mb-6">
        <label htmlFor="jobId" className="block text-sm font-medium mb-2">
          Job ID or Slug
        </label>
        <input
          type="text"
          id="jobId"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter job ID or slug"
        />
        <button
          onClick={generateImage}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate OG Image
        </button>
      </div>

      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated OG Image</h2>
          <img 
            src={imageUrl} 
            alt="Generated OG" 
            className="border rounded-lg shadow-lg"
            width={1200}
            height={630}
          />
        </div>
      )}
    </div>
  );
};

export default OGImageTest;
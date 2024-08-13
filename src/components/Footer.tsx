import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-neon-blue py-6 mt-8">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-4 md:space-y-0 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm">&copy; {new Date().getFullYear()} Suntram Digital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

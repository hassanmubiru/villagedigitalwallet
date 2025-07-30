import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'full';
  variant?: 'icon' | 'horizontal' | 'main';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'main',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'medium':
        return 'w-16 h-16';
      case 'large':
        return 'w-32 h-32';
      case 'full':
        return 'w-full h-auto';
      default:
        return 'w-16 h-16';
    }
  };

  const getLogoPath = () => {
    switch (variant) {
      case 'icon':
        return '/favicon.svg';
      case 'horizontal':
        return '/logo-horizontal.svg';
      case 'main':
      default:
        return '/logo.svg';
    }
  };

  const getAltText = () => {
    return 'Village Digital Wallet - Bridging Traditional Finance with Blockchain Technology';
  };

  return (
    <img
      src={getLogoPath()}
      alt={getAltText()}
      className={`${getSizeClasses()} ${className}`}
      loading="lazy"
    />
  );
};

// Logo with text component for headers
export const LogoWithText: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Logo size="medium" variant="main" />
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Village Digital Wallet
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Powered by Celo Blockchain
        </p>
      </div>
    </div>
  );
};

// Simple icon-only logo for mobile nav
export const LogoIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <Logo size="small" variant="icon" className={className} />;
};

export default Logo;

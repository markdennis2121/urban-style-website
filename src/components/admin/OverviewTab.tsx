
import React from 'react';
import StatsCards from './StatsCards';
import OnlineUsers from './OnlineUsers';

interface OverviewTabProps {
  usersCount: number;
  productsCount: number;
  messagesCount: number;
  wishlistsCount: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  usersCount,
  productsCount,
  messagesCount,
  wishlistsCount
}) => {
  return (
    <div className="space-y-6">
      <StatsCards 
        usersCount={usersCount}
        productsCount={productsCount}
        messagesCount={messagesCount}
        wishlistsCount={wishlistsCount}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineUsers />
        <div className="space-y-4">
          {/* Additional widgets can be added here */}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;

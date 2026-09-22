import { StatCards } from '@/components/dashboard/StatCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentDonationsFeed } from '@/components/dashboard/RecentDonationsFeed';
import { TopDonorsLeaderboard } from '@/components/dashboard/TopDonorsLeaderboard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Core Financial KPI Cards (एकूण जमा, एकूण खर्च, शिल्लक, रोख vs बँक) */}
      <StatCards />

      {/* 2. Quick Action Center & WhatsApp Daily Broadcast */}
      <QuickActions />

      {/* 3. Live Feeds & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Live Recent Donations Stream */}
        <div className="lg:col-span-7 space-y-4">
          <RecentDonationsFeed />
        </div>

        {/* Right Column: Top Donors Leaderboard & Expense Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <TopDonorsLeaderboard />
          <ExpenseChart />
        </div>
      </div>
    </div>
  );
}

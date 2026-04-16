import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Wallet, 
  MonitorPlay, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  isWalletConnected: boolean;
  connectedServices: string[];
  isTracking: boolean;
}

const mockStats = {
  totalMinutesWatched: 247,
  totalPaid: 12.456, // ALGO
  avgPerMinute: 0.08, // ALGO per minute
  thisMonth: {
    minutes: 89,
    cost: 7.12 // ALGO
  },
  videos: [
    { title: 'Video 1', minutes: 156, cost: 4.68, earnings: 0 },
    { title: 'Video 2', minutes: 91, cost: 2.73, earnings: 0 },
    { title: 'Video 3', minutes: 0, cost: 0, earnings: 15.23 },
    { title: 'Video 4', minutes: 0, cost: 0, earnings: 8.45 }
  ]
};

export function Dashboard({ isWalletConnected, connectedServices, isTracking }: DashboardProps) {
  if (!isWalletConnected) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Connect your cryptocurrency wallet to start tracking viewing time and processing micro-payments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectedServices.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MonitorPlay className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Welcome to StreamCryptoPayment</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start watching videos to see your viewing activity and ALGO token transactions here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="flex items-center gap-3 py-4">
          <MonitorPlay className="h-5 w-5 text-teal-600" />
          <div>
            <p className="font-medium text-teal-800">StreamCryptoPayment Dashboard</p>
            <p className="text-sm text-teal-700">
              Track your video viewing activity and ALGO token earnings/spending.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalMinutesWatched}</div>
            <p className="text-xs text-muted-foreground">
              All time watching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalPaid} ALGO</div>
            <p className="text-xs text-muted-foreground">
              Total spent watching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Minute</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.avgPerMinute} ALGO</div>
            <p className="text-xs text-muted-foreground">
              Average per minute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.thisMonth.minutes}m</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.thisMonth.cost} ALGO spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Video Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Video Activity</CardTitle>
          <CardDescription>
            Your video watching and earning activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.videos.map((video, index) => (
              <div
                key={video.title}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MonitorPlay className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.minutes > 0 ? `${video.minutes} minutes watched` : 'Creator content'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {video.cost > 0 ? (
                    <>
                      <p className="font-medium text-red-600">-{video.cost} ALGO</p>
                      <p className="text-sm text-muted-foreground">Spent watching</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-green-600">+{video.earnings} ALGO</p>
                      <p className="text-sm text-muted-foreground">Earned from views</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest viewing sessions and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'watch', video: 'Video 1', duration: '45 minutes', amount: '4.5 ALGO', time: '2 hours ago', isEarning: false },
              { type: 'watch', video: 'Video 2', duration: '23 minutes', amount: '1.84 ALGO', time: '5 hours ago', isEarning: false },
              { type: 'earn', video: 'Video 3', duration: '72 minutes viewed', amount: '3.6 ALGO', time: 'Yesterday', isEarning: true }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Badge variant={activity.isEarning ? "default" : "outline"}>
                    {activity.isEarning ? 'Earned' : 'Watched'}
                  </Badge>
                  <div>
                    <span className="text-sm font-medium">{activity.video}</span>
                    <p className="text-xs text-muted-foreground">{activity.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${activity.isEarning ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.isEarning ? '+' : '-'}{activity.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
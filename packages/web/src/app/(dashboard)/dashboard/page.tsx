'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Metrics {
  totalProjects: number;
  totalTests: number;
  totalExecutions: number;
  passRate: number;
}

interface RecentActivity {
  id: number;
  type: string;
  name: string;
  status: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics>({
    totalProjects: 0,
    totalTests: 0,
    totalExecutions: 0,
    passRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch projects
      const projectsRes = await fetch('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();
      const projects = projectsData.success ? projectsData.data : [];

      // Fetch all tests
      let allTests: any[] = [];
      if (projects.length > 0) {
        const testsPromises = projects.map((project: any) =>
          fetch(`http://localhost:3001/api/projects/${project.id}/tests`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => res.json())
        );
        const testsResults = await Promise.all(testsPromises);
        allTests = testsResults
          .filter(r => r.success)
          .flatMap(r => r.data || []);
      }

      // Fetch executions
      const executionsRes = await fetch('http://localhost:3001/api/executions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const executionsData = await executionsRes.json();
      const executions = executionsData.success ? executionsData.data : [];

      // Calculate metrics
      const passedExecutions = executions.filter((e: any) => e.status === 'PASSED').length;
      const totalExecutions = executions.length;
      const passRate = totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0;

      setMetrics({
        totalProjects: projects.length,
        totalTests: allTests.length,
        totalExecutions: totalExecutions,
        passRate: Math.round(passRate * 10) / 10,
      });

      // Set recent activity (last 5 executions)
      const recent: RecentActivity[] = executions
        .slice(0, 5)
        .map((exec: any) => ({
          id: exec.id,
          type: 'execution',
          name: `Test Execution #${exec.id}`,
          status: exec.status,
          timestamp: exec.startedAt || exec.createdAt,
        }));
      
      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold">{metrics.totalProjects}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tests</h3>
          <p className="text-3xl font-bold">{metrics.totalTests}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Test Executions</h3>
          <p className="text-3xl font-bold">{metrics.totalExecutions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.passRate}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {metrics.totalExecutions > 0 ? 'Based on executions' : 'No data yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toRelativeTimeString || 
                       new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm ${
                      activity.status === 'PASSED' 
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Run your first test to see activity here</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/projects')}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📁 View Projects
            </button>
            <button 
              onClick={() => router.push('/projects')}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              ➕ Create Project
            </button>
            <button 
              onClick={() => router.push('/executions')}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              ▶️ View Executions
            </button>
            <button 
              onClick={() => router.push('/ai-assistant')}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              ✨ AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ANALYTICS_DATA = {
  // Monthly page view data — used by the bar chart (BUG 26: tooltip off-by-one)
  monthlyViews: [
    { month: 'Jan', views: 12400 },
    { month: 'Feb', views: 15800 },
    { month: 'Mar', views: 18200 },
    { month: 'Apr', views: 16500 },
    { month: 'May', views: 22300 },
    { month: 'Jun', views: 28100 },
    { month: 'Jul', views: 25600 },
  ],

  topPages: [
    { page: 'GET /users',    views: 8423, avgTime: '2m 14s' },
    { page: 'Authentication', views: 7891, avgTime: '3m 42s' },
    { page: 'POST /users',   views: 5234, avgTime: '1m 58s' },
    { page: 'Error Codes',   views: 4102, avgTime: '1m 22s' },
    { page: 'Rate Limiting', views: 3876, avgTime: '2m 05s' },
  ],

  topSearches: [
    { query: 'authentication', count: 1204 },
    { query: 'rate limit',     count: 987  },
    { query: 'pagination',     count: 743  },
    { query: 'webhook events', count: 612  },
    { query: 'error codes',    count: 589  },
  ],
}

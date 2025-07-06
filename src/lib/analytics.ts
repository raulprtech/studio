
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { isAnalyticsLive } from './mode';

// MOCK DATA for when analytics is not configured
const mockAnalyticsData = {
    summary: {
        totalUsers: '1,234',
        activeUsers: '57',
        newUsers: '256',
        sessions: '2,456',
    },
    userChartData: [
        { date: 'Jan', users: 400 },
        { date: 'Feb', users: 300 },
        { date: 'Mar', users: 500 },
        { date: 'Apr', users: 200 },
        { date: 'May', users: 800 },
        { date: 'Jun', users: 700 },
    ],
    topPages: [
        { page: '/', views: '10,234' },
        { page: '/products', views: '8,765' },
        { page: '/blog', views: '5,432' },
        { page: '/about', views: '2,109' },
        { page: '/contact', views: '1,876' },
    ]
};

export async function getAnalyticsData() {
    if (!isAnalyticsLive()) {
        console.warn("Analytics not live. Returning mock data.");
        return mockAnalyticsData;
    }

    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    let analyticsDataClient: BetaAnalyticsDataClient;

    try {
        analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }
        });
    } catch (error) {
        console.error('Google Analytics Data API client initialization error:', error);
        console.warn("Returning mock data due to Analytics client initialization error.");
        return mockAnalyticsData;
    }
    
    try {
        const [summaryResponse, userChartResponse, topPagesResponse] = await Promise.all([
            // Summary Cards Data (last 28 days)
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'totalUsers' },
                    { name: 'activeUsers' },
                    { name: 'newUsers' },
                    { name: 'sessions' },
                ],
            }),
            // User Chart Data (last 6 months by month)
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'month' }, { name: 'year' }],
                metrics: [{ name: 'totalUsers' }],
                orderBys: [{ dimension: { orderType: 'NUMERIC', dimensionName: 'year' } }, { dimension: { orderType: 'NUMERIC', dimensionName: 'month' } }]
            }),
            // Top Pages (last 28 days)
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }],
                limit: 5,
                orderBys: [{ metric: { orderType: 'NUMERIC', metricName: 'screenPageViews' }, desc: true }],
            }),
        ]);

        // Process summary data
        const summaryRow = summaryResponse[0].rows?.[0]?.metricValues;
        const summary = {
            totalUsers: Number(summaryRow?.[0]?.value || 0).toLocaleString(),
            activeUsers: Number(summaryRow?.[1]?.value || 0).toLocaleString(),
            newUsers: Number(summaryRow?.[2]?.value || 0).toLocaleString(),
            sessions: Number(summaryRow?.[3]?.value || 0).toLocaleString(),
        };

        // Process user chart data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const userChartData = userChartResponse[0].rows?.map(row => {
            const monthIndex = parseInt(row.dimensionValues?.[0]?.value || '1', 10) - 1;
            return {
                date: monthNames[monthIndex],
                users: Number(row.metricValues?.[0]?.value || 0)
            }
        }) || [];

        // Process top pages
        const topPages = topPagesResponse[0].rows?.map(row => ({
            page: row.dimensionValues?.[0]?.value || 'N/A',
            views: Number(row.metricValues?.[0]?.value || 0).toLocaleString(),
        })) || [];


        return { summary, userChartData, topPages };

    } catch (error) {
        console.error("Error fetching Google Analytics data:", error);
        console.warn("Returning mock data due to Analytics API error.");
        return mockAnalyticsData;
    }
}

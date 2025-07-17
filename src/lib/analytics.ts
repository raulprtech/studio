

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { isFirebaseConfigured } from './firebase-admin';

const emptyAnalyticsData = {
    summary: { totalUsers: '0', activeUsers: '0', newUsers: '0', sessions: '0' },
    userChartData: [],
    topPages: []
};

function isAnalyticsConfigured(): boolean {
    return !!process.env.GOOGLE_ANALYTICS_PROPERTY_ID && isFirebaseConfigured;
}

export async function getAnalyticsData() {
    if (!isAnalyticsConfigured()) {
        console.warn("Analytics is not configured. Returning empty data.");
        return emptyAnalyticsData;
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
        console.error('Error de inicialización del cliente de la API de Google Analytics Data:', String(error));
        console.warn("Devolviendo datos vacíos debido a un error de inicialización del cliente de Analytics.");
        return emptyAnalyticsData;
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
            totalUsers: Number(summaryRow?.[0]?.value || 0).toLocaleString('es-ES'),
            activeUsers: Number(summaryRow?.[1]?.value || 0).toLocaleString('es-ES'),
            newUsers: Number(summaryRow?.[2]?.value || 0).toLocaleString('es-ES'),
            sessions: Number(summaryRow?.[3]?.value || 0).toLocaleString('es-ES'),
        };

        // Process user chart data
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const userChartData = userChartResponse[0].rows?.map(row => {
            const monthIndex = parseInt(row.dimensionValues?.[0]?.value || '1', 10) - 1;
            return {
                date: monthNames[monthIndex],
                users: Number(row.metricValues?.[0]?.value || 0)
            }
        }) || [];

        // Process top pages
        const topPages = topPagesResponse[0].rows?.map(row => ({
            page: row.dimensionValues?.[0]?.value || 'N/D',
            views: Number(row.metricValues?.[0]?.value || 0).toLocaleString('es-ES'),
        })) || [];


        return { summary, userChartData, topPages };

    } catch (error) {
        const errorMessage = String(error);
        // This is a configuration error on the user's side, not a code bug.
        // We provide a helpful warning instead of a generic error.
        if (errorMessage.includes('PERMISSION_DENIED') && errorMessage.includes('analyticsdata.googleapis.com')) {
             console.warn(`
********************************************************************************
** ADVERTENCIA DE CONFIGURACIÓN DE GOOGLE ANALYTICS **
********************************************************************************
La API de Google Analytics Data no está habilitada para tu proyecto o no tienes
los permisos necesarios.

Para solucionarlo, por favor:
1. Asegúrate de que estás usando la cuenta de servicio correcta.
2. Habilita la "Google Analytics Data API" en tu proyecto de Google Cloud en el
   siguiente enlace:
   ${errorMessage.substring(errorMessage.indexOf('https://'))}
3. Si la acabas de habilitar, espera unos minutos para que los cambios se propaguen.

La aplicación continuará funcionando con datos de análisis vacíos en modo real.
********************************************************************************
            `);
        } else {
            console.error("Error al obtener datos de Google Analytics:", errorMessage);
        }
        console.warn("Devolviendo datos vacíos debido a un error de la API de Analytics.");
        return emptyAnalyticsData;
    }
}

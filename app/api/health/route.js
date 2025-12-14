import { NextResponse } from 'next/server';

/**
 * Health Check API Route
 * 
 * This endpoint provides health status information for the application.
 * It's used by Docker health checks and monitoring systems to verify
 * that the application is running correctly.
 * 
 * @returns {NextResponse} JSON response with health status
 */
export async function GET() {
  try {
    // Basic health check - you can add more sophisticated checks here
    // such as database connectivity, external API availability, etc.
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    // Return unhealthy status if there's an error
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 503 }
    );
  }
}

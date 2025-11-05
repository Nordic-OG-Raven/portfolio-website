import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to fetch guest tokens from Superset for embedded dashboards
 * 
 * This endpoint authenticates with Superset and retrieves a guest token
 * that allows public access to embedded dashboards.
 * 
 * Environment variables required:
 * - SUPERSET_DOMAIN: Public URL of your Superset instance
 * - SUPERSET_USERNAME: Superset admin username
 * - SUPERSET_PASSWORD: Superset admin password
 * - SUPERSET_PROVIDER_KEY: Optional, for custom auth providers
 */

interface GuestTokenRequest {
  dashboardUuid?: string;
  dashboardId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GuestTokenRequest = await request.json();
    const { dashboardUuid, dashboardId } = body;

    // Get Superset configuration from environment variables
    // Use 127.0.0.1 instead of localhost to avoid browser security restrictions
    const supersetDomain = process.env.SUPERSET_DOMAIN || process.env.NEXT_PUBLIC_SUPERSET_DOMAIN || 'http://127.0.0.1:8088';
    const supersetUsername = process.env.SUPERSET_USERNAME || 'admin';
    const supersetPassword = process.env.SUPERSET_PASSWORD || 'admin';

    // Step 1: Authenticate with Superset to get access token
    const authResponse = await fetch(`${supersetDomain}/api/v1/security/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: supersetUsername,
        password: supersetPassword,
        provider: 'db',
        refresh: true,
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Superset auth error:', errorText);
      throw new Error(`Superset authentication failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    if (!accessToken) {
      throw new Error('No access token received from Superset');
    }

    // Step 2: Create guest token for the dashboard
    // First, try to get dashboard info to determine UUID
    let dashboardUuidToUse = dashboardUuid;

    if (!dashboardUuidToUse && dashboardId) {
      // Fetch dashboard details to get UUID
      const dashboardResponse = await fetch(
        `${supersetDomain}/api/v1/dashboard/${dashboardId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        dashboardUuidToUse = dashboardData.result?.uuid || dashboardData.result?.dashboard_uuid;
      }
    }

    // Create guest token - must use the embedding UUID, not dashboard ID
    if (!dashboardUuidToUse) {
      throw new Error('Dashboard UUID is required for guest token generation. Make sure embedding is enabled and UUID is provided.');
    }

    const guestTokenResponse = await fetch(
      `${supersetDomain}/api/v1/security/guest_token/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            username: 'guest_user',
            first_name: 'Guest',
            last_name: 'User',
          },
          resources: [
            {
              type: 'dashboard',
              id: dashboardUuidToUse, // Must be the embedding UUID
            },
          ],
          rls: [], // Row Level Security rules (empty for public dashboard)
        }),
      }
    );

    if (!guestTokenResponse.ok) {
      const errorText = await guestTokenResponse.text();
      console.error('Guest token error:', errorText);
      throw new Error(`Failed to create guest token: ${guestTokenResponse.statusText}`);
    }

    const guestTokenData = await guestTokenResponse.json();
    const guestToken = guestTokenData.token;

    if (!guestToken) {
      throw new Error('No guest token received from Superset');
    }

    return NextResponse.json({ guestToken }, { status: 200 });
  } catch (error) {
    console.error('Error fetching guest token:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch guest token',
        details: 'Check server logs for more information',
      },
      { status: 500 }
    );
  }
}


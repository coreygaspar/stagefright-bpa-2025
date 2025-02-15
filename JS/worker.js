// script used to handle requests to the PayPal API via Cloudflare Workers

export default {
  async fetch(request, env) {
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    // Ensure environment variables are set
    if (!env.PAYPAL_API_KEY || !env.PAYPAL_SECRET || !env.PAYPAL_CLIENT_ID) {
      return new Response(JSON.stringify({ error: "Missing PayPal credentials" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      });
    }

    const auth = btoa(`${env.PAYPAL_API_KEY}:${env.PAYPAL_SECRET}`);
    const tokenUrl = "https://api-m.paypal.com/v1/oauth2/token"; // Always use live endpoint

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: "PayPal authentication failed", details: errorData }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      });
    }

    const data = await response.json();
    data.client_id = env.PAYPAL_CLIENT_ID;

    const newHeaders = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });

    return new Response(JSON.stringify(data), { headers: newHeaders });
  }
};

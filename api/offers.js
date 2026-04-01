export default async function handler(req, res) {
  const API_KEY = "42656|PWYbKhc3H765iHPCbKR4Z4dT5ak1TigHQOc77MMa73812259";

  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || '8.8.8.8';
    const userAgent = req.headers['user-agent'];

    const url = `https://checkmyapp.site/api/v2?ip=${ip}&user_agent=${encodeURIComponent(userAgent)}&ctype=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.success || !data.offers) {
      return res.status(200).json({ offers: [] });
    }

    const sorted = data.offers
      .map(o => ({ ...o, payout: parseFloat(o.payout) }))
      .sort((a, b) => b.payout - a.payout);

    const top3 = sorted.slice(0, 3);

    res.status(200).json({ offers: top3 });

  } catch (err) {
    res.status(500).json({ error: "Failed", details: err.message });
  }
}

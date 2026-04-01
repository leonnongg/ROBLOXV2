export default async function handler(req, res) {
  const API_KEY = "42656|PWYbKhc3H765iHPCbKR4Z4dT5ak1TigHQOc77MMa73812259";

  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || '8.8.8.8';
    const userAgent = req.headers['user-agent'];

    // helper function (same API, just reusable)
    async function getOffers(ctype) {
      const url = `https://checkmyapp.site/api/v2?ip=${ip}&user_agent=${encodeURIComponent(userAgent)}&ctype=${ctype}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      const data = await response.json();
      return data.success && data.offers ? data.offers : [];
    }

    // 🔹 STEP 1: CPI (same as your current logic)
    let offers = await getOffers(1);

    // 🔹 STEP 2: fallback to CPA if low/empty
    if (offers.length < 3) {
      const extra = await getOffers(2);
      offers = offers.concat(extra);
    }

    // 🔹 STEP 3: sort (same logic as before)
    const sorted = offers
      .map(o => ({ ...o, payout: parseFloat(o.payout) }))
      .sort((a, b) => b.payout - a.payout);

    // 🔹 STEP 4: still return SAME format
    const top = sorted.slice(0, 3);

    res.status(200).json({ offers: top });

  } catch (err) {
    res.status(500).json({ error: "Failed", details: err.message });
  }
}

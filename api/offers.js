export default async function handler(req, res) {
  const API_KEY = "42656|PWYbKhc3H765iHPCbKR4Z4dT5ak1TigHQOc77MMa73812259";

  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || '8.8.8.8';
    const userAgent = req.headers['user-agent'];

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

    // 1️⃣ CPI first
    let offers = await getOffers(1);

    // 2️⃣ fallback CPA
    if (offers.length < 3) {
      const extra = await getOffers(2);
      offers = offers.concat(extra);
    }

    // ✅ 3️⃣ REMOVE DUPLICATES (by link)
    const seen = new Set();
    const unique = [];

    for (let o of offers) {
      if (!seen.has(o.link)) {
        seen.add(o.link);
        unique.push(o);
      }
    }

    // 4️⃣ sort (same as before)
    const sorted = unique
      .map(o => ({ ...o, payout: parseFloat(o.payout) || 0 }))
      .sort((a, b) => b.payout - a.payout);

    // 5️⃣ top 3 (same as before)
    const top = sorted.slice(0, 3);

    res.status(200).json({ offers: top });

  } catch (err) {
    res.status(500).json({ error: "Failed", details: err.message });
  }
}

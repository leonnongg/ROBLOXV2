module.exports = async (req, res) => {

  try {

    // Get visitor IP + device
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '';

    const userAgent =
      req.headers['user-agent'] || '';

    // Fetch region/device targeted offers
    const response = await fetch(
      `https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php?user_id=777591&api_key=6357c879410a493e93f5247c85db72c3&ip=${encodeURIComponent(ip)}&user_agent=${encodeURIComponent(userAgent)}`
    );

    const offers = await response.json();

    // Sort highest payout first
    offers.sort((a, b) => {

      const payA =
        parseFloat(
          String(a.conversion || '0')
          .replace(/[^0-9.]/g, '')
        ) || 0;

      const payB =
        parseFloat(
          String(b.conversion || '0')
          .replace(/[^0-9.]/g, '')
        ) || 0;

      return payB - payA;

    });

    // Always return at least 3 offers
    res.status(200).json(
      offers.slice(0, 3)
    );

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: 'Failed to fetch offers'
    });

  }

};

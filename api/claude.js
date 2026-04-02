export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const {
      userDescription,
      frameCount,
      style,
      motionType
    } = req.body;

    const prompt = `
Create ${frameCount} animation frames.

Description:
${userDescription}

Style:
${style}

Motion:
${motionType}

Return JSON array only.
`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

}
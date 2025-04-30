import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const { promptInput } = req.body;

  if (!promptInput || typeof promptInput !== 'string') {
    return res.status(400).json({ error: 'Prompt harus disertakan!' });
  }

  let [prompt, style] = promptInput.split('|').map(a => a.trim());
  style = style || 'realistic';

  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`;

  try {
    const response = await axios.post(
      'https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev',
      {
        prompt: `${prompt} -style ${style}`,
        size: '1024x1024',
        device_id: deviceId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://deepimg.ai',
          'Referer': 'https://deepimg.ai/',
        },
      }
    );

    const data = response.data;

    if (data?.data?.images?.length > 0) {
      const imageUrl = data.data.images[0].url;
      return res.status(200).json({
        imageUrl,
        prompt,
        style,
      });
    }

    return res.status(500).json({ error: 'Gagal mendapatkan URL gambar.' });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.' });
  }
}

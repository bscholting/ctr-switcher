import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [videos, setVideos] = useState([]);
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const loadVideos = async () => {
      const channelId = await getChannelId(accessToken);
      if (!channelId) return;

      const vids = await getVideos(channelId, accessToken);
      setVideos(vids);
    };

    loadVideos();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
    <div className="flex justify-end mb-4">
      <button
        onClick={() => {
          localStorage.removeItem('ctr_user');
          localStorage.removeItem('access_token');
          window.location.href = '/';
        }}
        className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>

    <h2 className="text-2xl font-semibold mb-6">
      Welcome, {user.name.split(' ')[0]} 👋
    </h2>

      {videos.length > 0 ? (
        <div className="grid gap-6">
          {videos.map((video) => (
            <Link
            to={`/test/${video.id.videoId || video.id}`}
            key={video.id.videoId || video.id}
            className="flex items-center gap-4 border p-4 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="w-32 rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{video.snippet.title}</h3>
              <p className="text-sm text-gray-500">
                Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Loading videos...</p>
      )}
    </div>
  );
}

async function getChannelId(accessToken) {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  
    const data = await res.json();
    return data.items?.[0]?.id || null;
  }
  
  async function getVideos(channelId, accessToken) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  
    const data = await res.json();
    return data.items || [];
  }
  
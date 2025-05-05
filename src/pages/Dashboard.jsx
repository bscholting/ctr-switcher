import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const channelRes = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const channelData = await channelRes.json();
        console.log("🔍 Channel API response:", channelData);
  
        if (!channelData.items || channelData.items.length === 0) {
          console.error("❌ No channel data returned:", channelData);
          throw new Error("No channel found.");
        }
  
        const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  
        if (!uploadsPlaylistId) {
          console.error("❌ No uploads playlist found in channel data:", channelData);
          throw new Error("No uploads playlist found.");
        }
  
        const playlistRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=25`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const playlistData = await playlistRes.json();
        const videoItems = playlistData.items || [];
  
        const formatted = videoItems.map((item) => ({
          id: item.snippet.resourceId.videoId,
          snippet: item.snippet,
        }));
  
        setVideos(formatted);
      } catch (err) {
        console.error("❌ Error loading videos:", err);
        setVideos([]);
      }
    };
  
    fetchVideos();
  }, []);
  

  const getTestStatus = (videoId) => {
    const test = JSON.parse(localStorage.getItem(`test_${videoId}`));
    if (!test) return { status: 'Not Started' };

    if (test.completed) {
      return { status: '✅ Complete', currentTitle: test.titles[1] };
    }

    const timeElapsed = Date.now() - test.startedAt;
    const timeLeft = 4 * 60 * 60 * 1000 - timeElapsed;

    if (timeLeft <= 0) {
      return { status: '⚠️ Should have switched', currentTitle: test.titles[0] };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const timeLeftStr = `${hours}h ${minutes}m ${seconds}s`;

    return {
      status: '⏳ Running',
      timeLeft: timeLeftStr,
      currentTitle: test.titles[0],
    };
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Videos</h1>

      {videos.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((video) => {
            const { status, timeLeft, currentTitle } = getTestStatus(video.id);

            return (
              <div key={video.id} className="border p-4 rounded shadow-sm">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="h-auto rounded-md mb-3"
                />
                <h2 className="font-semibold text-lg">{video.snippet.title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </p>

                <div className="text-sm mb-2">
                  <strong>Status:</strong> {status}
                  {status === '⏳ Running' && (
                    <>
                      <br />
                      <strong>Current Title:</strong> {currentTitle}
                      <br />
                      <strong>Time Left:</strong> {timeLeft}
                    </>
                  )}
                  {status === '✅ Complete' && (
                    <>
                      <br />
                      <strong>Final Title:</strong> {currentTitle}
                    </>
                  )}
                </div>

                <Link
                  to={`/test/${video.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Manage Test →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

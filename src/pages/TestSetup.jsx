import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function TestSetup() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [titles, setTitles] = useState(["", ""]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchVideo = async () => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      setVideo(data.items?.[0] || null);
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const savedTest = JSON.parse(localStorage.getItem(`test_${videoId}`));
    if (savedTest) {
      setTestStarted(true);
      setTestCompleted(savedTest.completed);
      setTitles(savedTest.titles);
      setCurrentTitle(savedTest.completed ? savedTest.titles[1] : savedTest.titles[0]);

      if (!savedTest.completed) {
        const timeElapsed = Date.now() - savedTest.startedAt;
        const timeLeft = 4 * 60 * 60 * 1000 - timeElapsed;
        if (timeLeft <= 0) {
          switchToSecondTitle(savedTest.titles[1]);
        } else {
          setTimeout(() => switchToSecondTitle(savedTest.titles[1]), timeLeft);
        }
      }
    }
  }, [videoId]);

  useEffect(() => {
    const savedTest = JSON.parse(localStorage.getItem(`test_${videoId}`));
    if (!savedTest || savedTest.completed) return;

    const interval = setInterval(() => {
      const timeElapsed = Date.now() - savedTest.startedAt;
      const timeRemaining = 4 * 60 * 60 * 1000 - timeElapsed;

      if (timeRemaining <= 0) {
        clearInterval(interval);
        setTimeLeftStr("Switching...");
        return;
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId]);

  const handleChange = (index, value) => {
    setTitles((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const updateVideoTitle = async (videoId, newTitle, snippet) => {
    try {
      const safeCategoryId = Number(snippet.categoryId) || 22;

      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: videoId,
          snippet: {
            ...snippet,
            title: newTitle,
            categoryId: safeCategoryId,
          },
        }),
      });

      return await res.json();
    } catch (error) {
      console.error('Error updating video title:', error);
      return { error };
    }
  };

  const switchToSecondTitle = async (titleB) => {
    const saved = JSON.parse(localStorage.getItem(`test_${videoId}`));
    if (!saved?.snippet) {
      console.error("❌ No saved snippet found. Can't update title.");
      alert("Test failed: no video data available to switch title.");
      return;
    }

    const result = await updateVideoTitle(videoId, titleB, saved.snippet);

    if (result.error || result.error?.message) {
      console.error("❌ Failed to update title B:", result.error);
      alert("⚠️ Title switch failed. Please refresh the page to retry.");
      return;
    }

    setCurrentTitle(titleB);
    setTestCompleted(true);
    setTimeLeftStr("Test complete.");
    localStorage.setItem(
      `test_${videoId}`,
      JSON.stringify({ ...saved, completed: true })
    );

    alert("✅ Switched to second title. Test complete!");
  };

  const startTest = async () => {
    if (!titles[0] || !titles[1]) {
      alert('Please enter both title options.');
      return;
    }

    if (!video || !video.snippet) {
      alert('Video data not available yet.');
      return;
    }

    const result = await updateVideoTitle(videoId, titles[0], video.snippet);
    if (result.error || result.error?.message) {
      alert(`❌ Failed to update title: ${result.error.message}`);
      return;
    }

    const testData = {
      titles,
      startedAt: Date.now(),
      completed: false,
      snippet: video.snippet,
    };

    localStorage.setItem(`test_${videoId}`, JSON.stringify(testData));
    setTestStarted(true);
    setCurrentTitle(titles[0]);

    setTimeout(() => switchToSecondTitle(titles[1]), 4 * 60 * 60 * 1000);

    alert(`✅ Test started with Title A.\nTitle B will switch in 4 hours.`);
  };

  if (!video) return <p className="p-8">Loading video info...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <h2 className="text-2xl font-bold mb-4 mt-4">Set Up A/B Test</h2>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-32 rounded-md"
        />
        <div>
          <h3 className="font-semibold">{video.snippet.title}</h3>
          <p className="text-sm text-gray-500">
            Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Enter Test Titles:</h3>

      {titles.map((title, i) => (
        <div key={i} className="mb-4">
          <label className="block mb-1 font-medium">Title Option {i + 1}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded"
            placeholder={`Enter title ${i + 1}`}
          />
        </div>
      ))}

      {testStarted && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <p className="font-medium">🧪 Test Status:</p>
          <p>Current Title: <strong>{currentTitle}</strong></p>
          {!testCompleted && <p>Time Until Switch: <strong>{timeLeftStr}</strong></p>}
          {testCompleted && <p className="text-green-600 font-semibold mt-2">✅ Title B is now live.</p>}
        </div>
      )}

      {!testStarted && (
        <button
          onClick={startTest}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-4"
        >
          Start Test
        </button>
      )}
    </div>
  );
}

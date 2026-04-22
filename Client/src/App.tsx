import { useEffect, useState } from "react";
import "./App.css";

type Author = {
  _id: string;
  name: string;
  email: string;
};

type Comment = {
  _id: string;
  content: string;
  author?: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Post = {
  _id: string;
  title: string;
  content: string;
  code?: string;
  author: Author;
  createdAt: string;
  comments?: Comment[];
  likes?: string[];
};

type CodeExplanation = {
  summary: string;
  complexity: "Basic" | "Intermediate";
  keyPoints: string[];
};

const API_BASE = "http://localhost:5001";

function App() {
  const [activeTab, setActiveTab] = useState<"feed" | "profile">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [codeExplanation, setCodeExplanation] = useState<CodeExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please login first.");
          setLoading(false);
          return;
        }

        const [postsRes, profileRes] = await Promise.all([
          fetch(`${API_BASE}/api/post`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const postsData = await postsRes.json();
        const profileData = await profileRes.json();

        if (!postsRes.ok) {
          throw new Error(postsData.message || "Failed to fetch posts");
        }

        if (!profileRes.ok) {
          throw new Error(profileData.message || "Failed to fetch profile");
        }

        setPosts(postsData.posts || []);
        setProfilePosts(profileData.posts || []);
        setProfileUser(profileData.user || null);
        setCurrentUserId(profileData.user?._id || "");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLikeToggle = async (postId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      setLikingPostId(postId);

      const res = await fetch(`${API_BASE}/api/post/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle like");
      }

      const updatedLikes = data.post?.likes || [];

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: updatedLikes,
              }
            : post,
        ),
      );

      setProfilePosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: updatedLikes,
              }
            : post,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLikingPostId("");
    }
  };

  const handleExplainCode = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      if (!selectedCode.trim()) {
        setError("Please add code first to generate an explanation.");
        return;
      }

      setExplainLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/ai/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: selectedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate explanation");
      }

      setCodeExplanation(data.explanation || null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExplainLoading(false);
    }
  };

  if (loading) return <h2 className="loading">Loading...</h2>;

  return (
    // Design wrapper: central page container and background atmosphere are controlled from App.css.
    <div className="app-shell">
      {/* Design accent: decorative blurred gradient orbs for visual depth. */}
      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />

      {/* Hero section: typography hierarchy + metric cards for a premium first impression. */}
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">COMMUNITY CODING SPACE</p>
          <h1>DevConnect</h1>
          <p>Share code, discuss ideas, and level up your full stack workflow.</p>
        </div>
        {/* Stats cards are purely presentational and styled through .stat-card classes. */}
        <div className="hero-stats" aria-label="Platform metrics">
          <div className="stat-card">
            <span>Posts</span>
            <strong>{posts.length}</strong>
          </div>
          <div className="stat-card">
            <span>Comments</span>
            <strong>{totalComments}</strong>
          </div>
          <div className="stat-card">
            <span>Likes</span>
            <strong>{totalLikes}</strong>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Tab row design: active state uses color + border treatment from CSS classes. */}
      <div className="tab-row">
        <button
          onClick={() => setActiveTab("feed")}
          className={activeTab === "feed" ? "tab active" : "tab"}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "tab active" : "tab"}
        >
          Profile
        </button>
      </div>

      {activeTab === "feed" ? (
        <div className="feed-layout">
          {/* Feed column: card-based content area with section heading treatment. */}
          <section className="feed-column">
            <div className="section-title-row">
              <h2>Latest Feed</h2>
              <span className="pill">Live updates</span>
            </div>
            {posts.length === 0 ? (
              <div className="empty-box">
                <p>No posts yet. Create your first post from Postman.</p>
              </div>
            ) : (
              posts.map((post) => {
                const likeCount = post.likes?.length || 0;
                const isLiked = !!currentUserId && (post.likes || []).includes(currentUserId);

                return (
                  // Post card design: bordered surface + subtle depth + badges for readability.
                  <article key={post._id} className="post-card">
                    <div className="post-head">
                      <h3>{post.title}</h3>
                      <span className="time-pill">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{post.content}</p>

                    {post.code && post.code.trim() !== "" && (
                      <pre className="code-block">
                        <code>{post.code}</code>
                      </pre>
                    )}

                    <div className="post-actions">
                      {/* Primary interaction style: like button uses stateful visual treatment. */}
                      <button
                        onClick={() => handleLikeToggle(post._id)}
                        disabled={likingPostId === post._id}
                        className={isLiked ? "like-btn liked" : "like-btn"}
                      >
                        {likingPostId === post._id
                          ? "Updating..."
                          : `${isLiked ? "Unlike" : "Like"} (${likeCount})`}
                      </button>

                      {post.code && post.code.trim() !== "" && (
                        <button
                          onClick={() => {
                            setSelectedCode(post.code || "");
                            setCodeExplanation(null);
                          }}
                          className="secondary-btn"
                        >
                          Use In Code Explainer
                        </button>
                      )}
                    </div>

                    <div className="comments-section">
                      <h4>Comments</h4>

                      {!post.comments || post.comments.length === 0 ? (
                        <p className="muted">No comments yet.</p>
                      ) : (
                        <div className="comment-list">
                          {post.comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                              <p>{comment.content}</p>
                              <small>
                                By {comment.author?.name || "Unknown"} •{" "}
                                {new Date(comment.createdAt).toLocaleString()}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <small>
                      By {post.author?.name || "Unknown"} ({post.author?.email || "No email"}) •{" "}
                      {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </article>
                );
              })
            )}
          </section>

          {/* Right rail panel: sticky utility card for AI helper experience. */}
          <aside className="ai-panel">
            <h3>Optional AI: Code Explanation</h3>
            <p className="muted">
              Paste code or reuse a post snippet to get a short explanation.
            </p>

            <label htmlFor="code-input">Code</label>
            <textarea
              id="code-input"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              placeholder="Paste code here..."
            />

            <button onClick={handleExplainCode} disabled={explainLoading} className="primary-btn">
              {explainLoading ? "Generating..." : "Explain Code"}
            </button>

            {/* Explanation card design: segmented content with heading rhythm for scanability. */}
            {codeExplanation && (
              <div className="explanation-card">
                <h4>Summary</h4>
                <p>{codeExplanation.summary}</p>

                <h4>Complexity</h4>
                <p>{codeExplanation.complexity}</p>

                <h4>Key Points</h4>
                <ul>
                  {codeExplanation.keyPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      ) : (
        // Profile view design: same visual language as feed cards for consistency.
        <div className="profile-layout">
          <div className="profile-card">
            <h2>Profile</h2>
            <p>
              <strong>Name:</strong> {profileUser?.name || "-"}
            </p>
            <p>
              <strong>Email:</strong> {profileUser?.email || "-"}
            </p>
            <p>
              <strong>Member Since:</strong>{" "}
              {profileUser?.createdAt
                ? new Date(profileUser.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <h3>Your Posts</h3>
          {profilePosts.length === 0 ? (
            <p className="muted">You have not created any posts yet.</p>
          ) : (
            profilePosts.map((post) => (
              <div key={post._id} className="post-card compact">
                <h4>{post.title}</h4>
                <p>{post.content}</p>
                <small>
                  Likes: {post.likes?.length || 0} • Comments: {post.comments?.length || 0}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;

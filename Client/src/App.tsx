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

const API_BASE = (import.meta.env.VITE_API_URL || "https://dev-connect-api-ten.vercel.app").replace(/\/$/, "");

function App() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCode, setPostCode] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);

  const [activeTab, setActiveTab] = useState<"feed" | "profile">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [likingPostId, setLikingPostId] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingPostId, setCommentingPostId] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [codeExplanation, setCodeExplanation] = useState<CodeExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
  const hasToken = Boolean(localStorage.getItem("token"));

  const loadData = async (token: string) => {
    const [postsRes, profileRes] = await Promise.all([
      fetch(`${API_BASE}/api/post`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        await loadData(token);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAuthSubmit = async () => {
    try {
      setSubmittingAuth(true);
      setError("");

      const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body =
        authMode === "signup"
          ? { name: authName, email: authEmail, password: authPassword }
          : { email: authEmail, password: authPassword };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        await loadData(data.token);
      }

      setAuthPassword("");
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first.");
        return;
      }

      if (!postTitle.trim() || !postContent.trim()) {
        setError("Title and content are required.");
        return;
      }

      setCreatingPost(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: postTitle, content: postContent, code: postCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setPostTitle("");
      setPostContent("");
      setPostCode("");
      await loadData(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreatingPost(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setActiveTab("feed");
    setPosts([]);
    setProfilePosts([]);
    setProfileUser(null);
    setCurrentUserId("");
    setSelectedCode("");
    setCodeExplanation(null);
    setError("");
    setAuthPassword("");
    setAuthEmail("");
    setAuthName("");
  };

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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle like");
      }

      const updatedLikes = data.post?.likes || [];

      setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, likes: updatedLikes } : post)));
      setProfilePosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, likes: updatedLikes } : post)),
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

  const handleAddComment = async (postId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      const content = commentDrafts[postId]?.trim() || "";
      if (!content) {
        setError("Comment content is required.");
        return;
      }

      setCommentingPostId(postId);
      setError("");

      const res = await fetch(`${API_BASE}/api/post/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      await loadData(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCommentingPostId("");
    }
  };

  if (loading) {
    return <h2 className="loading">Loading...</h2>;
  }

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />

      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">COMMUNITY CODING SPACE</p>
          <h1>DevConnect</h1>
          <p>Share code, discuss ideas, and level up your full stack workflow.</p>
        </div>
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

      {!hasToken ? (
        <div className="auth-shell">
          <section className="auth-card">
            <div className="auth-toggle-row">
              <button type="button" onClick={() => setAuthMode("login")} className={authMode === "login" ? "tab active" : "tab"}>
                Login
              </button>
              <button type="button" onClick={() => setAuthMode("signup")} className={authMode === "signup" ? "tab active" : "tab"}>
                Signup
              </button>
            </div>

            <h2>{authMode === "login" ? "Login to DevConnect" : "Create your account"}</h2>
            <p className="muted">
              {authMode === "login"
                ? "Use your email and password to enter the app."
                : "Create an account to post, like, and comment."}
            </p>

            {authMode === "signup" && (
              <label className="field">
                <span>Name</span>
                <input value={authName} onChange={(e) => setAuthName(e.target.value)} />
              </label>
            )}

            <label className="field">
              <span>Email</span>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            </label>

            <label className="field">
              <span>Password</span>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            </label>

            <button className="primary-btn auth-submit" onClick={handleAuthSubmit} disabled={submittingAuth}>
              {submittingAuth ? "Working..." : authMode === "login" ? "Login" : "Signup"}
            </button>
          </section>
        </div>
      ) : (
        <>
          <div className="tab-row auth-actions-row">
            <button type="button" onClick={handleLogout} className="secondary-btn">
              Logout
            </button>
          </div>

          <section className="composer-card">
            <div className="section-title-row">
              <h2>Create a Post</h2>
              <span className="pill">Public feed</span>
            </div>

            <div className="composer-grid">
              <label className="field">
                <span>Title</span>
                <input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
              </label>

              <label className="field full-width">
                <span>Content</span>
                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} />
              </label>

              <label className="field full-width">
                <span>Code (optional)</span>
                <textarea value={postCode} onChange={(e) => setPostCode(e.target.value)} rows={5} />
              </label>
            </div>

            <button className="primary-btn" onClick={handleCreatePost} disabled={creatingPost}>
              {creatingPost ? "Publishing..." : "Publish Post"}
            </button>
          </section>

          <div className="tab-row">
            <button onClick={() => setActiveTab("feed")} className={activeTab === "feed" ? "tab active" : "tab"}>
              Feed
            </button>
            <button onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? "tab active" : "tab"}>
              Profile
            </button>
          </div>

          {activeTab === "feed" ? (
            <div className="feed-layout">
              <section className="feed-column">
                <div className="section-title-row">
                  <h2>Latest Feed</h2>
                  <span className="pill">Live updates</span>
                </div>

                {posts.length === 0 ? (
                  <div className="empty-box">
                    <p>No posts yet. Create your first post above.</p>
                  </div>
                ) : (
                  posts.map((post) => {
                    const likeCount = post.likes?.length || 0;
                    const isLiked = !!currentUserId && (post.likes || []).includes(currentUserId);

                    return (
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

                          <div className="comment-composer">
                            <textarea
                              value={commentDrafts[post._id] || ""}
                              onChange={(e) =>
                                setCommentDrafts((prev) => ({
                                  ...prev,
                                  [post._id]: e.target.value,
                                }))
                              }
                              placeholder="Write a comment..."
                            />
                            <button
                              type="button"
                              className="secondary-btn"
                              onClick={() => handleAddComment(post._id)}
                              disabled={commentingPostId === post._id}
                            >
                              {commentingPostId === post._id ? "Posting..." : "Add Comment"}
                            </button>
                          </div>

                          {!post.comments || post.comments.length === 0 ? (
                            <p className="muted">No comments yet.</p>
                          ) : (
                            <div className="comment-list">
                              {post.comments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                  <p>{comment.content}</p>
                                  <small>
                                    By {comment.author?.name || "Unknown"} • {new Date(comment.createdAt).toLocaleString()}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <small>
                          By {post.author?.name || "Unknown"} ({post.author?.email || "No email"}) • {new Date(post.createdAt).toLocaleString()}
                        </small>
                      </article>
                    );
                  })
                )}
              </section>

              <aside className="ai-panel">
                <h3>Optional AI: Code Explanation</h3>
                <p className="muted">Paste code or reuse a post snippet to get a short explanation.</p>

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
                  {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : "-"}
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
        </>
      )}
    </div>
  );
}

export default App;

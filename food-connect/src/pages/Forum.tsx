import { useState, useEffect } from "react";
import { MessageCircle, User, X, Plus, ArrowBigUp, MessageSquare, Send } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForumSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "top">("latest");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  
  // --- ADD THIS STATE ---
  const [showToast, setShowToast] = useState(false);
  
  const [userUpvotes, setUserUpvotes] = useState<number[]>(() => 
    JSON.parse(localStorage.getItem("userUpvotes") || "[]")
  );

  const [feedback, setFeedback] = useState({ 
    recommend: 0, 
    foodAccess: 0, 
    knowledgeIncrease: 0, 
    easeOfUse: 0, 
    learnedNew: "", 
    suggestions: "" 
  });

  const fetchPosts = async () => {
    const res = await fetch(`${API_BASE_URL}/api/forum`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await fetch(`${API_BASE_URL}/api/forum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost })
    });
    setNewPost("");
    fetchPosts();
  };

  const toggleUpvote = async (id: number) => {
    const isUpvoted = userUpvotes.includes(id);
    const action = isUpvoted ? 'remove' : 'add';
    await fetch(`${API_BASE_URL}/api/forum/${id}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const newUpvotes = isUpvoted ? userUpvotes.filter(pId => pId !== id) : [...userUpvotes, id];
    setUserUpvotes(newUpvotes);
    localStorage.setItem("userUpvotes", JSON.stringify(newUpvotes));
    fetchPosts();
  };

  const handleReply = async (id: number) => {
    if (!replyContent.trim()) return;
    await fetch(`${API_BASE_URL}/api/forum/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent })
    });
    setReplyContent("");
    setReplyTo(null);
    fetchPosts();
  };

  const handleSubmitSurvey = async () => {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXl2PQ8r03BHR2YhbuJFasNG5rdsqlSc5HBXKKgDRZauqdZwjayK1iGNSkmVhigBth/exec";

    try {
      // 1. Send to Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });

      // 2. Send to local backend
      await fetch(`${API_BASE_URL}/api/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });

      // Close modal and show toast
      setIsSurveyOpen(false);
      setShowToast(true);
      
      // Reset feedback form to original state
      setFeedback({ 
        recommend: 0, 
        foodAccess: 0, 
        knowledgeIncrease: 0, 
        easeOfUse: 0, 
        learnedNew: "", 
        suggestions: "" 
      });

      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "top") return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const SurveyScale = ({ label, lowLabel, highLabel, field }: any) => (
    <div className="mb-6">
      <p className="text-xs font-black text-slate-800 mb-3 uppercase tracking-tight">{label}</p>
      <div className="flex justify-between gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setFeedback({...feedback, [field]: n})}
            className={`flex-1 py-2 sm:py-3 rounded-lg border-2 font-black transition-all text-sm ${feedback[field as keyof typeof feedback] === n ? 'bg-green-500 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-400'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1 px-1 text-[9px] font-bold text-slate-400 uppercase">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-slate-50 min-h-screen font-sans text-slate-900 pb-24">
      
      {/* HEADER AREA */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter flex items-center gap-2">
            <MessageCircle className="text-green-500" size={32} /> FORUM
          </h1>
          <button 
            onClick={() => setIsSurveyOpen(true)}
            className="bg-green-500 border-2 border-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            Survey
          </button>
        </div>

        <div className="flex bg-white border-2 border-slate-900 p-1 rounded-xl w-fit">
          {["latest", "top"].map((mode) => (
            <button key={mode} onClick={() => setSortBy(mode as any)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === mode ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE POST BOX */}
      <div className="bg-white border-4 border-slate-900 p-4 sm:p-6 mb-10 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <textarea 
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-green-500 min-h-[80px] resize-none"
          placeholder="Ask a question or share a resource..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button onClick={handlePost} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-green-500 transition-all flex items-center gap-2">
            Post <Plus size={14} />
          </button>
        </div>
      </div>

      {/* FEED */}
      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <div key={post._id} className="bg-white border-2 border-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200"><User size={16}/></div>
                <p className="text-[9px] font-black uppercase text-slate-400">{new Date(post.timestamp).toLocaleDateString()}</p>
              </div>
              <button onClick={() => toggleUpvote(post._id)} 
                className={`flex items-center gap-1 border-2 px-3 py-1 rounded-full transition-all ${userUpvotes.includes(post._id) ? 'bg-green-500 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-slate-200 text-slate-400'}`}>
                <ArrowBigUp size={18} fill={userUpvotes.includes(post._id) ? "white" : "none"} />
                <span className="font-black text-xs">{post.upvotes || 0}</span>
              </button>
            </div>

            <p className="text-slate-800 font-bold text-sm sm:text-base leading-snug mb-4">{post.content}</p>

            {/* REPLIES */}
            <div className="space-y-2 mb-4">
              {post.replies?.map((reply: any) => (
                <div key={reply._id} className="ml-4 sm:ml-6 p-3 bg-slate-50 border-l-2 border-green-500 rounded-r-xl">
                  <p className="text-xs font-semibold text-slate-600 leading-tight">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* REPLY ACTION */}
            {replyTo === post._id ? (
              <div className="flex gap-2 items-center">
                <input autoFocus className="flex-1 bg-white border-2 border-slate-900 rounded-lg px-3 py-2 text-xs font-bold" 
                  placeholder="Reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply(post._id)} />
                <button onClick={() => handleReply(post._id)} className="bg-slate-900 text-white p-2 rounded-lg"><Send size={14}/></button>
              </div>
            ) : (
              <button onClick={() => setReplyTo(post._id)} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-slate-900">
                <MessageSquare size={12}/> Reply
              </button>
            )}
          </div>
        ))}
      </div>

      {/* SUCCESS TOAST */}
      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ease-out transform ${
          showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-2 border-white/10 backdrop-blur-md">
          <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs uppercase tracking-widest">Success</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Feedback successfully submitted</span>
          </div>
        </div>
      </div>

      {/* SURVEY MODAL */}
      {isSurveyOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-[2.5rem] border-4 border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-black italic">SITE SURVEY</h2>
              <button onClick={() => setIsSurveyOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <SurveyScale label="Likely to recommend to a friend?" lowLabel="Not likely" highLabel="Very likely" field="recommend" />
              <SurveyScale label="Likely to help access food?" lowLabel="Not likely" highLabel="Very likely" field="foodAccess" />
              <SurveyScale label="Increase your knowledge?" lowLabel="Not at all" highLabel="Yes, a lot" field="knowledgeIncrease" />
              <SurveyScale label="Ease of use?" lowLabel="Difficult" highLabel="Easy" field="easeOfUse" />

              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase text-slate-800">Learned about a new resource?</p>
                <div className="flex gap-3">
                  {["No", "Yes"].map(opt => (
                    <button key={opt} onClick={() => setFeedback({...feedback, learnedNew: opt})}
                      className={`flex-1 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all ${feedback.learnedNew === opt ? 'bg-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pb-4">
                <p className="text-[11px] font-black uppercase text-slate-800">Suggestions?</p>
                <textarea 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[120px] outline-none focus:border-green-500"
                  placeholder="Tell us more..."
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback({...feedback, suggestions: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 border-t-2 border-slate-100 bg-slate-50 rounded-b-[2.3rem]">
              <button 
                onClick={handleSubmitSurvey}
                className="w-full bg-green-500 border-4 border-slate-900 text-slate-900 py-4 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
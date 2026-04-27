const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // New!

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://fcadmin:fcpassword@food-connect-forum.fjbuwbk.mongodb.net/?appName=Food-Connect-Forum";


mongoose.connect(MONGO_URI)
  .then(() => console.log("📦 Connected to MongoDB Cloud!"))
  .catch(err => console.error("❌ Connection error:", err));




// --- THE DATA MODEL ---
// This tells MongoDB what a 'Post' looks like
const postSchema = new mongoose.Schema({
  content: String,
  upvotes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  replies: [{
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const Post = mongoose.model('Post', postSchema);

const locationSchema = new mongoose.Schema({
  name: String,
  type: String,
  county: String,
  address: String,
  offerings: [String],
  // We keep position as an array since that's how your data is currently
  position: [Number], 
  // This is the new part for the clock logic
  schedule: {
    days: [Number],
    openHour: Number,
    closeHour: Number
  }
});

const Location = mongoose.model('Location', locationSchema);


const parseHours = (hoursString) => {
  // Default values if parsing fails
  let openHour = 9;
  let closeHour = 17;
  let days = [1, 2, 3, 4, 5];

  try {
    // 1. Detect Days
    if (hoursString.includes("Sat")) days = [6];
    if (hoursString.includes("Sun")) days = [0];
    if (hoursString.includes("Mon-Fri")) days = [1, 2, 3, 4, 5];

    // 2. Extract Times using Regex
    // This looks for patterns like "9:00 AM" or "4 PM"
    const timeRegex = /(\d+(?::\d+)?)\s*(AM|PM)/gi;
    const matches = [...hoursString.matchAll(timeRegex)];

    if (matches.length >= 2) {
      const convertTo24H = (timeStr, modifier) => {
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (!minutes) minutes = 0;
        if (hours === 12) hours = 0;
        if (modifier.toUpperCase() === 'PM') hours += 12;
        return hours + (minutes / 60);
      };

      openHour = convertTo24H(matches[0][1], matches[0][2]);
      closeHour = convertTo24H(matches[1][1], matches[1][2]);
    }
  } catch (e) {
    console.log("Could not parse hours for a location, using defaults.");
  }

  return { days, openHour, closeHour };
};

const seedLocations = async () => {
  const count = await Location.countDocuments();
  if (count === 0) {
    console.log("🌱 Database empty. Auto-parsing and seeding...");

    const formattedLocations = locations.map(loc => ({
      ...loc,
      schedule: parseHours(loc.hours || "") 
    }));

    await Location.insertMany(formattedLocations);
    console.log("✅ All locations seeded with smart schedules!");
  }
};
seedLocations();

// --- DATA ---
const locations = [
  { id: 1, name: "San Francisco-Marin Food Bank", type: "Food bank", county: "San Francisco", position: [37.75478, -122.3938], address: "900 Pennsylvania Ave, San Francisco, CA 94107", hours: "Mon-Fri 8:00 AM - 5:00 PM", offerings: ["CalFresh Access", "Community Markets", "Home-delivered food", "Farmer's Market"], status: "Open" },
  { id: 2, name: "The Food Pantry", type: "Pantry", county: "San Francisco", position: [37.76337, -122.40144], address: "500 De Haro Street, San Francisco, CA 94107", hours: "Sat 10:30 AM - 12:30 PM", offerings: ["Groceries"], restrictions: "Zip codes: 94102, 94103, 94107, 94110, 94112, 94114, 94124, 94158", status: "Closed" },
  { id: 3, name: "GLIDE Memorial Church", type: "Hot Meal", county: "San Francisco", position: [37.78523, -122.4119], address: "330 Ellis St, San Francisco, CA 94102", hours: "Mon-Fri: 8am-5pm, Sat-Sun: 8am-2:30pm", offerings: ["Free meals 3x daily"], status: "Open" },
  { id: 4, name: "St. Anthony Foundation", type: "Hot Meal", county: "San Francisco", position: [37.78198, -122.41315], address: "150 Golden Gate Ave, San Francisco, CA 94102", hours: "Daily; Breakfast 7am, Lunch 10am-1:30pm", offerings: ["Dine-in meals", "To-go meals", "Free clothing"], status: "Open" },
  { id: 5, name: "City College of San Francisco", type: "College Pantry", county: "San Francisco", position: [37.7262, -122.4524], address: "50 Frida Kahlo Way, San Francisco, CA 94112", hours: "Varies by campus; typically weekly", offerings: ["RAM Pantry", "Student Resources"], status: "Open" },
  { id: 6, name: "Alameda County Community Food Bank", type: "Food bank", county: "Alameda", position: [37.74129, -122.20098], address: "7900 Edgewater Dr, Oakland, CA 94621", hours: "Mon-Fri 9:00 AM - 4:00 PM", offerings: ["Summer meals (<18)", "Emergency Help Line"], status: "Open" },
  { id: 7, name: "Mercy Brown Bag Program", type: "Pantry", county: "Alameda", position: [37.78186, -122.22019], address: "3431 Foothill Blvd, Oakland, CA 94601", hours: "Mon-Fri 10:00 AM - 2:00 PM", offerings: ["Senior Groceries", "Snack bags"], status: "Open" },
  { id: 8, name: "South Hayward Parish Food Pantry", type: "Pantry", county: "Alameda", position: [37.633951, -122.079700], address: "27287 Patrick Ave, Hayward, CA 94544", hours: "M, T, Th, F: 9:00 AM - 4:00 PM", offerings: ["Groceries", "Sleeping shelter", "Hot meals"], status: "Open" },
  { id: 9, name: "Dorothy Day House", type: "Hot Meal", county: "Alameda", position: [37.870082, -122.271838], address: "1931 Center Street, Berkeley, CA 94704", hours: "Mon-Fri 8:00 AM - 5:00 PM", offerings: ["Hot meals", "Showers"], status: "Open" },
  { id: 10, name: "Berkeley City College", type: "College Pantry", county: "Alameda", position: [37.8703, -122.2694], address: "2050 Center St, Berkeley, CA 94704", hours: "Thursday 12:00 PM - 3:00 PM", offerings: ["Basic Needs Center", "Student Pantry"], status: "Closed" },
  { id: 11, name: "Laney College", type: "College Pantry", county: "Alameda", position: [37.7937, -122.2642], address: "900 Fallon St, Oakland, CA 94607", hours: "Wed & Thu: 11am-1pm, 3pm-5pm", offerings: ["Eagle's Nest Pantry"], status: "Open" },
  { id: 12, name: "Merritt College", type: "College Pantry", county: "Alameda", position: [37.7912, -122.1761], address: "12500 Campus Dr, Oakland, CA 94619", hours: "Thursdays (Schedule varies)", offerings: ["Panther Produce Pantry"], status: "Closed" },
  { id: 13, name: "College of Alameda", type: "College Pantry", county: "Alameda", position: [37.7788, -122.2789], address: "555 Ralph Appezzato Memorial Pkwy, Alameda, CA 94501", hours: "Varies by semester", offerings: ["Basic Needs Center"], status: "Open" },
  { id: 14, name: "Chabot College", type: "College Pantry", county: "Alameda", position: [37.6437, -122.1039], address: "25555 Hesperian Blvd, Hayward, CA 94545", hours: "Weekly distributions", offerings: ["Food Pantry", "Campus Market"], status: "Open" },
  { id: 15, name: "Ohlone College", type: "College Pantry", county: "Alameda", position: [37.5273, -121.9168], address: "43600 Mission Blvd, Fremont, CA 94539", hours: "Weekly (Schedule varies)", offerings: ["Renegade Pantry"], status: "Open" },
  { id: 16, name: "Food Bank of Contra Costa and Solano", type: "Food bank", county: "Contra Costa", position: [38.006119, -122.046523], address: "4010 Nelson Ave, Concord, CA 94520", hours: "Mon-Fri 8:00 AM - 4:30 PM", offerings: ["Direct distribution"], status: "Open" },
  { id: 17, name: "Loaves and Fishes", type: "Hot Meal", county: "Contra Costa", position: [38.016778, -122.134685], address: "835 Ferry St, Martinez, CA 94553", hours: "Mon-Sun 11:00 AM - 12:45 PM", offerings: ["Hot meals", "Groceries"], status: "Open" },
  { id: 18, name: "Diablo Valley College", type: "College Pantry", county: "Contra Costa", position: [37.9686, -122.0706], address: "321 Golf Club Rd, Pleasant Hill, CA 94523", hours: "Multiple weekdays", offerings: ["Viking Pantry"], status: "Open" },
  { id: 19, name: "Contra Costa College", type: "College Pantry", county: "Contra Costa", position: [37.9614, -122.3387], address: "2600 Mission Bell Dr, San Pablo, CA 94806", hours: "Weekly distributions", offerings: ["Basic Needs Pantry"], status: "Open" },
  { id: 20, name: "St. Vincent de Paul Free Dining Room", type: "Hot Meal", county: "Contra Costa", position: [38.00923, -121.86584], address: "2210 Gladstone Dr, Pittsburg, CA 94565", hours: "Mon-Sat 9:00 AM - 5:00 PM", offerings: ["Restaurant-style hot meals"], status: "Open" },
  { id: 21, name: "Samaritan House of San Mateo County", type: "Pantry", county: "San Mateo", position: [37.531052, -122.288162], address: "4031 Pacific Blvd, San Mateo, CA 94403", hours: "M-W: 9-5, Th: 9-12, F: 9-5", offerings: ["Drive-thru pantry", "Dining room", "Mobile meals"], status: "Open" },
  { id: 22, name: "Las Positas College", type: "College Pantry", county: "Alameda", position: [37.7126, -121.7963], address: "3000 Campus Hill Dr, Livermore, CA 94551", hours: "Schedule varies", offerings: ["Market", "Food Pantry"], status: "Open" },
  { id: 23, name: "San Jose City College", type: "College Pantry", county: "Santa Clara", position: [37.3191, -121.9213], address: "2100 Moorpark Ave, San Jose, CA 95128", hours: "Weekly distributions", offerings: ["Jaguar Pantry"], status: "Open" },
  { id: 24, name: "College of Marin", type: "College Pantry", county: "Marin", position: [37.9547, -122.5489], address: "835 College Ave, Kentfield, CA 94904", hours: "Weekly", offerings: ["Basic Needs Pantry"], status: "Open" },
  { id: 25, name: "Solano Community College", type: "College Pantry", county: "Solano", position: [38.2366, -122.1245], address: "4000 Suisun Valley Rd, Fairfield, CA 94534", hours: "Weekly distributions", offerings: ["Falcon's Nest Food Pantry"], status: "Open" }
];

// --- ROUTES ---

// 1. Locations 
app.get('/api/locations', async (req, res) => {
  try {
    const allLocations = await Location.find();
    res.json(allLocations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load locations" });
  }
});

// Get all posts
app.get('/api/forum', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create a post
app.post('/api/forum', async (req, res) => {
  try {
    const newPost = new Post({ content: req.body.content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: "Failed to create post" });
  }
});

// Upvote a post
app.post('/api/forum/:id/upvote', async (req, res) => {
  try {
    const { action } = req.body;
    const increment = action === 'add' ? 1 : -1;
    const post = await Post.findByIdAndUpdate(
      req.params.id, 
      { $inc: { upvotes: increment } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
});

// Reply to a post
app.post('/api/forum/:id/reply', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.replies.push({ content: req.body.content });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
});

// 6. Questionnaire (Survey)
app.post('/api/questionnaire', (req, res) => {
    try {
        let allFeedback = [];
        if (fs.existsSync(FEEDBACK_FILE)) {
            allFeedback = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
        }
        allFeedback.push({ ...req.body, id: Date.now(), timestamp: new Date() });
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(allFeedback, null, 2));
        res.status(200).json({ message: "Feedback saved!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save feedback" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server live on http://localhost:${PORT}`);
});
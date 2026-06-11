import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

// Standard schema for roadmap details
const RoadmapInputSchema = z.object({
  name: z.string(),
  degree: z.string(),
  semester: z.string(),
  current_skills: z.string(),
  certifications: z.string().optional(),
  projects: z.string().optional(),
  target_role: z.string(),
  timeline_months: z.number(),
  study_hours: z.number(),
  custom_key: z.string().optional(),
  provider: z.enum(["Gemini", "OpenAI"]).optional(),
});

export const ROLES_DB: Record<string, any> = {
  "Frontend Engineer": {
    skills: ["HTML5/CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Tailwind CSS", "Redux Toolkit", "Git & GitHub", "Vite", "Testing (Jest/Cypress)"],
    salary: "₹6.5L - ₹18L per annum",
    companies: ["Microsoft", "Flipkart", "Razorpay", "Uber", "CRED", "Zomato"],
    demand: "Very High",
    growth: "15% YoY",
    resources: {
      "JavaScript (ES6+)": { youtube: "https://www.youtube.com/results?search_query=javascript+es6+tutorial", doc: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", platform: "LeetCode (JS)", project: "Build an Interactive Task Manager App" },
      "React.js": { youtube: "https://www.youtube.com/results?search_query=react+js+complete+course", doc: "https://react.dev", platform: "Scrimba / Frontend Mentor", project: "Develop a Premium E-commerce Interface" },
      "Tailwind CSS": { youtube: "https://www.youtube.com/results?search_query=tailwind+css+tutorial", doc: "https://tailwindcss.com", platform: "Frontend Mentor", project: "Design a Sleek Portfolio Website" },
      "Next.js": { youtube: "https://www.youtube.com/results?search_query=nextjs+tutorial+complete", doc: "https://nextjs.org", platform: "Vercel Guides", project: "Build a Server-Side Rendered Blog platform" }
    },
    curriculum: [
      { title: "HTML5, CSS3 & Responsive Web Design", topics: ["Semantic HTML", "CSS Grid & Flexbox", "Media Queries", "Sleek layouts"], project: "Create a fully responsive agency landing page", practice: "Format structures and build CSS layouts manually", interview: "Explain CSS box model, flexbox positioning, and semantic accessibility.", portfolio: "Host page on GitHub Pages with clean styling" },
      { title: "JavaScript Foundations & ES6+", topics: ["DOM manipulation", "Promises & Async/Await", "Closures & Prototypes", "ES6 imports/exports"], project: "Build a dynamic weather app interacting with a REST API", practice: "Implement array methods (map, filter, reduce) from scratch", interview: "Explain closures, event loop, hoisting, and difference between == and ===.", portfolio: "Add weather project to portfolio with functional API fetching" },
      { title: "TypeScript & Frontend Tooling", topics: ["Static Types & Interfaces", "Generics", "Vite configurations", "Webpack vs Vite"], project: "Convert the weather app to TypeScript with strict configurations", practice: "Write complex typings for API response objects", interview: "What are the benefits of TypeScript over Javascript? Explain generics.", portfolio: "Publish a clean NPM package of a typescript utility" },
      { title: "React.js Basics & State Management", topics: ["Components & Props", "React Hooks (useState, useEffect)", "Context API", "Virtual DOM principles"], project: "Build a premium Task Planner with filters and categories", practice: "Manage state globally using Context API", interview: "Explain component lifecycle hooks, React Fiber, and why key prop is needed.", portfolio: "Deploy Task Planner to Vercel with responsive styling" },
      { title: "Advanced React, Tailwind & Routing", topics: ["Next.js App Router", "Tailwind CSS styling rules", "React Router DOM", "Performance optimization"], project: "Develop a real-time Chat Application frontend", practice: "Create smooth transitions and animation effects using Framer Motion", interview: "Explain Server Components vs Client Components. What is Hydration?", portfolio: "Verify Chat App builds without errors on Vercel" },
      { title: "Global State & Testing", topics: ["Redux Toolkit (RTK Query)", "Unit testing with Jest", "Integration testing with Cypress", "CI/CD deployment"], project: "Build a fully-featured E-commerce checkout platform", practice: "Integrate local storage caching with RTK Query states", interview: "How does Redux work? What is the difference between Jest and Cypress?", portfolio: "Complete final testing reports and publish code source on GitHub" }
    ]
  },
  "Backend Engineer": {
    skills: ["Python", "Node.js", "Go", "FastAPI", "Express.js", "PostgreSQL", "MongoDB", "Redis", "Docker", "REST & gRPC", "System Design"],
    salary: "₹7L - ₹20L per annum",
    companies: ["Amazon", "Google", "Paytm", "PhonePe", "Walmart", "Razorpay"],
    demand: "Very High",
    growth: "18% YoY",
    resources: {
      "Node.js / Express": { youtube: "https://www.youtube.com/results?search_query=nodejs+backend+tutorial", doc: "https://nodejs.org", platform: "FreeCodeCamp", project: "Build a REST API for library management" },
      "Databases (SQL/NoSQL)": { youtube: "https://www.youtube.com/results?search_query=sql+database+complete+course", doc: "https://www.postgresql.org/docs/", platform: "SQLZoo / LeetCode", project: "Design a relational schema for a booking portal" },
      "System Design": { youtube: "https://www.youtube.com/results?search_query=system+design+backend", doc: "https://github.com/donnemartin/system-design-primer", platform: "ByteByteGo", project: "Write design documentation for a URL shortener scaling to 1M users" },
      "Docker & Deployment": { youtube: "https://www.youtube.com/results?search_query=docker+kubernetes+tutorial", doc: "https://docs.docker.com", platform: "Play with Docker", project: "Containerize a multi-service backend with Postgres and Redis" }
    },
    curriculum: [
      { title: "Language Foundations & Async Basics", topics: ["Language syntax (Node.js/Python/Go)", "Async runtime and Event Loop", "File systems and I/O", "Package managers (NPM/PIP)"], project: "Build a CLI file organizer tool", practice: "Handle asynchronous operations using native language construct tools", interview: "Explain threads vs events, async vs sync calls, and error handling patterns.", portfolio: "Make CLI tool installable via package manager" },
      { title: "REST APIs & Router Frameworks", topics: ["Express/FastAPI routing", "Middleware architectures", "Request validation & parsing", "JSON Web Tokens (JWT) auth"], project: "Develop a User Authentication and Management microservice", practice: "Implement rate limiting and password hashing checks", interview: "What is REST? Explain HTTP status codes and how JWT authentication works.", portfolio: "Deploy service to Render with secure environment parameters" },
      { title: "Databases & ORM Integrations", topics: ["PostgreSQL/MySQL queries", "MongoDB database structures", "Prisma/Mongoose/SQLAlchemy ORMs", "Transaction controls"], project: "Design and integrate database schema for a Blog engine", practice: "Write optimized join queries and index key fields", interview: "Explain SQL Joins, Indexing, ACID transactions, and SQL vs NoSQL database architectures.", portfolio: "Publish entity-relationship diagrams and SQL migration scripts on GitHub" },
      { title: "Caching & Message Brokers", topics: ["Redis caching", "Message brokers (RabbitMQ/Kafka)", "In-memory datastores", "Job queues"], project: "Build a background email notifier processing queue with Redis", practice: "Configure cache invalidation mechanisms", interview: "What is caching? How do you prevent cache stampede? Explain Pub/Sub vs Message Queues.", portfolio: "Integrate queue status monitoring panels in git repo documentation" },
      { title: "Containerization & Cloud Basics", topics: ["Docker containers", "Docker Compose structures", "AWS EC2/S3 concepts", "Log management"], project: "Containerize booking engine with local database and caching instances", practice: "Write multi-stage Dockerfiles to minimize build footprints", interview: "What is containerization? Explain difference between Docker image and container.", portfolio: "Publish built container to Docker Hub repository" },
      { title: "System Design & Scaling", topics: ["Load balancing", "Database replication", "Horizontal vs vertical scaling", "API Gateway logic"], project: "Create high-level architecture designs for scaling a social feed to 10M users", practice: "Implement API rate-limiting policies at gateway routers", interview: "Explain sharding, read-replicas, CAP theorem, and CDN distribution.", portfolio: "Format architecture markdown files with diagrams and host on GitHub" }
    ]
  },
  "Full Stack Engineer": {
    skills: ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Node.js", "Express.js", "MongoDB", "SQL Basics", "Git & GitHub", "Tailwind CSS", "REST APIs", "Cloud Deployment"],
    salary: "₹7.5L - ₹22L per annum",
    companies: ["Paytm", "Swiggy", "Cure.fit", "Google", "Innovaccer", "Ola"],
    demand: "Extremely High",
    growth: "20% YoY",
    resources: {
      "React.js": { youtube: "https://www.youtube.com/results?search_query=react+js+tutorial", doc: "https://react.dev", platform: "Frontend Mentor", project: "Create dynamic SPA dashboards" },
      "Node.js & Express": { youtube: "https://www.youtube.com/results?search_query=nodejs+express+mongodb+tutorial", doc: "https://expressjs.com", platform: "FreeCodeCamp", project: "Develop complete API with CRUD functionalities" },
      "MERN Full Stack": { youtube: "https://www.youtube.com/results?search_query=mern+stack+project+tutorial", doc: "https://www.mongodb.com/mern-stack", platform: "FullStackOpen", project: "Build and deploy a collaborative Workspace platform" },
      "Git & CI/CD": { youtube: "https://www.youtube.com/results?search_query=git+github+ci+cd+complete", doc: "https://docs.github.com", platform: "LearnGitBranching", project: "Deploy website using GitHub Actions integration" }
    },
    curriculum: [
      { title: "Frontend Layouts & Logic (HTML/CSS/JS)", topics: ["Responsive Flex/Grid Systems", "DOM manipulations", "ES6+ Async operations", "Tailwind styling CSS framework"], project: "Design mock analytics dashboard web interface", practice: "Query and render structured elements dynamically using Fetch API", interview: "Explain grid vs flexbox, Promises, and AJAX structures.", portfolio: "Publish responsive portal template" },
      { title: "Frontend Library Frameworks (React.js)", topics: ["React states and props routing", "Effects & custom hooks triggers", "Global Context management", "Tailwind responsive design rules"], project: "Build an academic Course registration frontend application", practice: "Manage complex UI grids with multi-level search options", interview: "Explain Virtual DOM, state hooks, and custom hooks creation logic.", portfolio: "Deploy code components to Vercel portal" },
      { title: "Backend Services & API Layer (Node.js/Express)", topics: ["Express server handling", "Middleware setup and configurations", "Request parsing & CORS handling", "REST API architecture methods"], project: "Develop a microservice serving catalog details and items list", practice: "Implement structured route groupings with error middlewares", interview: "Explain request pipelines, Express routing, and REST concepts.", portfolio: "Verify API responses via tools and host code" },
      { title: "Databases & Storage (MongoDB & SQL)", topics: ["MongoDB collection structures", "SQL tables structure relations", "Mongoose ORM integration", "Database CRUD transactions"], project: "Design database model for a Student profile portfolio database", practice: "Implement query aggregation logic", interview: "Compare SQL vs NoSQL, explain database index triggers and ORM benefits.", portfolio: "Publish database schema structure diagrams" },
      { title: "Full Stack Integration (MERN)", topics: ["Connecting frontend UI to backend API", "Token-based secure authentication (JWT)", "Cookies & Session stores", "Unified CORS setups"], project: "Build a portal where students write reviews and rate academic mentors", practice: "Save tokens inside local state structures securely", interview: "Explain CSRF, CORS policies, secure sessions, and token handling.", portfolio: "Deploy both services to unified web hosting portal" },
      { title: "Production Deployment & Pipelines", topics: ["Vercel/Render hosting portals", "CI/CD automated release builds", "Monitoring API logs", "Testing suite run configs"], project: "Run automated test suites and deploy full MERN web portal publicly", practice: "Write pipeline scripts running tests before pushing builds", interview: "What is CI/CD? Explain production scaling issues and monitoring logs.", portfolio: "Ensure full website runs without warnings or errors" }
    ]
  },
  "Data Scientist / ML Engineer": {
    skills: ["Python", "NumPy & Pandas", "Matplotlib & Seaborn", "Scikit-Learn", "TensorFlow / PyTorch", "SQL queries", "Jupyter Notebooks", "Data Visualization", "Git & GitHub"],
    salary: "₹8L - ₹24L per annum",
    companies: ["Google", "NVIDIA", "Adobe", "Mu Sigma", "Fractal Analytics", "IBM"],
    demand: "High",
    growth: "22% YoY",
    resources: {
      "Data Analysis with Pandas": { youtube: "https://www.youtube.com/results?search_query=python+pandas+data+science", doc: "https://pandas.pydata.org", platform: "Kaggle Learn", project: "Analyze placement records dataset" },
      "Machine Learning Algorithms": { youtube: "https://www.youtube.com/results?search_query=machine+learning+complete+course", doc: "https://scikit-learn.org", platform: "Kaggle Competitions", project: "Build salary prediction models using Regression" },
      "Deep Learning & NLP": { youtube: "https://www.youtube.com/results?search_query=deep+learning+pytorch+tutorial", doc: "https://pytorch.org", platform: "Hugging Face Course", project: "Create text sentiment classifier neural net" }
    },
    curriculum: [
      { title: "Python for Data Analysis", topics: ["Pandas dataframes manipulation", "NumPy numeric arrays processing", "Jupyter environments", "Matplotlib charts"], project: "Clean and explore a housing market dataset", practice: "Perform data imputation, aggregation, and filtering", interview: "Explain standard deviation, Pandas merge vs join, and array slicing.", portfolio: "Publish Jupyter Notebook analysis report on GitHub" },
      { title: "Statistical Methods & SQL", topics: ["Probability distributions", "Hypothesis testing & p-values", "SQL window functions", "Data normalization rules"], project: "Run A/B testing evaluation on a web user interface logs dataset", practice: "Write multi-table joins and aggregation subqueries in SQL", interview: "Explain Type I vs Type II errors, Central Limit Theorem, and SQL schemas.", portfolio: "Publish SQL queries scripts for database analysis" },
      { title: "Classical Machine Learning", topics: ["Regression models (Linear/Logistic)", "Classification methods (Decision Trees, Random Forest)", "Model validation metrics (Precision/Recall)", "Hyperparameter tuning"], project: "Develop loan eligibility evaluation model", practice: "Perform feature engineering and feature selection cycles", interview: "Explain bias-variance trade-off, overfitting remedies, and ROC-AUC curve.", portfolio: "Publish loan classification package on GitHub" },
      { title: "Unsupervised Learning & Clustering", topics: ["K-Means clustering", "Dimensionality reduction (PCA)", "Hierarchical clustering", "Anomaly detection"], project: "Segment customers based on purchasing behavior dataset", practice: "Evaluate optimal clusters count using Elbow method", interview: "How does PCA work? Explain distance metrics used in K-Means clustering.", portfolio: "Publish interactive customer segmentation dashboard" },
      { title: "Deep Learning Foundations", topics: ["Neural Networks structure", "Activation functions (ReLU, Sigmoid)", "Loss functions & Optimizers", "PyTorch basics"], project: "Build an image classifier using Convolutional Neural Networks (CNNs)", practice: "Train neural network and monitor loss charts", interview: "Explain backpropagation, gradient descent, and function of activation functions.", portfolio: "Publish training checkpoint files on cloud server" },
      { title: "ML Model Deployment & MLOps", topics: ["Flask/FastAPI API wrapper", "Streamlit UI interfaces", "Docker containers", "Model monitoring metrics"], project: "Deploy the loan model as a Streamlit web application on Docker", practice: "Write wrapper API endpoints serving real-time model predictions", interview: "How do you deploy ML models? What are the key elements of MLOps?", portfolio: "Host live model dashboard publicly for users to test" }
    ]
  }
};

function generateLocalRoadmap(userData: z.infer<typeof RoadmapInputSchema>) {
  const role = userData.target_role;
  const months = userData.timeline_months;
  const roleInfo = ROLES_DB[role] || ROLES_DB["Full Stack Engineer"];
  const rawCurriculum = roleInfo.curriculum;
  
  const roadmap = [];
  
  if (months === 3) {
    roadmap.push({
      month: "Month 1",
      title: `${rawCurriculum[0].title} & ${rawCurriculum[1].title}`,
      topics: [...rawCurriculum[0].topics, ...rawCurriculum[1].topics],
      project: `${rawCurriculum[0].project} + ${rawCurriculum[1].project}`,
      practice: `1. ${rawCurriculum[0].practice}\n2. ${rawCurriculum[1].practice}`,
      interview: `1. ${rawCurriculum[0].interview}\n2. ${rawCurriculum[1].interview}`,
      portfolio: `1. ${rawCurriculum[0].portfolio}\n2. ${rawCurriculum[1].portfolio}`
    });
    roadmap.push({
      month: "Month 2",
      title: `${rawCurriculum[2].title} & ${rawCurriculum[3].title}`,
      topics: [...rawCurriculum[2].topics, ...rawCurriculum[3].topics],
      project: `${rawCurriculum[2].project} + ${rawCurriculum[3].project}`,
      practice: `1. ${rawCurriculum[2].practice}\n2. ${rawCurriculum[3].practice}`,
      interview: `1. ${rawCurriculum[2].interview}\n2. ${rawCurriculum[3].interview}`,
      portfolio: `1. ${rawCurriculum[2].portfolio}\n2. ${rawCurriculum[3].portfolio}`
    });
    roadmap.push({
      month: "Month 3",
      title: `${rawCurriculum[4].title} & ${rawCurriculum[5].title}`,
      topics: [...rawCurriculum[4].topics, ...rawCurriculum[5].topics],
      project: `${rawCurriculum[4].project} + ${rawCurriculum[5].project}`,
      practice: `1. ${rawCurriculum[4].practice}\n2. ${rawCurriculum[5].practice}`,
      interview: `1. ${rawCurriculum[4].interview}\n2. ${rawCurriculum[5].interview}`,
      portfolio: `1. ${rawCurriculum[4].portfolio}\n2. ${rawCurriculum[5].portfolio}`
    });
  } else if (months === 6) {
    for (let i = 0; i < rawCurriculum.length; i++) {
      roadmap.push({
        month: `Month ${i + 1}`,
        title: rawCurriculum[i].title,
        topics: rawCurriculum[i].topics,
        project: rawCurriculum[i].project,
        practice: rawCurriculum[i].practice,
        interview: rawCurriculum[i].interview,
        portfolio: rawCurriculum[i].portfolio
      });
    }
  } else {
    // 12 or 24 months
    const stepsCount = rawCurriculum.length;
    const monthsPerStep = Math.max(1, Math.floor(months / stepsCount));
    for (let i = 0; i < stepsCount; i++) {
      const start = i * monthsPerStep + 1;
      const end = Math.min(months, (i + 1) * monthsPerStep);
      const monthLabel = start !== end ? `Months ${start}-${end}` : `Month ${start}`;
      roadmap.push({
        month: monthLabel,
        title: rawCurriculum[i].title,
        topics: rawCurriculum[i].topics,
        project: rawCurriculum[i].project,
        practice: rawCurriculum[i].practice,
        interview: rawCurriculum[i].interview,
        portfolio: rawCurriculum[i].portfolio
      });
    }
  }
  
  // Calculate scores
  const currentSkillsLower = userData.current_skills
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  
  const matching: string[] = [];
  const missing: string[] = [];
  
  for (const req of roleInfo.skills) {
    let isMatch = false;
    for (const cur of currentSkillsLower) {
      if (cur && (req.toLowerCase().includes(cur) || cur.includes(req.toLowerCase()))) {
        isMatch = true;
        break;
      }
    }
    if (isMatch) {
      matching.push(req);
    } else {
      missing.push(req);
    }
  }
  
  const totalReq = roleInfo.skills.length;
  let readiness = Math.round((matching.length / Math.max(totalReq, 1)) * 100);
  readiness = Math.min(Math.max(readiness, 20), 95); // baseline limits
  
  const skillGap = 100 - readiness;
  let difficulty = "Moderate";
  if (missing.length > 6) {
    difficulty = "Hard";
  } else if (missing.length <= 3) {
    difficulty = "Easy";
  }
  
  const dailyTarget = Math.round((userData.study_hours / 6) * 10) / 10;
  
  const mentor = {
    weekly_goal: `Master the core skill set defined for the current roadmap month. Dedicate ${userData.study_hours} hours to practical coding.`,
    daily_target: `Spend ${dailyTarget} hours practicing key concepts and writing clean syntax in code repositories.`,
    schedule: `Split study time: 40% reading & tutorials, 60% building and styling projects. Take 15-minute breaks every hour.`,
    checkpoints: [
      "Write down 3 key concepts learned every day.",
      "Resolve syntax issues and commit updates to GitHub weekly.",
      "Record a 2-minute video explaining your project functionalities to practice communication skills."
    ]
  };
  
  return {
    readiness_score: readiness,
    skill_gap_score: skillGap,
    difficulty,
    matching_skills: matching,
    missing_skills: missing,
    roadmap,
    mentor,
    role_details: roleInfo
  };
}

export const generateCareerRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RoadmapInputSchema.parse(input))
  .handler(async ({ data }) => {
    // If a custom API key or standard system API keys exist, we can use LLM
    const customKey = data.custom_key?.trim();
    const systemLovableKey = process.env.LOVABLE_API_KEY;
    const systemGeminiKey = process.env.GEMINI_API_KEY;
    const systemOpenaiKey = process.env.OPENAI_API_KEY;
    
    const hasKeys = !!(customKey || systemLovableKey || systemGeminiKey || systemOpenaiKey);
    
    // Fall back to local database heuristics if keys are missing or specifically requested local
    if (!hasKeys) {
      return generateLocalRoadmap(data);
    }
    
    // Initialize model
    let model: any;
    try {
      if (data.provider === "OpenAI" && customKey) {
        const provider = createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          headers: { Authorization: `Bearer ${customKey}` },
        });
        model = provider("gpt-4o-mini");
      } else if (data.provider === "Gemini" && customKey) {
        const provider = createOpenAICompatible({
          name: "gemini",
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          headers: { Authorization: `Bearer ${customKey}` },
        });
        model = provider("gemini-1.5-flash");
      } else if (systemLovableKey) {
        const gateway = createLovableAiGatewayProvider(systemLovableKey);
        model = gateway("google/gemini-3-flash-preview");
      } else if (systemGeminiKey) {
        const provider = createOpenAICompatible({
          name: "gemini",
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          headers: { Authorization: `Bearer ${systemGeminiKey}` },
        });
        model = provider("gemini-1.5-flash");
      } else if (systemOpenaiKey) {
        const provider = createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          headers: { Authorization: `Bearer ${systemOpenaiKey}` },
        });
        model = provider("gpt-4o-mini");
      }
      
      const prompt = `
      You are a premium career development strategist and placement mentor. 
      Analyze the user profile details and generate a highly personalized month-by-month career roadmap.

      User Profile:
      - Name: ${data.name}
      - Degree: ${data.degree}
      - Semester: ${data.semester}
      - Current Skills: ${data.current_skills}
      - Certifications: ${data.certifications || "None"}
      - Completed Projects: ${data.projects || "None"}
      - Target Role: ${data.target_role}
      - Weekly Study Time: ${data.study_hours} hours
      - Timeline: ${data.timeline_months} months

      Provide your response as a valid JSON object. Do not include markdown code block formatting (like \`\`\`json) or any prefix/suffix outside the JSON.
      The response must strictly follow this JSON structure:
      {
          "readiness_score": <integer from 0 to 100 representing job readiness based on target role requirements>,
          "skill_gap_score": <integer from 0 to 100 representing skill gap>,
          "difficulty": "<Easy / Moderate / Hard>",
          "matching_skills": ["<skills user currently has that match the role>"],
          "missing_skills": ["<skills user needs to learn for the role>"],
          "roadmap": [
              {
                  "month": "<Month 1 / Months 1-2 etc.>",
                  "title": "<Skill theme title>",
                  "topics": ["<topic 1>", "<topic 2>"],
                  "project": "<recommended project description>",
                  "practice": "<practical goals>",
                  "interview": "<interview prep questions or concepts>",
                  "portfolio": "<portfolio/deployment improvements>"
              }
          ],
          "mentor": {
              "weekly_goal": "<detailed weekly goal>",
              "daily_target": "<detailed daily target>",
              "schedule": "<study schedule structure>",
              "checkpoints": ["<checkpoint 1>", "<checkpoint 2>"]
          }
      }
      `;
      
      const response = await generateText({
        model,
        prompt,
      });
      
      let text = response.text.trim();
      // Clean markdown code blocks if the model returned any
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?/im, "").replace(/```$/m, "").trim();
      }
      
      const result = JSON.parse(text);
      
      // Merge role details from local database for resources & static details
      const roleInfo = ROLES_DB[data.target_role] || ROLES_DB["Full Stack Engineer"];
      result.role_details = roleInfo;
      
      return result;
    } catch (error) {
      console.error("AI career roadmap generation failed, falling back to local database:", error);
      return generateLocalRoadmap(data);
    }
  });

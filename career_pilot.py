import streamlit as st
import json
import re

# Page Config
st.set_page_config(
    page_title="StudentOS — CareerPilot AI",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Premium UI CSS styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    
    .stApp {
        font-family: 'Outfit', sans-serif;
    }
    
    h1, h2, h3, .title-text {
        font-family: 'Space Grotesk', sans-serif;
    }
    
    /* Header styling */
    .header-banner {
        padding: 2.5rem;
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.15), rgba(37, 99, 235, 0.15), rgba(99, 102, 241, 0.05));
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        margin-bottom: 2rem;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    
    .main-title {
        font-size: 3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #1e3a8a, #2563eb, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    
    .sub-title {
        font-size: 1.15rem;
        color: #64748b;
        max-width: 700px;
        margin: 0 auto;
        line-height: 1.6;
    }

    /* Metric Cards */
    .metric-card {
        background-color: rgba(30, 41, 59, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
    }
    
    /* Timeline Card */
    .timeline-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border-left: 5px solid #2563eb;
    }
    
    .timeline-month {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 8px;
    }
    
    .timeline-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #334155;
        margin-bottom: 12px;
    }
    
    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 5px;
        margin-bottom: 5px;
    }
    
    .badge-primary {
        background-color: rgba(37, 99, 235, 0.1);
        color: #2563eb;
        border: 1px solid rgba(37, 99, 235, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# Curated Local Roles Database
ROLES_DB = {
    "Frontend Engineer": {
        "skills": ["HTML5/CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Tailwind CSS", "Redux Toolkit", "Git & GitHub", "Vite", "Testing (Jest/Cypress)"],
        "salary": "₹6.5L - ₹18L per annum",
        "companies": ["Microsoft", "Flipkart", "Razorpay", "Uber", "CRED", "Zomato"],
        "demand": "Very High",
        "growth": "15% YoY",
        "resources": {
            "JavaScript (ES6+)": {"youtube": "https://www.youtube.com/results?search_query=javascript+es6+tutorial", "doc": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "platform": "LeetCode (JS)", "project": "Build an Interactive Task Manager App"},
            "React.js": {"youtube": "https://www.youtube.com/results?search_query=react+js+complete+course", "doc": "https://react.dev", "platform": "Scrimba / Frontend Mentor", "project": "Develop a Premium E-commerce Interface"},
            "Tailwind CSS": {"youtube": "https://www.youtube.com/results?search_query=tailwind+css+tutorial", "doc": "https://tailwindcss.com", "platform": "Frontend Mentor", "project": "Design a Sleek Portfolio Website"},
            "Next.js": {"youtube": "https://www.youtube.com/results?search_query=nextjs+tutorial+complete", "doc": "https://nextjs.org", "platform": "Vercel Guides", "project": "Build a Server-Side Rendered Blog platform"}
        },
        "curriculum": [
            {"title": "HTML5, CSS3 & Responsive Web Design", "topics": ["Semantic HTML", "CSS Grid & Flexbox", "Media Queries", "Sleek layouts"], "project": "Create a fully responsive agency landing page", "practice": "Format structures and build CSS layouts manually", "interview": "Explain CSS box model, flexbox positioning, and semantic accessibility.", "portfolio": "Host page on GitHub Pages with clean styling"},
            {"title": "JavaScript Foundations & ES6+", "topics": ["DOM manipulation", "Promises & Async/Await", "Closures & Prototypes", "ES6 imports/exports"], "project": "Build a dynamic weather app interacting with a REST API", "practice": "Implement array methods (map, filter, reduce) from scratch", "interview": "Explain closures, event loop, hoisting, and difference between == and ===.", "portfolio": "Add weather project to portfolio with functional API fetching"},
            {"title": "TypeScript & Frontend Tooling", "topics": ["Static Types & Interfaces", "Generics", "Vite configurations", "Webpack vs Vite"], "project": "Convert the weather app to TypeScript with strict configurations", "practice": "Write complex typings for API response objects", "interview": "What are the benefits of TypeScript over Javascript? Explain generics.", "portfolio": "Publish a clean NPM package of a typescript utility"},
            {"title": "React.js Basics & State Management", "topics": ["Components & Props", "React Hooks (useState, useEffect)", "Context API", "Virtual DOM principles"], "project": "Build a premium Task Planner with filters and categories", "practice": "Manage state globally using Context API", "interview": "Explain component lifecycle hooks, React Fiber, and why key prop is needed.", "portfolio": "Deploy Task Planner to Vercel with responsive styling"},
            {"title": "Advanced React, Tailwind & Routing", "topics": ["Next.js App Router", "Tailwind CSS styling rules", "React Router DOM", "Performance optimization"], "project": "Develop a real-time Chat Application frontend", "practice": "Create smooth transitions and animation effects using Framer Motion", "interview": "Explain Server Components vs Client Components. What is Hydration?", "portfolio": "Verify Chat App builds without errors on Vercel"},
            {"title": "Global State & Testing", "topics": ["Redux Toolkit (RTK Query)", "Unit testing with Jest", "Integration testing with Cypress", "CI/CD deployment"], "project": "Build a fully-featured E-commerce checkout platform", "practice": "Integrate local storage caching with RTK Query states", "interview": "How does Redux work? What is the difference between Jest and Cypress?", "portfolio": "Complete final testing reports and publish code source on GitHub"}
        ]
    },
    "Backend Engineer": {
        "skills": ["Python", "Node.js", "Go", "FastAPI", "Express.js", "PostgreSQL", "MongoDB", "Redis", "Docker", "REST & gRPC", "System Design"],
        "salary": "₹7L - ₹20L per annum",
        "companies": ["Amazon", "Google", "Paytm", "PhonePe", "Walmart", "Razorpay"],
        "demand": "Very High",
        "growth": "18% YoY",
        "resources": {
            "Node.js / Express": {"youtube": "https://www.youtube.com/results?search_query=nodejs+backend+tutorial", "doc": "https://nodejs.org", "platform": "FreeCodeCamp", "project": "Build a REST API for library management"},
            "Databases (SQL/NoSQL)": {"youtube": "https://www.youtube.com/results?search_query=sql+database+complete+course", "doc": "https://www.postgresql.org/docs/", "platform": "SQLZoo / LeetCode", "project": "Design a relational schema for a booking portal"},
            "System Design": {"youtube": "https://www.youtube.com/results?search_query=system+design+backend", "doc": "https://github.com/donnemartin/system-design-primer", "platform": "ByteByteGo", "project": "Write design documentation for a URL shortener scaling to 1M users"},
            "Docker & Deployment": {"youtube": "https://www.youtube.com/results?search_query=docker+kubernetes+tutorial", "doc": "https://docs.docker.com", "platform": "Play with Docker", "project": "Containerize a multi-service backend with Postgres and Redis"}
        },
        "curriculum": [
            {"title": "Language Foundations & Async Basics", "topics": ["Language syntax (Node.js/Python/Go)", "Async runtime and Event Loop", "File systems and I/O", "Package managers (NPM/PIP)"], "project": "Build a CLI file organizer tool", "practice": "Handle asynchronous operations using native language construct tools", "interview": "Explain threads vs events, async vs sync calls, and error handling patterns.", "portfolio": "Make CLI tool installable via package manager"},
            {"title": "REST APIs & Router Frameworks", "topics": ["Express/FastAPI routing", "Middleware architectures", "Request validation & parsing", "JSON Web Tokens (JWT) auth"], "project": "Develop a User Authentication and Management microservice", "practice": "Implement rate limiting and password hashing checks", "interview": "What is REST? Explain HTTP status codes and how JWT authentication works.", "portfolio": "Deploy service to Render with secure environment parameters"},
            {"title": "Databases & ORM Integrations", "topics": ["PostgreSQL/MySQL queries", "MongoDB database structures", "Prisma/Mongoose/SQLAlchemy ORMs", "Transaction controls"], "project": "Design and integrate database schema for a Blog engine", "practice": "Write optimized join queries and index key fields", "interview": "Explain SQL Joins, Indexing, ACID transactions, and SQL vs NoSQL database architectures.", "portfolio": "Publish entity-relationship diagrams and SQL migration scripts on GitHub"},
            {"title": "Caching & Message Brokers", "topics": ["Redis caching", "Message brokers (RabbitMQ/Kafka)", "In-memory datastores", "Job queues"], "project": "Build a background email notifier processing queue with Redis", "practice": "Configure cache invalidation mechanisms", "interview": "What is caching? How do you prevent cache stampede? Explain Pub/Sub vs Message Queues.", "portfolio": "Integrate queue status monitoring panels in git repo documentation"},
            {"title": "Containerization & Cloud Basics", "topics": ["Docker containers", "Docker Compose structures", "AWS EC2/S3 concepts", "Log management"], "project": "Containerize booking engine with local database and caching instances", "practice": "Write multi-stage Dockerfiles to minimize build footprints", "interview": "What is containerization? Explain difference between Docker image and container.", "portfolio": "Publish built container to Docker Hub repository"},
            {"title": "System Design & Scaling", "topics": ["Load balancing", "Database replication", "Horizontal vs vertical scaling", "API Gateway logic"], "project": "Create high-level architecture designs for scaling a social feed to 10M users", "practice": "Implement API rate-limiting policies at gateway routers", "interview": "Explain sharding, read-replicas, CAP theorem, and CDN distribution.", "portfolio": "Format architecture markdown files with diagrams and host on GitHub"}
        ]
    },
    "Full Stack Engineer": {
        "skills": ["HTML5/CSS3", "JavaScript (ES6+)", "React.js", "Node.js", "Express.js", "MongoDB", "SQL Basics", "Git & GitHub", "Tailwind CSS", "REST APIs", "Cloud Deployment"],
        "salary": "₹7.5L - ₹22L per annum",
        "companies": ["Paytm", "Swiggy", "Cure.fit", "Google", "Innovaccer", "Ola"],
        "demand": "Extremely High",
        "growth": "20% YoY",
        "resources": {
            "React.js": {"youtube": "https://www.youtube.com/results?search_query=react+js+tutorial", "doc": "https://react.dev", "platform": "Frontend Mentor", "project": "Create dynamic SPA dashboards"},
            "Node.js & Express": {"youtube": "https://www.youtube.com/results?search_query=nodejs+express+mongodb+tutorial", "doc": "https://expressjs.com", "platform": "FreeCodeCamp", "project": "Develop complete API with CRUD functionalities"},
            "MERN Full Stack": {"youtube": "https://www.youtube.com/results?search_query=mern+stack+project+tutorial", "doc": "https://www.mongodb.com/mern-stack", "platform": "FullStackOpen", "project": "Build and deploy a collaborative Workspace platform"},
            "Git & CI/CD": {"youtube": "https://www.youtube.com/results?search_query=git+github+ci+cd+complete", "doc": "https://docs.github.com", "platform": "LearnGitBranching", "project": "Deploy website using GitHub Actions integration"}
        },
        "curriculum": [
            {"title": "Frontend Layouts & Logic (HTML/CSS/JS)", "topics": ["Responsive Flex/Grid Systems", "DOM manipulations", "ES6+ Async operations", "Tailwind styling CSS framework"], "project": "Design mock analytics dashboard web interface", "practice": "Query and render structured elements dynamically using Fetch API", "interview": "Explain grid vs flexbox, Promises, and AJAX structures.", "portfolio": "Publish responsive portal template"},
            {"title": "Frontend Library Frameworks (React.js)", "topics": ["React states and props routing", "Effects & custom hooks triggers", "Global Context management", "Tailwind responsive design rules"], "project": "Build an academic Course registration frontend application", "practice": "Manage complex UI grids with multi-level search options", "interview": "Explain Virtual DOM, state hooks, and custom hooks creation logic.", "portfolio": "Deploy code components to Vercel portal"},
            {"title": "Backend Services & API Layer (Node.js/Express)", "topics": ["Express server handling", "Middleware setup and configurations", "Request parsing & CORS handling", "REST API architecture methods"], "project": "Develop a microservice serving catalog details and items list", "practice": "Implement structured route groupings with error middlewares", "interview": "Explain request pipelines, Express routing, and REST concepts.", "portfolio": "Verify API responses via tools and host code"},
            {"title": "Databases & Storage (MongoDB & SQL)", "topics": ["MongoDB collection structures", "SQL tables structure relations", "Mongoose ORM integration", "Database CRUD transactions"], "project": "Design database model for a Student profile portfolio database", "practice": "Implement query aggregation logic", "interview": "Compare SQL vs NoSQL, explain database index triggers and ORM benefits.", "portfolio": "Publish database schema structure diagrams"},
            {"title": "Full Stack Integration (MERN)", "topics": ["Connecting frontend UI to backend API", "Token-based secure authentication (JWT)", "Cookies & Session stores", "Unified CORS setups"], "project": "Build a portal where students write reviews and rate academic mentors", "practice": "Save tokens inside local state structures securely", "interview": "Explain CSRF, CORS policies, secure sessions, and token handling.", "portfolio": "Deploy both services to unified web hosting portal"},
            {"title": "Production Deployment & Pipelines", "topics": ["Vercel/Render hosting portals", "CI/CD automated release builds", "Monitoring API logs", "Testing suite run configs"], "project": "Run automated test suites and deploy full MERN web portal publicly", "practice": "Write pipeline scripts running tests before pushing builds", "interview": "What is CI/CD? Explain production scaling issues and monitoring logs.", "portfolio": "Ensure full website runs without warnings or errors"}
        ]
    },
    "Data Scientist / ML Engineer": {
        "skills": ["Python", "NumPy & Pandas", "Matplotlib & Seaborn", "Scikit-Learn", "TensorFlow / PyTorch", "SQL queries", "Jupyter Notebooks", "Data Visualization", "Git & GitHub"],
        "salary": "₹8L - ₹24L per annum",
        "companies": ["Google", "NVIDIA", "Adobe", "Mu Sigma", "Fractal Analytics", "IBM"],
        "demand": "High",
        "growth": "22% YoY",
        "resources": {
            "Data Analysis with Pandas": {"youtube": "https://www.youtube.com/results?search_query=python+pandas+data+science", "doc": "https://pandas.pydata.org", "platform": "Kaggle Learn", "project": "Analyze placement records dataset"},
            "Machine Learning Algorithms": {"youtube": "https://www.youtube.com/results?search_query=machine+learning+complete+course", "doc": "https://scikit-learn.org", "platform": "Kaggle Competitions", "project": "Build salary prediction models using Regression"},
            "Deep Learning & NLP": {"youtube": "https://www.youtube.com/results?search_query=deep+learning+pytorch+tutorial", "doc": "https://pytorch.org", "platform": "Hugging Face Course", "project": "Create text sentiment classifier neural net"}
        },
        "curriculum": [
            {"title": "Python for Data Analysis", "topics": ["Pandas dataframes manipulation", "NumPy numeric arrays processing", "Jupyter environments", "Matplotlib charts"], "project": "Clean and explore a housing market dataset", "practice": "Perform data imputation, aggregation, and filtering", "interview": "Explain standard deviation, Pandas merge vs join, and array slicing.", "portfolio": "Publish Jupyter Notebook analysis report on GitHub"},
            {"title": "Statistical Methods & SQL", "topics": ["Probability distributions", "Hypothesis testing & p-values", "SQL window functions", "Data normalization rules"], "project": "Run A/B testing evaluation on a web user interface logs dataset", "practice": "Write multi-table joins and aggregation subqueries in SQL", "interview": "Explain Type I vs Type II errors, Central Limit Theorem, and SQL schemas.", "portfolio": "Publish SQL queries scripts for database analysis"},
            {"title": "Classical Machine Learning", "topics": ["Regression models (Linear/Logistic)", "Classification methods (Decision Trees, Random Forest)", "Model validation metrics (Precision/Recall)", "Hyperparameter tuning"], "project": "Develop loan eligibility evaluation model", "practice": "Perform feature engineering and feature selection cycles", "interview": "Explain bias-variance trade-off, overfitting remedies, and ROC-AUC curve.", "portfolio": "Publish loan classification package on GitHub"},
            {"title": "Unsupervised Learning & Clustering", "topics": ["K-Means clustering", "Dimensionality reduction (PCA)", "Hierarchical clustering", "Anomaly detection"], "project": "Segment customers based on purchasing behavior dataset", "practice": "Evaluate optimal clusters count using Elbow method", "interview": "How does PCA work? Explain distance metrics used in K-Means clustering.", "portfolio": "Publish interactive customer segmentation dashboard"},
            {"title": "Deep Learning Foundations", "topics": ["Neural Networks structure", "Activation functions (ReLU, Sigmoid)", "Loss functions & Optimizers", "PyTorch basics"], "project": "Build an image classifier using Convolutional Neural Networks (CNNs)", "practice": "Train neural network and monitor loss charts", "interview": "Explain backpropagation, gradient descent, and function of activation functions.", "portfolio": "Publish training checkpoint files on cloud server"},
            {"title": "ML Model Deployment & MLOps", "topics": ["Flask/FastAPI API wrapper", "Streamlit UI interfaces", "Docker containers", "Model monitoring metrics"], "project": "Deploy the loan model as a Streamlit web application on Docker", "practice": "Write wrapper API endpoints serving real-time model predictions", "interview": "How do you deploy ML models? What are the key elements of MLOps?", "portfolio": "Host live model dashboard publicly for users to test"}
        ]
    }
}

# AI Engine helper using local heuristics
def generate_local_roadmap(user_data):
    role = user_data["target_role"]
    months = user_data["timeline_months"]
    
    role_info = ROLES_DB.get(role, ROLES_DB["Full Stack Engineer"])
    raw_curriculum = role_info["curriculum"]
    
    # Adjust monthly roadmap cards based on user timeline selection (3, 6, 12, 24 months)
    roadmap = []
    
    if months == 3:
        # Combine 6 steps into 3 months
        roadmap.append({
            "month": "Month 1",
            "title": f"{raw_curriculum[0]['title']} & {raw_curriculum[1]['title']}",
            "topics": raw_curriculum[0]["topics"] + raw_curriculum[1]["topics"],
            "project": f"{raw_curriculum[0]['project']} + {raw_curriculum[1]['project']}",
            "practice": f"1. {raw_curriculum[0]['practice']}\n2. {raw_curriculum[1]['practice']}",
            "interview": f"1. {raw_curriculum[0]['interview']}\n2. {raw_curriculum[1]['interview']}",
            "portfolio": f"1. {raw_curriculum[0]['portfolio']}\n2. {raw_curriculum[1]['portfolio']}"
        })
        roadmap.append({
            "month": "Month 2",
            "title": f"{raw_curriculum[2]['title']} & {raw_curriculum[3]['title']}",
            "topics": raw_curriculum[2]["topics"] + raw_curriculum[3]["topics"],
            "project": f"{raw_curriculum[2]['project']} + {raw_curriculum[3]['project']}",
            "practice": f"1. {raw_curriculum[2]['practice']}\n2. {raw_curriculum[3]['practice']}",
            "interview": f"1. {raw_curriculum[2]['interview']}\n2. {raw_curriculum[3]['interview']}",
            "portfolio": f"1. {raw_curriculum[2]['portfolio']}\n2. {raw_curriculum[3]['portfolio']}"
        })
        roadmap.append({
            "month": "Month 3",
            "title": f"{raw_curriculum[4]['title']} & {raw_curriculum[5]['title']}",
            "topics": raw_curriculum[4]["topics"] + raw_curriculum[5]["topics"],
            "project": f"{raw_curriculum[4]['project']} + {raw_curriculum[5]['project']}",
            "practice": f"1. {raw_curriculum[4]['practice']}\n2. {raw_curriculum[5]['practice']}",
            "interview": f"1. {raw_curriculum[4]['interview']}\n2. {raw_curriculum[5]['interview']}",
            "portfolio": f"1. {raw_curriculum[4]['portfolio']}\n2. {raw_curriculum[5]['portfolio']}"
        })
    elif months == 6:
        # Map 1-to-1
        for i, step in enumerate(raw_curriculum):
            roadmap.append({
                "month": f"Month {i+1}",
                "title": step["title"],
                "topics": step["topics"],
                "project": step["project"],
                "practice": step["practice"],
                "interview": step["interview"],
                "portfolio": step["portfolio"]
            })
    else:
        # 12 or 24 months: Spread them across the timeline
        steps_count = len(raw_curriculum)
        months_per_step = max(1, months // steps_count)
        
        for i, step in enumerate(raw_curriculum):
            start = i * months_per_step + 1
            end = min(months, (i + 1) * months_per_step)
            month_label = f"Months {start}-{end}" if start != end else f"Month {start}"
            
            roadmap.append({
                "month": month_label,
                "title": step["title"],
                "topics": step["topics"],
                "project": step["project"],
                "practice": step["practice"],
                "interview": step["interview"],
                "portfolio": step["portfolio"]
            })
            
    # Calculate scores based on current skills count vs required skills count
    current_skills_lower = [s.strip().lower() for s in user_data["current_skills"].split(",")]
    matching = []
    missing = []
    
    for req in role_info["skills"]:
        is_match = False
        for cur in current_skills_lower:
            if cur and (cur in req.lower() or req.lower() in cur):
                is_match = True
                break
        if is_match:
            matching.append(req)
        else:
            missing.append(req)
            
    total_req = len(role_info["skills"])
    readiness = int((len(matching) / max(total_req, 1)) * 100)
    readiness = min(max(readiness, 20), 95) # baseline
    
    # Calculate metrics
    skill_gap = 100 - readiness
    difficulty = "Moderate"
    if len(missing) > 6:
        difficulty = "Hard"
    elif len(missing) <= 3:
        difficulty = "Easy"
        
    # Schedule
    study_hours = user_data["study_hours"]
    daily_target = round(study_hours / 6, 1)
    
    # AI Mentor Checkpoints
    mentor = {
        "weekly_goal": f"Master the core skill set defined for the current roadmap month. Dedicate {study_hours} hours to practical coding.",
        "daily_target": f"Spend {daily_target} hours practicing key concepts and writing clean syntax in code repositories.",
        "schedule": f"Split study time: 40% reading & tutorials, 60% building and styling projects. Take 15-minute breaks every hour.",
        "checkpoints": [
            "Write down 3 key concepts learned every day.",
            "Resolve syntax issues and commit updates to GitHub weekly.",
            "Record a 2-minute video explaining your project functionalities to practice communication skills."
        ]
    }
    
    return {
        "readiness_score": readiness,
        "skill_gap_score": skill_gap,
        "difficulty": difficulty,
        "matching_skills": matching,
        "missing_skills": missing,
        "roadmap": roadmap,
        "mentor": mentor,
        "role_details": role_info
    }

# LLM call fallback (Gemini)
def generate_ai_roadmap_gemini(api_key, user_data, model_name):
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    
    prompt = f"""
    You are a premium career development strategist and placement mentor. 
    Analyze the user profile details and generate a highly personalized month-by-month career roadmap.

    User Profile:
    - Name: {user_data['name']}
    - Degree: {user_data['degree']}
    - Semester: {user_data['semester']}
    - Current Skills: {user_data['current_skills']}
    - Certifications: {user_data['certifications']}
    - Completed Projects: {user_data['projects']}
    - Target Role: {user_data['target_role']}
    - Weekly Study Time: {user_data['study_hours']} hours
    - Timeline: {user_data['timeline_months']} months

    Provide your response as a valid JSON object. Do not include markdown code block formatting (like ```json) or any prefix/suffix outside the JSON.
    The response must strictly follow this JSON structure:
    {{
        "readiness_score": <integer from 0 to 100 representing job readiness based on target role requirements>,
        "skill_gap_score": <integer from 0 to 100 representing skill gap>,
        "difficulty": "<Easy / Moderate / Hard>",
        "matching_skills": ["<skills user currently has that match the role>"],
        "missing_skills": ["<skills user needs to learn for the role>"],
        "roadmap": [
            {{
                "month": "<Month 1 / Months 1-2 etc.>",
                "title": "<Skill theme title>",
                "topics": ["<topic 1>", "<topic 2>"],
                "project": "<recommended project description>",
                "practice": "<practical goals>",
                "interview": "<interview prep questions or concepts>",
                "portfolio": "<portfolio/deployment improvements>"
            }}
        ],
        "mentor": {{
            "weekly_goal": "<detailed weekly goal>",
            "daily_target": "<detailed daily target>",
            "schedule": "<study schedule structure>",
            "checkpoints": ["<checkpoint 1>", "<checkpoint 2>"]
        }}
    }}
    """
    response = model.generate_content(prompt)
    
    # Simple JSON string extractor
    cleaned = response.text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE)
    return json.loads(cleaned.strip())


# HEADER BANNER
st.markdown("""
<div class="header-banner">
    <div class="main-title">CareerPilot AI</div>
    <div class="sub-title">Personalized month-by-month roadmaps, skills gaps analytics, learning resources, and mentor schedules — tailored to target roles.</div>
</div>
""", unsafe_allow_html=True)

# Layout
form_col, result_col = st.columns([1, 1], gap="large")

with form_col:
    st.subheader("🧭 Career Assessment Form")
    
    # Sidebar Config Expandable for optional API keys
    with st.expander("🔑 Optional: Use Custom API Keys"):
        provider = st.selectbox("LLM Provider", ["Gemini", "OpenAI"])
        custom_key = st.text_input("Enter API Key", type="password", help="Leave blank to use the local heuristics database automatically")
        model_name = "gemini-1.5-flash" if provider == "Gemini" else "gpt-4o-mini"
        
    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
    
    name = st.text_input("Name", placeholder="Enter your full name", value="Yash Barjatya")
    
    deg_col, sem_col = st.columns([2, 1])
    with deg_col:
        degree = st.selectbox("Current Degree", ["MCA Student", "BCA Student", "Engineering (B.Tech)", "Fresher / Graduate", "Career Switcher"])
    with sem_col:
        semester = st.selectbox("Semester / Year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "Completed"])
        
    current_skills = st.text_area("Current Skills", placeholder="e.g. HTML, CSS, Javascript basics, C++ programming", value="HTML, CSS, JavaScript, Basic Git")
    
    cert_col, proj_col = st.columns([1, 1])
    with cert_col:
        certifications = st.text_input("Certifications Completed", placeholder="e.g. FreeCodeCamp, Azure Fundamentals")
    with proj_col:
        projects = st.text_input("Completed Projects", placeholder="e.g. Personal Portfolio website")
        
    role_col, time_col = st.columns([1, 1])
    with role_col:
        target_role = st.selectbox("Target Role", ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Data Scientist / ML Engineer"])
    with time_col:
        timeline = st.selectbox("Expected Timeline", ["3 Months", "6 Months", "12 Months", "24 Months"])
        
    hours_col, btn_col = st.columns([1, 1])
    with hours_col:
        study_hours = st.slider("Available Study Hours / Week", min_value=5, max_value=50, value=15, step=5)
    
    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
    generate_btn = st.button("🚀 Generate Personalized Roadmap", use_container_width=True, type="primary")

with result_col:
    st.subheader("📊 Career Analytics & Dashboard")
    
    # Process Submit
    if generate_btn:
        # Parse timeline months
        timeline_months = 6
        if "3" in timeline:
            timeline_months = 3
        elif "12" in timeline:
            timeline_months = 12
        elif "24" in timeline:
            timeline_months = 24
            
        user_data = {
            "name": name,
            "degree": degree,
            "semester": semester,
            "current_skills": current_skills,
            "certifications": certifications,
            "projects": projects,
            "target_role": target_role,
            "study_hours": study_hours,
            "timeline_months": timeline_months
        }
        
        with st.spinner("⏳ Analyzing profile and compiling custom roadmap..."):
            try:
                # Use local heuristics by default, or LLM if key is entered
                if 'custom_key' in locals() and custom_key.strip():
                    if provider == "Gemini":
                        data = generate_ai_roadmap_gemini(custom_key, user_data, model_name)
                        # Fetch default resources database to attach
                        role_info = ROLES_DB.get(target_role, ROLES_DB["Full Stack Engineer"])
                        data["role_details"] = role_info
                    else:
                        st.error("OpenAI custom keys integration in progress. Fallback to local analyzer.")
                        data = generate_local_roadmap(user_data)
                else:
                    data = generate_local_roadmap(user_data)
                
                # Cache results in Session State
                st.session_state["roadmap_result"] = data
                st.session_state["roadmap_user"] = name
                st.session_state["roadmap_role"] = target_role
                
            except Exception as e:
                st.error(f"❌ Analysis failed: {str(e)}")
                
    # Render Dashboard from Session State
    if "roadmap_result" in st.session_state:
        data = st.session_state["roadmap_result"]
        name = st.session_state["roadmap_user"]
        role = st.session_state["roadmap_role"]
        
        readiness = data.get("readiness_score", 50)
        gap = data.get("skill_gap_score", 50)
        difficulty = data.get("difficulty", "Moderate")
        
        # Color coding
        score_color = "#ef4444"
        if readiness >= 80:
            score_color = "#22c55e"
        elif readiness >= 50:
            score_color = "#eab308"
            
        # Metric Layout Columns
        col_m1, col_m2, col_m3 = st.columns([1, 1, 1])
        with col_m1:
            st.markdown(f"""
            <div class="metric-card">
                <div style="font-size: 0.85rem; font-weight: 600; color: #64748b;">JOB READINESS SCORE</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: {score_color}; margin: 5px 0;">{readiness}%</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">Industry target is 80%+</div>
            </div>
            """, unsafe_allow_html=True)
        with col_m2:
            st.markdown(f"""
            <div class="metric-card">
                <div style="font-size: 0.85rem; font-weight: 600; color: #64748b;">SKILL GAP SCORE</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #6366f1; margin: 5px 0;">{gap}%</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">Missing key target skills</div>
            </div>
            """, unsafe_allow_html=True)
        with col_m3:
            st.markdown(f"""
            <div class="metric-card">
                <div style="font-size: 0.85rem; font-weight: 600; color: #64748b;">LEARNING DIFFICULTY</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #3b82f6; margin: 10px 0;">{difficulty}</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">Based on timeline & gaps</div>
            </div>
            """, unsafe_allow_html=True)
            
        # Skill analysis
        st.markdown("<div style='height: 15px;'></div>", unsafe_allow_html=True)
        st.write("#### 🎯 Skill Gaps Breakdown")
        
        col_sk1, col_sk2 = st.columns([1, 1])
        with col_sk1:
            st.markdown("""<div style="border: 1px solid rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.03); border-radius: 8px; padding: 12px;">""", unsafe_allow_html=True)
            st.markdown("<span style='color: #22c55e; font-weight: bold;'>✔ Matching Strengths</span>", unsafe_allow_html=True)
            matching = data.get("matching_skills", [])
            if matching:
                for skill in matching:
                    st.markdown(f'<span class="badge badge-primary">{skill}</span>', unsafe_allow_html=True)
            else:
                st.write("<span style='font-size: 0.85rem; color: #64748b;'>No matching core skills identified.</span>", unsafe_allow_html=True)
            st.markdown("</div>", unsafe_allow_html=True)
            
        with col_sk2:
            st.markdown("""<div style="border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.03); border-radius: 8px; padding: 12px;">""", unsafe_allow_html=True)
            st.markdown("<span style='color: #ef4444; font-weight: bold;'>✖ Skill Gaps / Weaknesses</span>", unsafe_allow_html=True)
            missing = data.get("missing_skills", [])
            if missing:
                for skill in missing:
                    st.markdown(f'<span style="background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);" class="badge">{skill}</span>', unsafe_allow_html=True)
            else:
                st.write("<span style='font-size: 0.85rem; color: #64748b;'>All target skills are matched!</span>", unsafe_allow_html=True)
            st.markdown("</div>", unsafe_allow_html=True)
            
    else:
        st.info("💡 Fill out the Career Assessment Form and click generate to view your personalized roadmap and placement diagnostics.")

# MONTH-BY-MONTH ROADMAP TIMELINE (Full Width)
if "roadmap_result" in st.session_state:
    data = st.session_state["roadmap_result"]
    st.markdown("<hr style='border-top: 1px solid rgba(0, 0, 0, 0.05); margin: 30px 0;' />", unsafe_allow_html=True)
    
    st.subheader("🗺️ Month-by-Month Career Roadmap")
    st.write("Follow this interactive, progressive month-by-month plan designed to build technical competence and prepare you for hiring loops.")
    
    # Progress tracker sidebar
    stages = data.get("roadmap", [])
    
    for item in stages:
        with st.container():
            st.markdown(f"""
            <div class="timeline-card">
                <div class="timeline-month">{item.get('month', 'Month')}</div>
                <div class="timeline-title">{item.get('title', 'Learning Step')}</div>
                <hr style="border-top: 1px dashed #e2e8f0; margin: 10px 0;" />
            </div>
            """, unsafe_allow_html=True)
            
            # Sub-columns inside timeline card
            t_col1, t_col2 = st.columns([1, 1], gap="medium")
            with t_col1:
                st.write("**📚 Topics to Master:**")
                topics = item.get("topics", [])
                if isinstance(topics, list):
                    for topic in topics:
                        st.write(f"- {topic}")
                else:
                    st.write(topics)
                    
                st.write("**💻 Practice Goals:**")
                st.write(item.get("practice", "Daily practice on platforms"))
                
            with t_col2:
                st.write("**🚀 Recommended Project:**")
                st.write(item.get("project", "Build a micro application"))
                
                st.write("**🤝 Placement & Interview Prep:**")
                st.write(item.get("interview", "Explain basic architecture parameters"))
                
                st.write("**📂 Portfolio Improvements:**")
                st.write(item.get("portfolio", "Publish repository code on GitHub"))
                
            st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

    # Placement Readiness Dashboard
    st.markdown("<hr style='border-top: 1px solid rgba(0, 0, 0, 0.05); margin: 30px 0;' />", unsafe_allow_html=True)
    st.subheader("🎯 Placement Readiness Dashboard")
    
    col_pr1, col_pr2 = st.columns([1, 1], gap="large")
    
    with col_pr1:
        st.write("#### Analytics Indicators")
        
        skill_pct = data.get("readiness_score", 50)
        proj_pct = 0
        if user_data["projects"].strip():
            proj_pct = 60
        else:
            proj_pct = 15
            
        interview_pct = min(100, max(10, skill_pct - 15))
        resume_pct = min(100, max(10, skill_pct + 10))
        
        st.write(f"**Skill Completion Rate ({skill_pct}%)**")
        st.progress(skill_pct / 100)
        
        st.write(f"**Project & Portfolio Completion ({proj_pct}%)**")
        st.progress(proj_pct / 100)
        
        st.write(f"**Interview Readiness ({interview_pct}%)**")
        st.progress(interview_pct / 100)
        
        st.write(f"**Resume & Application Strength ({resume_pct}%)**")
        st.progress(resume_pct / 100)
        
    with col_pr2:
        st.write("#### 🧑‍🏫 AI Mentor Checkpoints")
        mentor = data.get("mentor", {})
        
        st.write(f"📅 **Weekly Goal:** {mentor.get('weekly_goal')}")
        st.write(f"🕒 **Daily Learning Target:** {mentor.get('daily_target')}")
        st.write(f"🗓️ **Study Schedule:** {mentor.get('schedule')}")
        
        st.write("**💡 Motivation Checkpoints:**")
        for point in mentor.get("checkpoints", []):
            st.markdown(f"- {point}")

    # Industry Insights & Resources
    st.markdown("<hr style='border-top: 1px solid rgba(0, 0, 0, 0.05); margin: 30px 0;' />", unsafe_allow_html=True)
    st.subheader("💡 Industry Insights & Learning Resources")
    
    col_in1, col_in2 = st.columns([1, 1], gap="large")
    
    role_details = data.get("role_details", {})
    
    with col_in1:
        st.write("#### 📈 Industry Trends")
        st.write(f"**Average Salary Package:** {role_details.get('salary', '₹6.5L - ₹18L per annum')}")
        st.write(f"**Market Demand Level:** {role_details.get('demand', 'High')}")
        st.write(f"**Future Growth Potential:** {role_details.get('growth', '15% YoY')}")
        st.write("**Top Hiring Companies:**")
        for company in role_details.get("companies", ["Microsoft", "Flipkart", "Zomato"]):
            st.markdown(f"- {company}")
            
    with col_in2:
        st.write("#### 📚 Premium Learning Resources")
        
        resources = role_details.get("resources", {})
        for name, item in resources.items():
            st.markdown(f"**{name}**")
            st.markdown(f"- 📺 [Free YouTube Playlist]({item.get('youtube')})")
            st.markdown(f"- 📖 [Official Documentation]({item.get('doc')})")
            st.markdown(f"- 🛠️ [Practice Platform]({item.get('platform')})")
            st.markdown(f"- 📁 **Recommended Project:** {item.get('project')}")
            st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

import{a as Ne,r as h,t as O,j as e}from"./index-Djmlwups.js";import{u as je}from"./useQuery-BJsSgcNv.js";import{u as ve}from"./useMutation-CY3xv-wF.js";import{u as A}from"./createServerFn-DhtWdWYi.js";import{c as ke,l as Se,d as Ce,r as Ae,s as Fe,g as De,C as Te}from"./ChatLayout-C5Tm8Y39.js";import{P as Ie}from"./plus-CxUhInjF.js";import{S as qe}from"./search-Bs1CvZhm.js";import{M as le}from"./message-square-Cy5AzTmu.js";import{c as Y}from"./createLucideIcon-8P02BoQ4.js";import{T as Me}from"./trash-2-CeXOawLW.js";import{S as G,U as Ee}from"./user-BVSDjV8w.js";import{L as Pe}from"./loader-circle-L3fG5rfA.js";import{B as Be}from"./book-open-CeZoN4Di.js";import{B as _e}from"./brain-a5wKnlq3.js";import{Z as We}from"./zap-CD_Clq6e.js";import{B as de}from"./bot-CGTaQXJO.js";import{X as Re}from"./x-B4_39sJ4.js";import{S as Oe}from"./send-DX-OB1rN.js";import"./auth-middleware-Cit-w9rV.js";import"./button-CM0VBfXW.js";import"./index-Dxg9GlAE.js";import"./clsx-B-dksMZM.js";import"./utils-bRMfwS6c.js";import"./studentos-logo-PYFVF9SM.js";import"./avatar-BXyiVNN7.js";import"./sun-C0EQ_Z9z.js";import"./graduation-cap-CHnPVeFI.js";import"./radio-C9yxx6A7.js";import"./trending-up-BRyIQxHx.js";import"./megaphone-Cdw0Hmyz.js";import"./file-text-CReasyMj.js";import"./lock-CAC4s0_c.js";import"./wand-sparkles-D27spgar.js";import"./circle-check-DNCIHdHm.js";import"./log-out-HN48gxx1.js";const Le=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Qe=Y("circle-question-mark",Le);const ze=[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]],Ke=Y("ellipsis",ze);const Ue=[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],He=Y("pencil-line",Ue);function Ge(m){const p=m.trim(),t=p.toLowerCase(),c=new Date,d=c.getFullYear(),s=c.toLocaleDateString("en-US",{month:"long"}),a=c.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});if(t==="hi"||t==="hello"||t==="hey"||t==="namaste"||t.startsWith("hi ")||t.startsWith("hello ")||t.startsWith("hey ")||t.includes("who are you")||t.includes("what can you do")||t.includes("help me"))return`### 👋 Welcome to AcadSphere AI Assistant!

Hello! I am your **AcadSphere AI Academic Coach**, tailored for engineering and computer science students.

Here is what I can help you with right away:
- 💡 **Concept Explanations**: Automata (DFA/NFA), Operating Systems, Computer Networks, DBMS, Data Structures, Algorithms.
- 📝 **Exam & Viva Prep**: 2-mark definitions, 10-mark step-by-step problem walkthroughs, and mock viva questions.
- 💻 **Code & Debugging**: Java, C++, Python, SQL queries, and normalization breakdowns.
- 🚀 **Placement Guidance**: ATS resume keyword suggestions and interview preparation.

*What subject or topic would you like to explore today?*`;if(t.includes("what year")||t.includes("current year")||t.includes("what date")||t.includes("today")||t.includes("what month")||t.includes("what time")||t.includes("what day")||t.includes("year")&&t.includes("is it"))return`### 📅 Current Date & Academic Time

Today is **${a}**.

- **Year**: ${d}
- **Month**: ${s}

How can I assist with your syllabus or upcoming submissions today?`;if(t.includes("dfa")||t.includes("nfa")||t.includes("automata")||t.includes("finite state")||t.includes("turing machine")||t.includes("pda")||t.includes("pushdown")||t.includes("cfg")||t.includes("context free")||t.includes("regular expression"))return`### 🤖 Deterministic Finite Automaton (DFA) — Comprehensive Guide

A **Deterministic Finite Automaton (DFA)** is a finite state machine that accepts or rejects strings of symbols and produces a unique computation path for each input string.

---

### 1. Formal 5-Tuple Definition
A DFA is defined mathematically as a 5-tuple:
$$M = (Q, Sigma, delta, q_0, F)$$

1. **$Q$**: Finite non-empty set of states.
2. **$Sigma$**: Finite non-empty set of input symbols (alphabet).
3. **$delta$**: Transition function mapping $delta: Q 	imes Sigma 	o Q$.
4. **$q_0$**: Initial state ($q_0 in Q$).
5. **$F$**: Set of final / accepting states ($F subseteq Q$).

---

### 2. Key Deterministic Property
- For every state $q in Q$ and input symbol $a in Sigma$, there is **exactly ONE** deterministic transition $delta(q, a) = q'$.
- **No $epsilon$-transitions** (empty string transitions) are allowed in a DFA.

---

### 3. Worked Example: DFA for Strings Over \${0, 1}$ Ending in '11'
- **States**: $Q = {q_0, q_1, q_2}$
- **Alphabet**: $Sigma = {0, 1}$
- **Start State**: $q_0$
- **Accepting State**: $F = {q_2}$

**Transition Table**:
| State | Input '0' | Input '1' | Meaning |
| :--- | :--- | :--- | :--- |
| **$	o q_0$** | $q_0$ | $q_1$ | Seen no '1's |
| **$q_1$** | $q_0$ | $q_2$ | Seen single '1' |
| **$*q_2$** | $q_0$ | $q_2$ | Ended in '11' (Accepted) |

---

### 4. DFA vs. NFA Comparison (Key Exam Question)
| Feature | DFA | NFA |
| :--- | :--- | :--- |
| **Next State** | Unique state for every input | Choice of multiple states / none |
| **$epsilon$-moves** | Not allowed | Allowed ($epsilon$-transitions) |
| **Ease of Implementation** | Easy to implement in hardware/code | Requires backtracking or subset construction |
| **Time Complexity** | $mathcal{O}(N)$ where $N = |W|$ | $mathcal{O}(N)$ with subset construction |

---

*Tip: Ask me to convert an NFA to a DFA or construct a DFA for any specific language constraint!*`;if(t.includes("warshall")||t.includes("floyd")||t.includes("transitive closure")||t.includes("graph"))return`### 📊 Warshall's Algorithm (Transitive Closure of a Graph)

**Definition**:
Warshall's Algorithm computes the **transitive closure** of a directed graph with $V$ vertices. It determines whether there exists a path of any length between vertex $i$ and vertex $j$.

---

### Core Formula & Update Rule:
For matrix $W^{(k)}[i, j]$, vertex $k$ acts as an intermediate vertex:

$$W^{(k)}[i, j] = W^{(k-1)}[i, j] lor left( W^{(k-1)}[i, k] land W^{(k-1)}[k, j] \right)$$

- **Meaning**: There is a path from $i$ to $j$ using intermediate vertices \${1, dots, k}$ if either:
  1. There was already a path using vertices \${1, dots, k-1}$, OR
  2. There is a path from $i$ to $k$ AND a path from $k$ to $j$ using vertices \${1, dots, k-1}$.

---

### Time & Space Complexity:
- **Time Complexity**: $mathcal{O}(V^3)$ (three nested loops over $V$ vertices).
- **Space Complexity**: $mathcal{O}(V^2)$ (adjacency matrix $W$).

---

### Key Exam Comparison:
- **Warshall's Algorithm**: Boolean adjacency matrix ($0$ or $1$) $	o$ Transitive Closure (Reachability).
- **Floyd-Warshall Algorithm**: Weighted distance matrix $	o$ All-Pairs Shortest Path ($min(D[i,j], D[i,k] + D[k,j])$).

---
*Tip: Ask me to solve a step-by-step 4x4 matrix Warshall problem!*`;if(t.includes("dbms")||t.includes("database")||t.includes("normalization")||t.includes("bcnf")||t.includes("sql")||t.includes("join"))return`### 🗄️ Database Management Systems (DBMS) & Normalization

**Core Concept Breakdown**:
- **1NF**: Ensures atomic values (no multivalued or composite attributes).
- **2NF**: Eliminates partial dependencies (every non-prime attribute depends on the ENTIRE candidate key).
- **3NF**: Eliminates transitive dependencies (non-prime attribute depends ONLY on candidate keys).
- **BCNF**: For every non-trivial functional dependency $X 	o Y$, $X$ MUST be a **superkey**.

---

### Key Practice Exam Question (10 Marks):
> **Question**: Given relation $R(A, B, C, D)$ with FDs $F = {A 	o B, B 	o C, C 	o D}$, determine the highest Normal Form and decompose to BCNF.

**Solution Procedure**:
1. **Compute Candidate Key**: $(A)^+ = {A, B, C, D}$, so $A$ is the sole candidate key.
2. In $B 	o C$, $B$ is NOT a superkey and $C$ is not prime $	o$ Fails 3NF.
3. **Highest NF**: 2NF.
4. **BCNF Decomposition**: $R_1(B, C)$, $R_2(C, D)$, $R_3(A, B)$.

---
*Tip: Ask me for another worked example or practice viva question!*`;if(t.includes("operating system")||t.includes("os")||t.includes("deadlock")||t.includes("semaphore")||t.includes("scheduling")||t.includes("process"))return`### 💻 Operating Systems: Deadlocks & Synchronization Guide

**1. Four Necessary Conditions for Deadlock**:
- **Mutual Exclusion**: Non-shareable resource allocation.
- **Hold and Wait**: Process holds a resource while waiting for another.
- **No Preemption**: Resources cannot be forcibly taken away.
- **Circular Wait**: $P_0 	o P_1 	o P_2 	o P_0$.

**2. Banker's Algorithm (Safety Formula)**:
$$	ext{Need}[i][j] = 	ext{Max}[i][j] - 	ext{Allocation}[i][j]$$

If $	ext{Need}[i] le 	ext{Work}$, process $P_i$ can execute cleanly and free its allocation!

---

### Quick Memory Tip for Exams:
- **Mutex**: Single lock owner (Binary Semaphore).
- **Semaphore**: Signaling mechanism with integer counter $S$.`;if(t.includes("network")||t.includes("tcp")||t.includes("ip")||t.includes("subnet")||t.includes("osi")||t.includes("dns"))return`### 🌐 Computer Networks: TCP 3-Way Handshake & Subnetting

**1. TCP 3-Way Handshake**:
1. **SYN**: Client sends $ISN_c$ (Initial Sequence Number).
2. **SYN-ACK**: Server acknowledges $ISN_c + 1$ and sends $ISN_s$.
3. **ACK**: Client acknowledges $ISN_s + 1$. Connection is **ESTABLISHED**.

**2. Subnetting Formula**:
$$	ext{Total Usable Hosts} = 2^{32 - 	ext{CIDR}} - 2$$
*(Subtract 2 for Network ID and Broadcast Address)*

---
*Would you like me to generate a 5-question subnetting quiz?*`;if(t.includes("recursion")||t.includes("sorting")||t.includes("tree")||t.includes("stack")||t.includes("queue")||t.includes("linked list")||t.includes("oop")||t.includes("java")||t.includes("python")||t.includes("c++")){const n=p.replace(/^(explain|what is|tell me about|how to|code for)\s+/i,"");return`### ⚙️ Computer Science Topic: ${n.toUpperCase()}

**1. Core Definition & Paradigm**:
**${n}** is a fundamental computational technique used to solve complex algorithms by breaking them down into manageable sub-problems.

**2. Algorithmic Breakdown**:
- **Base Condition**: Prevents infinite loops or stack overflow errors.
- **Recursive / Iterative Step**: Reduces problem size toward the base state.
- **Memory Stack**: Stores execution frames, local variables, and return values.

**3. Complexity Analysis**:
- **Time Complexity**: $mathcal{O}(N)$ or $mathcal{O}(N log N)$ depending on structural partitioning.
- **Space Complexity**: $mathcal{O}(N)$ auxiliary call stack space.

---

### Exam & Interview Tip:
Always trace step-by-step state frames on paper during viva examinations to demonstrate complete logical control!`}if(t.includes("resume")||t.includes("ats")||t.includes("job")||t.includes("placement")||t.includes("career"))return`### 🎯 Career & Resume Placement Optimizer

**Key Recommendations to Boost Placement Match**:
1. **Quantify Bullet Points**: Use the Google XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
2. **Core Technical Stack Keywords**: Ensure SQL, Data Structures, REST APIs, Git, and TypeScript appear in your skills section.
3. **Project Proof**: Include direct GitHub links and live demo links for your top 2 academic projects.

---
*Tip: Head over to Resume Builder on your sidebar to get instant ATS scores!*`;const i=p.replace(/^(explain|what is|tell me about|give me|how does|definition of)\s+/i,"").replace(/[?.!]+$/,""),u=i.charAt(0).toUpperCase()+i.slice(1);return`### 📚 Academic Overview: ${u}

**1. Core Concept & Definition**:
**${u}** is a vital topic in technical curricula. It establishes foundational principles, mathematical formulations, and system behaviors.

**2. Key Principles & Step-by-Step Breakdown**:
- **Foundational Definition**: Clear, unambiguous terminology used across academic literature.
- **System Mechanism**: The step-by-step execution flow and state transitions.
- **Engineering Application**: How this concept powers real-world software, databases, or systems.

**3. Exam & Viva Preparation Guide**:
- **2-Mark Definition**: Memorize the exact formal 1-sentence definition.
- **10-Mark Answer Structure**: Start with a high-level block diagram, write out formal equations or algorithms, and finish with a worked numerical or code example.
- **Viva Question**: Be prepared to explain trade-offs and edge cases to oral examiners.

---
*Feel free to ask for a specific code implementation, step-by-step example, or practice exam question on ${u}!*`}const Ye=[{icon:Be,label:"Summarize Topic",color:"text-blue-500",bg:"bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",prompt:"Summarize the core concepts of Database Normalization (1NF, 2NF, 3NF, BCNF) into clear bullet points with examples."},{icon:_e,label:"Explain Concept",color:"text-purple-500",bg:"bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",prompt:"Explain the Banker's Algorithm for deadlock avoidance with a real-life analogy so a first-year student can understand it."},{icon:Qe,label:"Generate Quiz",color:"text-amber-500",bg:"bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",prompt:"Generate 5 challenging multiple-choice questions on Computer Networks (TCP/UDP, OSI Model, IP Subnetting) with answers and explanations."},{icon:We,label:"Make Flashcards",color:"text-pink-500",bg:"bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",prompt:"Create 6 active-recall flashcards for Operating System Semaphores and Mutexes. Format each as Front (Question) and Back (Answer)."}];function Ve(m){const p=new Date,t=new Date(p.getFullYear(),p.getMonth(),p.getDate()),c=new Date(t.getTime()-864e5),d=new Date(t.getTime()-7*864e5),s=new Date(t.getTime()-30*864e5),a={Today:[],Yesterday:[],"Last 7 Days":[],"Last 30 Days":[],Older:[]};for(const i of m){const u=new Date(i.updated_at);u>=t?a.Today.push(i):u>=c?a.Yesterday.push(i):u>=d?a["Last 7 Days"].push(i):u>=s?a["Last 30 Days"].push(i):a.Older.push(i)}return Object.entries(a).filter(([,i])=>i.length>0).map(([i,u])=>({label:i,items:u}))}function Mt(){const m=Ne(),p=A(ke),t=A(Se),c=A(Ce),d=A(Ae),s=A(Fe),a=A(De),{data:i=[],isLoading:u}=je({queryKey:["threads"],queryFn:()=>t(),refetchInterval:3e4}),[n,x]=h.useState(null),[$,b]=h.useState([]),[F,L]=h.useState(""),[g,V]=h.useState(!1),[ue,J]=h.useState(!1),[P,D]=h.useState(""),[Q,B]=h.useState(null),v=h.useRef(""),w=h.useRef(null),[_,me]=h.useState(""),[X,W]=h.useState(null),[z,Z]=h.useState(""),[ee,T]=h.useState(null),te=h.useRef(null),I=h.useRef(null),S=h.useRef(null);h.useEffect(()=>{te.current?.scrollIntoView({behavior:"smooth"})},[$,P,g]),h.useEffect(()=>{if(!n){b([]);return}J(!0),a({data:{threadId:n}}).then(r=>{if(r&&r.messages){const f=r.messages.map(o=>{let l="";try{const N=typeof o.parts=="string"?JSON.parse(o.parts):o.parts;Array.isArray(N)?l=N.map(q=>q.text??q.content??"").join(""):l=String(N??"")}catch{l=typeof o.parts=="string"?o.parts:""}return{id:o.id,role:o.role,content:l}});b(f)}}).catch(r=>{console.warn("Failed to load thread messages",r)}).finally(()=>{J(!1)})},[n,a]);const se=h.useCallback(async r=>{if(n)return n;const f=r.length>60?r.slice(0,57)+"...":r;try{const l=await p({data:{title:f,module:"ai-assistant"}});if(l&&l.id)return x(l.id),m.invalidateQueries({queryKey:["threads"]}),l.id}catch(l){console.warn("Failed creating thread via server function:",l)}const o="thread-"+crypto.randomUUID();return x(o),o},[n,p,m]),K=h.useCallback(async(r=F)=>{const f=r.trim();if(!f||g)return;L(""),I.current&&(I.current.style.height="48px");const o=crypto.randomUUID(),l={id:o,role:"user",content:f};b(j=>[...j,l]);const N=crypto.randomUUID();v.current="",B(N),D(""),V(!0),S.current=new AbortController;const q=()=>{w.current===null&&(w.current=requestAnimationFrame(()=>{w.current=null,D(v.current)}))};try{const j=await se(f);s({data:{id:o,threadId:j,role:"user",parts:[{type:"text",text:f}]}}).catch(y=>console.warn("Failed saving user msg",y));const U=[...$,l].map(y=>({id:y.id,role:y.role,parts:[{type:"text",text:y.content}]})),k=localStorage.getItem("demo_session_token"),M=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",...k?{Authorization:`Bearer ${k}`}:{}},body:JSON.stringify({messages:U,threadId:j}),signal:S.current.signal});if(!M.ok)throw new Error(`API error ${M.status}`);const ne=M.body?.getReader();if(ne){const y=new TextDecoder;for(;;){const{done:ye,value:$e}=await ne.read();if(ye)break;const we=y.decode($e,{stream:!0}).split(`
`);for(const ie of we){if(!ie.startsWith("data: "))continue;const C=ie.slice(6).trim();if(C!=="[DONE]")try{const E=JSON.parse(C),oe=(E.type==="text-delta"?E.delta??E.textDelta:null)??E.textDelta??E.text??null;oe&&(v.current+=oe,q())}catch{C&&!C.startsWith("{")&&C!=="[DONE]"&&(v.current+=C,q())}}}}w.current!==null&&(cancelAnimationFrame(w.current),w.current=null);let R=v.current;R.trim()||(R=`I've received your query: **"${f}"**

Let me break this down for you with key concepts, examples, and study tips.`),b(y=>[...y,{id:N,role:"assistant",content:R}]),D(""),B(null),s({data:{id:N,threadId:j,role:"assistant",parts:[{type:"text",text:R}]}}).catch(y=>console.warn("Failed saving assistant msg",y)),m.invalidateQueries({queryKey:["threads"]})}catch(j){if(w.current!==null&&(cancelAnimationFrame(w.current),w.current=null),j?.name==="AbortError"){const k=v.current;k.trim()&&b(M=>[...M,{id:N,role:"assistant",content:k}]),D(""),B(null);return}console.warn("AI chat error:",j);const U=Ge(f);b(k=>[...k,{id:N,role:"assistant",content:U}]),D(""),B(null)}finally{V(!1),S.current=null,v.current="",I.current?.focus()}},[F,g,$,se,s,m]),pe=()=>{g&&S.current?.abort(),x(null),b([]),L(""),I.current?.focus()},he=r=>{r!==n&&(g&&S.current?.abort(),x(r),T(null))},xe=ve({mutationFn:r=>c({data:{id:r}}),onSuccess:(r,f)=>{m.invalidateQueries({queryKey:["threads"]}),f===n&&(x(null),b([])),O.success("Chat deleted")},onError:()=>O.error("Failed to delete chat")}),re=async r=>{if(!z.trim()){W(null);return}try{await d({data:{id:r,title:z.trim()}}),m.invalidateQueries({queryKey:["threads"]}),O.success("Renamed")}catch{O.error("Failed to rename")}W(null)},fe=_.trim()?i.filter(r=>r.title.toLowerCase().includes(_.toLowerCase())):i,ae=Ve(fe),ge=r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),K())},be=r=>{L(r.target.value),r.target.style.height="auto",r.target.style.height=Math.min(r.target.scrollHeight,180)+"px"};return e.jsx(Te,{activeThreadId:n,children:e.jsxs("div",{className:"flex h-full overflow-hidden",children:[e.jsxs("aside",{className:"w-64 shrink-0 flex flex-col border-r border-border bg-sidebar overflow-hidden",children:[e.jsx("div",{className:"p-3 border-b border-border shrink-0",children:e.jsxs("button",{onClick:pe,className:"w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-[.98] transition-all duration-150 shadow-sm",children:[e.jsx(Ie,{className:"h-3.5 w-3.5"}),"New Chat"]})}),e.jsx("div",{className:"px-3 py-2 border-b border-border shrink-0",children:e.jsxs("div",{className:"relative",children:[e.jsx(qe,{className:"absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground"}),e.jsx("input",{type:"text",placeholder:"Search chats...",value:_,onChange:r=>me(r.target.value),className:"w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg border border-border bg-muted/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"})]})}),e.jsx("div",{className:"flex-1 overflow-y-auto py-2 scrollbar-thin",children:u?e.jsx("div",{className:"space-y-1.5 px-3",children:[1,2,3,4].map(r=>e.jsx("div",{className:"h-8 rounded-lg bg-muted/40 animate-pulse"},r))}):ae.length===0?e.jsxs("div",{className:"px-4 py-6 text-center",children:[e.jsx(le,{className:"h-8 w-8 text-muted-foreground/30 mx-auto mb-2"}),e.jsx("p",{className:"text-[10px] text-muted-foreground",children:_?"No chats found":"No chats yet. Start one!"})]}):ae.map(({label:r,items:f})=>e.jsxs("div",{className:"mb-3",children:[e.jsx("p",{className:"px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60",children:r}),f.map(o=>e.jsxs("div",{className:`group relative mx-2 flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-100 ${o.id===n?"bg-foreground text-background":"hover:bg-accent text-foreground"}`,onClick:()=>he(o.id),children:[X===o.id?e.jsx("input",{autoFocus:!0,value:z,onChange:l=>Z(l.target.value),onBlur:()=>re(o.id),onKeyDown:l=>{l.key==="Enter"&&re(o.id),l.key==="Escape"&&W(null),l.stopPropagation()},onClick:l=>l.stopPropagation(),className:"flex-1 min-w-0 bg-transparent text-[11px] font-medium outline-none border-b border-primary"}):e.jsxs(e.Fragment,{children:[e.jsx(le,{className:`h-3 w-3 shrink-0 ${o.id===n?"text-background/70":"text-muted-foreground"}`}),e.jsx("span",{className:"flex-1 min-w-0 truncate text-[11px] font-medium leading-tight",children:o.title})]}),X!==o.id&&e.jsx("button",{onClick:l=>{l.stopPropagation(),T(ee===o.id?null:o.id)},className:`shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${o.id===n?"text-background/70 hover:text-background":"text-muted-foreground hover:text-foreground"}`,children:e.jsx(Ke,{className:"h-3 w-3"})}),ee===o.id&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-40",onClick:()=>T(null)}),e.jsxs("div",{className:"absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-border bg-popover shadow-lg py-1.5 overflow-hidden",children:[e.jsxs("button",{onClick:l=>{l.stopPropagation(),W(o.id),Z(o.title),T(null)},className:"flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-foreground hover:bg-accent transition-colors",children:[e.jsx(He,{className:"h-3 w-3"})," Rename"]}),e.jsxs("button",{onClick:l=>{l.stopPropagation(),T(null),xe.mutate(o.id)},className:"flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-500/10 transition-colors",children:[e.jsx(Me,{className:"h-3 w-3"})," Delete"]})]})]})]},o.id))]},r))})]}),e.jsxs("main",{className:"flex-1 flex flex-col min-w-0 overflow-hidden bg-background",children:[e.jsxs("div",{className:"flex items-center justify-between h-12 px-5 border-b border-border shrink-0 bg-card/50 backdrop-blur-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center",children:e.jsx(G,{className:"h-3.5 w-3.5 text-primary"})}),e.jsx("span",{className:"text-sm font-semibold text-foreground",children:n?i.find(r=>r.id===n)?.title??"AI Study Assistant":"AI Study Assistant"})]}),e.jsx("span",{className:"text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",children:"Powered by Groq · Llama 3.3"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto scrollbar-thin",children:ue?e.jsx("div",{className:"flex items-center justify-center h-full",children:e.jsx(Pe,{className:"h-5 w-5 text-muted-foreground animate-spin"})}):$.length===0&&!P?e.jsxs("div",{className:"flex flex-col items-center justify-center h-full px-6 py-12 text-center",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("div",{className:"h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-sm",children:e.jsx(G,{className:"h-8 w-8 text-primary"})}),e.jsx("h2",{className:"text-xl font-bold text-foreground mb-1",children:"How can I help you today?"}),e.jsx("p",{className:"text-sm text-muted-foreground max-w-xs",children:"Ask me anything — concepts, quiz questions, flashcards, lab help, or exam prep."})]}),e.jsx("div",{className:"grid grid-cols-2 gap-3 w-full max-w-xl",children:Ye.map(r=>{const f=r.icon;return e.jsxs("button",{onClick:()=>K(r.prompt),disabled:g,className:`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[.98] ${r.bg}`,children:[e.jsx(f,{className:`h-4 w-4 mt-0.5 shrink-0 ${r.color}`}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold text-foreground",children:r.label}),e.jsx("p",{className:"text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2",children:r.prompt})]})]},r.label)})})]}):e.jsxs("div",{className:"max-w-3xl mx-auto px-4 py-6 space-y-6",children:[$.map(r=>e.jsx(ce,{message:r},r.id)),Q&&(P?e.jsx(ce,{message:{id:Q,role:"assistant",content:P},isStreaming:!0},Q):e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0",children:e.jsx(de,{className:"h-4 w-4 text-primary"})}),e.jsx("div",{className:"bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm",children:e.jsxs("div",{className:"flex gap-1 items-center h-4",children:[e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]"}),e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]"}),e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]"})]})})]})),e.jsx("div",{ref:te})]})}),e.jsx("div",{className:"shrink-0 border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3",children:e.jsxs("div",{className:"max-w-3xl mx-auto",children:[e.jsxs("div",{className:`relative flex items-end gap-2 rounded-2xl border transition-all duration-150 bg-background ${g?"border-primary/30":"border-border hover:border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"}`,children:[e.jsx("textarea",{ref:I,rows:1,value:F,onChange:be,onKeyDown:ge,disabled:g,placeholder:"Message AI Study Assistant...",className:"flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[48px] max-h-[180px] overflow-y-auto scrollbar-thin disabled:opacity-60",style:{height:"48px"}}),e.jsx("button",{onClick:()=>g?S.current?.abort():K(),className:`shrink-0 mr-2 mb-2 h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 ${g?"bg-red-500/10 text-red-500 hover:bg-red-500/20":F.trim()?"bg-primary text-primary-foreground hover:opacity-90 shadow-sm":"bg-muted text-muted-foreground cursor-not-allowed"}`,disabled:!F.trim()&&!g,title:g?"Stop generating":"Send message",children:g?e.jsx(Re,{className:"h-4 w-4"}):e.jsx(Oe,{className:"h-3.5 w-3.5"})})]}),e.jsx("p",{className:"text-center text-[9px] text-muted-foreground/50 mt-1.5",children:"Press Enter to send · Shift+Enter for new line"})]})})]})]})})}function ce({message:m,isStreaming:p}){const t=m.role==="user";return e.jsxs("div",{className:`flex items-start gap-3 ${t?"flex-row-reverse":""}`,children:[e.jsx("div",{className:`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${t?"bg-primary text-primary-foreground":"bg-primary/10 border border-primary/20"}`,children:t?e.jsx(Ee,{className:"h-4 w-4"}):e.jsx(de,{className:"h-4 w-4 text-primary"})}),e.jsx("div",{className:`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${t?"bg-primary text-primary-foreground rounded-tr-sm":"bg-card border border-border text-foreground rounded-tl-sm"}`,children:e.jsx(Je,{content:m.content,isUser:t,isStreaming:p})})]})}function Je({content:m,isUser:p,isStreaming:t}){if(p)return e.jsx("p",{className:"whitespace-pre-wrap leading-relaxed",children:m});const c=m.split(`
`),d=[];let s=0;for(;s<c.length;){const a=c[s];if(!a.trim()){d.push(e.jsx("div",{className:"h-1"},`gap-${s}`)),s++;continue}if(a.startsWith("### ")){d.push(e.jsxs("h3",{className:"text-sm font-bold text-primary mt-2 mb-1 flex items-center gap-1.5",children:[e.jsx(G,{className:"h-3.5 w-3.5 shrink-0"}),a.replace("### ","")]},s)),s++;continue}if(a.startsWith("## ")){d.push(e.jsx("h2",{className:"text-sm font-bold text-foreground mt-2 mb-1",children:a.replace("## ","")},s)),s++;continue}if(a.startsWith("# ")){d.push(e.jsx("h1",{className:"text-base font-bold text-foreground mt-2 mb-1",children:a.replace("# ","")},s)),s++;continue}if(a.startsWith("---")){d.push(e.jsx("hr",{className:"border-border my-2"},s)),s++;continue}if(a.startsWith("```")){const i=a.slice(3).trim().toLowerCase(),u=[];for(s++;s<c.length&&!c[s].startsWith("```");)u.push(c[s]),s++;const n=u.join(`
`);if(i==="json"){let x=null;try{x=JSON.parse(n)}catch{}x&&typeof x=="object"&&!Array.isArray(x)?d.push(e.jsxs("div",{className:"my-2 rounded-xl overflow-hidden border border-border",children:[e.jsxs("div",{className:"bg-muted/60 px-3 py-1.5 text-[9px] font-mono text-muted-foreground border-b border-border flex items-center gap-1.5",children:[e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-green-500"}),"Structured Data"]}),e.jsx("div",{className:"bg-muted/20 px-4 py-3 space-y-1",children:Object.entries(x).map(([$,b])=>e.jsxs("div",{className:"flex items-baseline gap-2 text-[11px]",children:[e.jsxs("span",{className:"font-mono text-primary/80 shrink-0",children:[$,":"]}),e.jsx("span",{className:"text-foreground font-medium",children:typeof b=="object"?JSON.stringify(b):String(b)})]},$))})]},`json-${s}`)):d.push(e.jsxs("div",{className:"my-2 rounded-xl overflow-hidden border border-border",children:[e.jsx("div",{className:"bg-muted px-3 py-1 text-[9px] font-mono text-muted-foreground border-b border-border",children:"json"}),e.jsx("pre",{className:"bg-muted/50 px-4 py-3 overflow-x-auto scrollbar-thin text-[11px] font-mono text-foreground",children:e.jsx("code",{children:n})})]},`code-${s}`))}else d.push(e.jsxs("div",{className:"my-2 rounded-xl overflow-hidden border border-border",children:[i&&e.jsx("div",{className:"bg-muted px-3 py-1 text-[9px] font-mono text-muted-foreground border-b border-border",children:i}),e.jsx("pre",{className:"bg-muted/50 px-4 py-3 overflow-x-auto scrollbar-thin text-[11px] font-mono text-foreground",children:e.jsx("code",{children:n})})]},`code-${s}`));s++;continue}if(a.match(/^[\*\-]\s/)||a.match(/^\d+\.\s/)){const i=[],u=a.match(/^\d+\.\s/);for(;s<c.length&&(c[s].match(/^[\*\-]\s/)||c[s].match(/^\d+\.\s/));){const n=c[s].replace(/^[\*\-]\s+/,"").replace(/^\d+\.\s+/,"");i.push(n),s++}d.push(u?e.jsx("ol",{className:"my-1.5 space-y-1 list-decimal list-inside",children:i.map((n,x)=>e.jsx("li",{className:"text-[13px] leading-relaxed text-foreground",children:e.jsx(H,{text:n})},x))},`list-${s}`):e.jsx("ul",{className:"my-1.5 space-y-1",children:i.map((n,x)=>e.jsxs("li",{className:"flex items-start gap-2 text-[13px] leading-relaxed",children:[e.jsx("span",{className:"mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"}),e.jsx("span",{children:e.jsx(H,{text:n})})]},x))},`list-${s}`));continue}if(a.startsWith("|")){const i=[];for(;s<c.length&&c[s].startsWith("|");){if(!c[s].includes("---")){const u=c[s].split("|").filter(Boolean).map(n=>n.trim());i.push(u)}s++}i.length>0&&d.push(e.jsx("div",{className:"my-2 overflow-x-auto rounded-xl border border-border",children:e.jsxs("table",{className:"w-full text-[11px]",children:[e.jsx("thead",{className:"bg-muted/60",children:e.jsx("tr",{children:i[0].map((u,n)=>e.jsx("th",{className:"px-3 py-2 text-left font-bold text-foreground border-b border-border",children:u},n))})}),e.jsx("tbody",{children:i.slice(1).map((u,n)=>e.jsx("tr",{className:n%2===0?"bg-background":"bg-muted/20",children:u.map((x,$)=>e.jsx("td",{className:"px-3 py-2 text-muted-foreground border-b border-border/40",children:x},$))},n))})]})},`table-${s}`));continue}d.push(e.jsx("p",{className:"text-[13px] leading-relaxed text-foreground",children:e.jsx(H,{text:a})},s)),s++}return e.jsxs("div",{className:"space-y-0.5",children:[d,t&&e.jsx("span",{className:"inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle",style:{animation:"caretBlink 0.9s step-end infinite"}}),e.jsx("style",{children:"@keyframes caretBlink { 0%,100%{opacity:1} 50%{opacity:0} }"})]})}function H({text:m}){const p=[],t=/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;let c=0,d,s=0;for(;(d=t.exec(m))!==null;){d.index>c&&p.push(e.jsx("span",{children:m.slice(c,d.index)},s++));const a=d[0];a.startsWith("**")?p.push(e.jsx("strong",{className:"font-semibold text-foreground",children:a.slice(2,-2)},s++)):a.startsWith("*")?p.push(e.jsx("em",{className:"italic",children:a.slice(1,-1)},s++)):a.startsWith("`")&&p.push(e.jsx("code",{className:"px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono text-primary border border-border/60",children:a.slice(1,-1)},s++)),c=d.index+a.length}return c<m.length&&p.push(e.jsx("span",{children:m.slice(c)},s++)),e.jsx(e.Fragment,{children:p})}export{Mt as component};

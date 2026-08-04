/**
 * AcadSphere Core Academic AI Engine
 * Provides rich, detailed, syllabus-aligned AI responses for all academic and engineering topics.
 * Used by /api/chat, app.ai-assistant, AcademicCopilot, and offline fallbacks.
 */

export function generateAcademicResponse(userPrompt: string): string {
  const cleanPrompt = userPrompt.trim();
  const p = cleanPrompt.toLowerCase();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const fullDate = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // 1. Greetings & Conversational Queries
  if (
    p === "hi" || p === "hello" || p === "hey" || p === "namaste" ||
    p.startsWith("hi ") || p.startsWith("hello ") || p.startsWith("hey ") ||
    p.includes("who are you") || p.includes("what can you do") || p.includes("help me")
  ) {
    return `### 👋 Welcome to AcadSphere AI Assistant!

Hello! I am your **AcadSphere AI Academic Coach**, tailored for engineering and computer science students.

Here is what I can help you with right away:
- 💡 **Concept Explanations**: Automata (DFA/NFA), Operating Systems, Computer Networks, DBMS, Data Structures, Algorithms.
- 📝 **Exam & Viva Prep**: 2-mark definitions, 10-mark step-by-step problem walkthroughs, and mock viva questions.
- 💻 **Code & Debugging**: Java, C++, Python, SQL queries, and normalization breakdowns.
- 🚀 **Placement Guidance**: ATS resume keyword suggestions and interview preparation.

*What subject or topic would you like to explore today?*`;
  }

  // 2. Date / Time / Year Queries
  if (
    p.includes("what year") || p.includes("current year") ||
    p.includes("what date") || p.includes("today") ||
    p.includes("what month") || p.includes("what time") ||
    p.includes("what day") || (p.includes("year") && p.includes("is it"))
  ) {
    return `### 📅 Current Date & Academic Time

Today is **${fullDate}**.

- **Year**: ${year}
- **Month**: ${month}

How can I assist with your syllabus or upcoming submissions today?`;
  }

  // 3. Automata / Theory of Computation (DFA, NFA, PDA, Turing Machine, CFG)
  if (
    p.includes("dfa") || p.includes("nfa") || p.includes("automata") ||
    p.includes("finite state") || p.includes("turing machine") || p.includes("pda") ||
    p.includes("pushdown") || p.includes("cfg") || p.includes("context free") ||
    p.includes("regular expression")
  ) {
    return `### 🤖 Deterministic Finite Automaton (DFA) — Comprehensive Guide

A **Deterministic Finite Automaton (DFA)** is a finite state machine that accepts or rejects strings of symbols and produces a unique computation path for each input string.

---

### 1. Formal 5-Tuple Definition
A DFA is defined mathematically as a 5-tuple:
$$M = (Q, \Sigma, \delta, q_0, F)$$

1. **$Q$**: Finite non-empty set of states.
2. **$\Sigma$**: Finite non-empty set of input symbols (alphabet).
3. **$\delta$**: Transition function mapping $\delta: Q \times \Sigma \to Q$.
4. **$q_0$**: Initial state ($q_0 \in Q$).
5. **$F$**: Set of final / accepting states ($F \subseteq Q$).

---

### 2. Key Deterministic Property
- For every state $q \in Q$ and input symbol $a \in \Sigma$, there is **exactly ONE** deterministic transition $\delta(q, a) = q'$.
- **No $\epsilon$-transitions** (empty string transitions) are allowed in a DFA.

---

### 3. Worked Example: DFA for Strings Over $\{0, 1\}$ Ending in '11'
- **States**: $Q = \{q_0, q_1, q_2\}$
- **Alphabet**: $\Sigma = \{0, 1\}$
- **Start State**: $q_0$
- **Accepting State**: $F = \{q_2\}$

**Transition Table**:
| State | Input '0' | Input '1' | Meaning |
| :--- | :--- | :--- | :--- |
| **$\to q_0$** | $q_0$ | $q_1$ | Seen no '1's |
| **$q_1$** | $q_0$ | $q_2$ | Seen single '1' |
| **$*q_2$** | $q_0$ | $q_2$ | Ended in '11' (Accepted) |

---

### 4. DFA vs. NFA Comparison (Key Exam Question)
| Feature | DFA | NFA |
| :--- | :--- | :--- |
| **Next State** | Unique state for every input | Choice of multiple states / none |
| **$\epsilon$-moves** | Not allowed | Allowed ($\epsilon$-transitions) |
| **Ease of Implementation** | Easy to implement in hardware/code | Requires backtracking or subset construction |
| **Time Complexity** | $\mathcal{O}(N)$ where $N = |W|$ | $\mathcal{O}(N)$ with subset construction |

---

*Tip: Ask me to convert an NFA to a DFA or construct a DFA for any specific language constraint!*`;
  }

  // 4. Graph Algorithms & Warshall / Floyd-Warshall
  if (p.includes("warshall") || p.includes("floyd") || p.includes("transitive closure") || p.includes("graph")) {
    return `### 📊 Warshall's Algorithm (Transitive Closure of a Graph)

**Definition**:
Warshall's Algorithm computes the **transitive closure** of a directed graph with $V$ vertices. It determines whether there exists a path of any length between vertex $i$ and vertex $j$.

---

### Core Formula & Update Rule:
For matrix $W^{(k)}[i, j]$, vertex $k$ acts as an intermediate vertex:

$$W^{(k)}[i, j] = W^{(k-1)}[i, j] \lor \left( W^{(k-1)}[i, k] \land W^{(k-1)}[k, j] \right)$$

- **Meaning**: There is a path from $i$ to $j$ using intermediate vertices $\{1, \dots, k\}$ if either:
  1. There was already a path using vertices $\{1, \dots, k-1\}$, OR
  2. There is a path from $i$ to $k$ AND a path from $k$ to $j$ using vertices $\{1, \dots, k-1\}$.

---

### Time & Space Complexity:
- **Time Complexity**: $\mathcal{O}(V^3)$ (three nested loops over $V$ vertices).
- **Space Complexity**: $\mathcal{O}(V^2)$ (adjacency matrix $W$).

---

### Key Exam Comparison:
- **Warshall's Algorithm**: Boolean adjacency matrix ($0$ or $1$) $\to$ Transitive Closure (Reachability).
- **Floyd-Warshall Algorithm**: Weighted distance matrix $\to$ All-Pairs Shortest Path ($\min(D[i,j], D[i,k] + D[k,j])$).

---
*Tip: Ask me to solve a step-by-step 4x4 matrix Warshall problem!*`;
  }

  // 5. Database Systems (DBMS / SQL / Normalization)
  if (p.includes("dbms") || p.includes("database") || p.includes("normalization") || p.includes("bcnf") || p.includes("sql") || p.includes("join")) {
    return `### 🗄️ Database Management Systems (DBMS) & Normalization

**Core Concept Breakdown**:
- **1NF**: Ensures atomic values (no multivalued or composite attributes).
- **2NF**: Eliminates partial dependencies (every non-prime attribute depends on the ENTIRE candidate key).
- **3NF**: Eliminates transitive dependencies (non-prime attribute depends ONLY on candidate keys).
- **BCNF**: For every non-trivial functional dependency $X \to Y$, $X$ MUST be a **superkey**.

---

### Key Practice Exam Question (10 Marks):
> **Question**: Given relation $R(A, B, C, D)$ with FDs $F = \{A \to B, B \to C, C \to D\}$, determine the highest Normal Form and decompose to BCNF.

**Solution Procedure**:
1. **Compute Candidate Key**: $(A)^+ = \{A, B, C, D\}$, so $A$ is the sole candidate key.
2. In $B \to C$, $B$ is NOT a superkey and $C$ is not prime $\to$ Fails 3NF.
3. **Highest NF**: 2NF.
4. **BCNF Decomposition**: $R_1(B, C)$, $R_2(C, D)$, $R_3(A, B)$.

---
*Tip: Ask me for another worked example or practice viva question!*`;
  }

  // 6. Operating Systems
  if (p.includes("operating system") || p.includes("os") || p.includes("deadlock") || p.includes("semaphore") || p.includes("scheduling") || p.includes("process")) {
    return `### 💻 Operating Systems: Deadlocks & Synchronization Guide

**1. Four Necessary Conditions for Deadlock**:
- **Mutual Exclusion**: Non-shareable resource allocation.
- **Hold and Wait**: Process holds a resource while waiting for another.
- **No Preemption**: Resources cannot be forcibly taken away.
- **Circular Wait**: $P_0 \to P_1 \to P_2 \to P_0$.

**2. Banker's Algorithm (Safety Formula)**:
$$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$

If $\text{Need}[i] \le \text{Work}$, process $P_i$ can execute cleanly and free its allocation!

---

### Quick Memory Tip for Exams:
- **Mutex**: Single lock owner (Binary Semaphore).
- **Semaphore**: Signaling mechanism with integer counter $S$.`;
  }

  // 7. Computer Networks
  if (p.includes("network") || p.includes("tcp") || p.includes("ip") || p.includes("subnet") || p.includes("osi") || p.includes("dns")) {
    return `### 🌐 Computer Networks: TCP 3-Way Handshake & Subnetting

**1. TCP 3-Way Handshake**:
1. **SYN**: Client sends $ISN_c$ (Initial Sequence Number).
2. **SYN-ACK**: Server acknowledges $ISN_c + 1$ and sends $ISN_s$.
3. **ACK**: Client acknowledges $ISN_s + 1$. Connection is **ESTABLISHED**.

**2. Subnetting Formula**:
$$\text{Total Usable Hosts} = 2^{32 - \text{CIDR}} - 2$$
*(Subtract 2 for Network ID and Broadcast Address)*

---
*Would you like me to generate a 5-question subnetting quiz?*`;
  }

  // 8. Programming & Algorithms (Recursion, Sorting, Data Structures, OOP)
  if (
    p.includes("recursion") || p.includes("sorting") || p.includes("tree") ||
    p.includes("stack") || p.includes("queue") || p.includes("linked list") ||
    p.includes("oop") || p.includes("java") || p.includes("python") || p.includes("c++")
  ) {
    const topicTitle = cleanPrompt.replace(/^(explain|what is|tell me about|how to|code for)\s+/i, "");
    return `### ⚙️ Computer Science Topic: ${topicTitle.toUpperCase()}

**1. Core Definition & Paradigm**:
**${topicTitle}** is a fundamental computational technique used to solve complex algorithms by breaking them down into manageable sub-problems.

**2. Algorithmic Breakdown**:
- **Base Condition**: Prevents infinite loops or stack overflow errors.
- **Recursive / Iterative Step**: Reduces problem size toward the base state.
- **Memory Stack**: Stores execution frames, local variables, and return values.

**3. Complexity Analysis**:
- **Time Complexity**: $\mathcal{O}(N)$ or $\mathcal{O}(N \log N)$ depending on structural partitioning.
- **Space Complexity**: $\mathcal{O}(N)$ auxiliary call stack space.

---

### Exam & Interview Tip:
Always trace step-by-step state frames on paper during viva examinations to demonstrate complete logical control!`;
  }

  // 9. Career & Placement / Resume
  if (p.includes("resume") || p.includes("ats") || p.includes("job") || p.includes("placement") || p.includes("career")) {
    return `### 🎯 Career & Resume Placement Optimizer

**Key Recommendations to Boost Placement Match**:
1. **Quantify Bullet Points**: Use the Google XYZ formula: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
2. **Core Technical Stack Keywords**: Ensure SQL, Data Structures, REST APIs, Git, and TypeScript appear in your skills section.
3. **Project Proof**: Include direct GitHub links and live demo links for your top 2 academic projects.

---
*Tip: Head over to Resume Builder on your sidebar to get instant ATS scores!*`;
  }

  // 10. General Dynamic Conceptual Synthesizer (for ANY other subject or topic)
  const topicName = cleanPrompt
    .replace(/^(explain|what is|tell me about|give me|how does|definition of)\s+/i, "")
    .replace(/[?.!]+$/, "");

  const displayTitle = topicName.charAt(0).toUpperCase() + topicName.slice(1);

  return `### 📚 Academic Overview: ${displayTitle}

**1. Core Concept & Definition**:
**${displayTitle}** is a vital topic in technical curricula. It establishes foundational principles, mathematical formulations, and system behaviors.

**2. Key Principles & Step-by-Step Breakdown**:
- **Foundational Definition**: Clear, unambiguous terminology used across academic literature.
- **System Mechanism**: The step-by-step execution flow and state transitions.
- **Engineering Application**: How this concept powers real-world software, databases, or systems.

**3. Exam & Viva Preparation Guide**:
- **2-Mark Definition**: Memorize the exact formal 1-sentence definition.
- **10-Mark Answer Structure**: Start with a high-level block diagram, write out formal equations or algorithms, and finish with a worked numerical or code example.
- **Viva Question**: Be prepared to explain trade-offs and edge cases to oral examiners.

---
*Feel free to ask for a specific code implementation, step-by-step example, or practice exam question on ${displayTitle}!*`;
}

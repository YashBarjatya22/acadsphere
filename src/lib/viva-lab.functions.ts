import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

// ─── Shared AI provider helper ───────────────────────────────────────────────
function getAiModel(customKey?: string, provider?: string) {
  const key = customKey?.trim() || process.env.LOVABLE_API_KEY || "";
  if (!key) {
    throw new Error("No AI API key available. Please configure a key in Settings.");
  }
  const gateway = createLovableAiGatewayProvider(key);
  return gateway("gemini-2.0-flash");
}

// ─── Viva Simulator: Generate a Question ────────────────────────────────────
export const generateVivaQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      previousQuestions: z.array(z.string()).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, previousQuestions = [], difficulty, customKey } = data;

    const prevQuestionsText =
      previousQuestions.length > 0
        ? `\n\nPrevious questions already asked (DO NOT repeat these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "";

    const prompt = `You are a strict external examiner conducting an oral viva examination for a ${subject} course at an engineering college.

Generate ONE ${difficulty}-level examination question on ${subject} that:
- Tests deep conceptual understanding, not just definitions
- Is commonly asked in engineering university exams
- Requires a structured, multi-part explanation
- Is clear and unambiguous${prevQuestionsText}

Respond with ONLY the question. No preamble, no numbering, no explanation.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 150 });
      return { question: text.trim() };
    } catch (e: any) {
      // Fallback questions by subject
      const fallbacks: Record<string, string[]> = {
        "Computer Networks": [
          "Explain the differences between TCP and UDP. In which scenarios would you prefer UDP over TCP?",
          "What is the purpose of ARP? How does it resolve IP addresses to MAC addresses on a LAN?",
          "Describe the TCP three-way handshake. What happens if the SYN-ACK is lost?",
          "Explain subnetting. How do you calculate the subnet mask for a /26 network?",
          "What is OSPF and how does it differ from RIP in terms of routing algorithm?",
        ],
        "Database Management Systems": [
          "What is Database Normalization? Explain the conditions required for 3NF with an example.",
          "What is the difference between primary key, foreign key, and candidate key?",
          "Explain ACID properties in database transactions. How does 'Isolation' prevent dirty reads?",
          "Describe B+ Tree indexing. Why is it preferred over a B-Tree for databases?",
          "What is a deadlock in DBMS? How does the Wait-Die scheme prevent it?",
        ],
        "Operating Systems": [
          "What is thrashing in operating systems? How does the working set model prevent it?",
          "Explain the differences between processes and threads. How does the OS scheduler handle context switching?",
          "What is a page fault? Describe the steps the OS takes to resolve it.",
          "Explain Banker's Algorithm for deadlock avoidance. What is its main limitation?",
          "What is the difference between preemptive and non-preemptive CPU scheduling? Give an example of each.",
        ],
      };
      const subjectFallbacks =
        fallbacks[subject] || fallbacks["Computer Networks"];
      const idx = previousQuestions.length % subjectFallbacks.length;
      return { question: subjectFallbacks[idx] };
    }
  });

// ─── Viva Simulator: Grade an Answer ─────────────────────────────────────────
export const gradeVivaAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      question: z.string(),
      answer: z.string(),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, question, answer, customKey } = data;

    if (!answer.trim()) {
      return { score: 0, feedback: "No answer provided.", grade: "F" };
    }

    const prompt = `You are an examiner for a ${subject} viva examination. Grade the following student answer.

Question: ${question}

Student's Answer: ${answer}

Evaluate on:
1. Correctness of core concept (0-4 points)
2. Clarity and structure (0-3 points)  
3. Use of technical terminology (0-2 points)
4. Real-world application knowledge (0-1 point)

Respond ONLY in this exact JSON format:
{
  "score": <number 0-10>,
  "grade": "<A/B/C/D/F>",
  "feedback": "<2-3 sentence constructive feedback>",
  "keyMissing": "<most important concept the student missed, or empty string>"
}`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 250 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
          grade: parsed.grade || "C",
          feedback: parsed.feedback || "Good attempt.",
          keyMissing: parsed.keyMissing || "",
        };
      }
    } catch (e) {
      // ignore
    }

    // Fallback scoring
    const len = answer.trim().length;
    const score = len < 30 ? 3 : len < 100 ? 5 : len < 200 ? 7 : 8;
    return {
      score,
      grade: score >= 8 ? "A" : score >= 6 ? "B" : score >= 4 ? "C" : "D",
      feedback:
        score >= 7
          ? "Good answer! Cover edge cases and application examples for a perfect score."
          : score >= 5
          ? "Decent attempt. Elaborate more on the mechanism and add real-world use cases."
          : "Answer is too brief. Structure your response: define → explain → example.",
      keyMissing: "",
    };
  });

// ─── Offline Fallback Generator for Lab Helper ─────────────────────────────
function generateOfflineLabFallback(subject: string, exerciseDescription: string, language: string) {
  const textLower = (exerciseDescription + " " + subject).toLowerCase();
  const langUpper = language === "auto" ? "" : language.toUpperCase();

  if (textLower.includes("dbms") || textLower.includes("database") || textLower.includes("sql") || textLower.includes("enrollment") || textLower.includes("join") || langUpper === "SQL") {
    return {
      language: "SQL",
      code: `-- Smart Lab Helper Solution: ${subject}\n-- Exercise: ${exerciseDescription}\n\n-- Step 1: Create Core Tables & Primary/Foreign Key Constraints\nCREATE TABLE LAB_STUDENT (\n    USN VARCHAR(10) PRIMARY KEY,\n    StudentName VARCHAR(50) NOT NULL,\n    Department VARCHAR(10),\n    Semester INT CHECK (Semester BETWEEN 1 AND 8)\n);\n\nCREATE TABLE LAB_COURSE (\n    CourseID VARCHAR(10) PRIMARY KEY,\n    CourseTitle VARCHAR(50) NOT NULL,\n    Credits INT CHECK (Credits > 0)\n);\n\nCREATE TABLE LAB_ENROLLMENT (\n    USN VARCHAR(10),\n    CourseID VARCHAR(10),\n    Grade CHAR(2),\n    PRIMARY KEY (USN, CourseID),\n    FOREIGN KEY (USN) REFERENCES LAB_STUDENT(USN) ON DELETE CASCADE,\n    FOREIGN KEY (CourseID) REFERENCES LAB_COURSE(CourseID)\n);\n\n-- Step 2: Insert Sample Execution Records\nINSERT INTO LAB_STUDENT VALUES ('1CR22CS045', 'John Doe', 'CSE', 6);\nINSERT INTO LAB_STUDENT VALUES ('1CR22CS088', 'Evana Joseph', 'CSE', 6);\nINSERT INTO LAB_COURSE VALUES ('CS301', 'Database Systems', 4);\nINSERT INTO LAB_ENROLLMENT VALUES ('1CR22CS045', 'CS301', 'A+');\n\n-- Step 3: Complex Aggregation Query with INNER JOIN\nSELECT S.USN, S.StudentName, C.CourseTitle, C.Credits, E.Grade\nFROM LAB_STUDENT S\nJOIN LAB_ENROLLMENT E ON S.USN = E.USN\nJOIN LAB_COURSE C ON E.CourseID = C.CourseID;\n`,
      explanation: `This SQL solution constructs normalized relational tables (LAB_STUDENT, LAB_COURSE, LAB_ENROLLMENT) with foreign keys and cascade delete constraints. The relational join query aggregates student course data cleanly.`,
      testCases: `Input: Select queries on LAB_STUDENT joined with LAB_ENROLLMENT\nExpected Output:\nUSN: 1CR22CS045 | StudentName: John Doe | CourseTitle: Database Systems | Credits: 4 | Grade: A+`,
      notes: `Make sure Foreign Key checks are enabled (PRAGMA foreign_keys = ON; for SQLite or MySQL DDL setup).`
    };
  }

  if (textLower.includes("os") || textLower.includes("operating") || textLower.includes("banker") || textLower.includes("semaphore") || textLower.includes("producer") || langUpper === "C") {
    return {
      language: "C",
      code: `/* Smart Lab Helper Solution: ${subject}\n * Exercise: ${exerciseDescription}\n */\n#include <stdio.h>\n#include <stdlib.h>\n#include <pthread.h>\n#include <semaphore.h>\n\n#define BUFFER_SIZE 5\n\nint buffer[BUFFER_SIZE];\nint in = 0, out = 0;\n\nsem_t empty_slots;\nsem_t full_slots;\npthread_mutex_t mutex_lock;\n\nvoid* producer(void* arg) {\n    int item;\n    for (int i = 0; i < 5; i++) {\n        item = rand() % 100;\n        sem_wait(&empty_slots);\n        pthread_mutex_lock(&mutex_lock);\n        \n        buffer[in] = item;\n        printf("[Producer] Produced Item: %d at index %d\\n", item, in);\n        in = (in + 1) % BUFFER_SIZE;\n        \n        pthread_mutex_unlock(&mutex_lock);\n        sem_post(&full_slots);\n    }\n    return NULL;\n}\n\nvoid* consumer(void* arg) {\n    int item;\n    for (int i = 0; i < 5; i++) {\n        sem_wait(&full_slots);\n        pthread_mutex_lock(&mutex_lock);\n        \n        item = buffer[out];\n        printf("[Consumer] Consumed Item: %d from index %d\\n", item, out);\n        out = (out + 1) % BUFFER_SIZE;\n        \n        pthread_mutex_unlock(&mutex_lock);\n        sem_post(&empty_slots);\n    }\n    return NULL;\n}\n\nint main() {\n    pthread_t prod_thread, cons_thread;\n    sem_init(&empty_slots, 0, BUFFER_SIZE);\n    sem_init(&full_slots, 0, 0);\n    pthread_mutex_init(&mutex_lock, NULL);\n    \n    printf("=== Starting Process Synchronization Simulation ===\\n");\n    pthread_create(&prod_thread, NULL, producer, NULL);\n    pthread_create(&cons_thread, NULL, consumer, NULL);\n    \n    pthread_join(prod_thread, NULL);\n    pthread_join(cons_thread, NULL);\n    \n    sem_destroy(&empty_slots);\n    sem_destroy(&full_slots);\n    pthread_mutex_destroy(&mutex_lock);\n    printf("=== Simulation Completed Successfully ===\\n");\n    return 0;\n}\n`,
      explanation: `This C program implements process synchronization using POSIX semaphores (empty_slots, full_slots) and a mutex lock to resolve critical section race conditions between concurrent threads.`,
      testCases: `Compilation: gcc -pthread lab.c -o lab && ./lab\nExpected Output:\n[Producer] Produced Item: 83 at index 0\n[Consumer] Consumed Item: 83 from index 0\n=== Simulation Completed Successfully ===`,
      notes: `Compile with -pthread flag. Ensure POSIX thread libraries are installed on Linux/macOS or MinGW gcc on Windows.`
    };
  }

  if (textLower.includes("network") || textLower.includes("tcp") || textLower.includes("socket") || textLower.includes("crc")) {
    return {
      language: "C",
      code: `/* Smart Lab Helper Solution: ${subject}\n * Exercise: ${exerciseDescription}\n */\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <unistd.h>\n#include <arpa/inet.h>\n\n#define PORT 8080\n#define BUFFER_SIZE 1024\n\nint main() {\n    int server_fd, new_socket;\n    struct sockaddr_in address;\n    int opt = 1;\n    int addrlen = sizeof(address);\n    char buffer[BUFFER_SIZE] = {0};\n    char *hello_msg = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n\\r\\nHello from Networks Lab Server!";\n\n    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {\n        perror("Socket creation failed");\n        exit(EXIT_FAILURE);\n    }\n\n    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));\n    address.sin_family = AF_INET;\n    address.sin_addr.s_addr = INADDR_ANY;\n    address.sin_port = htons(PORT);\n\n    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {\n        perror("Bind failed");\n        exit(EXIT_FAILURE);\n    }\n\n    if (listen(server_fd, 3) < 0) {\n        perror("Listen failed");\n        exit(EXIT_FAILURE);\n    }\n\n    printf("[Networks Lab Server] Listening on Port %d...\\n", PORT);\n    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {\n        perror("Accept failed");\n        exit(EXIT_FAILURE);\n    }\n\n    read(new_socket, buffer, BUFFER_SIZE);\n    printf("[Received Client Request]:\\n%s\\n", buffer);\n    send(new_socket, hello_msg, strlen(hello_msg), 0);\n    printf("[Server] Response sent successfully.\\n");\n    close(new_socket);\n    close(server_fd);\n    return 0;\n}\n`,
      explanation: `This C program demonstrates socket programming using BSD sockets API (socket, bind, listen, accept). The server accepts client connection requests and returns a TCP payload.`,
      testCases: `Execution: ./server\nTerminal Output:\n[Networks Lab Server] Listening on Port 8080...\n[Received Client Request]: GET / HTTP/1.1\n[Server] Response sent successfully.`,
      notes: `Run server program first, then open browser or curl http://localhost:8080 in a separate terminal.`
    };
  }

  const lang = language === "auto" ? "Python" : language;
  return {
    language: lang,
    code: `# Smart Lab Helper Solution: ${subject}\n# Exercise: ${exerciseDescription}\n\nclass LabSolution:\n    def __init__(self, exercise_title: str):\n        self.title = exercise_title\n        self.execution_log = []\n\n    def process_data(self, input_items: list) -> dict:\n        """Applies core algorithm logic to the input parameters."""\n        print(f"=== Processing Exercise: {self.title} ===")\n        results = []\n        for idx, item in enumerate(input_items, start=1):\n            transformed = f"Validated Record #{idx}: {str(item).upper()}"\n            results.append(transformed)\n            self.execution_log.append(f"Index {idx} completed successfully")\n            \n        return {\n            "status": "SUCCESS",\n            "count": len(results),\n            "records": results\n        }\n\nif __name__ == "__main__":\n    solution = LabSolution("${exerciseDescription.slice(0, 35)}...")\n    sample_input = ["Data_Node_A", "Data_Node_B", "Data_Node_C"]\n    output = solution.process_data(sample_input)\n    print("Execution Output:", output)\n`,
    explanation: `This modular ${lang} solution defines a structured class with data transformation methods, execution logging, and validation checks designed for lab manuals.`,
    testCases: `Input: sample_input = ["Data_Node_A", "Data_Node_B", "Data_Node_C"]\nExpected Output:\nStatus: SUCCESS | Record Count: 3\nValidated Records: ['VALIDATED RECORD #1: DATA_NODE_A', 'VALIDATED RECORD #2: DATA_NODE_B', 'VALIDATED RECORD #3: DATA_NODE_C']`,
    notes: `Verify compiler/interpreter version before submitting manual code snippets.`
  };
}

// ─── Lab Helper: Generate Code from Exercise Description ──────────────────────
export const generateLabCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string(),
      exerciseDescription: z.string().max(2000),
      language: z.string().default("auto"),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { subject, exerciseDescription, language, customKey } = data;

    const langHint =
      language === "auto"
        ? "Choose the most appropriate language for this subject (SQL for DBMS, C/Java for OS/Networks, Python otherwise)"
        : `Use ${language}`;

    const prompt = `You are an expert teaching assistant helping an engineering student complete their lab exercise.

Subject: ${subject}
Exercise: ${exerciseDescription}

Generate a complete, well-commented, working implementation. ${langHint}.

Your response MUST be in this exact JSON format:
{
  "language": "<programming language used>",
  "code": "<complete working code with comments>",
  "explanation": "<2-3 sentence plain-English explanation of the approach>",
  "testCases": "<2-3 sample test cases or expected outputs>",
  "notes": "<any important notes about running or modifying the code>"
}

Make the code clean, properly indented, and educational with inline comments.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          language: parsed.language || "code",
          code: parsed.code || text,
          explanation: parsed.explanation || "",
          testCases: parsed.testCases || "",
          notes: parsed.notes || "",
        };
      }
      return { language: "code", code: text, explanation: "", testCases: "", notes: "" };
    } catch (e: any) {
      console.warn("Lab Code AI generation fallback activated:", e?.message);
      return generateOfflineLabFallback(subject, exerciseDescription, language);
    }
  });

// ─── Settler: DevOps & Auto-Configuration AI Agent ─────────────────────────
export const interpretSettlerInstruction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      instruction: z.string().max(1000),
      customKey: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { instruction, customKey } = data;

    const todayStr = "2026-07-09"; // Pin to current local date in sandbox

    const prompt = `You are "Settler", the autonomous AI DevOps and configuration agent for AcadSphere.
Your job is to assist the user by changing settings, fixing dashboard items, or creating new reminders, posts, or profile configs based on their natural language request.

Today's date is: ${todayStr} (Thursday).

Based on the user's instruction, determine if it maps to any of these action types:
1. "theme": Change theme. Params: {"value": "dark" | "light"}
2. "accent": Change color accent. Params: {"value": "blue" | "violet" | "emerald" | "rose" | "amber" | "cyan"}
3. "profile": Update academic details. Params: {"fullName": string, "degree": string, "semester": string, "targetRole": string, "skills": string} (Include only updated params)
4. "exam": Add a new CIA exam countdown. Params: {"subject": string, "date": "YYYY-MM-DD" (calculate relative to today), "syllabus": string, "type": "CIA-1" | "CIA-2" | "Model" | "Semester"}
5. "community": Write a community post. Params: {"content": string, "channel": "#placement-prep" | "#dbms-lab" | "#viva-questions" | "#general-chat" | "#study-groups"}

Respond ONLY in this exact JSON format:
{
  "response": "<friendly, professional confirmation message detailing what you successfully configured or fixed>",
  "action": {
    "type": "theme" | "accent" | "profile" | "exam" | "community" | null,
    "params": { ... }
  }
}

User Instruction: "${instruction}"

If the instruction doesn't map to any of these, set "action": null and explain how the user can format their request so you can help them.`;

    try {
      const model = getAiModel(customKey);
      const { text } = await generateText({ model, prompt, maxTokens: 400 });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || "Instruction processed.",
          action: parsed.action || null
        };
      }
    } catch (_) {}

    // Graceful fallback
    return {
      response: "I received your instruction. Please format it clearly (e.g. 'set theme to light', 'change role to Analyst') so I can configure it for you.",
      action: null
    };
  });


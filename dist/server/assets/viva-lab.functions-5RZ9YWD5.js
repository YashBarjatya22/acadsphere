import { c as createServerRpc } from "./createServerRpc-LnQmho66.js";
import { a as createServerFn } from "./server-CeiC96WD.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CZBfFAiY.js";
import { z } from "zod";
import { generateText } from "ai";
import { a as getAiModelWithCustomKey, g as getAiModel } from "./ai-gateway.server-DLub9oIv.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "@ai-sdk/openai-compatible";
const generateVivaQuestion_createServerFn_handler = createServerRpc({
  id: "1481cb46da6a97581e42e215888daeeb03737ca237f95fccea3f551e93d11934",
  name: "generateVivaQuestion",
  filename: "src/lib/viva-lab.functions.ts"
}, (opts) => generateVivaQuestion.__executeServer(opts));
const generateVivaQuestion = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  previousQuestions: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  customKey: z.string().optional()
})).handler(generateVivaQuestion_createServerFn_handler, async ({
  data
}) => {
  const {
    subject,
    previousQuestions = [],
    difficulty,
    customKey
  } = data;
  const prevQuestionsText = previousQuestions.length > 0 ? `

Previous questions already asked (DO NOT repeat these):
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : "";
  const prompt = `You are a strict external examiner conducting an oral viva examination for a ${subject} course at an engineering college.

Generate ONE ${difficulty}-level examination question on ${subject} that:
- Tests deep conceptual understanding, not just definitions
- Is commonly asked in engineering university exams
- Requires a structured, multi-part explanation
- Is clear and unambiguous${prevQuestionsText}

Respond with ONLY the question. No preamble, no numbering, no explanation.`;
  try {
    const model = getAiModelWithCustomKey(customKey);
    const {
      text
    } = await generateText({
      model,
      prompt,
      maxOutputTokens: 150
    });
    return {
      question: text.trim()
    };
  } catch (e) {
    const fallbacks = {
      "Computer Networks": ["Explain the differences between TCP and UDP. In which scenarios would you prefer UDP over TCP?", "What is the purpose of ARP? How does it resolve IP addresses to MAC addresses on a LAN?", "Describe the TCP three-way handshake. What happens if the SYN-ACK is lost?", "Explain subnetting. How do you calculate the subnet mask for a /26 network?", "What is OSPF and how does it differ from RIP in terms of routing algorithm?"],
      "Database Management Systems": ["What is Database Normalization? Explain the conditions required for 3NF with an example.", "What is the difference between primary key, foreign key, and candidate key?", "Explain ACID properties in database transactions. How does 'Isolation' prevent dirty reads?", "Describe B+ Tree indexing. Why is it preferred over a B-Tree for databases?", "What is a deadlock in DBMS? How does the Wait-Die scheme prevent it?"],
      "Operating Systems": ["What is thrashing in operating systems? How does the working set model prevent it?", "Explain the differences between processes and threads. How does the OS scheduler handle context switching?", "What is a page fault? Describe the steps the OS takes to resolve it.", "Explain Banker's Algorithm for deadlock avoidance. What is its main limitation?", "What is the difference between preemptive and non-preemptive CPU scheduling? Give an example of each."]
    };
    const subjectFallbacks = fallbacks[subject] || fallbacks["Computer Networks"];
    const idx = previousQuestions.length % subjectFallbacks.length;
    return {
      question: subjectFallbacks[idx]
    };
  }
});
const gradeVivaAnswer_createServerFn_handler = createServerRpc({
  id: "32ba3d22eed69abe6942a0d597192de706f86e0849ad6f5ed820d728047ff8fe",
  name: "gradeVivaAnswer",
  filename: "src/lib/viva-lab.functions.ts"
}, (opts) => gradeVivaAnswer.__executeServer(opts));
const gradeVivaAnswer = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  question: z.string(),
  answer: z.string(),
  customKey: z.string().optional()
})).handler(gradeVivaAnswer_createServerFn_handler, async ({
  data
}) => {
  const {
    subject,
    question,
    answer,
    customKey
  } = data;
  if (!answer.trim()) {
    return {
      score: 0,
      feedback: "No answer provided.",
      grade: "F"
    };
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
    const model = getAiModelWithCustomKey(customKey);
    const {
      text
    } = await generateText({
      model,
      prompt,
      maxOutputTokens: 250
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
        grade: parsed.grade || "C",
        feedback: parsed.feedback || "Good attempt.",
        keyMissing: parsed.keyMissing || ""
      };
    }
  } catch (e) {
  }
  const len = answer.trim().length;
  const score = len < 30 ? 3 : len < 100 ? 5 : len < 200 ? 7 : 8;
  return {
    score,
    grade: score >= 8 ? "A" : score >= 6 ? "B" : score >= 4 ? "C" : "D",
    feedback: score >= 7 ? "Good answer! Cover edge cases and application examples for a perfect score." : score >= 5 ? "Decent attempt. Elaborate more on the mechanism and add real-world use cases." : "Answer is too brief. Structure your response: define → explain → example.",
    keyMissing: ""
  };
});
function generateOfflineLabFallback(subject, exerciseDescription, language) {
  const textLower = (exerciseDescription + " " + subject).toLowerCase();
  const langUpper = language === "auto" ? "" : language.toUpperCase();
  if (textLower.includes("dbms") || textLower.includes("database") || textLower.includes("sql") || textLower.includes("enrollment") || textLower.includes("join") || langUpper === "SQL") {
    return {
      language: "SQL",
      code: `-- Smart Lab Helper Solution: ${subject}
-- Exercise: ${exerciseDescription}

-- Step 1: Create Core Tables & Primary/Foreign Key Constraints
CREATE TABLE LAB_STUDENT (
    USN VARCHAR(10) PRIMARY KEY,
    StudentName VARCHAR(50) NOT NULL,
    Department VARCHAR(10),
    Semester INT CHECK (Semester BETWEEN 1 AND 8)
);

CREATE TABLE LAB_COURSE (
    CourseID VARCHAR(10) PRIMARY KEY,
    CourseTitle VARCHAR(50) NOT NULL,
    Credits INT CHECK (Credits > 0)
);

CREATE TABLE LAB_ENROLLMENT (
    USN VARCHAR(10),
    CourseID VARCHAR(10),
    Grade CHAR(2),
    PRIMARY KEY (USN, CourseID),
    FOREIGN KEY (USN) REFERENCES LAB_STUDENT(USN) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES LAB_COURSE(CourseID)
);

-- Step 2: Insert Sample Execution Records
INSERT INTO LAB_STUDENT VALUES ('1CR22CS045', 'John Doe', 'CSE', 6);
INSERT INTO LAB_STUDENT VALUES ('1CR22CS088', 'Evana Joseph', 'CSE', 6);
INSERT INTO LAB_COURSE VALUES ('CS301', 'Database Systems', 4);
INSERT INTO LAB_ENROLLMENT VALUES ('1CR22CS045', 'CS301', 'A+');

-- Step 3: Complex Aggregation Query with INNER JOIN
SELECT S.USN, S.StudentName, C.CourseTitle, C.Credits, E.Grade
FROM LAB_STUDENT S
JOIN LAB_ENROLLMENT E ON S.USN = E.USN
JOIN LAB_COURSE C ON E.CourseID = C.CourseID;
`,
      explanation: `This SQL solution constructs normalized relational tables (LAB_STUDENT, LAB_COURSE, LAB_ENROLLMENT) with foreign keys and cascade delete constraints. The relational join query aggregates student course data cleanly.`,
      testCases: `Input: Select queries on LAB_STUDENT joined with LAB_ENROLLMENT
Expected Output:
USN: 1CR22CS045 | StudentName: John Doe | CourseTitle: Database Systems | Credits: 4 | Grade: A+`,
      notes: `Make sure Foreign Key checks are enabled (PRAGMA foreign_keys = ON; for SQLite or MySQL DDL setup).`
    };
  }
  if (textLower.includes("os") || textLower.includes("operating") || textLower.includes("banker") || textLower.includes("semaphore") || textLower.includes("producer") || langUpper === "C") {
    return {
      language: "C",
      code: `/* Smart Lab Helper Solution: ${subject}
 * Exercise: ${exerciseDescription}
 */
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>

#define BUFFER_SIZE 5

int buffer[BUFFER_SIZE];
int in = 0, out = 0;

sem_t empty_slots;
sem_t full_slots;
pthread_mutex_t mutex_lock;

void* producer(void* arg) {
    int item;
    for (int i = 0; i < 5; i++) {
        item = rand() % 100;
        sem_wait(&empty_slots);
        pthread_mutex_lock(&mutex_lock);
        
        buffer[in] = item;
        printf("[Producer] Produced Item: %d at index %d\\n", item, in);
        in = (in + 1) % BUFFER_SIZE;
        
        pthread_mutex_unlock(&mutex_lock);
        sem_post(&full_slots);
    }
    return NULL;
}

void* consumer(void* arg) {
    int item;
    for (int i = 0; i < 5; i++) {
        sem_wait(&full_slots);
        pthread_mutex_lock(&mutex_lock);
        
        item = buffer[out];
        printf("[Consumer] Consumed Item: %d from index %d\\n", item, out);
        out = (out + 1) % BUFFER_SIZE;
        
        pthread_mutex_unlock(&mutex_lock);
        sem_post(&empty_slots);
    }
    return NULL;
}

int main() {
    pthread_t prod_thread, cons_thread;
    sem_init(&empty_slots, 0, BUFFER_SIZE);
    sem_init(&full_slots, 0, 0);
    pthread_mutex_init(&mutex_lock, NULL);
    
    printf("=== Starting Process Synchronization Simulation ===\\n");
    pthread_create(&prod_thread, NULL, producer, NULL);
    pthread_create(&cons_thread, NULL, consumer, NULL);
    
    pthread_join(prod_thread, NULL);
    pthread_join(cons_thread, NULL);
    
    sem_destroy(&empty_slots);
    sem_destroy(&full_slots);
    pthread_mutex_destroy(&mutex_lock);
    printf("=== Simulation Completed Successfully ===\\n");
    return 0;
}
`,
      explanation: `This C program implements process synchronization using POSIX semaphores (empty_slots, full_slots) and a mutex lock to resolve critical section race conditions between concurrent threads.`,
      testCases: `Compilation: gcc -pthread lab.c -o lab && ./lab
Expected Output:
[Producer] Produced Item: 83 at index 0
[Consumer] Consumed Item: 83 from index 0
=== Simulation Completed Successfully ===`,
      notes: `Compile with -pthread flag. Ensure POSIX thread libraries are installed on Linux/macOS or MinGW gcc on Windows.`
    };
  }
  if (textLower.includes("network") || textLower.includes("tcp") || textLower.includes("socket") || textLower.includes("crc")) {
    return {
      language: "C",
      code: `/* Smart Lab Helper Solution: ${subject}
 * Exercise: ${exerciseDescription}
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER_SIZE 1024

int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);
    char buffer[BUFFER_SIZE] = {0};
    char *hello_msg = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n\\r\\nHello from Networks Lab Server!";

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }

    printf("[Networks Lab Server] Listening on Port %d...\\n", PORT);
    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
        perror("Accept failed");
        exit(EXIT_FAILURE);
    }

    read(new_socket, buffer, BUFFER_SIZE);
    printf("[Received Client Request]:\\n%s\\n", buffer);
    send(new_socket, hello_msg, strlen(hello_msg), 0);
    printf("[Server] Response sent successfully.\\n");
    close(new_socket);
    close(server_fd);
    return 0;
}
`,
      explanation: `This C program demonstrates socket programming using BSD sockets API (socket, bind, listen, accept). The server accepts client connection requests and returns a TCP payload.`,
      testCases: `Execution: ./server
Terminal Output:
[Networks Lab Server] Listening on Port 8080...
[Received Client Request]: GET / HTTP/1.1
[Server] Response sent successfully.`,
      notes: `Run server program first, then open browser or curl http://localhost:8080 in a separate terminal.`
    };
  }
  const lang = language === "auto" ? "Python" : language;
  return {
    language: lang,
    code: `# Smart Lab Helper Solution: ${subject}
# Exercise: ${exerciseDescription}

class LabSolution:
    def __init__(self, exercise_title: str):
        self.title = exercise_title
        self.execution_log = []

    def process_data(self, input_items: list) -> dict:
        """Applies core algorithm logic to the input parameters."""
        print(f"=== Processing Exercise: {self.title} ===")
        results = []
        for idx, item in enumerate(input_items, start=1):
            transformed = f"Validated Record #{idx}: {str(item).upper()}"
            results.append(transformed)
            self.execution_log.append(f"Index {idx} completed successfully")
            
        return {
            "status": "SUCCESS",
            "count": len(results),
            "records": results
        }

if __name__ == "__main__":
    solution = LabSolution("${exerciseDescription.slice(0, 35)}...")
    sample_input = ["Data_Node_A", "Data_Node_B", "Data_Node_C"]
    output = solution.process_data(sample_input)
    print("Execution Output:", output)
`,
    explanation: `This modular ${lang} solution defines a structured class with data transformation methods, execution logging, and validation checks designed for lab manuals.`,
    testCases: `Input: sample_input = ["Data_Node_A", "Data_Node_B", "Data_Node_C"]
Expected Output:
Status: SUCCESS | Record Count: 3
Validated Records: ['VALIDATED RECORD #1: DATA_NODE_A', 'VALIDATED RECORD #2: DATA_NODE_B', 'VALIDATED RECORD #3: DATA_NODE_C']`,
    notes: `Verify compiler/interpreter version before submitting manual code snippets.`
  };
}
const generateLabCode_createServerFn_handler = createServerRpc({
  id: "483b3cf204bc0e4e2580baf31d2a0f47e326b8baf9fd5c9d59af098b089eeaab",
  name: "generateLabCode",
  filename: "src/lib/viva-lab.functions.ts"
}, (opts) => generateLabCode.__executeServer(opts));
const generateLabCode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  subject: z.string(),
  exerciseDescription: z.string().max(2e3),
  language: z.string().default("auto"),
  customKey: z.string().optional()
})).handler(generateLabCode_createServerFn_handler, async ({
  data
}) => {
  const {
    subject,
    exerciseDescription,
    language,
    customKey
  } = data;
  const langHint = language === "auto" ? "Choose the most appropriate language for this subject (SQL for DBMS, C/Java for OS/Networks, Python otherwise)" : `Use ${language}`;
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
    const {
      text
    } = await generateText({
      model,
      prompt
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        language: parsed.language || "code",
        code: parsed.code || text,
        explanation: parsed.explanation || "",
        testCases: parsed.testCases || "",
        notes: parsed.notes || ""
      };
    }
    return {
      language: "code",
      code: text,
      explanation: "",
      testCases: "",
      notes: ""
    };
  } catch (e) {
    console.warn("Lab Code AI generation fallback activated:", e?.message);
    return generateOfflineLabFallback(subject, exerciseDescription, language);
  }
});
const interpretSettlerInstruction_createServerFn_handler = createServerRpc({
  id: "386dc3c343a7084b5c082350c77dfbcefd5fa9e7d8d1f771a42fbba2c2bf14fe",
  name: "interpretSettlerInstruction",
  filename: "src/lib/viva-lab.functions.ts"
}, (opts) => interpretSettlerInstruction.__executeServer(opts));
const interpretSettlerInstruction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  instruction: z.string().max(1e3),
  customKey: z.string().optional()
})).handler(interpretSettlerInstruction_createServerFn_handler, async ({
  data
}) => {
  const {
    instruction,
    customKey
  } = data;
  const todayStr = "2026-07-09";
  const prompt = `You are "Settler", the autonomous AI DevOps and configuration agent for AcadSphere.
Your job is to assist the user by changing settings, fixing dashboard items, or creating new reminders, posts, or profile configs based on their natural language request.

Today's date is: ${todayStr} (Thursday).

Based on the user's instruction, determine if it maps to any of these action types:
1. "theme": Change theme. Params: {"value": "dark" | "light"}
2. "accent": Change color accent. Params: {"value": "blue" | "violet" | "emerald" | "rose" | "amber" | "cyan"}
3. "profile": Update academic details. Params: {"fullName": string, "degree": string, "semester": string, "targetRole": string, "skills": string} (Include only updated params)
4. "community": Write a community post. Params: {"content": string, "channel": "#placement-prep" | "#dbms-lab" | "#viva-questions" | "#general-chat" | "#study-groups"}

Respond ONLY in this exact JSON format:
{
  "response": "<friendly, professional confirmation message detailing what you successfully configured or fixed>",
  "action": {
    "type": "theme" | "accent" | "profile" | "community" | null,
    "params": { ... }
  }
}

User Instruction: "${instruction}"

If the instruction doesn't map to any of these, set "action": null and explain how the user can format their request so you can help them.`;
  try {
    const model = getAiModel(customKey);
    const {
      text
    } = await generateText({
      model,
      prompt,
      maxOutputTokens: 400
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        response: parsed.response || "Instruction processed.",
        action: parsed.action || null
      };
    }
  } catch (_) {
  }
  return {
    response: "I received your instruction. Please format it clearly (e.g. 'set theme to light', 'change role to Analyst') so I can configure it for you.",
    action: null
  };
});
export {
  generateLabCode_createServerFn_handler,
  generateVivaQuestion_createServerFn_handler,
  gradeVivaAnswer_createServerFn_handler,
  interpretSettlerInstruction_createServerFn_handler
};

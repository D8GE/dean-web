// Extra demo copy for detail surfaces. Keyed by ids that already live in demo-data.ts.
// Nothing here fetches, and none of the grades, due dates, or course facts change.

export type WorkCopy = {
  prompt: string;
  steps?: string[];
  rubric?: { name: string; note: string }[];
  announcementId?: string;
  moduleItemId?: string;
};

export const workCopy: Record<string, WorkCopy> = {
  a1: {
    prompt:
      "Two pages is enough if the claim is specific. Don't summarize the whole article. Prof. Alvarez comments by Wednesday so Friday's revision has somewhere to go.",
    steps: [
      "Put a claim someone could disagree with in the first paragraph.",
      "Use two short moments from the text, not a walk through the whole piece.",
      "End on what this draft still needs, so her comments have a target.",
    ],
    rubric: [
      { name: "Thesis", note: "A stake, not a topic." },
      { name: "Evidence", note: "Two short quotes that do work." },
      { name: "Organization", note: "Follow the claim, not the article's order." },
    ],
    announcementId: "n-e1",
    moduleItemId: "me8d",
  },
  a2: {
    prompt:
      "Questions 1–8 are product, quotient, and chain rule. Show the algebra. A naked derivative with no steps gets half credit.",
    steps: [
      "1–4 use product and quotient. Write the rule before you simplify.",
      "5–8 are chain rule. Keep the inner function visible.",
      "Box the final derivative on each one.",
    ],
    rubric: [
      { name: "Setup", note: "Name the rule, then start the algebra." },
      { name: "Algebra", note: "Steps on the page. A bare answer is half." },
      { name: "Finish", note: "Due Tuesday at 9:00 AM, before class." },
    ],
    announcementId: "n-m1",
    moduleItemId: "mm8c",
  },
  a3: {
    prompt:
      "Ten questions, open note, due Wednesday at 11:59 PM. Focus on the covenant scenes, not the genealogy lists. The Week 8 reading guide is enough.",
    steps: [
      "Review Genesis 12, 15, and 17 before the side stories.",
      "Use the reading guide's marks, not a second commentary.",
      "It's open note. Have the guide beside you, not a blank tab.",
    ],
    rubric: [
      { name: "Covenant scenes", note: "Call, promise, and circumcision." },
      { name: "Notes", note: "Open note. The guide is the note." },
    ],
    announcementId: "n-b1",
    moduleItemId: "mb8d",
  },
  a4: {
    prompt:
      "Loops and lists, due Thursday at 5:00 PM — the end of lab. Start from the posted starter. The autograder opens Wednesday night.",
    steps: [
      "Use the starter file. Don't begin from a blank script.",
      "Cover an empty list. That's the case that bit Lab 4.",
      "Submit during lab so you can ask in the room.",
    ],
    rubric: [
      { name: "Starter", note: "The posted file, with the TODO filled in." },
      { name: "Edges", note: "Empty list has to pass." },
      { name: "Timing", note: "Thursday lab ends at 5:00 PM." },
    ],
    announcementId: "n-c1",
    moduleItemId: "mc8d",
  },
  a5: {
    prompt:
      "About 200 words. Use one term from chapter 7 correctly and one example that isn't the textbook's. Tie it to Monday's recall demo. Replies are optional.",
    steps: [
      "Name the demo Dr. Patel runs at 7:00, in a sentence.",
      "One chapter term, used for your example, not the book's.",
      "Stop near 200 words. Longer doesn't score more.",
    ],
    rubric: [
      { name: "Term", note: "One word from chapter 7, used correctly." },
      { name: "Example", note: "Yours, not the textbook's." },
      { name: "Length", note: "About 200 words. Replies are optional." },
    ],
    announcementId: "n-p2",
    moduleItemId: "mp8d",
  },
  "g-b1": {
    prompt: "Exam 1 covered the Pentateuch. The short answer was the chronology through Exodus.",
  },
  "g-b5": {
    prompt: "The essay asked how covenant gets set up in Genesis, with the thesis doing the holding.",
  },
  "g-e1": {
    prompt: "The diagnostic was a first look at voice and whether the claim had a stake.",
  },
  "g-e2": {
    prompt: "Summarize the article. Your own argument stays out of a summary.",
  },
  "g-e4": {
    prompt: "Workshop notes for a partner. Specific enough that they can use the sentence you named.",
  },
  "g-m1": {
    prompt: "Exam 1 covered limits. The setup was the point, and so was the algebra at the end.",
  },
  "g-c3": {
    prompt: "Lab 3 was functions that return, including the edge case the autograder keeps.",
  },
  "g-p1": {
    prompt: "Exam 1 covered research methods and a short neuron diagram.",
  },
  "g-p4": {
    prompt: "Respond to the sleep study. Name the confound, then say what the lab should do next.",
  },
};

export const announcementMore: Record<string, string> = {
  "n-b1":
    "If you only reread one stretch, make it Genesis 15 and 17. The quiz will not ask you to sort the names in chapter 22. Bring the reading guide, not a second book.",
  "n-b2":
    "The key for the chronology short answer is under Week 6 in Modules. Tuesday office hours in DeMoss 1120 are the right place if you want to walk one item, not the whole exam.",
  "n-e1":
    "Paste the draft into the assignment, or bring the file. If the first sentence is still a topic (\"this essay is about rhetoric\"), rewrite that sentence before you turn anything in.",
  "n-e2":
    "Thin notes from Thursday can still be fixed. Add two comments that name a sentence. You'll want them when the draft comes back Wednesday.",
  "n-m1":
    "Office hours Thursday are for redoing an exam problem, not for the whole set. Start questions 1–8 tonight so you're asking about one stuck step, not all eight.",
  "n-m2":
    "The limit setups on Exam 1 were fine. The points left at the end were algebra. Thursday, 11:00–12:30, Science Hall 210, is the redo slot.",
  "n-c1":
    "The starter lives in the Week 8 module. Autograder opens Wednesday night, so a Wednesday submit still leaves Thursday lab to fix the empty-list case.",
  "n-c2":
    "Lab 4's window stays open through Friday. The empty-string failure is the usual one-line fix. Resubmit the same file after you cover that case.",
  "n-p1":
    "Same link as the other Mondays. The recall demo is short on purpose. The Friday post is where you connect it to chapter 7, so take two lines of notes while it happens.",
  "n-p2":
    "Skip the textbook's example on purpose. If the term doesn't change what your example means, it's the wrong term. Replies to classmates are optional this week.",
};

export type ModuleCopy = {
  body: string;
  takeaway: string;
  action?: { href: string; label: string };
};

export const moduleCopy: Record<string, ModuleCopy> = {
  mb7a: {
    body: "Exodus 1–24 is the week 7 reading: slavery, exit, Sinai, and the start of the law. You already marked it done.",
    takeaway: "The law chapters make more sense if you keep the narrative around them, which is what the lecture was for.",
  },
  mb7b: {
    body: "Dr. Hammond's lecture treated the laws as part of the story, not a break from it. Covenant code sits inside a rescue, not after one.",
    takeaway: "When a statute shows up, ask who just got brought out, and why the rule is there.",
  },
  mb7c: {
    body: "The covenant-code quiz is already scored. It sat on the statutes, not on the plagues.",
    takeaway: "That's the pattern for Wednesday's quiz too: scenes over lists.",
  },
  mb8a: {
    body: "Genesis 12–25 runs from the call of Abram through the birth of Isaac and the start of the next generation. The covenant scenes are 12, 15, and 17.",
    takeaway: "Mark those three before you reread the family conflict around them. The quiz will.",
  },
  mb8b: {
    body: "The lecture walks the call, the promise in chapter 15, and circumcision in chapter 17 as one argument, not three topics.",
    takeaway: "If you can say what changes at each of those three, you're ready for the ten questions.",
  },
  mb8c: {
    body: "The reading guide is a one-page mark-up: which verses to underline, and which genealogies to skip. Dr. Hammond said the guide is enough for the quiz.",
    takeaway: "Still open on the module. Open it once before Wednesday night.",
  },
  mb8d: {
    body: "Ten questions, open note, due Wednesday at 11:59 PM. It is the same quiz as the one on your week list.",
    takeaway: "Have the guide open beside you. Don't try to memorize the names.",
  },
  me7a: {
    body: "Week 7 asked you to bring a printed draft to the workshop. That copy is what your partner wrote on.",
    takeaway: "If the printout was thin, the draft due tonight is where you make up for it.",
  },
  me7b: {
    body: "Workshop notes are the comments you gave and the ones you got. The useful ones name a sentence.",
    takeaway: "Pull two of those sentences into tonight's draft so the peer review actually changes a line.",
  },
  me7c: {
    body: "The lecture was short on purpose: \"good job\" doesn't count, and a comment has to point at words on the page.",
    takeaway: "Use that standard on your own draft before you turn it in. If a paragraph has no sentence you'd defend, it isn't ready.",
  },
  me8a: {
    body: "The sample analysis is there so you can see a claim that could be wrong, then evidence that is only a few quoted words.",
    takeaway: "Don't copy its structure past the idea. Your article is a different piece, and the sample's thesis won't fit it.",
  },
  me8b: {
    body: "Prof. Alvarez's lecture this week: a topic (\"the author uses rhetoric\") cannot be wrong, so it isn't a thesis. A stake can.",
    takeaway: "Read your first sentence out loud. If nobody could push back, rewrite it before the body paragraphs.",
  },
  me8c: {
    body: "The outline worksheet is one claim, two pieces of evidence, and a note about what the draft still lacks. It's still unchecked.",
    takeaway: "Fill it before the 3:30 block. The block is for paragraphs, not for finding the claim.",
  },
  me8d: {
    body: "This is the draft due tonight at 11:59 PM. Two pages is enough. She wants a real thesis more than a long summary.",
    takeaway: "Dean's 3:30 block is parked on the body paragraphs. The 8:15 block is for the polish and the submit.",
  },
  mm7a: {
    body: "Sections 2.1 and 2.2 set up the derivative as a limit of a difference quotient. You already read them.",
    takeaway: "Exam 1 showed the setup was fine and the algebra at the end was the leak. The reading itself can stay checked.",
  },
  mm7b: {
    body: "The lecture worked difference quotients until the limit definition felt like a recipe. That's the quiz you already took.",
    takeaway: "If problem set 4 feels slippery, it's the rules, not this definition. Don't reread 2.1 tonight.",
  },
  mm7c: {
    body: "The definition quiz is scored. It asked for the setup, which is the part of Exam 1 that actually held.",
    takeaway: "Use it as proof you can start a derivative problem. The new work is recognizing which rule, faster.",
  },
  mm8a: {
    body: "Sections 2.3 and 2.4 are the rules: product, quotient, and chain. Problem set 4 is exactly those sections.",
    takeaway: "You don't need a new reading tonight. You need questions 1–8 with the algebra visible.",
  },
  mm8b: {
    body: "The video is three chain-rule examples and nothing else. Notes, since the clip isn't in this demo: label the inner function, differentiate the outer, multiply by the inner derivative, then simplify.",
    takeaway: "Example 2 is the one that looks like a quotient and isn't. Check that before you call it a quotient rule.",
  },
  mm8c: {
    body: "Problem set 4 is questions 1–8, due Tuesday at 9:00 AM. Product, quotient, chain. Steps or half credit.",
    takeaway: "Dean's 4:45 block is questions 1–8. Don't spend it hunting for a ninth problem that isn't there.",
  },
  mc7a: {
    body: "Functions that return a value, not just print one. Lab 3 was the practice, and the feedback asked you to name the edge you skipped.",
    takeaway: "That note matters for Lab 5. The empty list is the edge this week.",
  },
  mc7b: {
    body: "Lab 4 was strings. A few submissions missed the empty string, and the resubmit window stays open through Friday.",
    takeaway: "If yours failed that case, it's a one-line fix. It is not this week's lab.",
  },
  mc7c: {
    body: "Quiz 2 covered functions: parameters, returns, and why a print is not a return. Already scored.",
    takeaway: "Lab 5 builds on this. Loops are new. Functions are supposed to feel finished.",
  },
  mc8a: {
    body: "for, while, and lists. The lecture's warning was index errors: the last item is length minus one, and an empty list never enters the body.",
    takeaway: "Write the empty-list result down before you code it. That's the case the autograder opens with.",
  },
  mc8b: {
    body: "The video is a short tour of index errors. Notes, since the clip isn't in this demo: off-by-one at the end, a loop that starts at 1, and a list that arrives empty.",
    takeaway: "If your loop assumes the list has an item, it will fail the starter's first test.",
  },
  mc8c: {
    body: "The starter is a single file with the function signatures in place and a TODO where the loop goes. Tests for the empty list are already in the file.",
    takeaway: "Download isn't wired in this demo. The file is the one Prof. Lindqvist posted in the week 8 module, and Lab 5 is the thing you submit.",
  },
  mc8d: {
    body: "Lab 5 is loops and lists, due Thursday at 5:00 PM, which is the end of the lab period in Green Hall Lab 1720.",
    takeaway: "Autograder opens Wednesday night. A Wednesday submit leaves you Thursday to fix the empty list in the room.",
  },
  mp7a: {
    body: "Chapter 3 is biology and behavior. You read it before the neuron diagram on Exam 1.",
    takeaway: "The exam note was the diagram, not the chapter. No need to reread it for Friday's post.",
  },
  mp7b: {
    body: "The lecture was neurons, briefly, on purpose. Exam 1's diagram is the part that dropped a few points.",
    takeaway: "If you redo anything from week 7, redo the diagram labels, not the whole chapter.",
  },
  mp7c: {
    body: "The sleep-study response is scored. The comment asked you to name the confound and then say what the lab should do next.",
    takeaway: "That second sentence — what next — is the move Friday's discussion post also wants.",
  },
  mp8a: {
    body: "Chapter 7 is memory and learning. The Friday post needs one term from it, used on an example that is not the book's.",
    takeaway: "Pick the term before Monday's demo so you know what you're watching for at 7:00.",
  },
  mp8b: {
    body: "Live session, Monday 7:00–8:00 PM, same link as the other weeks. Dr. Patel runs a short recall demo. The Friday post connects that demo to the chapter.",
    takeaway: "Take two lines while it happens. Future-you will not remember which list was harder.",
    action: { href: "/schedule?event=class-m4", label: "See it on today's schedule" },
  },
  mp8c: {
    body: "The prompt is already posted: about 200 words, one chapter term, one example of yours, replies optional.",
    takeaway: "Read it before the live session so the demo has a job. The post itself is still open.",
  },
  mp8d: {
    body: "The discussion post is due Friday at 11:59 PM. It is the open writing item in PSYC 101.",
    takeaway: "200 words is the target, not the minimum to beat. Use the demo from Monday night.",
  },
};

export const moduleWorkLinks: Record<string, string> = {
  mb8c: "a3",
  mb8d: "a3",
  me8c: "a1",
  me8d: "a1",
  mm8b: "a2",
  mm8c: "a2",
  mc8c: "a4",
  mc8d: "a4",
  mp8c: "a5",
  mp8d: "a5",
};

export const announcementWork: Record<string, string> = {
  "n-b1": "a3",
  "n-b2": "g-b1",
  "n-e1": "a1",
  "n-e2": "g-e4",
  "n-m1": "a2",
  "n-m2": "g-m1",
  "n-c1": "a4",
  "n-c2": "g-c4",
  "n-p1": "a5",
  "n-p2": "a5",
};

export const badgeCopy: Record<string, string> = {
  "12-day streak": "Twelve days with a study block. Tonight is the one that makes thirteen.",
  "Early bird": "Unlocked for a block that finished before 9:00 AM.",
  "Perfect week": "Still locked. 9 of 13 things are done this week.",
  Bookworm: "Unlocked. The module readings are mostly checked off. The 30-page quest still has 8 pages left.",
  "Quiz master": "Locked. Calc's last quiz was a 76, so the run isn't clean. Wednesday's Genesis quiz is the next shot.",
};

export const questCopy: Record<string, { detail: string; href: string; action: string }> = {
  "Finish 3 study blocks": {
    detail:
      "One is done, so two are left. Tonight's plan has three study blocks, and the walk doesn't count: English at 3:30, problem set 4 at 4:45, and the polish at 8:15. Any two of those finish the quest.",
    href: "/focus",
    action: "Start the 3:30 block",
  },
  "Submit before the deadline": {
    detail:
      "Four of five submissions this week made it in on time. The English draft, due tonight at 11:59 PM, is the one still out.",
    href: "/assignments/a1",
    action: "Open the draft",
  },
  "Read 30 pages": {
    detail: "22 pages in, 8 to go. Genesis 12–25 is the reading that closes it. The quiz on Wednesday uses the same pages.",
    href: "/courses/bibl-104/items/mb8a",
    action: "Open the reading",
  },
};

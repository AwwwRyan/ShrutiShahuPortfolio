/**
 * Pre-fill text for the Contact page's message field, keyed by the `?service=` slug each
 * Services card links with. Shruti's own wording — kept verbatim, editable by the visitor
 * once it lands in the textarea (this is a `defaultValue`, not a locked value).
 */
export const SERVICE_INQUIRY_TEMPLATES: Record<string, string> = {
  'content-editing-proofreading': `Hi, I'm interested in your Content Editing & Proofreading services.
I'd like help with: [Briefly describe the content you need help with]
Approximate word count: [Word count]
Deadline (if any): [Date]
Additional details:
[Add any other requirements/questions you'd like to share]`,

  'manuscript-editing': `Hi, I'm interested in your Manuscript Editing services.
I'd like help with: [Briefly describe the type of manuscript you need help with]
Approximate word count: [Word count]
Stage of the manuscript: [e.g., first draft, revised draft, near-final draft]
Deadline (if any): [Date]
Additional details:
[Add any information about the manuscript, intended audience, publishing plans, or specific concerns you'd like to share]`,

  'academic-editing': `Hi, I'm interested in your Academic Editing services.
I'd like help with: [Briefly describe the type of document you need help with]
Subject/discipline: [Field of study]
Approximate word count: [Word count]
Academic level: [e.g., undergraduate, postgraduate, doctoral, researcher]
Deadline (if any): [Date]
Additional details:
[Add any specific requirements, guidelines, formatting style, journal/university requirements, or other information that may be relevant]`,

  writing: `Hi, I'm interested in your Writing services.
I'd like help with: [Briefly describe the type of content. E.g., article, blog post, website copy, report, essay, profile, feature, etc.]
Topic/subject: [Topic]
Approximate length: [Word count or desired length]
Deadline (if any): [Date]
Additional details:
[Add any background information, key points, references, examples, or specific requirements you'd like me to consider]`,

  'digital-news-reportage': `Hi, I'm interested in your Digital News Reportage services.
I'd like help with: [Briefly describe the event, story, issue, or subject I'd like covered]
Topic/event: [Brief description]
Location: [Location, if relevant]
Intended platform/publication: [Website, digital publication, news platform, etc.]
Deadline/publication date (if any): [Date]
Additional details:
[Add information about the story, people involved, sources, access, background, or any specific angle you'd like covered]`,

  research: `Hi, I'm interested in your Research services.
I'd like help with: [Briefly describe the topic, question, or research problem you need help with]
Research topic/subject: [Topic]
Type of research needed: [e.g., literature review, background research, source gathering, fact-checking, qualitative research, desk research, etc.]
Scope/areas to focus on: [Specific aspects, questions, or areas of interest]
Deadline (if any): [Date]
Additional details:
[Add any sources, guidelines, geographical/time-period limitations, preferred sources, or other requirements you'd like me to consider]`,
};

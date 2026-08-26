from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font('helvetica', 'B', 15)
        # Title
        self.cell(0, 10, 'Novalantis / Hireonomous Demo Guide', border=False, align='C')
        self.ln(15)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('helvetica', 'I', 8)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

    def chapter_title(self, num, label):
        # Arial 12
        self.set_font('helvetica', 'B', 14)
        # Background color
        self.set_fill_color(240, 248, 255)
        # Title
        self.cell(0, 10, f'Step {num}: {label}', border=False, ln=True, fill=True)
        self.ln(4)

    def chapter_body(self, body):
        # Times 12
        self.set_font('helvetica', '', 12)
        # Output justified text
        self.multi_cell(0, 7, body)
        self.ln()

demo_points = [
    {
        "title": "Welcome & Login (The Front Door)",
        "content": "Start the demo by showing the clean, rebranded login page. Explain that Novalantis/Hireonomous provides a secure, modern entry point. Highlight the 'Find the right talent, faster' tagline which sets the stage for our AI-driven value proposition."
    },
    {
        "title": "The Analytics Dashboard (Command Center)",
        "content": "Once logged in, draw attention to the Dashboard. Point out the Recruitment Activity timeline and the key metrics (Candidates Screened, Calls made, Interviews, Hired). Explain that this gives a bird's-eye view of the entire hiring funnel in real-time without having to dig through spreadsheets."
    },
    {
        "title": "Job Board Management (Setting the Target)",
        "content": "Navigate to the Jobs section. Show how easy it is to create or edit a job listing. Emphasize that the platform uses these job descriptions (skills, roles, requirements) as the ultimate ground truth to guide the AI's understanding of what a 'perfect match' looks like."
    },
    {
        "title": "Uploading Candidates (The Real-Time Pipeline)",
        "content": "Move to the Hiring/Pipeline workspace. Upload a sample resume. Demonstrate how the system automatically parses the resume, compares it against the Job Description, and generates a Match Score (e.g., 75%). This eliminates manual resume screening."
    },
    {
        "title": "AI Recruiter Configuration (Customizing the Agent)",
        "content": "Show the AI Recruiter Configuration panel. Explain that we can customize the AI's behavior, tone, and the exact screening questions it asks. Mention that the AI focuses heavily on two core aspects: 'Are you interested in the role?' and 'How many years of experience do you have?' to ensure high-quality screening."
    },
    {
        "title": "AI Recruiter Simulator (Test Drive)",
        "content": "Open the AI Simulator. Show that recruiters can actually 'talk' to the AI agent before deploying it to real candidates. This builds trust and ensures the AI represents the company brand perfectly."
    },
    {
        "title": "Automated AI Outreach & Bulk Actions (The Magic)",
        "content": "Back in the pipeline, demonstrate the new bulk select feature. Select one or more candidates and explain that with a single click of 'Start AI Outreach', Bolna AI will call these candidates over the phone simultaneously. Show how you can also bulk delete candidates easily to keep the pipeline clean."
    },
    {
        "title": "Call Results & Live Feedback (Closing the Loop)",
        "content": "Finally, explain what happens after the call. Show how candidates are automatically tagged as 'Interested', 'Not Interested', or 'Callback Required' based on the conversation. Highlight that the AI generates a detailed call summary and transcript, allowing the human recruiter to take over only for the warmest, pre-qualified leads."
    }
]

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()
pdf.set_font("helvetica", size=12)

# Intro
pdf.multi_cell(0, 7, "This document serves as a step-by-step presentation guide for demonstrating the Novalantis/Hireonomous AI Recruitment Platform. Use these talking points to guide your audience through the core value propositions.")
pdf.ln(10)

for i, point in enumerate(demo_points, 1):
    pdf.chapter_title(i, point['title'])
    pdf.chapter_body(point['content'])

pdf.output('Novalantis_Demo_Guide.pdf')

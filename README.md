# RMGen: Your README.md Generator

## Inspiration

Developing and publishing software projects demands significant time and effort.  The process of manually creating comprehensive README.md files, while crucial for project clarity and accessibility, can be a tedious and repetitive task.  This project originated from the need to streamline this workflow, automating the creation of high-quality README files to reduce development overhead and improve developer productivity. Existing template solutions often require substantial manual customization, highlighting the need for a more automated and efficient solution.

## Journey

This project leveraged a combination of AI-assisted development tools and APIs to achieve its automation goals.  Initially developed using Cursor, the project later transitioned to Gemini Code Assist within VS Code. This iterative development process allowed for exploration of the capabilities of large language models (LLMs) in software development, and provided valuable experience in integrating LLMs with external services.  Specifically, the project facilitated learning in leveraging the GitHub API, integrating Gemini's generative AI capabilities, and building a full-stack application using AI-agent technologies.


## Usage

RMGen offers four methods for README.md generation:

1.  Direct repository link input.
2.  Owner name and repository name input.
3.  GitHub account connection and repository selection (currently supports public repositories).
4.  A "from scratch" option, allowing users to build their README.md from the ground up within the application.


After selecting a generation method and specifying project details (project type and team collaboration), users choose desired README components, answer relevant prompts, and preview their generated README.md.  The generated README can then be copied or (in future iterations) directly pushed to the GitHub repository.


## Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Backend:** Python, Flask
*   **AI Model:** Google Gemini
*   **Deployment:** Cloudflare Pages (frontend), Render (backend)
*   **AI Agents Used:** Cursor (initial development), Gemini Code Assist (subsequent development)


## Roadmap

Future development will focus on:

1.  Directly pushing the generated README.md to the GitHub repository.
2.  Adding support for private repositories via GitHub authentication.


## Troubleshooting

Initial requests may experience a slight delay (up to one minute). This is due to server warm-up times on the free-tier Render hosting environment.


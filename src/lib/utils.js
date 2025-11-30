import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const buildResumeHtml = (resumeData, filename = "Resume") => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${filename}</title>
      <meta charset="UTF-8" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 0.5in;
        }
        .resume-header {
          text-align: center;
          border-bottom: 1px solid #ccc;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .resume-header h1 {
          font-size: 18pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          font-size: 9pt;
          color: #444;
        }
        .section {
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .summary {
          font-size: 10pt;
          color: #333;
        }
        .experience-item, .education-item {
          margin-bottom: 12px;
        }
        .exp-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .exp-title {
          font-weight: bold;
        }
        .exp-company {
          color: #444;
        }
        .exp-date {
          font-style: italic;
          color: #666;
        }
        .bullets {
          margin-left: 16px;
          margin-top: 4px;
        }
        .bullets li {
          margin-bottom: 2px;
          font-size: 10pt;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-tag {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 9pt;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="resume-header">
        <h1>${resumeData?.personalInfo?.name || "Your Name"}</h1>
        <div class="contact-info">
          ${resumeData?.personalInfo?.email
      ? `<span>${resumeData.personalInfo.email}</span>`
      : ""
    }
          ${resumeData?.personalInfo?.phone
      ? `<span>${resumeData.personalInfo.phone}</span>`
      : ""
    }
          ${resumeData?.personalInfo?.location
      ? `<span>${resumeData.personalInfo.location}</span>`
      : ""
    }
          ${resumeData?.personalInfo?.linkedin
      ? `<span>${resumeData.personalInfo.linkedin}</span>`
      : ""
    }
        </div>
      </div>

      ${resumeData?.summary
      ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p class="summary">${resumeData.summary}</p>
        </div>
      `
      : ""
    }

      ${resumeData?.experience?.length
      ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${resumeData.experience
        .map(
          (exp) => `
            <div class="experience-item">
              <div class="exp-header">
                <div>
                  <span class="exp-title">${exp.title}</span>
                  <span class="exp-company"> | ${exp.company}, ${exp.location}</span>
                </div>
                <span class="exp-date">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <ul class="bullets">
                ${exp.bullets.map((b) => `<li>${b.text}</li>`).join("")}
              </ul>
            </div>
          `
        )
        .join("")}
        </div>
      `
      : ""
    }

      ${resumeData?.education?.length
      ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resumeData.education
        .map(
          (edu) => `
            <div class="education-item">
              <div class="exp-header">
                <div>
                  <span class="exp-title">${edu.degree}</span>
                  <span class="exp-company"> | ${edu.school}, ${edu.location}</span>
                </div>
                <span class="exp-date">${edu.startDate} - ${edu.endDate}</span>
              </div>
              ${edu.description
              ? `<p class="summary">${edu.description}</p>`
              : ""
            }
            </div>
          `
        )
        .join("")}
        </div>
      `
      : ""
    }

      ${resumeData?.skills?.length
      ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${resumeData.skills
        .map((skill) => `<span class="skill-tag">${skill}</span>`)
        .join("")}
          </div>
        </div>
      `
      : ""
    }
    </body>
  </html>
  `;
};

export const buildCoverletterHtml = (letterName, coverLetter) => `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${letterName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.8;
              padding: 1in;
              max-width: 8.5in;
              margin: 0 auto;
              color: #333;
            }
            .content {
              white-space: pre-wrap;
              font-size: 12pt;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="content">${coverLetter}</div>
        </body>
      </html>
    `
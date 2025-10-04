// Default Google Sheets TSV link
const TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjovjEuYUCC0Bm7IuIYC8JE0eUtA58hfyYrreGW-5T8z4k0vs6Vt8i8IzeNY0ewDRP3XIJ4WJNPxXZ/pub?gid=0&single=true&output=tsv";

const projectList = document.getElementById("projectList");
const projectDetails = document.getElementById("projectDetails");
const currentDate = document.getElementById("currentDate");

// 9 Predefined card colors
const cardColors = [
  "blue", "purple", "yellow", "red", 
  "green", "pink", "teal", "orange", "indigo"
];

// Show current date in sidebar
function setDate() {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const today = new Date().toLocaleDateString("en-US", options);
  currentDate.textContent = today;
}

// Parse Markdown-style formatting
function parseFormatting(text) {
  let formatted = text;

  // Bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Underline: __text__
  formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>');

  // Inline code: `text`
  formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

  return formatted;
}

// Load projects from Google Sheets TSV
async function loadProjects() {
  try {
    const res = await fetch(TSV_URL);
    const text = await res.text();
    const rows = text.trim().split("\n").map(r => r.split("\t"));
    
    const headers = rows.shift();
    const projects = rows.map(r => {
      const obj = {};
      headers.forEach((h, i) => (obj[h.trim().toLowerCase()] = r[i]?.trim()));
      return obj;
    });

    displayProjectCards(projects);
  } catch (err) {
    console.error("Error loading TSV:", err);
    projectList.innerHTML = "<p>Failed to load projects. Check your TSV link.</p>";
  }
}

// Display project cards on left sidebar
function displayProjectCards(projects) {
  projectList.innerHTML = "";
  projects.forEach((p, i) => {
    const card = document.createElement("div");

    // Assign color automatically (cycle through 9 colors)
    const color = cardColors[i % cardColors.length];
    card.classList.add("project-card", color);

    // Adjust text color for light backgrounds
    const darkTextColors = ["yellow", "orange"];
    if (darkTextColors.includes(color)) {
      card.style.color = "#333";
    }

    card.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.description}</p>
    `;
    card.addEventListener("click", () => showDetails(p, color));
    projectList.appendChild(card);
  });
}

// Display project details on right
function showDetails(project, color) {
  const fileLink = project.file || project.link || project["project file"] || "";

  // Split details by semicolon and apply formatting
  const detailsArray = (project.details || "No additional details available.")
    .split(";")
    .map(d => d.trim())
    .filter(d => d);

  projectDetails.innerHTML = `
    <div class="details-header">
      <h2>${project.title}</h2>
      ${fileLink ? `<button onclick="window.open('${fileLink}', '_blank')">Open File</button>` : ""}
    </div>
    <p>${project.description}</p>
    <div class="details-separator"></div>
    <p><strong>Deadline:</strong> ${project.deadline || "Not set"}</p>
    <p><strong>Type of project:</strong> ${project.task || "n/a"}</p>
    <div class="details-content">
      ${detailsArray.map(d => `<p>${parseFormatting(d)}</p>`).join("")}
    </div>
  `;
}

// Initialize
setDate();
loadProjects();


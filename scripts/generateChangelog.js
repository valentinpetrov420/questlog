import fs from "node:fs/promises";
 
const OWNER = "valentinpetrov420";
const REPO = "questlog";
const OUTPUT_FILE = new URL("../public/patchnotes.json", import.meta.url);
 
async function fetchAllCommits() {
    let url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=100`;
    const commits = [];
 
    while (url) {
        const response = await fetch(url, {
            headers: {
                Accept: "application/vnd.github+json"
            },
        });
 
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
 
        const page = await response.json();
        commits.push(...page);
 
        const linkHeader = response.headers.get("Link");
        const nextLink = linkHeader
            ?.split(",")
            .find((part) => part.includes('rel="next"'));
 
        url = nextLink ? nextLink.split(";")[0].trim().slice(1, -1) : null;
    }
 
    return commits;
}
 
function toPatchEntry(commit) {
    return {
        message: commit.commit.message,
        date: commit.commit.author.date,
    };
}
 
async function run() {
    const commits = await fetchAllCommits();
    const entries = commits.map(toPatchEntry);
 
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(entries, null, 2));
}
 
run();
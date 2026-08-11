import './AboutPage.css';

import readmeRaw from '../../readme-content.md?raw';
import ReactMarkdown from 'react-markdown';

function hideSections(content: string): string {
  return content
    .replace(/<!-- hide:start -->[\s\S]*?<!-- hide:end -->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


export default function AboutPage() {
    const readmeContent = hideSections(readmeRaw);

    return <div className="about-page-container">
        <ReactMarkdown>{readmeContent}</ReactMarkdown>
    </div>
}
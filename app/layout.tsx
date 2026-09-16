import { ThemeProvider } from '@/components/theme-provider'
import Sessioprovider from '@/components/session-provider'
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './global.css'
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Famosa garage',
  description: 'one of the best Enginner ',
  keywords: [
    "Ashish Rohilla", "ashishrohilla.in", "DevOps Engineering", "Full Stack Development", "Cloud Architecture", 
    "System Administration", "Software Development", "Coding Tutorials", "Tech Education", "Programming",
    "Web Development", "React.js", "Next.js", "Node.js", "TypeScript", "JavaScript", "Python", 
    "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "GCP", "CI/CD", "Continuous Integration", 
    "Continuous Deployment", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "Ansible", 
    "Linux", "Ubuntu", "CentOS", "Shell Scripting", "Bash", "Networking", "Security", "Cybersecurity", 
    "Database Management", "SQL", "MySQL", "PostgreSQL", "MongoDB", "NoSQL", "Redis", "GraphQL", 
    "REST API", "Microservices", "Serverless", "Frontend Development", "Backend Development", 
    "UI/UX Design", "Tailwind CSS", "Bootstrap", "HTML5", "CSS3", "SASS", "LESS", "Web Design", 
    "App Development", "Mobile Development", "React Native", "Flutter", "iOS Development", 
    "Android Development", "Agile Methodology", "Scrum", "Kanban", "Project Management", 
    "Software Engineering", "Tech Blog", "Developer Community", "Coding Bootcamp", "Online Courses", 
    "Tech Mentorship", "Career Growth", "Interview Preparation", "Coding Challenges", "LeetCode", 
    "System Design", "Data Structures", "Algorithms", "Open Source", "Git", "GitHub", "Version Control", 
    "IT Automation", "Infrastructure as Code", "Monitoring", "Prometheus", "Grafana", "ELK Stack", 
    "Logstash", "Kibana", "Elasticsearch", "Tech News", "Developer Tools", "VS Code", "IntelliJ", 
    "Vim", "Software Architecture"
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en"  suppressHydrationWarning>
      <meta name="google-adsense-account" content="ca-pub-7557474007097933">
      </meta>

      <meta name="google-site-verification" content="frvHP0JeNOztqEzCjXqrTIlM492jh1yIYa2IZaNbBRg" />
      <head>
        
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7557474007097933"
     crossOrigin="anonymous"></script>
     <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
     <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"/>



      </head>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <main className='w-full mx-4'>
              <Analytics/>
              <SpeedInsights/>
            </main>
          {children}
          </ThemeProvider>
          <Toaster />
          <Sessioprovider/>
      </body>
    </html>
  )
} 

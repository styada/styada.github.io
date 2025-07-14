import { Logo } from "@once-ui-system/core";

const person = {
  firstName: "Sai Suchir",
  lastName: "Tyada",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Applied AI Engineer",
  avatar: "/images/avatar.jpg",
  email: "tyada.saisuchir@gmail.com",
  location: "America/Chicago", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Hindi", "Telugu", "French"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/styada/",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/saisuchirtyada/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing the work and projects of ${person.name}.`,
  headline: <>Augmenting life with AI and curiosity</>,
  featured: {
    display: true,
    title: <>Recent project: <strong className="ml-4">Computerized Reconstruction of Tomographic Images</strong></>,
    href: "work/computerized-reconstruction-tomography/",
  },
  subline: (
    <>
      Hi I'm Sai!
      <br /> I am an applied AI engineer at Target, where I work on enabling teams to build
      AI-powered tools. 
      <br />After hours, I travel the world and follow my curiosity.
    </>
  ),
};

const about = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://calendly.com/styada3-gatech/30min",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Sai is a Minneapolis-based Applied AI Engineer and MS candidate at Georgia Tech with a passion for creating AI tools that augment (not replace) humans and their work. 
        His work involves building Target's internal LLM Evaluation platforms, Synthetic Data Generation platforms (LLMs & MLLMs), and Kafka-based Appplication Monitoring platform. 
      </>
    ),
  },
    studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        name: "Georgia Institute of Technology",
        description: <>
          <>Masters of Science in Computer Science</>
          <>Interactive Intelligence Specialization</>
        </> ,
      },
      {
        name: "University of Minnesota - Twin Cities",
        description: <>Bachelors of Arts in Mathematics</>,
      },
      {
        name: "Oxford University",
        description: <>Artificial Intelligence Programme</>,
      },
      {
        name: "University of Minnesota - Twin Cities",
        description: <>Bachelors of Science in Computer Science - AI Track</>,
      },
    ],
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
      company: "Target",
      timeframe: "Oct 2024 - Present",
      role: "Applied AI Engineer / Software Engineer - Generative AI",
      achievements: [
        <>
          Created and deployed a live GenAI application monitoring service using Kafka for on-the-go response evaluations.
        </>,
        <>
          Contributed to model benchmarking through the creation of text and multimodal synthetic data generation pipelines using LLMs and MLLMs.
        </>,
        <>
          Led development of a synthetic data generation API and designed high-level architecture for GenAI platform APIs in production settings.
        </>,
        <>
          Ran prompt engineering experiments for LLM-based and RAG-specific LLM-as-a-judge evaluation systems and contributed to internal GenAI documentation.
        </>,
      ],
      images: [],
    },
    {
      company: "Target",
      timeframe: "Sep 2023 - Oct 2024",
      role: "TLP Engineer",
      achievements: [
        <>
          Responsible for production support of VMs running barcode OCR in distribution center.
        </>,
        <>
          Automated process to achieve a 95% reduction of time to gather valuable metrics.
        </>,
        <>
          Created APIs supporting adoption of RAG-based Generative AI initiatives.
        </>,
        <>
          Lead efforts to overhaul initial APIs to reduce technical overheads and streamline processes.
        </>,
        <>
          Gained experience in integrations to codebases using GPT, Llama2, and Mixtral models.
        </>,
      ],
      images: [
        // {
        //   src: "/images/projects/project-01/cover-01.jpg",
        //   alt: "Project image",
        //   width: 16,
        //   height: 9,
        // },
      ],
    },
    {
      company: "Best Buy",
      timeframe: "Sep 2022 - May 2023",
      role: "Software Engineer Intern",
      achievements: [
        <>
          Developed customer-facing ReactJS applications for Mobile Activations and BestBuy.com teams.
        </>,
        <>
          Enhanced e-commerce features and worked in agile teams to deliver user-focused solutions.
        </>,
      ],
      images: [],
    },
    {
      company: "Target",
      timeframe: "Jun 2022 - Aug 2022",
      role: "Software Development Intern – Infrastructure",
      achievements: [
        <>
          Built Monthly Aggregator Service in Go to consolidate monthly workload utilization data.
        </>,
        <>
          Gained experience with PostgreSQL queries and Golang - PostgreSQL integrations.
        </>,
        <>
          Executed unit testing, error handling and planned for concurrency to be introduced to the service.
        </>,
      ],
      images: [],
    },
    {
      company: "Best Buy Health",
      timeframe: "Sep 2021 - May 2022",
      role: "Software Development Intern – CRM",
      achievements: [
        <>
          Worked on migration of legacy systems to Microsoft Dynamics 365 and Power Platform for Active Aging team.
        </>
      ],
      images: [],
    },
    {
      company: "Target",
      timeframe: "Jun 2021 - Aug 2021",
      role: "Back-End Software Development Intern",
      achievements: [
        <>
          Developed API endpoints in Spring Boot (Java) and Cassandra for partner integrations.
        </>,
        <>
          Set up API-endpoints to interact with other partner vendors’ APIs for app integrations.
        </>,
      ],
      images: [],
    },
    {
      company: "The Toro Company",
      timeframe: "Jun 2020 - Aug 2020",
      role: "Inventory Analyst Intern",
      achievements: [
        <>
          Imaged devices to meet Toro security provisioning requirements for local environments.
        </>,
        <>
          Data wiped devices for protection of Toro proprietary data and employee patents.
        </>,
        <>
          Distributed software to employees and devices all over the world across various time zones.
        </>
      ],
      images: [],
    },
    {
      company: "Optum",
      timeframe: "Aug 2018 - Jun 2019",
      role: "Full-Stack Software Development Intern",
      achievements: [
        <>
          Led a team of 5 other high school intern developers as technical lead to develop a performance metrics web app.
        </>,
        <>
          Planned and executed agile sprints to develop a web page application meeting deadlines.
        </>,
        <>
          Addressed the need for an Optum-specific team performance metrics dashboard using JavaScript frameworks. 
        </>
      ],
      images: [],
    }
    ],
  },
  technical: {
    display: false, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: <>Able to prototype in Figma with Once UI with unnatural speed.</>,
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cover-02.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/cover-03.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Next.js",
        description: <>Building next gen apps with Next.js + Once UI + Supabase.</>,
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cover-04.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

const blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };

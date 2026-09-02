/**
 * Homepage copy. Kept deliberately short — one sentence per idea, not a
 * paragraph. Whitespace and hierarchy carry the rest; the words don't have
 * to.
 */
export const HOMEPAGE_COPY = {
  hero: {
    badge: "00 // WHERE REAL PROBLEMS MEET REAL BUILDERS",
    title: "Stop guessing what to build. Start building what people are already asking for.",
    subtitle: "A public marketplace of real problems reported by developers and teams. Builders come here to see exactly what's broken — and who's waiting for a fix.",
    ctaValidate: "Report a Problem",
    ctaExplore: "Browse Problems",
  },

  about: {
    title: "What is NeedBoard?",
    subtitle: "A meeting point for people stuck with a problem and the builders who can solve it.",
    description: "Developers lose hours to broken tools and clunky workflows. Founders spend months building things nobody asked for. NeedBoard fixes both: report a real frustration, we group it with similar reports, and builders see exactly how many people are affected before writing a line of code.",
  },

  features: {
    title: "What You Can Do on NeedBoard",
    subtitle: "Three ways NeedBoard turns frustration into real solutions.",

    list: [
      {
        id: "explore",
        badge: "FIND YOUR PROBLEM, INSTANTLY",
        title: "Search by Meaning, Not Just Words",
        desc: "Describe your frustration in plain words — NeedBoard matches by meaning, not exact phrasing, so scattered duplicates become one clear signal.",
        interactiveTitle: "How Search Will Work",
        interactiveInput: "flaky microfrontend hot reloading compile failures",
        interactiveMatch: "Flaky local testing setups and slow hot-reload compilation times",
        interactiveScore: "Match Score: 94%"
      },
      {
        id: "submit",
        badge: "REPORT IT IN SECONDS",
        title: "Turn Your Frustration Into an Opportunity",
        desc: "Tell us what's broken in plain language. If others hit the same wall, your report strengthens an existing problem — otherwise, you've just created a new one.",
        interactiveTitle: "Log Frustration Lifecycle",
        stages: [
          { label: "1. Tell Us What's Wrong", value: "Parsing 200-page lease contracts is costing us hours of manual reviews..." },
          { label: "2. We Check for Matches", value: "Looking for others who've hit the same wall..." },
          { label: "3. Your Problem Goes Live", value: "New problem created: 'Massive unstructured PDF contract parsing' — now visible to builders!" }
        ]
      },
      {
        id: "curate",
        badge: "THE BEST SOLUTIONS RISE TO THE TOP",
        title: "Real Users Decide What's Actually Good",
        desc: "Once solutions are listed, the community takes over — upvotes, downvotes, and honest reviews from people who've actually used them.",
        interactiveTitle: "How Voting Will Work",
        solName: "StockFlow Multi-Sync",
        solDesc: "Real-time webhook-based multi-channel inventory synchronization that updates stock levels under 1 second.",
        upvotesCount: "+12",
        reviewsCount: "💬 Reviews (5 / 5.0 Rating)"
      }
    ]
  },

  ecosystem: {
    title: "Built for Two Kinds of People",
    subtitle: "Whether you're stuck with a problem or looking for one worth solving, NeedBoard works for you.",

    reporters: {
      title: "If You Have a Problem",
      subtitle: "For Developers, Creators, and Teams",
      benefits: [
        {
          title: "Say What's Broken",
          desc: "Report a broken tool in seconds and put it in front of builders who can actually fix it."
        },
        {
          title: "Back Problems You Recognize",
          desc: "Click 'Me Too' to add your voice and show builders how many people need this fixed."
        },
        {
          title: "Get Notified When It's Fixed",
          desc: "The moment a builder ships a fix, we email you directly — no need to keep checking back."
        }
      ]
    },

    builders: {
      title: "If You Want to Build Something People Need",
      subtitle: "For SaaS Founders, Indie Developers, and Creators",
      benefits: [
        {
          title: "Skip the Guesswork and Cold Outreach",
          desc: "Build for people already asking for a fix — the demand is already documented and waiting."
        },
        {
          title: "Launch to an Audience That's Waiting",
          desc: "Publish your solution and we notify everyone who asked for it — instant first users, zero marketing spend."
        },
        {
          title: "Earn Trust as a Verified Builder",
          desc: "Get verified, unlock the Builder badge, and earn the credibility people need to try what you've made."
        }
      ]
    }
  },

  activeSignals: {
    title: "Problems Being Solved Right Now",
    subtitle: "What's still unsolved — pick your next build.",
    ctaText: "See All Open Problems",
  }
};

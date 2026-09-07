/**
 * Centralized Copy Configuration
 * All user-facing text, headers, subheadings, explanations, and descriptive text are stored here.
 * This makes it easy for builders, founders, and normal audiences to understand, and enables
 * painless future integration with an admin dashboard or a database/CMS.
 */

export const APP_COPY = {
  global: {
    appName: "NeedBoard",
    tagline: "Problem-Market Fit Engine",
  },

  home: {
    badge: "Collective Problem Clustering",
    heroTitle: "Find Problems Worth Solving.",
    heroSubtitle: "Real customer complaints and product frustrations, organized into active groups with pre-validated demand.",
    inputPlaceholder: "Describe a problem or frustration (e.g., inventory sync breaks across Shopify and Etsy)...",
    characterWarning: "Input exceeds limits. Please shorten it.",
    inputContextHelp: "Details help us group your voice with others facing the same issue.",
    submitButtonText: "Submit Problem",
    submitButtonLoading: "Analyzing...",
    signInToSubmitText: "Sign In to Submit",
    
    // Developer helper indicator
    seedToolkitTitle: "BUILDER TOOLKIT",
    seedToolkitDesc: "Your database is empty. Inject 5 realistic software and hardware customer problem groups to see how founders discover opportunities!",
    seedButtonText: "Seed Sample Data",
    seedButtonLoading: "Seeding...",

    // Trending Section
    trendingTitle: "Active Problem Groups",
    trendingSubtitle: "THE LARGEST ACCUMULATIONS OF CUSTOMER FRUSTRATIONS AND PRODUCT GAPS",
    browseAllLink: "Browse All Niches",
    signalSizeLabel: "People Affected:",
    distinctPhrasingsSuffix: "variations of this problem reported",
    inspectLink: "Inspect Problem",
  },

  browse: {
    title: "Browse Problem Niches",
    subtitle: "Select a high-level commercial vertical to explore active customer pain points that you can turn into products.",
    backLink: "Back to Niches",
  },

  search: {
    title: "Validate Your Product Idea",
    subtitle: "Search across real customer complaints to see if people actually struggle with the problem you want to solve.",
    inputPlaceholder: "Search for problems or frustrations (e.g. monorepo, calendar sync)",
    searchingText: "Searching databases...",
    resultsTitle: "Matching Pain Points",
    noResults: "We couldn't find any active groups matching that search. This might be a brand new niche to seed!",
  },

  clusterDetail: {
    backToNiche: "Back to Niche",
    matchHeader: "Active Customer Pain Point",
    evidenceTitle: "Real Customer Evidence",
    evidenceSubtitle: "RAW QUOTES FROM REAL USERS",
    meTooTitle: "I Experience This Too",
    meTooDesc: "Faced this exact problem? Add your voice to increase its priority for builders.",
    meTooInputPlaceholder: "Optional: Describe how you personally experience this issue in your own words...",
    meTooButtonText: "Add My Voice (Me Too)",
    meTooButtonLoading: "Submitting...",
    meTooSuccess: "Thanks — your voice has been added to this problem's demand.",

    // Adjacent/Related
    adjacentTitle: "Related Customer Pain Points",
    adjacentSubtitle: "SIMILAR OPPORTUNITIES IN THIS NICHE",
  },

  draftResult: {
    matchHeader: "Highly Similar Group Found",
    matchTitle: "You are not alone.",
    matchDesc: "Other people are already describing this exact issue — a validated pain point with real demand.",
    peopleAffected: "others affected",
    clusterLabel: "Active Problem Group",

    // New cluster (first reporter)
    newHeader: "New Pain Point Discovered",
    newTitle: "You're the first to report this!",
    newDesc: "You're seeding a new problem group, helping builders spot a fresh, unserved gap.",
    proposedCategoryLabel: "Proposed Market Niche",
    proposedCanonicalLabel: "Simplified Problem Summary",
    customCanonicalPlaceholder: "Refine the problem summary if needed...",

    publishButtonText: "Publish & Save Pain Point",
    publishButtonLoading: "Publishing...",

    successHeader: "Pain Point Published!",
    successMatchedDesc: "Your feedback was merged with others. You have fortified an active problem group:",
    successSeededDesc: "You have successfully seeded a brand new customer problem group for builders to solve:",
    viewDetailsButton: "Inspect Pain Point",
    submitAnotherButton: "Submit Another",
  },

  solutions: {
    tabTitle: "Active Solutions",
    tabSubtitle: "Products built to solve this exact problem",
    addSolutionButton: "⚡ I Built a Solution",
    noSolutions: "No solutions listed yet. Built something that solves this? Put it in front of this validated audience.",
    formTitle: "Submit Your Product Solution",
    formSubtitle: "Pitch your product directly to a validated group of people suffering from this exact problem.",
    productNameLabel: "Product Name",
    productNamePlaceholder: "e.g., Webpack TurboLoader",
    productUrlLabel: "Product Website URL",
    productUrlPlaceholder: "e.g., https://turbo-loader.dev",
    descriptionLabel: "How does it solve this problem?",
    descriptionPlaceholder: "Describe how your product resolves this specific friction point...",
    founderNameLabel: "Founder / Creator Name",
    founderNamePlaceholder: "e.g., Alex Rivera",
    submitButtonText: "Publish Solution",
    submitButtonLoading: "Publishing...",
    successHeader: "Solution Listed Successfully!",
    successDesc: "Your solution is now pinned directly to this problem group, in front of your core audience.",
  },

  reviews: {
    title: "User Reviews & Feedback",
    addReviewButton: "Write a Review",
    noReviews: "No reviews yet. Tried it out? Be the first to share your experience.",
    ratingLabel: "Product Rating",
    reviewTextLabel: "Your Experience",
    reviewTextPlaceholder: "Share how this solution resolved the issue for you, your team's feedback, or any bugs you encountered...",
    reviewerNameLabel: "Your Name",
    reviewerNamePlaceholder: "e.g., Jane Dev",
    submitButton: "Post Review",
    submitButtonLoading: "Posting...",
    successHeader: "Review Posted!",
    successDesc: "Thanks for validating this solution — your review is now on the product listing.",
    averageRatingLabel: "Average Rating",
  }
};

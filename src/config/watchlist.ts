// What /watchlist/ shows that may change before the plan opens: the price
// block and the waitlist form's field labels. src/pages/watchlist.astro and
// src/components/SignupForm.astro read it. Pricing and packaging are not
// final, so this holds no features, tiers or dates.
export const WATCHLIST = {
  priceLabel: 'Price',
  // Display text, shown as is.
  price: '$39/mo',
  priceNote: 'Planned launch price. Waitlist members get a founding rate.',
  labels: {
    email: 'Email address',
    handle: "Your brand's Instagram handle or website",
    brands: 'Brands you want to watch',
  },
  placeholders: {
    handle: '@yourbrand or yourbrand.com',
  },
  // Under each optional field. The signup function keeps the first 5 brands
  // (MAX_BRANDS in supabase/functions/socialteardown-signup/rules.ts).
  hints: {
    handle: 'Optional.',
    brands: 'Optional. Up to 5, separated by commas.',
  },
};

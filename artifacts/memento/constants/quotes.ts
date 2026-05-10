export const QUOTES = [
  "The two most important days in your life are the day you are born and the day you find out why.",
  "Life is what happens when you're busy making other plans.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "The purpose of life is to live it, to taste experience to the utmost.",
  "Time you enjoy wasting is not wasted time.",
  "The biggest adventure you can take is to live the life of your dreams.",
  "Do not go gentle into that good night. Rage, rage against the dying of the light.",
  "We are the sum total of our experiences.",
  "Life is short, and it's up to you to make it sweet.",
  "The unexamined life is not worth living.",
  "It is not length of life, but depth of life.",
  "You only live once, but if you do it right, once is enough.",
  "Life is not measured by the number of breaths we take, but by the moments that take our breath away.",
  "The most important thing is to enjoy your life—to be happy—it's all that matters.",
  "Don't count the days, make the days count.",
  "We must be willing to let go of the life we planned so as to have the life that is waiting for us.",
  "Life shrinks or expands in proportion to one's courage.",
  "The good life is one inspired by love and guided by knowledge.",
  "To live is the rarest thing in the world. Most people exist, that is all.",
  "Life is not a problem to be solved, but a reality to be experienced.",
  "The privilege of a lifetime is being who you are.",
  "Life isn't about finding yourself. Life is about creating yourself.",
  "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.",
  "Life is either a daring adventure or nothing at all.",
  "The secret of getting ahead is getting started.",
  "In three words I can sum up everything I've learned about life: it goes on.",
  "To the well-organized mind, death is but the next great adventure.",
  "Life is 10% what happens to you and 90% how you react to it.",
  "Wherever you are, be all there.",
  "The only impossible journey is the one you never begin.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

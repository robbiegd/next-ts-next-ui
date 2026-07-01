import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'] ?? ''
});
const prisma = new PrismaClient({ adapter });

interface SeedQuestion {
  text: string;
  category: string;
  source: string;
  answers: [string, number][];
}

const questions: SeedQuestion[] = [
  // From the Big Buzzer Edition cards
  {
    text: "Name a job so dangerous, you wouldn't want it.",
    category: 'general',
    source: 'card-scan',
    answers: [
      ['Police officer', 13],
      ['Construction / Electrician', 13],
      ['Firefighter', 11],
      ['High-rise window washer', 11],
      ['Animal trainer / tamer', 3]
    ]
  },
  {
    text: "What's something you want to know about a movie before you go see it?",
    category: 'fast-money',
    source: 'card-scan',
    answers: [
      ['The cast', 30],
      ["What's it about", 13],
      ['Genre', 8],
      ['Length', 7]
    ]
  },
  {
    text: 'Other than Family Feud, name an iconic game show.',
    category: 'fast-money',
    source: 'card-scan',
    answers: [
      ['The Price is Right', 37],
      ['Jeopardy', 29],
      ['Wheel of Fortune', 26]
    ]
  },
  {
    text: 'How can you tell somebody is angry at you from their text messages?',
    category: 'fast-money',
    source: 'card-scan',
    answers: [
      ['Reply in all caps', 36],
      ['Angry emojis', 10],
      ['Short answer', 9]
    ]
  },
  // Summer pack
  {
    text: 'Name something you always pack for a beach day.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Sunscreen', 38],
      ['Towel', 22],
      ['Snacks', 14],
      ['Umbrella', 10],
      ['Swimsuit', 9],
      ['Speaker', 4]
    ]
  },
  {
    text: 'Name a food you only eat at a summer cookout.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Hot dogs', 31],
      ['Hamburgers', 24],
      ['Corn on the cob', 18],
      ['Watermelon', 12],
      ['Potato salad', 8]
    ]
  },
  {
    text: 'Name something that ruins a family road trip.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Traffic', 29],
      ['Car sickness', 21],
      ['Fighting siblings', 19],
      ['No snacks', 11],
      ['Getting lost', 9],
      ['Flat tire', 6]
    ]
  },
  {
    text: 'Name a way to cool off on a hot summer day.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Go swimming', 41],
      ['Eat ice cream', 20],
      ['Air conditioning', 17],
      ['Cold drink', 10],
      ['Run through the sprinkler', 5]
    ]
  },
  {
    text: 'Name something you hear at every family reunion.',
    category: 'summer',
    source: 'seed',
    answers: [
      ["You've gotten so big!", 33],
      ['Who made this dish?', 17],
      ['Old family stories', 16],
      ['When are you getting married?', 14],
      ['Arguing about politics', 8]
    ]
  },
  {
    text: 'Name a summer job teenagers love to hate.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Lifeguard', 27],
      ['Fast food', 24],
      ['Camp counselor', 18],
      ['Mowing lawns', 14],
      ['Retail', 9]
    ]
  },
  {
    text: 'Name something people forget to bring camping.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Bug spray', 30],
      ['Flashlight', 22],
      ['Matches', 15],
      ['Phone charger', 12],
      ['Toilet paper', 10]
    ]
  },
  {
    text: 'Name an activity families do on the Fourth of July.',
    category: 'summer',
    source: 'seed',
    answers: [
      ['Watch fireworks', 45],
      ['Barbecue', 28],
      ['Go to a parade', 12],
      ['Pool party', 8]
    ]
  }
];

async function main() {
  const existing = await prisma.question.count();
  if (existing > 0) {
    console.log(`Question bank already has ${existing} questions — skipping seed.`);
    return;
  }

  for (const question of questions) {
    await prisma.question.create({
      data: {
        text: question.text,
        category: question.category,
        source: question.source,
        answers: {
          create: question.answers.map(([text, points], index) => ({
            text,
            points,
            rank: index + 1
          }))
        }
      }
    });
  }
  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    return prisma.$disconnect().then(() => {
      throw error;
    });
  });

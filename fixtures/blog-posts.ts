import type { NewPost, NewTag } from '@/lib/db/schema';

/**
 * Sample blog post fixtures for development and testing
 */

export const sampleTags: Omit<NewTag, 'id'>[] = [
  { value: 'tech' },
  { value: 'travel' },
  { value: 'food' },
  { value: 'photography' },
  { value: 'tutorial' },
  { value: 'javascript' },
  { value: 'typescript' },
  { value: 'react' },
  { value: 'nextjs' },
];

export const samplePosts: Omit<NewPost, 'id' | 'userId'>[] = [
  {
    title: 'Getting Started with Next.js 15',
    slug: 'getting-started-with-nextjs-15',
    description:
      'A comprehensive guide to building modern web applications with Next.js 15 and the App Router.',
    body: `# Getting Started with Next.js 15

Next.js 15 represents a significant leap forward in building modern web applications. With the new App Router, React Server Components, and improved performance, it's never been easier to create fast, production-ready applications.

## Why Next.js 15?

Next.js 15 brings several exciting features:

- **App Router**: A new way to define routes using the file system
- **Server Components**: Render components on the server for better performance
- **Streaming**: Progressive rendering for improved user experience
- **Improved TypeScript support**: Better type safety out of the box

## Installation

Getting started is simple:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Creating Your First Page

With the App Router, creating a page is as simple as creating a file in the \`app\` directory:

\`\`\`tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js 15!</h1>
      <p>This is your first page.</p>
    </main>
  );
}
\`\`\`

## Server Components by Default

One of the most powerful features is that all components are Server Components by default. This means they render on the server, reducing the amount of JavaScript sent to the client.

\`\`\`tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## Conclusion

Next.js 15 provides an excellent foundation for building modern web applications. The combination of Server Components, improved routing, and better developer experience makes it a top choice for React developers.

Stay tuned for more tutorials on advanced Next.js features!`,
    published: true,
    publishDate: '2024-11-01',
  },
  {
    title: 'Building a Full-Stack App with Drizzle ORM',
    slug: 'building-fullstack-app-drizzle-orm',
    description:
      'Learn how to use Drizzle ORM to build type-safe database applications with SQLite and TypeScript.',
    body: `# Building a Full-Stack App with Drizzle ORM

Drizzle ORM is a lightweight, TypeScript-first ORM that provides excellent type safety and developer experience. Let's explore how to use it to build a full-stack application.

## Why Drizzle?

- **Type-safe**: End-to-end type safety from database to UI
- **Lightweight**: No magic, minimal overhead
- **SQL-like**: Familiar syntax for SQL developers
- **Great DX**: Excellent autocomplete and error messages

## Setting Up

First, install the dependencies:

\`\`\`bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
\`\`\`

## Defining Your Schema

Create a schema file:

\`\`\`typescript
// schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  createdAt: text('created_at').default(sql\`(CURRENT_TIMESTAMP)\`),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
});
\`\`\`

## Querying Data

With Drizzle, queries are type-safe and intuitive:

\`\`\`typescript
// Get all users
const allUsers = await db.select().from(users);

// Get user by email
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// Join users and posts
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(posts.userId, users.id));
\`\`\`

## Inserting Data

Inserts are equally straightforward:

\`\`\`typescript
const [newUser] = await db
  .insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
  })
  .returning();
\`\`\`

## Conclusion

Drizzle ORM provides an excellent balance between type safety, performance, and developer experience. It's perfect for TypeScript applications that need reliable database access.`,
    published: true,
    publishDate: '2024-10-28',
  },
  {
    title: 'My Journey Through Japan',
    slug: 'journey-through-japan',
    description:
      'A travel log of my two-week adventure exploring Tokyo, Kyoto, and the Japanese Alps.',
    body: `# My Journey Through Japan

Last month, I had the incredible opportunity to spend two weeks exploring Japan. From the bustling streets of Tokyo to the serene temples of Kyoto, every moment was unforgettable.

## Tokyo: The Electric City

Tokyo is a city of contrasts. Modern skyscrapers stand alongside traditional temples, and the energy is palpable everywhere you go.

### Must-Visit Spots

- **Shibuya Crossing**: The world's busiest pedestrian crossing is a sight to behold
- **Senso-ji Temple**: Tokyo's oldest temple in Asakusa
- **Tsukiji Outer Market**: Incredible fresh seafood and street food
- **Shinjuku Gyoen**: A peaceful oasis in the heart of the city

## Kyoto: Ancient Beauty

Kyoto transported me back in time. With over 2,000 temples and shrines, it's impossible to see everything, but here are my favorites:

- **Fushimi Inari**: The famous tunnel of thousands of red torii gates
- **Kinkaku-ji**: The stunning Golden Pavilion
- **Arashiyama Bamboo Grove**: Walking through towering bamboo is surreal
- **Gion District**: Spot geishas in the traditional streets

## Food Highlights

The food alone is worth the trip:

- Authentic ramen in Tokyo's back alleys
- Kaiseki (traditional multi-course) dinner in Kyoto
- Fresh sushi at Tsukiji
- Okonomiyaki in Osaka
- Matcha everything!

## Tips for First-Time Visitors

1. Get a JR Pass if you're traveling between cities
2. Learn basic Japanese phrases - locals appreciate the effort
3. Cash is still king in many places
4. Stay in a ryokan (traditional inn) at least once
5. Don't be afraid to get lost - some of the best experiences happen off the beaten path

Japan exceeded all my expectations. The blend of ancient tradition and cutting-edge technology, the incredible food, and the warmth of the people made it a trip I'll never forget.

Already planning my return trip!`,
    published: true,
    publishDate: '2024-10-15',
  },
  {
    title: 'The Perfect Sourdough Bread Recipe',
    slug: 'perfect-sourdough-bread-recipe',
    description:
      'Master the art of sourdough baking with this detailed, beginner-friendly recipe.',
    body: `# The Perfect Sourdough Bread Recipe

After two years of experimentation, I've finally perfected my sourdough bread recipe. Here's everything you need to know to bake your own artisan loaves at home.

## What You'll Need

### Equipment
- Kitchen scale (essential!)
- Dutch oven or bread cloche
- Mixing bowl
- Bench scraper
- Banneton or bowl with tea towel

### Ingredients
- 500g bread flour
- 350g water (70% hydration)
- 100g active sourdough starter
- 10g salt

## The Process

### Day 1: Morning (8:00 AM)

**Feed your starter**: Mix equal parts flour and water with your starter. Let it double in size (4-6 hours).

### Day 1: Evening (7:00 PM)

**Make the dough**:
1. Mix water and starter until combined
2. Add flour, mix until no dry flour remains
3. Let rest 30 minutes (autolyse)
4. Add salt, pinch into dough
5. Perform stretch and folds every 30 minutes for 2 hours

**Bulk fermentation**: Cover and let sit at room temperature for 6-8 hours or until doubled.

### Day 2: Morning (6:00 AM)

**Shape the dough**:
1. Turn out onto lightly floured surface
2. Pre-shape into a round, rest 20 minutes
3. Final shape with tension
4. Place in banneton seam-side up
5. Refrigerate for 8-24 hours (cold fermentation)

### Day 2: Evening (6:00 PM)

**Bake**:
1. Preheat dutch oven at 500°F for 1 hour
2. Score the loaf
3. Bake covered for 20 minutes at 500°F
4. Remove lid, reduce to 450°F
5. Bake 25-30 minutes until deep golden brown
6. Cool completely before slicing (this is crucial!)

## Tips for Success

- **Temperature matters**: Warmer = faster fermentation
- **Don't skip the cold fermentation**: It develops flavor and makes scoring easier
- **Listen to your dough**: Adjust times based on dough behavior, not just the clock
- **Practice makes perfect**: Don't be discouraged by early failures

## Troubleshooting

**Dense crumb?** Under-fermented or not enough strength built during folding.

**Too sour?** Over-fermented or starter too acidic. Try shorter bulk fermentation.

**Flat loaf?** Over-proofed. Watch for the "poke test" - dough should spring back slowly.

## Final Thoughts

Sourdough baking is as much art as science. Each loaf teaches you something new. Embrace the process, and soon you'll be baking bakery-quality bread at home.

Happy baking! 🍞`,
    published: true,
    publishDate: '2024-10-05',
  },
  {
    title: 'Photography Tips for Beginners',
    slug: 'photography-tips-beginners',
    description:
      'Essential tips and techniques to help you take better photos, regardless of your camera.',
    body: `# Photography Tips for Beginners

Photography is an incredible creative outlet, and the good news is that you don't need expensive equipment to take great photos. Here are essential tips that will immediately improve your photography.

## 1. Understand the Exposure Triangle

The three pillars of photography:

### Aperture (f-stop)
- Controls depth of field
- Lower f-number = blurrier background (f/1.8, f/2.8)
- Higher f-number = sharper background (f/8, f/11)

### Shutter Speed
- Controls motion blur
- Fast shutter (1/1000s) = freezes action
- Slow shutter (1/30s) = shows movement

### ISO
- Controls sensor sensitivity
- Low ISO (100-400) = cleaner images, needs more light
- High ISO (1600+) = more grain, works in low light

## 2. Composition Rules

### Rule of Thirds
Imagine a grid dividing your frame into nine equal parts. Place important elements along these lines or at intersections.

### Leading Lines
Use natural lines (roads, rivers, fences) to draw the viewer's eye through the image.

### Frame Within a Frame
Use doorways, windows, or natural elements to frame your subject.

## 3. Light is Everything

The quality of light makes or breaks a photo.

- **Golden Hour**: Hour after sunrise and before sunset - soft, warm light
- **Blue Hour**: Twilight - cool, dreamy light
- **Avoid harsh midday sun**: Creates unflattering shadows
- **Overcast days**: Perfect for portraits - natural soft light

## 4. Get Closer

Don't be afraid to fill the frame with your subject. Most beginners shoot from too far away.

"If your photos aren't good enough, you're not close enough." - Robert Capa

## 5. Shoot in RAW

If your camera supports it:
- More editing flexibility
- Better quality
- Recover highlights/shadows

## 6. Practice Daily

The best way to improve:
- Take photos every day
- Try one new technique per week
- Review and critique your own work
- Study photos you admire

## 7. Learn to Edit

Post-processing is essential:
- Start with Lightroom or free alternatives (Darktable, RawTherapee)
- Learn basic adjustments: exposure, contrast, white balance
- Don't over-edit - less is often more

## Common Beginner Mistakes

1. **Everything in focus**: Choose a focal point
2. **Ignoring backgrounds**: A busy background distracts from your subject
3. **Center framing**: Try off-center compositions
4. **Auto mode only**: Learn manual or semi-manual modes
5. **Not enough practice**: Shoot regularly!

## Gear Matters Less Than You Think

Your camera doesn't take photos - you do. Master the fundamentals with what you have before upgrading gear.

## Challenge Yourself

Try these projects:
- 365 project: One photo every day for a year
- Photo walk: Explore your neighborhood with fresh eyes
- Single subject: Photograph the same subject 50 different ways
- Constraints: Shoot only with a 50mm lens for a month

Remember, every professional was once a beginner. Keep shooting, keep learning, and most importantly, have fun!`,
    published: true,
    publishDate: '2024-09-20',
  },
  {
    title: 'Draft: Advanced TypeScript Patterns',
    slug: 'draft-advanced-typescript-patterns',
    description:
      'Exploring advanced TypeScript patterns and techniques for building robust applications.',
    body: `# Advanced TypeScript Patterns

This is a draft post exploring some advanced TypeScript patterns...

## Conditional Types

TODO: Add examples

## Mapped Types

TODO: Add examples

## Template Literal Types

TODO: Add examples`,
    published: false,
    publishDate: null,
  },
];

/**
 * Tag assignments for posts (by post index and tag values)
 */
export const postTagAssignments: Array<{ postIndex: number; tagValues: string[] }> = [
  { postIndex: 0, tagValues: ['tech', 'tutorial', 'javascript', 'nextjs', 'typescript'] },
  { postIndex: 1, tagValues: ['tech', 'tutorial', 'typescript'] },
  { postIndex: 2, tagValues: ['travel', 'photography'] },
  { postIndex: 3, tagValues: ['food'] },
  { postIndex: 4, tagValues: ['photography', 'tutorial'] },
  { postIndex: 5, tagValues: ['tech', 'typescript'] },
];

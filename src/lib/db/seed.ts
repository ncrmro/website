import { db, sqlite } from './index';
import { users, posts, tags, postsTags } from './schema';
import { samplePosts, sampleTags, postTagAssignments } from '../../fixtures/blog-posts';
import { eq } from 'drizzle-orm';

/**
 * Seed the database with development data
 */
async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create test users
    console.log('Creating test users...');
    const [adminUser] = await db
      .insert(users)
      .values({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password-hashed', // In production, this would be properly hashed
        admin: true,
      })
      .returning();

    const [regularUser] = await db
      .insert(users)
      .values({
        name: 'Bob Alice',
        email: 'bob@alice.com',
        password: 'password-hashed',
        admin: false,
      })
      .returning();

    console.log(`✅ Created users: ${adminUser.email}, ${regularUser.email}`);

    // Create tags
    console.log('Creating tags...');
    const createdTags = await db
      .insert(tags)
      .values(sampleTags)
      .returning();

    console.log(`✅ Created ${createdTags.length} tags`);

    // Create tag lookup map
    const tagMap = new Map(createdTags.map(tag => [tag.value, tag.id]));

    // Create posts
    console.log('Creating blog posts...');
    const createdPosts = await db
      .insert(posts)
      .values(
        samplePosts.map(post => ({
          ...post,
          userId: adminUser.id,
        }))
      )
      .returning();

    console.log(`✅ Created ${createdPosts.length} blog posts`);

    // Create post-tag relationships
    console.log('Creating post-tag relationships...');
    for (const assignment of postTagAssignments) {
      const post = createdPosts[assignment.postIndex];
      if (!post) continue;

      for (const tagValue of assignment.tagValues) {
        const tagId = tagMap.get(tagValue);
        if (!tagId) continue;

        await db.insert(postsTags).values({
          postId: post.id,
          tagId: tagId,
        });
      }
    }

    console.log('✅ Created post-tag relationships');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log(`  Admin: ${adminUser.email} (password: "password" or "admin")`);
    console.log(`  User: ${regularUser.email} (password: "password")`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

seed();

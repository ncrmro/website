---
slug: apollo-cache-overview
title: Apollo Cache Overview
date: "2021-01-02"
description: "What is the Apollo cache, ensure correct usage and update post mutation."
tags: ["GraphQL", "Apollo", "React"]
---

If your using [Apollo](https://www.apollographql.com/docs/) [GraphQL](https://graphql.org/) and you've not yet looked at the [Apollo Cache](https://www.apollographql.com/docs/react/caching/cache-configuration/)
object in your App I would highly recommend familiarizing it. As you may not be getting the benefits of caching as you thought, which I didn't catch until
working with [Graphql Mutations](https://graphql.org/learn/queries/#mutations).

In this case, while working on [JTX](https://jtronics.exchange/) I was trying to show a list of user parts,
then creating a new used part which should then be reflected in the [React](https://reactjs.org/) frontend.

After taking a look at your GraphQL cache you might find things are not being cached, this is because you need to explicitly 
request ids for every object and in your mocks you will need to remember to apply the `__typname` field.

When testing Mutations modifying the cache or what the cache should look like during testing it's best to extract the cache
in testing and compare with the cache in your application.

### GraphQL Caching

[This article](https://www.apollographql.com/blog/demystifying-cache-normalization/) goes much more in-depth into how the Apollo GraphQL cache works by implementing cache normalization.

The cache is simply an object!

#### Unique Identifies

Each of the keys is the GraphQL cache is `__typename` + the `id` ([uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier) in this case)
this is the object's Unique Identifier in side of your cache.

```json
{
  "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4": {
    "id": "97cfac8a-a4b4-48d0-ba12-901cf474e7e4",
    "__typename": "Part",
    "category": "CPU",
    "name": "Intel Pentium G3470",
    "slug": "intel-pentium-g3470"
  }
}
```

#### Accessing the Apollo Cache

Throughout your app, you can access the cache object you initially passed into your Apollo client. This can be extracted
at any point and be inspected.

#### Mutations

Mutations when creating or deleting nodes don't automatically update the cache and thus you can specify an [update function](https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates)
on the [Mutation options](https://www.apollographql.com/docs/react/data/mutations/#options).

```typescript
const update = (cache, { data: { createOwnedPart } }) => {
  console.log("EXISTING CACHE", JSON.stringify(cache.extract()));
};
```

#### A more fleshed out Cache example

In our case the Viewer object is always based on the JWT token found in the GraphQL requests header, we can see that the
viewer object on the `ROOT_QUERY` points to the key `USER:uuid` which then has a few other objects on it.

```json
{
  "System:8dd2bcf4-d722-4d10-9aa5-14300ec86186": {
    "id": "8dd2bcf4-d722-4d10-9aa5-14300ec86186",
    "__typename": "System",
    "name": "Test User's Backup System"
  },
  "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b": {
    "id": "e1e5989c-37f5-42e8-85d1-06ea6de5f29b",
    "__typename": "User",
    "systemsByOwnerId": {
      "__typename": "SystemsConnection",
      "nodes": [
        {
          "__ref": "System:8dd2bcf4-d722-4d10-9aa5-14300ec86186"
        }
      ]
    },
    "ownedPartsByOwnerId": {
      "__typename": "OwnedPartsConnection",
      "nodes": [
        {
          "__ref": "OwnedPart:39a336d6-188f-4589-8d31-fa0455b47be1"
        }
      ]
    }
  },
  "ROOT_QUERY": {
    "__typename": "Query",
    "viewer": {
      "__ref": "User:e1e5989c-37f5-42e8-85d1-06ea6de5f29b"
    }
  },
  "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4": {
    "id": "97cfac8a-a4b4-48d0-ba12-901cf474e7e4",
    "__typename": "Part",
    "category": "CPU",
    "name": "Intel Pentium G3470",
    "slug": "intel-pentium-g3470"
  },
  "OwnedPart:39a336d6-188f-4589-8d31-fa0455b47be1": {
    "id": "39a336d6-188f-4589-8d31-fa0455b47be1",
    "__typename": "OwnedPart",
    "partByPartId": {
      "__ref": "Part:97cfac8a-a4b4-48d0-ba12-901cf474e7e4"
    },
    "systemBySystemId": null
  }
}
```

In this way, we end up only ever keeping one copy of the actual object around and every other GraphQL node in the cache references
that cache key. This stops bloat but also means any components that are using that object automatically update if we need
to make a Mutation.

### Updating Cache after Mutation

Mutating a node that already exists in the cache will automatically update it. Adding a new node to our
viewers OwnedPartConnection is a little trickier.

```typescript
const update = (cache, { data: { createOwnedPart } }) => {
  
  // First we find the original query we made in the cache.
  const data = cache.readQuery<ViewerPartsQuery>({
    query: ViewerPartsDocument,
  });
 
  // From that we can get the reference of the viewer in the cache
  const viewerRef = cache.identify({
    __typename: "User",
    id: data.viewer.id,
  });

  // The mutation already added the new viewer part 
  //let's get a reference to the new viewer part.
  const newViewerPartRef = cache.identify(createOwnedPart.ownedPart);
  
  // we update the viewer object in our cache
  // on ownedPartsByOwnerId nodes  field we include the new viewer part refrence. 
  cache.modify({
    id: viewerRef,
    fields: {
      ownedPartsByOwnerId: (existingCommentRefs) => ({
        nodes: [...existingCommentRefs.nodes, { __ref: newViewerPartRef }],
      }),
    },
  });
};
```

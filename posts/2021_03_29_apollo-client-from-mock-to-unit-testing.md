---
slug: apollo-client-from-mock-to-unit-testing
title: Apollo Client Work Flow - From Mock to Unit Testing
date: "2021-03-29"
description:
  In this post we cover an optimal work flow for building out and testing React
  components that use GraphQL queries
tags: ["CHANGEME"]
---

Sometimes you start building the backend first, other times it's easier to
figure out what to store by building out the frontend.

A better approach is to build your frontend initially using the same mocks you
will later use to perform your unit testing.

Often unit testing is the last thing your thinking about. They will often be
frustrating to write after writing your business logic, especially if you're not
building your graphQL queries, fragments and mocks to be Apollo Cache Compliant.

What I mean by being cache compliant is each item in your queries needs to
include an `ID` field and your mocks need to include a `__typename` field.

Check out my
[Apollo Cache Testing post](https://ncrmro.com/posts/apollo-cache-overview) for
more in-depth Apollo Cache testing notes.

If using [GraphQL codegen](https://graphql-code-generator.com/) to generate
typescript types and functions I would recommend adding the
`nonOptionalTypename: true` this will throw TS errors when any of your typed
mocks are missing `__typename` (often making it hard to figure out why the
Apollo cache isn't working as expected).

Additionally, when performing mutations, your queries inside the mutation
response fields should match any cached queries.

## Todo example

So let's say you're trying to build everyone's favorite todo example app.

We would start out mocking our data like this. Before we get too much further,
this mock is what I like to call scaffolding code eg, we use it to build the
rest of our code and then tear it down. We will come back to this mocked data in
a second.

```typescript jsx
import React from "react";

const ViewerTodos: React.FC = () => {
  const data = {
    viewer: {
      todos: {
        nodes: [{ id: "test", text: "My test todo" }],
      },
    },
  };
  return (
    <div>
      <h1>Todos</h1>
      <li>
        {data.viewer.todos.nodes.map((todo) => (
          <div key={todo.id}>{todo.text}</div>
        ))}
      </li>
    </div>
  );
};
```

### Our Queries

This post does not cover and Apollo Server and assumes you already have one with
a schema.

Now let's say you have a query and a mutation available.

```graphql
query ViewerTodos {
  viewer {
    id
    todos {
      nodes {
        id
        text
      }
    }
  }
}
```

```graphql
mutation AddTodo($input: AddTodoInput!) {
  addTodo(input: $input) {
    id
    text
  }
}
```

### Our Queries with a Fragment

I typically will create a simple fragment for most of my types which insures
that all queries have the mandatory fields and allow us to type simple mocks.

Lets now make a fragment

```graphql
fragment TodoSimple on Todo {
  id
  text
}
```

#### The Query and Mutation

Remember queries can be composed of multiple fragment, you can also add extra
fields, here we've also decided we would like the createdAt field

```graphql
query ViewerTodos {
  viewer {
    id
    todos {
      nodes {
        ...TodoSimple
        createdAt
      }
    }
  }
}
```

The mutation

```graphql
mutation AddTodo($input: AddTodoInput!) {
  addTodo(input: $input) {
    todo {
      ...TodoSimple
      createdAt
    }
  }
}
```

### The Mock

Now, remember how I said we would come back to the mock from the beginning.

These mocks might live in a file or folder like `utils/mocks.ts`

```typescript jsx
// utils/mocks.ts for example

import { TodoSimpleFragment } from "@gqlgen";

export const todoSimpleFragment: TodoSimpleFragment = {
  __typename: "Todo",
  id: "todo-mock-id",
  text: "My mocked todo text",
};
```

#### Mocking the GraphQL request and result

We can now build out the Mock Request and Result, ignore the type `GraphQLMock`
I'll explain that bit later.

```typescript
import {
  ViewerTodosDocument,
  ViewerTodosVariables,
  ViewerTodos,
} from "@gqlgen";
import { viewerSimpleFragment, todoSimpleFragment } from "./utils/mocks";

export const ViewerTodosMock: GraphQLMock<ViewerTodosVariables, ViewerTodos> = {
  request: {
    query: ViewerTodosDocument,
    variables: {},
  },
  result: {
    data: {
      __typename: "Query",
      viewer: {
        ...viewerSimpleFragment,
        todos: { nodes: [{ ...todoSimpleFragment, createdAt: "NOW" }] },
      },
    },
  },
};
```

## The unit test

```typescript jsx
import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import ViewerTodos from "@pages/viewer/todos";
import { render, RenderResult, waitFor } from "@testing-library/react";
import { ViewerContext } from "@utils/jwtUtils";
import { ViewerTodosMock } from "./mocks";
import { InMemoryCache } from "@apollo/client";
import { viewerMock } from "@utils/mocks";

export async function renderComponent(
  mocks
): Promise<{ cache: InMemoryCache } & RenderResult> {
  const cache = new InMemoryCache();
  const utils = render(
    <MockedProvider mocks={mocks} cache={cache} addTypename={true}>
      <ViewerContext.Provider value={viewerMock}>
        <ViewerTodos />
      </ViewerContext.Provider>
    </MockedProvider>
  );
  await waitFor(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return { ...utils, cache };
}

test("ViewerTodos should render viewer todos", async () => {
  const utils = await renderComponent([ViewerTodosMock]);
  const viewerTodo = ViewerTodosMock.result.data.viewer.todos.nodes[0];

  const viewerPartCard = utils.container.querySelector(
    `#viewer-todo-${viewerTodo.id}`
  );
  const todo = viewerPartCard.querySelector("div:nth-child(1)");
  expect(todo.innerHTML).toBe(viewerTodo.text);
  expect(utils.cache.extract()).toMatchSnapshot(
    "cache should contain viewer todos"
  );
});
```

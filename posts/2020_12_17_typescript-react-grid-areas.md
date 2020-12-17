---
slug: '/posts/typescript-react-grid-areas'
title: Typescript React Grid Areas
date: '2020-12-17'
description: A Reusable Component Design Pattern fo Grid Areas in Typescript React.
tags: ['react', 'typescript', 'grid']
---

While working on [JTX](jtronics.exchange) I've started to design for mobile-first. [CSS Grid Layout
](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) has been on my to-learn list for a long time. While
learning more about Grid Layout I learned about this neat feature (CSS property) called [grid-template-areas](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)

Naturally, I wanted to make this into a [React reusable component](https://reactjs.org/docs/components-and-props.html)
with [Typescript Enums](https://www.typescriptlang.org/docs/handbook/enums.html) I could lock down styling to specific use cases.

These components use [Tailwind](http://tailwindcss.com/docs) for styling, but the Typescript enums
that define which style to use could easily be switched out.

We can also [enable grid area names](https://developers.google.com/web/tools/chrome-devtools/css/grid#area-names) in [Chrome Devtools](https://developers.google.com/web/tools/chrome-devtools)

### The Code

I will first show us using the components and the next section shows the actual components

```typescript jsx
import React from 'react'
import PageLayout from '../components/PageLayout'
import SearchFilters from '../components/SearchFilters'
import { Grid, GridSection, GridTypes } from '../components/Grid'

interface SearchResultsProps {}
enum GridAreas {
  Sidebar = 'search-sidebar',
  Results = 'search-results',
}

const SearchResults: React.FC<SearchResultsProps> = (props) => {
  return (
    <PageLayout id="search">
      <Grid
        type={GridTypes.ThreeColumn}
        areas={[GridAreas.Sidebar, GridAreas.Results]}
      >
        <GridSection
          id={GridAreas.Sidebar}
          className="w-auto md:w-64"
          area={GridAreas.Sidebar}
        >
          <SearchFilters />
        </GridSection>
        <GridSection
          id={GridAreas.Results}
          className="col-span-2"
          area={GridAreas.Results}
        >
          <Grid type={GridTypes.SingleColumn}>
            {data.searchResuls.nodes.map((result, idx) => (
              <div key={idx}>result.name</div>
            ))}
          </Grid>
        </GridSection>
      </Grid>
    </PageLayout>
  )
}
```

```typescript jsx
import React from 'react'

/**
 * These are the various ways we want to use out grid
 * @enum {string}
 * */
export enum GridTypes {
  Auto = 'grid-flow-row md:grid-flow-col auto-cols-max',
  SingleColumn = 'grid-flow-row auto-cols-max',
  ThreeColumn = 'grid-cols-3 gap-4',
}

interface GridProps {
  children
  type?: GridTypes
  gridTemplateAreas?: string
  className?: string
  areas?: Array<string>
}

interface GridStyles {
  gridTemplateAreas?: string
}

/**
 * Our universal grid component
 * The areas props allows us to use named grid areas
 */
export const Grid: React.FC<GridProps> = (props) => {
  const type = props.type ? props.type : GridTypes.Auto
  const className = `grid ${type} ${props.className ? props.className : ''}`
  const styles: GridStyles = {}

  if (props.areas) {
    styles.gridTemplateAreas = ''
    props.areas.forEach(
      (area) =>
        (styles.gridTemplateAreas = `${styles.gridTemplateAreas} '${area}'`)
    )
  }
  return (
    <div className={className} style={styles}>
      {props.children}
    </div>
  )
}

/**
 * Our universal grid section component
 * The area prop allows us to specify the grid area name
 */
export interface GridSectionProps {
  id?: string
  children
  className: string
  area: string
}

export const GridSection: React.FC<GridSectionProps> = (props) => (
  <div
    id={props.id}
    className={props.className}
    style={{ gridArea: `${props.area}` }}
  >
    {props.children}
  </div>
)

export default Grid
```

---
slug: react-typescript-enum-form-stepper
title: Building a Enum Based Form Stepper In React Typescript
date: "2021-01-18"
description: We look at a streamlined form stepper design pattern.
tags: ["react", "typescript", "css"]
---

First, we are going to create our steps as enums. If we don't define values for
our enums the will by default increment. This design pattern works best with at
least 3 form steps.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}
```

Next, let's add the state and for now, we will deal with only the default case
which is the first step in our multipart from stepper. We can see that we can
now also increment the stepper, because of our default case it will also be our
first step named default.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}

const Form: React.FC = () => {
  const [formStep, setFormStep] = useState<FormState>(FormState.Default);
  let step;
  switch (formStep) {
    case FormState.Default:
    default:
      step = <>First step</>;
      break;
  }
  return (
    <form>
      <div>{step}</div>
      <div>
        <Button onClick={() => setFormStep(formStep - 1)}>Back</Button>
        <Button onClick={() => setFormStep(formStep + 1)}>Next</Button>
      </div>
    </form>
  );
};
```

Lastly, we add the other steps (which could be components defined elsewhere) and
`gridTemplateAreas`, which we could use to further change our form layout.

```typescript jsx
enum FormState {
  Default, // 0
  Address, // 1
  Billing, // 2
}

const Form = () => {
  const [formStep, setFormStep] = useState<FormState>(FormState.Default);
  let step;
  switch (formStep) {
    case FormState.Address:
      step = <div>Address Step</div>;
      break;
    case FormState.Billing:
      step = <div>Billing Step</div>;
      break;
    case FormState.Default:
    default:
      step = <>First step</>;
      break;
  }
  return (
    <form
      style={{
        gridTemplateAreas: "'step-body' 'step-action'",
        gridTemplateRows: "auto auto",
      }}
    >
      <div style={{ gridArea: "step-body" }}>{step}</div>
      <div className="flex justify-end" style={{ gridArea: "step-action" }}>
        <Button onClick={() => setFormStep(formStep - 1)} className="mr-2">
          Back
        </Button>
        <Button onClick={() => setFormStep(formStep + 1)}>Next</Button>
      </div>
    </form>
  );
};
```

Failed to compile.
./src/components/MatterWorkspace.tsx:47:37
Type error: Argument of type '"Intake" | "Investigation" | "Medical Documentation" | "Insurance Negotiation" | "Pleadings" | "Discovery" | "Mediation" | "Pre-Trial" | "Trial" | "Resolution" | "Closed" | "Document Review" | "Demand or Negotiation" | "Administrative Process" | "Hearing or Trial"' is not assignable to parameter of type '"Intake" | "Pleadings" | "Discovery" | "Mediation" | "Resolution" | "Closed"'.
  Type '"Investigation"' is not assignable to type '"Intake" | "Pleadings" | "Discovery" | "Mediation" | "Resolution" | "Closed"'.
  45 |   const client = clients.find((c) => c.id === matter.clientId);
  46 |   const stages = matter.category === "personal_injury" ? PI_STAGES : EMPLOYMENT_STAGES;
> 47 |   const stageIndex = stages.indexOf(matter.stage as (typeof stages)[number]);
     |                                     ^
  48 |   const matterTasks = tasks.filter((t) => t.matterId === matter.id);
  49 |   const matterComms = communications.filter((c) => c.matterId === matter.id);
  50 |   const matterEvents = calendarEvents.filter((e) => e.matterId === matter.id);
Error: Command "npm run build" exited with 1
